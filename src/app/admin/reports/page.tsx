'use client';

import React, { useState, useEffect } from 'react';
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
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';

interface ReportData {
  summary: { totalUsers: number; totalProperties: number; totalRequests: number };
  usersByRole: { _id: string; count: number }[];
  usersByFunding: { _id: string; count: number }[];
  usersByUniversity: { _id: string; count: number }[];
  requestsByStatus: { _id: string; count: number }[];
  propertiesByStatus: { _id: boolean; count: number }[];
  monthlySignups: { _id: { year: number; month: number }; count: number }[];
  monthlyRequests: { _id: { year: number; month: number }; count: number }[];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function buildMonthlyLabels() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { label: MONTH_NAMES[d.getMonth()], month: d.getMonth() + 1, year: d.getFullYear() };
  });
}

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <Card elevation={0} className="glass-card" sx={{ height: '100%', borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
        </Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{value.toLocaleString()}</Typography>
      </CardContent>
    </Card>
  );
}

export default function AdminReportsPage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, isLoading } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || authUser?.role !== 'admin')) router.push('/');
  }, [isAuthenticated, isLoading, authUser, router]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/reports');
        setData(res.data.data);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && authUser?.role === 'admin') fetchReports();
  }, [isAuthenticated, authUser]);

  const months = buildMonthlyLabels();

  const monthlySignupData = months.map(m =>
    data?.monthlySignups.find(s => s._id.month === m.month && s._id.year === m.year)?.count ?? 0
  );
  const monthlyRequestData = months.map(m =>
    data?.monthlyRequests.find(r => r._id.month === m.month && r._id.year === m.year)?.count ?? 0
  );

  const fundingPieData = (data?.usersByFunding ?? []).map((f, i) => ({
    id: i, value: f.count, label: f._id ?? 'Unknown',
  }));

  const statusPieData = (data?.requestsByStatus ?? []).map((s, i) => ({
    id: i,
    value: s.count,
    label: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    color: s._id === 'approved' ? '#2e7d32' : s._id === 'rejected' ? '#c62828' : '#ed6c02',
  }));

  const topUnis = (data?.usersByUniversity ?? []).slice(0, 7);

  return (
    <AdminLayout>
      <Box className="modern-shell" sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Reports</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Platform-wide analytics — users, properties and applications
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>
        ) : !data ? null : (
          <Stack sx={{ gap: 3 }}>
            {/* Summary cards */}
            <Grid container spacing={2} columns={12}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <SummaryCard icon={<PeopleRoundedIcon />} label="Total Users" value={data.summary.totalUsers} color="#1976d2" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <SummaryCard icon={<ApartmentRoundedIcon />} label="Total Properties" value={data.summary.totalProperties} color="#2e7d32" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <SummaryCard icon={<AssignmentRoundedIcon />} label="Total Applications" value={data.summary.totalRequests} color="#ed6c02" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <SummaryCard
                  icon={<CheckCircleRoundedIcon />}
                  label="Approved"
                  value={data.requestsByStatus.find(s => s._id === 'approved')?.count ?? 0}
                  color="#7b1fa2"
                />
              </Grid>
            </Grid>

            {/* Monthly trends */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Monthly Trends</Typography>
                <Typography variant="caption" color="text.secondary">User sign-ups and applications over the last 6 months</Typography>
                <Box sx={{ width: '100%', overflowX: 'auto', mt: 2 }}>
                  <LineChart
                    height={260}
                    xAxis={[{ scaleType: 'band', data: months.map(m => m.label) }]}
                    yAxis={[{ width: 36 }]}
                    series={[
                      { data: monthlySignupData, label: 'New Users', color: '#1976d2', area: true, showMark: false },
                      { data: monthlyRequestData, label: 'Applications', color: '#ed6c02', area: true, showMark: false },
                    ]}
                    margin={{ top: 16, right: 16, bottom: 24, left: 40 }}
                    sx={{ width: '100%', '& .MuiAreaElement-root': { fillOpacity: 0.1 }, '& .MuiLineElement-root': { strokeWidth: 2 } }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Pie charts row */}
            <Grid container spacing={2} columns={12}>
              {/* Funding breakdown */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Funding Type Breakdown</Typography>
                    <Typography variant="caption" color="text.secondary">Distribution of student funding types</Typography>
                    {fundingPieData.length === 0 ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <Typography variant="body2" color="text.secondary">No data yet</Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <PieChart
                          series={[{ data: fundingPieData, innerRadius: 50, paddingAngle: 3, cornerRadius: 4 }]}
                          width={320}
                          height={200}
                          margin={{ top: 0, right: 80, bottom: 0, left: 0 }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Application status breakdown */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Application Status</Typography>
                    <Typography variant="caption" color="text.secondary">Breakdown of all application outcomes</Typography>
                    {statusPieData.length === 0 ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <Typography variant="body2" color="text.secondary">No data yet</Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <PieChart
                          series={[{ data: statusPieData, innerRadius: 50, paddingAngle: 3, cornerRadius: 4 }]}
                          width={320}
                          height={200}
                          margin={{ top: 0, right: 80, bottom: 0, left: 0 }}
                        />
                      </Box>
                    )}
                    {/* Status legend */}
                    <Stack direction="row" sx={{ justifyContent: 'center', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
                      {statusPieData.map(s => (
                        <Chip key={s.label} size="small" label={`${s.label}: ${s.value}`}
                          sx={{ bgcolor: `${s.color}18`, color: s.color, fontWeight: 600, fontSize: 11 }} />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Top universities bar chart */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Users by University</Typography>
                <Typography variant="caption" color="text.secondary">Top institutions by number of registered students</Typography>
                {topUnis.length === 0 ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <Typography variant="body2" color="text.secondary">No university data yet</Typography>
                  </Box>
                ) : (
                  <Box sx={{ width: '100%', overflowX: 'auto', mt: 2 }}>
                    <BarChart
                      height={260}
                      borderRadius={6}
                      xAxis={[{
                        scaleType: 'band',
                        data: topUnis.map(u => u._id.length > 28 ? u._id.slice(0, 28) + '…' : u._id),
                        tickLabelStyle: { fontSize: 11 },
                      }]}
                      yAxis={[{ width: 36 }]}
                      series={[{ data: topUnis.map(u => u.count), label: 'Students', color: '#1976d2' }]}
                      margin={{ top: 16, right: 16, bottom: 60, left: 40 }}
                      sx={{ width: '100%' }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Properties status */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Property Listing Status</Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 3 }}>
                  {(data.propertiesByStatus ?? []).map(p => (
                    <Box key={String(p._id)} sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: p._id ? 'success.main' : 'text.secondary' }}>
                        {p.count}
                      </Typography>
                      <Chip
                        size="small"
                        label={p._id ? 'Published' : 'Draft'}
                        color={p._id ? 'success' : 'default'}
                        variant={p._id ? 'filled' : 'outlined'}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  ))}
                  {data.propertiesByStatus.length === 0 && (
                    <Typography variant="body2" color="text.secondary">No properties yet</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        )}
      </Box>
    </AdminLayout>
  );
}
