'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LandlordLayout from '@/components/landlord/LandlordLayout';
import api from '@/services/api';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

interface AllocationItem {
  roomNumber: string;
  student?: { _id?: string; name?: string; email?: string };
  request?: { _id?: string; status?: string; moveInDate?: string; leaseDuration?: number };
  notes?: string;
  allocatedAt?: string;
}

interface PropertyItem {
  _id: string;
  propertyName: string;
  city?: string;
  totalRooms?: number;
  availableRooms?: number;
  roomAllocations?: AllocationItem[];
}

type RoomState = 'available' | 'allocated' | 'unassigned';

interface RoomSlot {
  label: string;
  state: RoomState;
  allocation?: AllocationItem;
}

function stateChipColor(state: RoomState): 'success' | 'warning' | 'default' {
  if (state === 'allocated') return 'success';
  if (state === 'unassigned') return 'warning';
  return 'default';
}

export default function PropertyRoomInventoryPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { user, isAuthenticated, isLoading } = useAuth();

  const [property, setProperty] = useState<PropertyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        const res = await api.get(`/properties/${propertyId}`);
        setProperty(res.data || null);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load room inventory');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, user, propertyId]);

  const roomSlots = useMemo<RoomSlot[]>(() => {
    const totalRooms = Number(property?.totalRooms || 0);
    const allocations = property?.roomAllocations || [];
    const roomMap = new Map((allocations || []).map((allocation) => [allocation.roomNumber.trim().toLowerCase(), allocation]));

    const slots: RoomSlot[] = [];
    for (let index = 1; index <= totalRooms; index += 1) {
      const label = String(index);
      const allocation = roomMap.get(label.toLowerCase());
      slots.push({
        label,
        state: allocation ? 'allocated' : 'available',
        allocation,
      });
    }

    const unmatchedAllocations = allocations.filter((allocation) => !roomMap.has(allocation.roomNumber.trim().toLowerCase()));
    unmatchedAllocations.forEach((allocation) => {
      slots.push({
        label: allocation.roomNumber,
        state: 'unassigned',
        allocation,
      });
    });

    return slots;
  }, [property]);

  const stats = useMemo(() => {
    const totalRooms = Number(property?.totalRooms || 0);
    const allocated = (property?.roomAllocations || []).length;
    const available = Math.max(0, totalRooms - allocated);
    return {
      totalRooms,
      allocated,
      available,
      occupancyRate: totalRooms > 0 ? Math.round((allocated / totalRooms) * 100) : 0,
    };
  }, [property]);

  if (isLoading) return null;

  return (
    <LandlordLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'grey.50', minHeight: '100vh' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3, gap: 1.5 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Room Inventory</Typography>
            <Typography variant="body2" color="text.secondary">
              Track allocated and vacant rooms for {property?.propertyName || 'this property'}.
            </Typography>
          </Box>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={() => router.push('/landlord/properties')} sx={{ textTransform: 'none' }}>
              Back to Properties
            </Button>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => router.push(`/landlord/properties/${propertyId}/allocate`)} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Manage Allocations
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : !property ? (
          <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
            <Typography color="text.secondary">Property not found.</Typography>
          </Paper>
        ) : (
          <Stack sx={{ gap: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                  <Typography variant="caption" color="text.secondary">Total Rooms</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalRooms}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                  <Typography variant="caption" color="text.secondary">Allocated</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.allocated}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                  <Typography variant="caption" color="text.secondary">Available</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.available}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                  <Typography variant="caption" color="text.secondary">Occupancy Rate</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.occupancyRate}%</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Room Slots</Typography>
                  <Typography variant="body2" color="text.secondary">Rooms inferred from property total rooms and allocation records.</Typography>
                </Box>
                <Chip size="small" icon={<HomeWorkRoundedIcon />} label={`${roomSlots.length} entries`} />
              </Stack>

              {roomSlots.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No room data is available for this property yet.</Typography>
              ) : (
                <Grid container spacing={1.5}>
                  {roomSlots.map((slot) => (
                    <Grid key={`${slot.label}-${slot.state}`} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.8,
                          borderColor: slot.state === 'allocated' ? 'success.light' : slot.state === 'unassigned' ? 'warning.light' : 'divider',
                          bgcolor: slot.state === 'allocated' ? 'rgba(46,125,50,0.04)' : slot.state === 'unassigned' ? 'rgba(237,108,2,0.04)' : 'background.paper',
                        }}
                      >
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>Room {slot.label}</Typography>
                            <Chip size="small" label={slot.state} color={stateChipColor(slot.state)} sx={{ mt: 0.75, textTransform: 'capitalize' }} />
                          </Box>
                          <MeetingRoomRoundedIcon sx={{ color: slot.state === 'allocated' ? 'success.main' : slot.state === 'unassigned' ? 'warning.main' : 'text.disabled' }} />
                        </Stack>

                        {slot.allocation ? (
                          <Stack sx={{ gap: 0.5, mt: 1.25 }}>
                            <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center' }}>
                              <PeopleRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{slot.allocation.student?.name || 'Student'}</Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">{slot.allocation.student?.email || ''}</Typography>
                            {slot.allocation.request?.status && (
                              <Chip size="small" label={slot.allocation.request.status} color={slot.allocation.request.status === 'approved' ? 'success' : 'default'} sx={{ alignSelf: 'flex-start', mt: 0.5, textTransform: 'capitalize' }} />
                            )}
                            {slot.allocation.notes && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                Notes: {slot.allocation.notes}
                              </Typography>
                            )}
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>
                            Vacant room slot.
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Allocation Records</Typography>
              {(property.roomAllocations || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">No room allocations have been added yet.</Typography>
              ) : (
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Request</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Allocated</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(property.roomAllocations || []).map((allocation) => (
                        <TableRow key={`${allocation.roomNumber}-${allocation.allocatedAt || ''}`} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{allocation.roomNumber}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{allocation.student?.name || 'Student'}</Typography>
                            <Typography variant="caption" color="text.secondary">{allocation.student?.email || ''}</Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                              <Chip size="small" label={allocation.request?._id ? 'Linked request' : 'No request link'} color={allocation.request?._id ? 'success' : 'default'} />
                            </Stack>
                          </TableCell>
                          <TableCell>{allocation.allocatedAt ? new Date(allocation.allocatedAt).toLocaleDateString('en-ZA') : '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Stack>
        )}
      </Box>
    </LandlordLayout>
  );
}
