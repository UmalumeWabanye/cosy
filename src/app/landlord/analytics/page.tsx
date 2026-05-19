'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LandlordLayout from '@/components/landlord/LandlordLayout';
import api from '@/services/api';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

interface PropertyItem {
  _id: string;
  propertyName: string;
  city?: string;
  universityNearby?: string;
  price?: number;
  isAvailable?: boolean;
}

interface RequestItem {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  leaseDuration?: number;
  moveInDate?: string;
  createdAt: string;
  student?: { _id: string; name?: string; email?: string };
  property?: { _id: string; propertyName?: string };
}

interface ViewingItem {
  _id: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
  property?: { _id: string; propertyName?: string };
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function MiniLineChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  if (data.length === 0) {
    return <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>No data</Typography>;
  }

  const max = Math.max(...data.map((item) => item.value), 1);
  const width = 420;
  const height = 90;
  const padding = 8;
  const points = data.map((item, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (item.value / max) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 90 }}>
        <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={points.join(' ')} />
        {data.map((item, index) => {
          const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
          const y = height - padding - (item.value / max) * (height - padding * 2);
          return <circle key={index} cx={x} cy={y} r="3.5" fill={color} />;
        })}
      </svg>
      <Stack direction="row" sx={{ justifyContent: 'space-between', px: `${padding}px` }}>
        {data.map((item, index) => (
          <Typography key={index} variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>{item.label}</Typography>
        ))}
      </Stack>
    </Box>
  );
}

function monthSeries(items: Array<{ createdAt?: string }>) {
  const now = new Date();
  const buckets = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: MONTH_NAMES[date.getMonth()],
      value: 0,
    };
  });

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  for (const item of items) {
    if (!item.createdAt) continue;
    const date = new Date(item.createdAt);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const bucket = bucketMap.get(key);
    if (bucket) bucket.value += 1;
  }

  return buckets.map((bucket) => ({ label: bucket.label, value: bucket.value }));
}

export default function LandlordAnalyticsPage() {
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
      if (!isAuthenticated || user?.role !== 'landlord') return;
      try {
        setLoading(true);
        setError('');
        const [propertyRes, requestRes, viewingRes] = await Promise.all([
          api.get('/properties/mine?limit=300'),
          api.get('/requests'),
          api.get('/viewings'),
        ]);

        setProperties(Array.isArray(propertyRes.data?.data) ? propertyRes.data.data : []);
        setRequests(Array.isArray(requestRes.data?.data) ? requestRes.data.data : []);
        setViewings(Array.isArray(viewingRes.data?.data) ? viewingRes.data.data : []);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

  const approvedRequests = useMemo(() => requests.filter((request) => request.status === 'approved'), [requests]);
  const pendingRequests = useMemo(() => requests.filter((request) => request.status === 'pending'), [requests]);
  const pendingViewings = useMemo(() => viewings.filter((viewing) => viewing.status === 'pending'), [viewings]);

  const currentResidents = useMemo(() => {
    const now = new Date();
    const unique = new Set<string>();

    for (const request of approvedRequests) {
      if (!request.student?._id || !request.moveInDate || !request.leaseDuration) continue;
      const moveInDate = new Date(request.moveInDate);
      if (Number.isNaN(moveInDate.getTime())) continue;
      const leaseEndDate = new Date(moveInDate);
      leaseEndDate.setMonth(leaseEndDate.getMonth() + Number(request.leaseDuration));

      if (moveInDate <= now && leaseEndDate >= now) {
        unique.add(request.student._id);
      }
    }

    return unique.size;
  }, [approvedRequests]);

  const propertyPerformance = useMemo(() => {
    const requestByProperty = new Map<string, RequestItem[]>();
    const viewingByProperty = new Map<string, ViewingItem[]>();

    for (const request of requests) {
      const propertyId = request.property?._id;
      if (!propertyId) continue;
      const group = requestByProperty.get(propertyId) || [];
      group.push(request);
      requestByProperty.set(propertyId, group);
    }

    for (const viewing of viewings) {
      const propertyId = viewing.property?._id;
      if (!propertyId) continue;
      const group = viewingByProperty.get(propertyId) || [];
      group.push(viewing);
      viewingByProperty.set(propertyId, group);
    }

    return properties.map((property) => {
      const propertyRequests = requestByProperty.get(property._id) || [];
      const propertyViewings = viewingByProperty.get(property._id) || [];
      const activeResidents = new Set(
        propertyRequests
          .filter((request) => request.status === 'approved' && request.student?._id)
          .map((request) => request.student?._id as string)
      ).size;

      return {
        property,
        applications: propertyRequests.length,
        approvedApplications: propertyRequests.filter((request) => request.status === 'approved').length,
        pendingApplications: propertyRequests.filter((request) => request.status === 'pending').length,
        viewings: propertyViewings.length,
        pendingViewings: propertyViewings.filter((viewing) => viewing.status === 'pending').length,
        activeResidents,
      };
    });
  }, [properties, requests, viewings]);

  const requestSeries = useMemo(() => monthSeries(requests), [requests]);
  const viewingSeries = useMemo(() => monthSeries(viewings), [viewings]);

  if (isLoading) return null;

  return (
    <LandlordLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 3, gap: 1.5 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Analytics</Typography>
            <Typography variant="body2" color="text.secondary">
              Track your properties, student applications, bookings, and occupancy trends.
            </Typography>
          </Box>
          <Chip label={new Date().toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })} variant="outlined" />
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard icon={<ApartmentRoundedIcon />} label="Total Properties" value={properties.length} color="#1976d2" /></Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard icon={<AssignmentRoundedIcon />} label="Total Applications" value={requests.length} color="#ed6c02" /></Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard icon={<CalendarTodayRoundedIcon />} label="Total Viewings" value={viewings.length} color="#0288d1" /></Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard icon={<GroupsRoundedIcon />} label="Students Living There" value={currentResidents} color="#2e7d32" /></Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Applications Trend</Typography>
                    <Stack direction="row" sx={{ gap: 0.75 }}>
                      <Chip size="small" color="warning" label={`Pending ${pendingRequests.length}`} />
                      <Chip size="small" color="success" label={`Approved ${approvedRequests.length}`} />
                    </Stack>
                  </Stack>
                  <MiniLineChart data={requestSeries} color="#ed6c02" />
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Viewing Trend</Typography>
                    <Chip size="small" color="warning" label={`Pending ${pendingViewings.length}`} />
                  </Stack>
                  <MiniLineChart data={viewingSeries} color="#0288d1" />
                </Paper>
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Property Performance</Typography>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 820 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Institution</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Applications</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Approved</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Pending</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Viewings</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Students Living</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {propertyPerformance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <Typography variant="body2" color="text.secondary">No property records found for analytics.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : propertyPerformance.map((item) => (
                      <TableRow key={item.property._id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.property.propertyName}</Typography>
                          <Typography variant="caption" color="text.secondary">R{Number(item.property.price || 0).toLocaleString()}</Typography>
                        </TableCell>
                        <TableCell>{item.property.city || '—'}</TableCell>
                        <TableCell>{item.property.universityNearby || '—'}</TableCell>
                        <TableCell>{item.applications}</TableCell>
                        <TableCell>{item.approvedApplications}</TableCell>
                        <TableCell>{item.pendingApplications}</TableCell>
                        <TableCell>{item.viewings}</TableCell>
                        <TableCell>{item.activeResidents}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Box>
    </LandlordLayout>
  );
}
