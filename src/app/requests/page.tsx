'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/services/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import StudentLayout from '@/components/student/StudentLayout';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

interface Request {
  _id: string;
  propertyId: { _id: string; name: string; images: string[]; location: { city: string; address: string }; pricing: { minRent: number } };
  moveInDate: string; leaseDuration: string; fundingType: string; message: string;
  status: 'pending' | 'approved' | 'rejected'; createdAt: string;
}

const statusColor: Record<string, 'warning' | 'success' | 'error'> = {
  pending: 'warning', approved: 'success', rejected: 'error',
};

export default function RequestsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'student')) router.push('/login');
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get('/requests/my');
        setRequests(res.data.data);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load requests');
      } finally { setLoading(false); }
    };
    fetch();
  }, [isAuthenticated]);

  if (isLoading) return (
    <StudentLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    </StudentLayout>
  );

  if (!isAuthenticated || user?.role !== 'student') return null;

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  return (
    <StudentLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>My Requests</Typography>
            <Typography variant="body2" color="text.secondary">Track your accommodation requests</Typography>
          </Box>
          <Button variant="contained" component={Link} href="/browse" sx={{ textTransform: 'none', fontWeight: 600 }}>
            + New Request
          </Button>
        </Box>

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        {/* Filter */}
        <Box sx={{ overflowX: 'auto', pb: 0.5, mb: 3 }}>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, v) => v && setFilter(v)}
            size="small"
            sx={{ flexWrap: 'nowrap', whiteSpace: 'nowrap' }}
          >
            {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
              <ToggleButton key={s} value={s} sx={{ textTransform: 'capitalize', fontFamily: 'inherit', px: 2 }}>
                {s === 'all' ? 'All' : s}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Card variant="outlined" sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>
              {filter === 'all' ? 'No requests yet. Browse properties to get started!' : `No ${filter} requests.`}
            </Typography>
            <Button variant="contained" component={Link} href="/browse" sx={{ textTransform: 'none' }}>
              Browse Properties
            </Button>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filtered.map((request) => (
              <Card key={request._id} variant="outlined" sx={{ boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px', '&:hover': { boxShadow: 'hsla(220, 30%, 5%, 0.1) 0px 10px 25px 0px' }, transition: 'box-shadow 0.2s' }}>
                <CardContent>
                  <Grid container spacing={3}>
                    {/* Image */}
                    <Grid size={{ xs: 12, sm: 3 }}>
                      {request.propertyId.images?.[0] ? (
                        <Box sx={{ height: 140, borderRadius: 1, overflow: 'hidden' }}>
                          <img src={request.propertyId.images[0]} alt={request.propertyId.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                      ) : (
                        <Box sx={{ height: 140, bgcolor: 'grey.200', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography color="text.disabled">No image</Typography>
                        </Box>
                      )}
                    </Grid>

                    {/* Details */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>{request.propertyId.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {request.propertyId.location.address}, {request.propertyId.location.city}
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Monthly Rent</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            R{request.propertyId.pricing.minRent.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Move-in Date</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {new Date(request.moveInDate).toLocaleDateString('en-ZA')}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                        <Chip label={request.leaseDuration} size="small" variant="outlined" color="primary" />
                        <Chip label={request.fundingType} size="small" variant="outlined" />
                      </Box>
                    </Grid>

                    {/* Status */}
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Status</Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              label={request.status}
                              color={statusColor[request.status]}
                              size="small"
                              sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                            />
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {new Date(request.createdAt).toLocaleDateString('en-ZA')}
                          </Typography>
                          <Button variant="outlined" size="small" fullWidth onClick={() => router.push(`/browse/${request.propertyId._id}`)} sx={{ textTransform: 'none' }}>
                            View Property
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </StudentLayout>
  );
}
