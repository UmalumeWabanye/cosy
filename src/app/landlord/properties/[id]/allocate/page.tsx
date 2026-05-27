'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LandlordLayout from '@/components/landlord/LandlordLayout';
import api from '@/services/api';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';

interface RequestItem {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  moveInDate?: string;
  leaseDuration?: number;
  student?: { _id: string; name?: string; email?: string };
  property?: { _id: string; propertyName?: string } | null;
}

interface AllocationItem {
  roomNumber: string;
  student: { _id: string; name?: string; email?: string };
  request?: { _id: string } | null;
  notes?: string;
  allocatedAt?: string;
}

interface PropertyItem {
  _id: string;
  propertyName: string;
  totalRooms?: number;
  availableRooms?: number;
  roomAllocations?: AllocationItem[];
}

interface AutoSuggestion {
  requestId: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
}

export default function AllocatePropertyRoomsPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { user, isAuthenticated, isLoading } = useAuth();

  const [property, setProperty] = useState<PropertyItem | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'landlord')) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated || user?.role !== 'landlord' || !propertyId) return;
      try {
        setLoading(true);
        setError('');
        const [propertyRes, requestRes] = await Promise.all([
          api.get(`/properties/${propertyId}`),
          api.get('/requests'),
        ]);

        setProperty(propertyRes.data || null);
        const allRequests = Array.isArray(requestRes.data?.data) ? requestRes.data.data : [];
        setRequests(allRequests.filter((request: RequestItem) => request.status === 'approved' && request.property?._id === propertyId));
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load room allocation data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, user, propertyId]);

  const allocations = property?.roomAllocations || [];
  const normalizeRoomNumber = (value: string) => value.trim().toLowerCase();
  const allocatedStudentIds = useMemo(() => new Set(allocations.map((allocation) => allocation.student?._id)), [allocations]);
  const allocatedRoomNumbers = useMemo(
    () => new Set(allocations.map((allocation) => normalizeRoomNumber(allocation.roomNumber || '')).filter(Boolean)),
    [allocations]
  );
  const remainingRooms = Math.max(0, Number(property?.totalRooms || 0) - allocations.length);

  const unallocatedRequests = useMemo(
    () => requests.filter((request) => request.student?._id && !allocatedStudentIds.has(request.student._id)),
    [requests, allocatedStudentIds]
  );

  const autoSuggestions = useMemo<AutoSuggestion[]>(() => {
    const totalRooms = Number(property?.totalRooms || 0);
    if (totalRooms <= 0 || unallocatedRequests.length === 0) return [];

    const candidateRooms = Array.from({ length: totalRooms }, (_, index) => `Room ${index + 1}`);
    const availableRoomsForSuggestion = candidateRooms.filter(
      (label) => !allocatedRoomNumbers.has(normalizeRoomNumber(label))
    );

    return unallocatedRequests.slice(0, availableRoomsForSuggestion.length).map((request, index) => ({
      requestId: request._id,
      studentId: request.student!._id,
      studentName: request.student?.name || request.student?.email || 'Student',
      roomNumber: availableRoomsForSuggestion[index],
    }));
  }, [property?.totalRooms, unallocatedRequests, allocatedRoomNumbers]);

  const addAllocation = () => {
    if (!roomNumber.trim() || !selectedRequestId) {
      setError('Choose a room number and a student request.');
      return;
    }

    const normalizedRoomNumber = normalizeRoomNumber(roomNumber);
    if (allocatedRoomNumbers.has(normalizedRoomNumber)) {
      setError('This room is already allocated. Choose another room number.');
      return;
    }

    if (Number(property?.totalRooms || 0) > 0 && allocations.length >= Number(property?.totalRooms || 0)) {
      setError('All rooms are already allocated for this property.');
      return;
    }

    const request = requests.find((item) => item._id === selectedRequestId);
    if (!request?.student?._id) {
      setError('Selected request has no student attached.');
      return;
    }

    if (allocatedStudentIds.has(request.student._id)) {
      setError('This student already has an allocation.');
      return;
    }

    setProperty((prev) => {
      if (!prev) return prev;
      const currentAllocations = prev.roomAllocations || [];
      const nextAllocations = [
        ...currentAllocations,
        {
          roomNumber: roomNumber.trim(),
          student: request.student as { _id: string; name?: string; email?: string },
          request: { _id: request._id },
          notes: notes.trim(),
          allocatedAt: new Date().toISOString(),
        },
      ];
      return {
        ...prev,
        roomAllocations: nextAllocations,
        availableRooms: Math.max(0, Number(prev.totalRooms || 0) - nextAllocations.length),
      };
    });

    setRoomNumber('');
    setSelectedRequestId('');
    setNotes('');
    setError('');
  };

  const removeAllocation = (roomNumberToRemove: string) => {
    setProperty((prev) => {
      if (!prev) return prev;
      const currentAllocations = prev.roomAllocations || [];
      const nextAllocations = currentAllocations.filter((allocation) => allocation.roomNumber !== roomNumberToRemove);
      return {
        ...prev,
        roomAllocations: nextAllocations,
        availableRooms: Math.max(0, Number(prev.totalRooms || 0) - nextAllocations.length),
      };
    });
  };

  const autoAllocateRooms = () => {
    if (!property) return;
    if (autoSuggestions.length === 0) {
      setError('No suggestions available. Ensure total rooms are set and there are unallocated approved requests.');
      return;
    }

    setProperty((prev) => {
      if (!prev) return prev;

      const existingAllocations = prev.roomAllocations || [];
      const existingStudentIds = new Set(existingAllocations.map((allocation) => allocation.student?._id).filter(Boolean));
      const existingRoomIds = new Set(existingAllocations.map((allocation) => normalizeRoomNumber(allocation.roomNumber || '')).filter(Boolean));

      const additions: AllocationItem[] = [];

      for (const suggestion of autoSuggestions) {
        if (existingStudentIds.has(suggestion.studentId)) continue;
        if (existingRoomIds.has(normalizeRoomNumber(suggestion.roomNumber))) continue;

        const request = requests.find((item) => item._id === suggestion.requestId);
        if (!request?.student) continue;

        additions.push({
          roomNumber: suggestion.roomNumber,
          student: request.student as { _id: string; name?: string; email?: string },
          request: { _id: request._id },
          notes: 'Auto-suggested assignment',
          allocatedAt: new Date().toISOString(),
        });

        existingStudentIds.add(suggestion.studentId);
        existingRoomIds.add(normalizeRoomNumber(suggestion.roomNumber));
      }

      if (additions.length === 0) return prev;

      const nextAllocations = [...existingAllocations, ...additions];
      return {
        ...prev,
        roomAllocations: nextAllocations,
        availableRooms: Math.max(0, Number(prev.totalRooms || 0) - nextAllocations.length),
      };
    });

    setError('');
  };

  const saveAllocations = async () => {
    if (!property) return;
    try {
      setSaving(true);
      setError('');
      await api.put(`/properties/${property._id}`, {
        roomAllocations: property.roomAllocations || [],
        availableRooms: property.availableRooms ?? remainingRooms,
      });
      router.push('/landlord/properties');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save room allocations');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <LandlordLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'grey.50', minHeight: '100vh' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3, gap: 1.5 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Room Allocation</Typography>
            <Typography variant="body2" color="text.secondary">
              Assign approved students into rooms for {property?.propertyName || 'this property'}.
            </Typography>
          </Box>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={() => router.push('/landlord/properties')} sx={{ textTransform: 'none' }}>Back to Properties</Button>
            <Button variant="contained" onClick={saveAllocations} disabled={saving || !property} sx={{ textTransform: 'none', fontWeight: 700 }}>
              {saving ? <CircularProgress size={18} /> : 'Save Allocations'}
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : (
          <Stack sx={{ gap: 2 }}>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2 }}>
                <TextField label="Room Number" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} fullWidth />
                <TextField select label="Approved Student" value={selectedRequestId} onChange={(e) => setSelectedRequestId(e.target.value)} fullWidth>
                  <MenuItem value="">Select a student</MenuItem>
                  {requests.map((request) => (
                    <MenuItem key={request._id} value={request._id}>
                      {request.student?.name || request.student?.email || 'Student'}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <TextField
                label="Allocation Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
                sx={{ mt: 2 }}
              />
              <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 2 }}>
                <Stack direction="row" sx={{ gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={autoAllocateRooms}
                    disabled={!property || autoSuggestions.length === 0}
                    sx={{ textTransform: 'none' }}
                  >
                    Auto-fill Suggestions ({autoSuggestions.length})
                  </Button>
                  <Button variant="outlined" onClick={addAllocation} sx={{ textTransform: 'none' }}>Add Allocation</Button>
                </Stack>
              </Stack>
            </Paper>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Rooms</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{property?.totalRooms ?? 0}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">Allocated Rooms</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{allocations.length}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">Available Rooms</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{property?.availableRooms ?? remainingRooms}</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Current Allocations</Typography>
              {allocations.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No rooms have been assigned yet.</Typography>
              ) : (
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Allocated</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allocations.map((allocation) => (
                        <TableRow key={allocation.roomNumber} hover>
                          <TableCell>{allocation.roomNumber}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{allocation.student?.name || 'Student'}</Typography>
                            <Typography variant="caption" color="text.secondary">{allocation.student?.email || ''}</Typography>
                          </TableCell>
                          <TableCell>{allocation.notes || '—'}</TableCell>
                          <TableCell>{allocation.allocatedAt ? new Date(allocation.allocatedAt).toLocaleDateString('en-ZA') : '—'}</TableCell>
                          <TableCell align="right">
                            <Button size="small" color="error" onClick={() => removeAllocation(allocation.roomNumber)} sx={{ textTransform: 'none' }}>
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Approved Requests Available for Allocation</Typography>
              {requests.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No approved requests found for this property yet.</Typography>
              ) : (
                <Stack sx={{ gap: 1 }}>
                  {requests.map((request) => (
                    <Stack key={request._id} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed', borderColor: 'divider', pb: 1 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{request.student?.name || 'Student'}</Typography>
                        <Typography variant="caption" color="text.secondary">{request.student?.email || ''}</Typography>
                      </Box>
                      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                        <Chip size="small" label="Approved" color="success" />
                        {request.student?._id && allocatedStudentIds.has(request.student._id) ? (
                          <Chip size="small" label="Allocated" color="primary" variant="outlined" />
                        ) : (
                          (() => {
                            const suggestion = autoSuggestions.find((item) => item.requestId === request._id);
                            return suggestion ? <Chip size="small" label={`Suggested: ${suggestion.roomNumber}`} color="info" variant="outlined" /> : null;
                          })()
                        )}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        )}
      </Box>
    </LandlordLayout>
  );
}