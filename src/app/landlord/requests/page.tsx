'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LandlordLayout from '@/components/landlord/LandlordLayout';
import api from '@/services/api';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

interface RequestItem {
  _id: string;
  student?: { name?: string; email?: string };
  property?: { _id?: string; propertyName?: string; city?: string };
  moveInDate: string;
  leaseDuration: string;
  fundingType: string;
  roomNumber?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

function statusColor(status: string): 'warning' | 'success' | 'error' | 'default' {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'error';
  if (status === 'pending') return 'warning';
  return 'default';
}

export default function LandlordRequestsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [roomInputs, setRoomInputs] = useState<Record<string, string>>({});

  const [editTarget, setEditTarget] = useState<RequestItem | null>(null);
  const [editForm, setEditForm] = useState({ moveInDate: '', leaseDuration: '', fundingType: 'NSFAS', message: '', roomNumber: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<RequestItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'landlord')) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!isAuthenticated || user?.role !== 'landlord') return;
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/requests');
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setRequests(data);
        const initialRoomInputs: Record<string, string> = {};
        for (const request of data) {
          initialRoomInputs[request._id] = request.roomNumber || '';
        }
        setRoomInputs(initialRoomInputs);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [isAuthenticated, user]);

  const updateStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const roomNumber = (roomInputs[requestId] || '').trim();
      if (status === 'approved' && !roomNumber) {
        setError('Assign a room number before approving the application.');
        return;
      }

      setUpdatingId(requestId);
      setError('');
      const res = await api.patch(`/requests/${requestId}/status`, { status, roomNumber });
      const updated = res.data;
      setRequests((prev) => prev.map((request) => request._id === requestId ? { ...request, ...updated } : request));
      if (updated?.roomNumber !== undefined) {
        setRoomInputs((prev) => ({ ...prev, [requestId]: updated.roomNumber || '' }));
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update request status');
    } finally {
      setUpdatingId(null);
    }
  };

  const openEdit = (request: RequestItem) => {
    setEditTarget(request);
    setEditForm({
      moveInDate: request.moveInDate ? request.moveInDate.split('T')[0] : '',
      leaseDuration: String(request.leaseDuration || ''),
      fundingType: request.fundingType || 'NSFAS',
      message: request.message || '',
      roomNumber: request.roomNumber || roomInputs[request._id] || '',
    });
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    try {
      setSavingEdit(true);
      const payload = {
        moveInDate: editForm.moveInDate,
        leaseDuration: Number(editForm.leaseDuration),
        fundingType: editForm.fundingType,
        message: editForm.message,
        roomNumber: editForm.roomNumber,
      };
      const res = await api.patch(`/requests/${editTarget._id}`, payload);
      const updated = res.data?.data;
      setRequests((prev) => prev.map((request) => request._id === editTarget._id ? updated : request));
      setRoomInputs((prev) => ({ ...prev, [editTarget._id]: updated?.roomNumber || '' }));
      setEditTarget(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update application');
    } finally {
      setSavingEdit(false);
    }
  };

  const removeRequest = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/requests/${deleteTarget._id}`);
      setRequests((prev) => prev.filter((request) => request._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to remove application');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(
    () => (statusFilter === 'all' ? requests : requests.filter((request) => request.status === statusFilter)),
    [requests, statusFilter]
  );

  if (isLoading) return null;

  return (
    <LandlordLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3, gap: 1.5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Enquiry Management</Typography>
          <Typography variant="body2" color="text.secondary">Only requests for your own properties are visible here.</Typography>
        </Box>
        <Button variant="outlined" onClick={() => router.push('/landlord/dashboard')} sx={{ textTransform: 'none' }}>Back to Dashboard</Button>
      </Stack>

      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup exclusive value={statusFilter} onChange={(_, value) => value && setStatusFilter(value)} size="small">
          <ToggleButton value="all">All ({requests.length})</ToggleButton>
          <ToggleButton value="pending">Pending ({requests.filter((request) => request.status === 'pending').length})</ToggleButton>
          <ToggleButton value="approved">Approved ({requests.filter((request) => request.status === 'approved').length})</ToggleButton>
          <ToggleButton value="rejected">Rejected ({requests.filter((request) => request.status === 'rejected').length})</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">No {statusFilter === 'all' ? '' : statusFilter} requests found for your account.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Move-in</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Funding</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((request) => (
                <TableRow key={request._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{request.student?.name || 'Student'}</Typography>
                    <Typography variant="caption" color="text.secondary">{request.student?.email || ''}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{request.property?.propertyName || 'Property'}</Typography>
                    <Typography variant="caption" color="text.secondary">{request.property?.city || ''}</Typography>
                  </TableCell>
                  <TableCell>{new Date(request.moveInDate).toLocaleDateString('en-ZA')}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{request.fundingType}</TableCell>
                  <TableCell>
                    {request.status === 'pending' ? (
                      <TextField
                        size="small"
                        placeholder="e.g. B12"
                        value={roomInputs[request._id] || ''}
                        onChange={(e) => setRoomInputs((prev) => ({ ...prev, [request._id]: e.target.value }))}
                        sx={{ minWidth: 120 }}
                      />
                    ) : request.roomNumber ? (
                      <Chip size="small" label={`Room ${request.roomNumber}`} color="info" variant="outlined" />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell><Chip size="small" color={statusColor(request.status)} label={request.status} sx={{ textTransform: 'capitalize' }} /></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 0.75 }}>
                      {request.status === 'pending' && (
                        <>
                          <Button size="small" color="success" variant="contained" disabled={updatingId === request._id} onClick={() => updateStatus(request._id, 'approved')}>
                            Approve
                          </Button>
                          <Button size="small" color="error" variant="outlined" disabled={updatingId === request._id} onClick={() => updateStatus(request._id, 'rejected')}>
                            Reject
                          </Button>
                        </>
                      )}
                      <Button size="small" variant="outlined" disabled={updatingId === request._id} onClick={() => openEdit(request)}>
                        Edit
                      </Button>
                      <Button size="small" color="error" variant="text" disabled={updatingId === request._id} onClick={() => setDeleteTarget(request)}>
                        Remove
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>

      <Dialog open={!!editTarget} onClose={() => !savingEdit && setEditTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Application</DialogTitle>
        <DialogContent>
          <Stack sx={{ gap: 2, mt: 0.5 }}>
            <TextField
              label="Move-in date"
              type="date"
              value={editForm.moveInDate}
              onChange={(e) => setEditForm((prev) => ({ ...prev, moveInDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Lease duration (months)"
              type="number"
              value={editForm.leaseDuration}
              onChange={(e) => setEditForm((prev) => ({ ...prev, leaseDuration: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Funding type"
              select
              value={editForm.fundingType}
              onChange={(e) => setEditForm((prev) => ({ ...prev, fundingType: e.target.value }))}
              fullWidth
            >
              <MenuItem value="NSFAS">NSFAS</MenuItem>
              <MenuItem value="Private">Private</MenuItem>
              <MenuItem value="Self-funded">Self-funded</MenuItem>
            </TextField>
            <TextField
              label="Assigned room"
              value={editForm.roomNumber}
              onChange={(e) => setEditForm((prev) => ({ ...prev, roomNumber: e.target.value }))}
              placeholder="e.g. B12"
              fullWidth
            />
            <TextField
              label="Message"
              value={editForm.message}
              onChange={(e) => setEditForm((prev) => ({ ...prev, message: e.target.value }))}
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTarget(null)} disabled={savingEdit}>Cancel</Button>
          <Button onClick={saveEdit} disabled={savingEdit} variant="contained">{savingEdit ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Remove Application?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will permanently remove the selected application and free up its room allocation if it was approved.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button onClick={removeRequest} disabled={deleting} color="error" variant="contained">{deleting ? 'Removing…' : 'Remove'}</Button>
        </DialogActions>
      </Dialog>
    </LandlordLayout>
  );
}
