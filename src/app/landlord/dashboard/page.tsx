'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LandlordLayout from '@/components/landlord/LandlordLayout';
import api from '@/services/api';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';

interface PropertyItem {
  _id: string;
  propertyName: string;
  city?: string;
  address?: string;
  price?: number;
  roomType?: string;
  isAvailable?: boolean;
  createdAt: string;
}

interface RequestItem {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  student?: { _id: string; name?: string; email?: string; university?: string; course?: string };
  property?: { _id: string; propertyName?: string; city?: string };
  moveInDate?: string;
  leaseDuration?: number;
  createdAt: string;
}

interface ViewingItem {
  _id: string;
  status: 'pending' | 'approved' | 'declined';
  requestedDate: string;
  student?: { name?: string; email?: string };
  property?: { _id: string; propertyName?: string; city?: string };
}

function statusColor(status: string): 'success' | 'warning' | 'error' | 'default' {
  if (status === 'approved') return 'success';
  if (status === 'rejected' || status === 'declined') return 'error';
  if (status === 'pending') return 'warning';
  return 'default';
}

function StatCard({
  title,
  value,
  helper,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  helper?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{title}</Typography>
          <Box sx={{ color }}>{icon}</Box>
        </Stack>
        <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{value}</Typography>
        {helper ? <Typography variant="caption" color="text.secondary">{helper}</Typography> : null}
      </CardContent>
    </Card>
  );
}

