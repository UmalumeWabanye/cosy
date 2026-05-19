'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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

interface RequestItem {
  _id: string;
  student?: { name?: string; email?: string };
  property?: { propertyName?: string; city?: string };
  moveInDate: string;
  leaseDuration: string;
  fundingType: string;
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
      setUpdatingId(requestId);
      await api.patch(`/requests/${requestId}/status`, { status });
      setRequests((prev) => prev.map((request) => request._id === requestId ? { ...request, status } : request));
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to update request status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(
    () => (statusFilter === 'all' ? requests : requests.filter((request) => request.status === statusFilter)),
    [requests, statusFilter]
  );

  if (isLoading) return null;

  return (
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
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
