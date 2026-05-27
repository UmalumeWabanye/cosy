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
  totalRooms?: number;
  availableRooms?: number;
  roomAllocations?: Array<{
    roomNumber?: string;
    student?: string | { _id?: string; name?: string; email?: string };
    request?: string | { _id?: string };
    allocatedAt?: string;
  }>;
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
  roomNumber?: string;
  createdAt: string;
}

interface ViewingItem {
  _id: string;
  status: 'pending' | 'approved' | 'declined';
  requestedDate: string;
  student?: { name?: string; email?: string };
  property?: { _id: string; propertyName?: string; city?: string };
}

type PressureColor = 'error' | 'warning' | 'info' | 'success';

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

function daysUntil(dateStr?: string) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
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
    if (!isLoading && (!isAuthenticated || user?.role !== 'landlord')) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [propertyRes, requestRes, viewingRes] = await Promise.allSettled([
          api.get('/properties/mine?limit=200'),
          api.get('/requests'),
          api.get('/viewings'),
        ]);

        const propertyData =
          propertyRes.status === 'fulfilled'
            ? (propertyRes.value.data?.data ?? propertyRes.value.data ?? [])
            : [];
        const requestData =
          requestRes.status === 'fulfilled'
            ? (requestRes.value.data?.data ?? requestRes.value.data ?? [])
            : [];
        const viewingData =
          viewingRes.status === 'fulfilled'
            ? (viewingRes.value.data?.data ?? viewingRes.value.data ?? [])
            : [];

        setProperties(Array.isArray(propertyData) ? propertyData : []);
        setRequests(Array.isArray(requestData) ? requestData : []);
        setViewings(Array.isArray(viewingData) ? viewingData : []);

        if (requestRes.status !== 'fulfilled') {
          setError('Could not load applications right now. Please refresh.');
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load landlord dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'landlord') {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const activeListings = useMemo(() => properties.filter((property) => property.isAvailable !== false).length, [properties]);
  const pendingApplications = useMemo(() => requests.filter((request) => request.status === 'pending').length, [requests]);
  const approvedApplications = useMemo(() => requests.filter((request) => request.status === 'approved').length, [requests]);
  const pendingViewings = useMemo(() => viewings.filter((viewing) => viewing.status === 'pending').length, [viewings]);

  const occupancyByProperty = useMemo(() => {
    const now = new Date();

    return properties.map((property) => {
      const totalRooms = Number(property.totalRooms ?? property.roomAllocations?.length ?? 0);
      const propertyRequests = requests.filter((request) => request.property?._id === property._id && request.status === 'approved');

      const activeApprovedRequests = propertyRequests.filter((request) => {
        if (!request.moveInDate) return false;
        const moveInDate = new Date(request.moveInDate);
        if (Number.isNaN(moveInDate.getTime())) return false;

        const leaseMonths = Number(request.leaseDuration || 0);
        const leaseEndDate = new Date(moveInDate);
        leaseEndDate.setMonth(leaseEndDate.getMonth() + leaseMonths);

        return moveInDate <= now && leaseEndDate >= now;
      });

      const occupiedFromAllocations = new Set(
        (property.roomAllocations || [])
          .filter((allocation) => allocation.roomNumber && (allocation.student || allocation.request))
          .map((allocation) => String(allocation.roomNumber))
      );

      const occupiedRooms = Math.max(activeApprovedRequests.length, occupiedFromAllocations.size);
      const vacantRooms = Math.max(0, totalRooms - occupiedRooms);
      const occupancyRateForProperty = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
      const pressureLabel = occupancyRateForProperty >= 90 ? 'Critical' : occupancyRateForProperty >= 75 ? 'High' : vacantRooms <= 2 ? 'Watch' : 'Healthy';
      const pressureColor: PressureColor = occupancyRateForProperty >= 90 ? 'error' : occupancyRateForProperty >= 75 ? 'warning' : vacantRooms <= 2 ? 'info' : 'success';

      const upcomingMoveIns = propertyRequests
        .filter((request) => request.moveInDate && new Date(request.moveInDate) > now)
        .sort((a, b) => +new Date(a.moveInDate || '') - +new Date(b.moveInDate || ''))
        .slice(0, 2);

      return {
        property,
        totalRooms,
        occupiedRooms,
        vacantRooms,
        occupancyRateForProperty,
        pressureLabel,
        pressureColor,
        activeApprovedRequests,
        upcomingMoveIns,
      };
    });
  }, [properties, requests]);

  const totalRooms = useMemo(
    () => occupancyByProperty.reduce((sum, item) => sum + item.totalRooms, 0),
    [occupancyByProperty]
  );
  const occupiedRooms = useMemo(
    () => occupancyByProperty.reduce((sum, item) => sum + item.occupiedRooms, 0),
    [occupancyByProperty]
  );
  const vacantRooms = Math.max(0, totalRooms - occupiedRooms);
  const overallOccupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

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
    return overallOccupancyRate;
  }, [overallOccupancyRate]);

  const upcomingMoveIns = useMemo(
    () =>
      requests
        .filter((request) => request.status === 'approved' && request.moveInDate)
        .sort((a, b) => +new Date(a.moveInDate || '') - +new Date(b.moveInDate || ''))
        .slice(0, 6),
    [requests]
  );

  const pressureWatchCount = useMemo(
    () => occupancyByProperty.filter((item) => item.occupancyRateForProperty >= 75 || item.vacantRooms <= 2).length,
    [occupancyByProperty]
  );

  const criticalPressureCount = useMemo(
    () => occupancyByProperty.filter((item) => item.occupancyRateForProperty >= 90).length,
    [occupancyByProperty]
  );

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
            <Button
              variant="outlined"
              startIcon={<InsightsRoundedIcon />}
              onClick={() => router.push('/landlord/analytics')}
              sx={{ textTransform: 'none' }}
            >
              Analytics
            </Button>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => router.push('/landlord/properties/new')}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Add Property
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
                <StatCard title="Rooms Occupied" value={occupiedRooms} helper={`Across ${totalRooms || 0} total rooms`} icon={<Diversity3RoundedIcon />} color="#0d9488" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Vacant Rooms" value={vacantRooms} helper={`${occupancyRate}% occupancy`} icon={<VerifiedRoundedIcon />} color={vacantRooms === 0 ? '#2e7d32' : '#ed6c02'} />
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
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Occupancy Rate" value={`${occupancyRate}%`} helper="Rooms occupied vs total rooms" icon={<VerifiedRoundedIcon />} color={occupancyRate >= 70 ? '#2e7d32' : occupancyRate >= 40 ? '#ed6c02' : '#d32f2f'} />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 4 }}>
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
                      <Chip size="small" color="success" label={`Occupied: ${occupiedRooms}`} />
                      <Chip size="small" color="warning" label={`Vacant: ${vacantRooms}`} />
                      <Chip size="small" variant="outlined" label={`Rate: ${occupancyRate}%`} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
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
                      <Button onClick={() => router.push('/landlord/profile')} sx={{ mt: 1.5, textTransform: 'none' }}>
                        Complete Verification
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Room Pressure</Typography>
                      <ApartmentRoundedIcon sx={{ color: criticalPressureCount > 0 ? 'error.main' : 'warning.main' }} />
                    </Stack>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>{pressureWatchCount}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      Properties at or above 75% occupancy, or with two or fewer vacant rooms.
                    </Typography>
                    <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
                      <Chip size="small" color="warning" label={`Watch: ${pressureWatchCount}`} />
                      <Chip size="small" color="error" label={`Critical: ${criticalPressureCount}`} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Property Occupancy</Typography>
                      <Typography variant="body2" color="text.secondary">Room-level occupancy by property</Typography>
                    </Box>
                    <Chip size="small" color="primary" label={`${overallOccupancyRate}% overall`} />
                  </Stack>

                  {occupancyByProperty.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">No properties yet.</Typography>
                  ) : (
                    <Box sx={{ overflowX: 'auto' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Rooms</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Occupied</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Vacant</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Rate</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Pressure</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {occupancyByProperty.map((item) => (
                            <TableRow key={item.property._id} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.property.propertyName}</Typography>
                                <Typography variant="caption" color="text.secondary">{item.property.city || '—'}</Typography>
                              </TableCell>
                              <TableCell>{item.totalRooms}</TableCell>
                              <TableCell>{item.occupiedRooms}</TableCell>
                              <TableCell>{item.vacantRooms}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={`${item.occupancyRateForProperty}%`}
                                  color={item.occupancyRateForProperty >= 80 ? 'success' : item.occupancyRateForProperty >= 50 ? 'warning' : 'error'}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip size="small" label={item.pressureLabel} color={item.pressureColor} sx={{ fontWeight: 600 }} />
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  sx={{ textTransform: 'none' }}
                                  onClick={() => router.push(`/landlord/properties/${item.property._id}/rooms`)}
                                >
                                  Rooms
                                </Button>
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
                <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Upcoming Move-ins</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Approved students whose move-in date is coming up or has just started.</Typography>

                  {upcomingMoveIns.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">No upcoming move-ins yet.</Typography>
                  ) : (
                    <Stack sx={{ gap: 1 }}>
                      {upcomingMoveIns.map((request) => {
                        const days = daysUntil(request.moveInDate);
                        return (
                          <Box key={request._id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.5 }}>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{request.student?.name || 'Student'}</Typography>
                                <Typography variant="caption" color="text.secondary">{request.property?.propertyName || 'Property'} · {request.moveInDate ? new Date(request.moveInDate).toLocaleDateString('en-ZA') : 'No date'}</Typography>
                              </Box>
                              <Chip
                                size="small"
                                label={days === 0 ? 'Today' : days !== null && days > 0 ? `${days} days` : 'Due'}
                                color={days !== null && days <= 3 ? 'warning' : 'default'}
                              />
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Room {request.roomNumber || 'pending assignment'}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              {/* Quick Actions */}
              <Grid size={{ xs: 12 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Quick Actions</Typography>
                  <Stack direction="row" sx={{ gap: 1.5, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Add Property', icon: <AddRoundedIcon fontSize="small" />, path: '/landlord/properties/new', color: '#1976d2', filled: true },
                      { label: 'Review Applications', icon: <ApartmentRoundedIcon fontSize="small" />, path: '/landlord/requests', color: '#ed6c02', filled: false },
                      { label: 'Manage Viewings', icon: <InsightsRoundedIcon fontSize="small" />, path: '/landlord/viewings', color: '#6a1b9a', filled: false },
                      { label: 'View Analytics', icon: <InsightsRoundedIcon fontSize="small" />, path: '/landlord/analytics', color: '#0d9488', filled: false },
                      { label: 'Monthly Report', icon: <PendingActionsRoundedIcon fontSize="small" />, path: '/landlord/reports/collection', color: '#2e7d32', filled: false },
                    ].map(item => (
                      <Button
                        key={item.label}
                        variant={item.filled ? 'contained' : 'outlined'}
                        size="small"
                        startIcon={item.icon}
                        onClick={() => router.push(item.path)}
                        sx={{
                          textTransform: 'none', fontWeight: 600, borderRadius: 2,
                          ...(item.filled ? {} : { borderColor: `${item.color}60`, color: item.color, '&:hover': { borderColor: item.color, bgcolor: `${item.color}10` } }),
                          ...(item.filled ? { bgcolor: item.color, '&:hover': { bgcolor: item.color, opacity: 0.9 } } : {}),
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </Stack>
                </Paper>
              </Grid>

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