export default function LandlordDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [viewings, setViewings] = useState<ViewingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== 'landlord' && user?.role !== 'admin'))) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [propertyRes, requestRes, viewingRes] = await Promise.all([
          api.get('/properties/mine?limit=200'),
          api.get('/requests'),
          api.get('/viewings'),
        ]);

        const propertyData = propertyRes.data?.data ?? [];
        const requestData = requestRes.data?.data ?? [];
        const viewingData = viewingRes.data?.data ?? [];

        setProperties(Array.isArray(propertyData) ? propertyData : []);
        setRequests(Array.isArray(requestData) ? requestData : []);
        setViewings(Array.isArray(viewingData) ? viewingData : []);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load landlord dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && (user?.role === 'landlord' || user?.role === 'admin')) {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const activeListings = useMemo(() => properties.filter((property) => property.isAvailable !== false).length, [properties]);
  const pendingApplications = useMemo(() => requests.filter((request) => request.status === 'pending').length, [requests]);
  const approvedApplications = useMemo(() => requests.filter((request) => request.status === 'approved').length, [requests]);
  const pendingViewings = useMemo(() => viewings.filter((viewing) => viewing.status === 'pending').length, [viewings]);

  const activeResidents = useMemo(() => {
    const now = new Date();
    const uniqueStudentIds = new Set<string>();

    for (const request of requests) {
      if (request.status !== 'approved') continue;
      if (!request.student?._id || !request.moveInDate) continue;

      const moveInDate = new Date(request.moveInDate);
      if (Number.isNaN(moveInDate.getTime())) continue;

      const leaseMonths = Number(request.leaseDuration || 0);
      const leaseEndDate = new Date(moveInDate);
      leaseEndDate.setMonth(leaseEndDate.getMonth() + leaseMonths);

      if (moveInDate <= now && leaseEndDate >= now) {
        uniqueStudentIds.add(request.student._id);
      }
    }

    return uniqueStudentIds.size;
  }, [requests]);

  const occupancyRate = useMemo(() => {
    if (properties.length === 0) return 0;
    const rate = Math.round((approvedApplications / properties.length) * 100);
    return Math.max(0, Math.min(rate, 100));
  }, [approvedApplications, properties.length]);

  const profileVerified = Boolean(user?.profileComplete && user?.idNumber);

  const recentRequests = useMemo(
    () => [...requests].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 8),
    [requests]
  );

  const recentViewings = useMemo(
    () => [...viewings].sort((a, b) => +new Date(b.requestedDate) - +new Date(a.requestedDate)).slice(0, 8),
    [viewings]
  );

  const recentlyAddedProperties = useMemo(
    () => [...properties].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6),
    [properties]
  );

  if (isLoading) return null;

  return (
    <LandlordLayout>
      <Box sx={{ px: { xs: 2, md: 4 }, pt: { xs: 2, md: 3 }, pb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3, gap: 1.5 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Landlord Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your listings, enquiries, viewings, occupancy, and verification in one place.
            </Typography>
          </Box>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={() => router.push('/landlord/requests')} sx={{ textTransform: 'none' }}>
              Manage Enquiries
            </Button>
            <Button variant="outlined" onClick={() => router.push('/landlord/viewings')} sx={{ textTransform: 'none' }}>
              View Bookings
            </Button>
            <Button variant="outlined" onClick={() => router.push('/landlord/analytics')} sx={{ textTransform: 'none' }}>
              Open Analytics
            </Button>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => router.push('/landlord/properties/new')} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Add Listing
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Total Listings" value={properties.length} helper="All properties" icon={<ApartmentRoundedIcon />} color="#1976d2" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Active Listings" value={activeListings} helper="Visible to students" icon={<CheckCircleRoundedIcon />} color="#2e7d32" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Pending Enquiries" value={pendingApplications} helper="Need your action" icon={<PendingActionsRoundedIcon />} color="#ed6c02" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Pending Viewings" value={pendingViewings} helper="Student booking requests" icon={<Diversity3RoundedIcon />} color="#6a1b9a" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Students Living" value={activeResidents} helper="Active approved occupancies" icon={<InsightsRoundedIcon />} color="#0d9488" />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Occupancy Tracking</Typography>
                      <InsightsRoundedIcon sx={{ color: 'primary.main' }} />
                    </Stack>
                    <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>{occupancyRate}%</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Approx. occupancy based on approved applications vs total listings.
                    </Typography>
                    <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
                      <Chip size="small" color="success" label={`Approved: ${approvedApplications}`} />
                      <Chip size="small" color="warning" label={`Pending: ${pendingApplications}`} />
                      <Chip size="small" variant="outlined" label={`Listings: ${properties.length}`} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Verification Flow</Typography>
                      <VerifiedRoundedIcon sx={{ color: profileVerified ? 'success.main' : 'warning.main' }} />
                    </Stack>
                    <Chip
                      sx={{ mt: 1 }}
                      color={profileVerified ? 'success' : 'warning'}
                      label={profileVerified ? 'Verified Profile' : 'Verification Incomplete'}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                      {profileVerified
                        ? 'Your verification details are complete and visible to applicants.'
                        : 'Complete your profile to improve student trust and conversion.'}
                    </Typography>
                    {!profileVerified && (
                      <Button onClick={() => router.push('/profile')} sx={{ mt: 1.5, textTransform: 'none' }}>
                        Complete Verification
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Enquiry Management</Typography>
                  {recentRequests.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">No enquiries yet.</Typography>
                  ) : (
                    <Box sx={{ overflowX: 'auto' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Move-in</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentRequests.map((request) => (
                            <TableRow key={request._id} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{request.student?.name || 'Student'}</Typography>
                                <Typography variant="caption" color="text.secondary">{request.student?.email || ''}</Typography>
                              </TableCell>
                              <TableCell>{request.property?.propertyName || 'Property'}</TableCell>
                              <TableCell>{request.moveInDate ? new Date(request.moveInDate).toLocaleDateString() : '—'}</TableCell>
                              <TableCell>
                                <Chip size="small" color={statusColor(request.status)} label={request.status} sx={{ textTransform: 'capitalize' }} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 5 }}>
                <Stack sx={{ gap: 2 }}>
                  <Paper variant="outlined" sx={{ p: 2.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.25 }}>Viewing Bookings</Typography>
                    {recentViewings.length === 0 ? (
                      <Typography color="text.secondary" variant="body2">No viewing requests yet.</Typography>
                    ) : (
                      <Stack sx={{ gap: 1 }}>
                        {recentViewings.map((viewing) => (
                          <Box key={viewing._id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.2 }}>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{viewing.property?.propertyName || 'Property'}</Typography>
                              <Chip size="small" color={statusColor(viewing.status)} label={viewing.status} sx={{ textTransform: 'capitalize' }} />
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {viewing.student?.name || 'Student'} • {new Date(viewing.requestedDate).toLocaleString('en-ZA')}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.25 }}>Recent Listings</Typography>
                    {recentlyAddedProperties.length === 0 ? (
                      <Typography color="text.secondary" variant="body2">No listings yet.</Typography>
                    ) : (
                      <Stack sx={{ gap: 1 }}>
                        {recentlyAddedProperties.map((property) => (
                          <Stack key={property._id} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed', borderColor: 'divider', pb: 0.8 }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{property.propertyName}</Typography>
                              <Typography variant="caption" color="text.secondary">{property.city || '—'}</Typography>
                            </Box>
                            <Chip size="small" label={property.isAvailable ? 'Available' : 'Unavailable'} color={property.isAvailable ? 'success' : 'default'} />
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </LandlordLayout>
  );
}
