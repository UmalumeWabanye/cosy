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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

interface Viewing {
  _id: string;
  status: 'pending' | 'approved' | 'declined';
  requestedDate: string;
  student?: { name?: string; email?: string };
  property?: { propertyName?: string; city?: string };
}

function statusColor(status: Viewing['status']): 'warning' | 'success' | 'error' | 'default' {
  if (status === 'approved') return 'success';
  if (status === 'declined') return 'error';
  if (status === 'pending') return 'warning';
  return 'default';
}

export default function LandlordViewingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'landlord')) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchViewings = async () => {
      if (!isAuthenticated || user?.role !== 'landlord') return;
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/viewings');
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setViewings(data);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load viewing bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchViewings();
  }, [isAuthenticated, user]);

  const updateStatus = async (viewingId: string, status: 'approved' | 'declined') => {
    try {
      setUpdatingId(viewingId);
      const res = await api.patch(`/viewings/${viewingId}/status`, { status });
      const updated = res.data?.data;
      setViewings((prev) => prev.map((item) => item._id === viewingId ? { ...item, status: updated?.status ?? status } : item));
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to update viewing status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(
    () => (statusFilter === 'all' ? viewings : viewings.filter((viewing) => viewing.status === statusFilter)),
    [viewings, statusFilter]
  );

  if (isLoading) return null;

  return (
    <LandlordLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3, gap: 1.5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Viewing Bookings</Typography>
          <Typography variant="body2" color="text.secondary">Only viewing bookings for your listings are shown.</Typography>
        </Box>
        <Button variant="outlined" onClick={() => router.push('/landlord/dashboard')} sx={{ textTransform: 'none' }}>Back to Dashboard</Button>
      </Stack>

      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup exclusive value={statusFilter} onChange={(_, value) => value && setStatusFilter(value)} size="small">
          <ToggleButton value="all">All ({viewings.length})</ToggleButton>
          <ToggleButton value="pending">Pending ({viewings.filter((viewing) => viewing.status === 'pending').length})</ToggleButton>
          <ToggleButton value="approved">Approved ({viewings.filter((viewing) => viewing.status === 'approved').length})</ToggleButton>
          <ToggleButton value="declined">Declined ({viewings.filter((viewing) => viewing.status === 'declined').length})</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">No {statusFilter === 'all' ? '' : statusFilter} viewings found for your account.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Requested Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((viewing) => (
                <TableRow key={viewing._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{viewing.student?.name || 'Student'}</Typography>
                    <Typography variant="caption" color="text.secondary">{viewing.student?.email || ''}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{viewing.property?.propertyName || 'Property'}</Typography>
                    <Typography variant="caption" color="text.secondary">{viewing.property?.city || ''}</Typography>
                  </TableCell>
                  <TableCell>{new Date(viewing.requestedDate).toLocaleString('en-ZA')}</TableCell>
                  <TableCell><Chip size="small" color={statusColor(viewing.status)} label={viewing.status} sx={{ textTransform: 'capitalize' }} /></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 0.75 }}>
                      {viewing.status === 'pending' && (
                        <>
                          <Button size="small" color="success" variant="contained" disabled={updatingId === viewing._id} onClick={() => updateStatus(viewing._id, 'approved')}>
                            Approve
                          </Button>
                          <Button size="small" color="error" variant="outlined" disabled={updatingId === viewing._id} onClick={() => updateStatus(viewing._id, 'declined')}>
                            Decline
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
    </LandlordLayout>
  );
}
