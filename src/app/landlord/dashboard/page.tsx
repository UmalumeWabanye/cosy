'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayout';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';

import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

interface Property {
  _id: string;
  title: string;
  city?: string;
  price?: number;
  available?: boolean;
  images?: string[];
  createdAt: string;
}

interface Request {
  _id: string;
  property?: { _id: string; title: string };
  user?: { name: string; email: string };
  status: string;
  createdAt: string;
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: `${color}.lighter` || `${color}.50`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: `${color}.main`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function LandlordDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Guard: only landlords
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== 'landlord' && user?.role !== 'admin'))) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [propRes, reqRes] = await Promise.all([
        api.get('/admin/properties?limit=50'),
        api.get('/admin/requests?limit=50'),
      ]);
      setProperties(Array.isArray(propRes.data.data) ? propRes.data.data : propRes.data);
      setRequests(Array.isArray(reqRes.data.data) ? reqRes.data.data : reqRes.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  const activeListings = properties.filter((p) => p.available !== false).length;
  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const approvedRequests = requests.filter((r) => r.status === 'approved').length;

  const statusColor = (s: string) => {
    if (s === 'approved') return 'success';
    if (s === 'rejected') return 'error';
    return 'warning';
  };

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3, gap: 2 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              My Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! Here's an overview of your listings.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => router.push('/admin/properties/new')}
            sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
          >
            Add Listing
          </Button>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<ApartmentRoundedIcon />}
                  label="Total Listings"
                  value={properties.length}
                  color="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<CheckCircleRoundedIcon />}
                  label="Active Listings"
                  value={activeListings}
                  color="success"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<PendingActionsRoundedIcon />}
                  label="Pending Requests"
                  value={pendingRequests}
                  color="warning"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<AssignmentRoundedIcon />}
                  label="Approved Requests"
                  value={approvedRequests}
                  color="info"
                />
              </Grid>
            </Grid>

            {/* My Listings */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
              My Listings
            </Typography>
            {properties.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', mb: 4 }}>
                <ApartmentRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">
                  You haven't added any listings yet.
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2, textTransform: 'none' }}
                  onClick={() => router.push('/admin/properties/new')}
                >
                  Add Your First Listing
                </Button>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                      <TableCell sx={{ fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>
                        City
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {properties.map((p) => (
                      <TableRow key={p._id} hover>
                        <TableCell>
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              src={p.images?.[0]}
                              variant="rounded"
                              sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}
                            >
                              <ApartmentRoundedIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                              {p.title}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Typography variant="caption" color="text.secondary">
                            {p.city ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {p.price != null ? `R${p.price.toLocaleString()}` : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={p.available !== false ? 'Available' : 'Unavailable'}
                            color={p.available !== false ? 'success' : 'default'}
                            variant={p.available !== false ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'none', fontSize: 12 }}
                            onClick={() => router.push(`/admin/properties/${p._id}/edit`)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Recent Requests */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
              Recent Requests
            </Typography>
            {requests.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
                <AssignmentRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No requests yet.</Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>
                        Property
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>
                        Date
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.slice(0, 20).map((r) => (
                      <TableRow key={r._id} hover>
                        <TableCell>
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'secondary.main' }}>
                              {(r.user?.name ?? r.user?.email ?? '?')[0].toUpperCase()}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                {r.user?.name ?? '—'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                {r.user?.email ?? ''}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Typography variant="body2" noWrap>
                            {r.property?.title ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                            color={statusColor(r.status) as any}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(r.createdAt).toLocaleDateString('en-ZA', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
