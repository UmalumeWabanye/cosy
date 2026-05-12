'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayout';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import IconButton from '@mui/material/IconButton';

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

interface Request {
  _id: string;
  userId: { _id: string; name: string; email: string; university: string };
  propertyId: { _id: string; name: string; images: string[]; location: { address: string; city: string }; pricing: { minRent: number; maxRent: number; deposit: number } };
  moveInDate: string;
  leaseDuration: string;
  fundingType: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

function statusColor(status: string): 'warning' | 'success' | 'error' | 'default' {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'error';
  if (status === 'pending') return 'warning';
  return 'default';
}

export default function AdminRequestsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) router.push('/');
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => { fetchRequests(); }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const res = await api.get('/requests', { params });
      setRequests(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(true);
      await api.patch(`/requests/${id}`, { status: 'approved' });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'approved' } : r));
      setSelectedRequest(null);
    } catch (e: any) { alert(e.response?.data?.message || 'Failed'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading(true);
      await api.patch(`/requests/${id}`, { status: 'rejected' });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'rejected' } : r));
      setSelectedRequest(null);
    } catch (e: any) { alert(e.response?.data?.message || 'Failed'); }
    finally { setActionLoading(false); }
  };

  const filtered = statusFilter === 'all' ? requests : requests.filter(r => r.status === statusFilter);

  if (isLoading) return null;
  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <AdminLayout pendingCount={requests.filter(r => r.status === 'pending').length}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{  justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 4, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Requests</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Review and manage student accommodation requests</Typography>
          </Box>
        </Stack>

        {/* Filter tabs */}
        <ToggleButtonGroup
          exclusive
          value={statusFilter}
          onChange={(_, v) => { if (v) setStatusFilter(v); }}
          size="small"
          sx={{ mb: 3 }}
        >
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <ToggleButton key={f} value={f} sx={{ textTransform: 'capitalize', px: 2 }}>
              {f}
              <Chip
                size="small"
                label={f === 'all' ? requests.length : requests.filter(r => r.status === f).length}
                sx={{ ml: 1, height: 18, fontSize: 11 }}
                color={statusColor(f) as any}
                variant="outlined"
              />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 8, textAlign: 'center' }}>
            <Typography color="text.secondary">No {statusFilter === 'all' ? '' : statusFilter} requests found.</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Move-in</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Lease</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Funding</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} >{r.userId?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.userId?.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{r.propertyId?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.propertyId?.location?.city}</Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2">{new Date(r.moveInDate).toLocaleDateString()}</Typography></TableCell>
                    <TableCell><Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{r.leaseDuration}</Typography></TableCell>
                    <TableCell><Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{r.fundingType}</Typography></TableCell>
                    <TableCell>
                      <Chip size="small" label={r.status} color={statusColor(r.status)} sx={{ textTransform: 'capitalize' }} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" sx={{  justifyContent: 'flex-end', gap: 0.5 }}>
                        {r.status === 'pending' && (
                          <>
                            <IconButton size="small" color="success" onClick={() => handleApprove(r._id)} title="Approve">
                              <CheckRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleReject(r._id)} title="Reject">
                              <CloseRoundedIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                        <IconButton size="small" onClick={() => setSelectedRequest(r)} title="View details">
                          <OpenInNewRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest} onClose={() => setSelectedRequest(null)}  fullWidth sx={{ maxWidth: "sm" }}>
        {selectedRequest && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>Request Details</DialogTitle>
            <DialogContent dividers>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>PROPERTY</Typography>
              <Typography sx={{ fontWeight: 600 }} >{selectedRequest.propertyId?.name}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedRequest.propertyId?.location?.address}, {selectedRequest.propertyId?.location?.city}</Typography>
              <Typography variant="body2">R{selectedRequest.propertyId?.pricing?.minRent?.toLocaleString()} – R{selectedRequest.propertyId?.pricing?.maxRent?.toLocaleString()}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>STUDENT</Typography>
              <Typography sx={{ fontWeight: 600 }} >{selectedRequest.userId?.name}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedRequest.userId?.email}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedRequest.userId?.university}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>REQUEST</Typography>
              <Stack direction="row" sx={{  flexWrap: 'wrap', gap: 2 }}>
                <Box><Typography variant="caption" color="text.secondary">Move-in</Typography><Typography variant="body2">{new Date(selectedRequest.moveInDate).toLocaleDateString()}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Lease</Typography><Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{selectedRequest.leaseDuration}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Funding</Typography><Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{selectedRequest.fundingType}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Status</Typography><Chip size="small" label={selectedRequest.status} color={statusColor(selectedRequest.status)} sx={{ textTransform: 'capitalize', display: 'block' }} /></Box>
              </Stack>

              {selectedRequest.message && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>MESSAGE</Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{selectedRequest.message}</Typography>
                  </Paper>
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              {selectedRequest.status === 'pending' && (
                <>
                  <Button variant="contained" color="success" disabled={actionLoading} startIcon={actionLoading ? <CircularProgress size={16} /> : <CheckRoundedIcon />} onClick={() => handleApprove(selectedRequest._id)}>
                    Approve
                  </Button>
                  <Button variant="contained" color="error" disabled={actionLoading} startIcon={<CloseRoundedIcon />} onClick={() => handleReject(selectedRequest._id)}>
                    Reject
                  </Button>
                </>
              )}
              <Button onClick={() => setSelectedRequest(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </AdminLayout>
  );
}
