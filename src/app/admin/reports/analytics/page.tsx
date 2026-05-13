'use client';

import React, { useEffect, useState } from 'react';
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
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';

import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';

interface ReportData {
  summary: { totalUsers: number; totalProperties: number; totalRequests: number };
  usersByRole: { _id: string; count: number }[];
  usersByFunding: { _id: string; count: number }[];
  usersByUniversity: { _id: string; count: number }[];
  requestsByStatus: { _id: string; count: number }[];
  propertiesByStatus: { _id: boolean | null; count: number }[];
  monthlySignups: { _id: { year: number; month: number }; count: number }[];
  monthlyRequests: { _id: { year: number; month: number }; count: number }[];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function StatCard({ icon, label, value, color = 'primary' }: { icon: React.ReactNode; label: string; value: number | string; color?: string }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${color}.50`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: `${color}.main`, flexShrink: 0 }}>
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

function BarRow({ label, value, max, color = '#1976d2' }: { label: string; value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 1 }}>
      <Typography variant="body2" sx={{ minWidth: 120, color: 'text.secondary' }} noWrap>{label}</Typography>
      <Box sx={{ flex: 1, bgcolor: 'action.hover', borderRadius: 1, height: 8, overflow: 'hidden' }}>
        <Box sx={{ width: `${pct}%`, bgcolor: color, height: '100%', borderRadius: 1, transition: 'width 0.6s ease' }} />
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 28, textAlign: 'right' }}>{value}</Typography>
    </Stack>
  );
}

function MiniLineChart({ data, color = '#1976d2' }: { data: { label: string; value: number }[]; color?: string }) {
  if (data.length === 0) return <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>No data</Typography>;
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 400; const H = 80; const PAD = 8;
  const pts = data.map((d, i) => {
    const x = PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2);
    const y = H - PAD - (d.value / max) * (H - PAD * 2);
    return `${x},${y}`;
  });
  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 80 }}>
        <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={pts.join(' ')} />
        {data.map((d, i) => {
          const x = PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2);
          const y = H - PAD - (d.value / max) * (H - PAD * 2);
          return <circle key={i} cx={x} cy={y} r="3.5" fill={color} />;
        })}
      </svg>
      <Stack direction="row" sx={{ justifyContent: 'space-between', px: `${PAD}px` }}>
        {data.map((d, i) => (
          <Typography key={i} variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>{d.label}</Typography>
        ))}
      </Stack>
    </Box>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) router.push('/');
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/admin/reports')
      .then(res => { setData(res.data.data); })
      .catch(e => setError(e?.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const statusColor = (s: string) => s === 'approved' ? '#2e7d32' : s === 'rejected' ? '#c62828' : '#ed6c02';

  const signupSeries = (data?.monthlySignups ?? []).map(m => ({
    label: MONTH_NAMES[m._id.month - 1],
    value: m.count,
  }));
  const requestSeries = (data?.monthlyRequests ?? []).map(m => ({
    label: MONTH_NAMES[m._id.month - 1],
    value: m.count,
  }));

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Analytics</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Platform overview — users, properties and applications
            </Typography>
          </Box>
          <Chip label={new Date().toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })} variant="outlined" />
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>
        ) : data && (
          <>
            {/* Summary stats */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard icon={<PeopleRoundedIcon />} label="Total Users" value={data.summary.totalUsers} color="primary" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard icon={<ApartmentRoundedIcon />} label="Total Properties" value={data.summary.totalProperties} color="info" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard icon={<AssignmentRoundedIcon />} label="Total Applications" value={data.summary.totalRequests} color="warning" />
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Users by role */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Users by Role</Typography>
                  {data.usersByRole.map(r => (
                    <BarRow key={r._id} label={r._id ?? 'Unknown'} value={r.count} max={data.summary.totalUsers} />
                  ))}
                </Paper>
              </Grid>

              {/* Users by funding */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Users by Funding Type</Typography>
                  {data.usersByFunding.length === 0
                    ? <Typography variant="body2" color="text.disabled">No data</Typography>
                    : data.usersByFunding.map(r => (
                      <BarRow key={r._id} label={r._id ?? 'Unknown'} value={r.count} max={data.summary.totalUsers} color="#7b1fa2" />
                    ))}
                </Paper>
              </Grid>

              {/* Applications by status */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Applications by Status</Typography>
                  {data.requestsByStatus.map(r => (
                    <Stack key={r._id} direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}>
                      {r._id === 'approved' && <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} />}
                      {r._id === 'rejected' && <CancelRoundedIcon sx={{ fontSize: 18, color: 'error.main' }} />}
                      {r._id === 'pending' && <PendingActionsRoundedIcon sx={{ fontSize: 18, color: 'warning.main' }} />}
                      <Typography variant="body2" sx={{ flex: 1, textTransform: 'capitalize' }}>{r._id}</Typography>
                      <Chip size="small" label={r.count} sx={{ bgcolor: statusColor(r._id), color: '#fff', fontWeight: 700, fontSize: 12 }} />
                    </Stack>
                  ))}
                </Paper>
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>New Users — Last 6 Months</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <MiniLineChart data={signupSeries} color="#1976d2" />
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Applications — Last 6 Months</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <MiniLineChart data={requestSeries} color="#ed6c02" />
                </Paper>
              </Grid>
            </Grid>

            {/* Top universities */}
            {data.usersByUniversity.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Top Universities</Typography>
                {data.usersByUniversity.map(u => (
                  <BarRow key={u._id} label={u._id} value={u.count} max={data.usersByUniversity[0]?.count ?? 1} color="#0288d1" />
                ))}
              </Paper>
            )}
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
