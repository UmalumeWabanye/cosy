'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayout';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';

interface RoleBucket {
  _id: string;
  count: number;
}

interface ReportPayload {
  summary: { totalUsers: number; totalProperties: number; totalRequests: number };
  usersByRole: RoleBucket[];
  requestsByStatus: { _id: string; count: number }[];
}

interface RequestItem {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  student?: { name?: string; email?: string };
  property?: { propertyName?: string; city?: string };
  createdAt: string;
}

interface ViewingItem {
  _id: string;
  status: 'pending' | 'approved' | 'declined';
  student?: { name?: string; email?: string };
  property?: { propertyName?: string; city?: string };
  requestedDate: string;
}

function StatCard({
  title,
  value,
  icon,
  helper,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  helper?: string;
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

function statusColor(status: string): 'warning' | 'success' | 'error' | 'default' {
  if (status === 'approved') return 'success';
  if (status === 'rejected' || status === 'declined') return 'error';
  if (status === 'pending') return 'warning';
  return 'default';
}

export default function AdminDashboardClientInner() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [reports, setReports] = useState<ReportPayload | null>(null);
  const [landlords, setLandlords] = useState<any[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [viewings, setViewings] = useState<ViewingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [reportRes, landlordRes, requestRes, viewingRes] = await Promise.all([
          api.get('/admin/reports'),
          api.get('/admin/users?role=landlord&limit=200'),
          api.get('/requests'),
          api.get('/viewings'),
        ]);

        setReports(reportRes.data?.data || null);
        setLandlords(Array.isArray(landlordRes.data?.data) ? landlordRes.data.data : []);
        setRequests(Array.isArray(requestRes.data?.data) ? requestRes.data.data : []);
        setViewings(Array.isArray(viewingRes.data?.data) ? viewingRes.data.data : []);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') fetchDashboard();
  }, [isAuthenticated, user]);

  const roleMap = useMemo(() => {
    const map: Record<string, number> = { admin: 0, landlord: 0, student: 0 };
    (reports?.usersByRole || []).forEach((bucket) => {
      map[bucket._id] = bucket.count;
    });
    return map;
  }, [reports]);

  const pendingRequests = useMemo(() => requests.filter((request) => request.status === 'pending').length, [requests]);
  const pendingViewings = useMemo(() => viewings.filter((viewing) => viewing.status === 'pending').length, [viewings]);

  const verifiedLandlords = useMemo(
    () => landlords.filter((landlord) => landlord.profileComplete && landlord.isVerified).length,
    [landlords]
  );

  const unverifiedLandlords = Math.max(0, landlords.length - verifiedLandlords);

  const recentRequests = useMemo(
    () => [...requests].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 8),
    [requests]
  );

  const recentViewings = useMemo(
    () => [...viewings].sort((a, b) => +new Date(b.requestedDate) - +new Date(a.requestedDate)).slice(0, 8),
    [viewings]
  );

  if (isLoading) return null;

  return (
    <AdminLayout pendingCount={pendingRequests}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3, gap: 1.5 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Platform Control Center</Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor both student and landlord platforms, moderation queues, and operational health.
            </Typography>
          </Box>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={() => router.push('/admin/users')} sx={{ textTransform: 'none' }}>Manage Users</Button>
            <Button variant="contained" onClick={() => router.push('/admin/reports')} sx={{ textTransform: 'none', fontWeight: 700 }}>Open Analytics</Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Students" value={roleMap.student || 0} helper="Active student accounts" icon={<PeopleRoundedIcon />} color="#1976d2" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Landlords" value={roleMap.landlord || 0} helper="Property owners onboarded" icon={<ApartmentRoundedIcon />} color="#6a1b9a" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Properties" value={reports?.summary.totalProperties || 0} helper="Listings across both platforms" icon={<AssignmentRoundedIcon />} color="#2e7d32" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Pending Queues" value={pendingRequests + pendingViewings} helper={`${pendingRequests} applications + ${pendingViewings} viewings`} icon={<WarningAmberRoundedIcon />} color="#ed6c02" />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Landlord Verification</Typography>
                      <VerifiedRoundedIcon sx={{ color: 'primary.main' }} />
                    </Stack>
                    <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>{verifiedLandlords}</Typography>
                    <Typography variant="body2" color="text.secondary">Verified and profile-complete landlords.</Typography>
                    <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                      <Chip size="small" color="success" label={`Verified: ${verifiedLandlords}`} />
                      <Chip size="small" color="warning" label={`Needs review: ${unverifiedLandlords}`} />
                    </Stack>
                    <Button sx={{ mt: 1.5, textTransform: 'none' }} onClick={() => router.push('/admin/users')}>Review Landlords</Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Operations Snapshot</Typography>
                      <InsightsRoundedIcon sx={{ color: 'primary.main' }} />
                    </Stack>
                    <Stack sx={{ mt: 1.5, gap: 1 }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Total Applications</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{reports?.summary.totalRequests || 0}</Typography>
                      </Stack>
                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Pending Applications</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{pendingRequests}</Typography>
                      </Stack>
                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Pending Viewing Requests</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{pendingViewings}</Typography>
                      </Stack>
                    </Stack>
                    <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mt: 2 }}>
                      <Button size="small" variant="outlined" sx={{ textTransform: 'none' }} onClick={() => router.push('/admin/requests')}>Applications</Button>
                      <Button size="small" variant="outlined" sx={{ textTransform: 'none' }} onClick={() => router.push('/admin/properties')}>Properties</Button>
                      <Button size="small" variant="outlined" sx={{ textTransform: 'none' }} onClick={() => router.push('/admin/notifications')}>Notifications</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Recent Applications</Typography>
                  {recentRequests.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">No applications yet.</Typography>
                  ) : (
                    <Box sx={{ overflowX: 'auto' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
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
                              <TableCell><Chip size="small" color={statusColor(request.status)} label={request.status} sx={{ textTransform: 'capitalize' }} /></TableCell>
                              <TableCell>{new Date(request.createdAt).toLocaleDateString('en-ZA')}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 5 }}>
                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Recent Viewing Requests</Typography>
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
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
