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
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface TenantRow {
  requestId: string;
  student: { _id: string; name: string; email: string; fundingType?: string; phone?: string } | null;
  property: { _id: string; propertyName: string; city?: string; price: number; roomType?: string } | null;
  moveInDate: string;
  leaseDuration: number;
  leaseEndDate: string;
  fundingType: string;
  monthlyRent: number;
  paymentStatus: 'expected' | 'upcoming' | 'inactive';
  isActiveInMonth: boolean;
}

interface CollectionSummary {
  totalActiveTenants: number;
  totalExpected: number;
  byFunding: { NSFAS: number; Private: number; 'Self-funded': number };
}

interface CollectionData {
  month: number;
  year: number;
  rows: TenantRow[];
  summary: CollectionSummary;
}

function StatCard({ icon, label, value, sub, color = 'primary' }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string;
}) {
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
            {sub && <Typography variant="caption" color="text.disabled">{sub}</Typography>}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function fundingChipColor(type?: string): 'primary' | 'secondary' | 'default' {
  if (type === 'NSFAS') return 'primary';
  if (type === 'Private') return 'secondary';
  return 'default';
}

export default function MonthlyCollectionPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) router.push('/');
  }, [isLoading, isAuthenticated, user, router]);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/admin/reports/collection?month=${month}&year=${year}`);
      setData(res.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load collection report');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    if (isAuthenticated) fetchReport();
  }, [isAuthenticated, fetchReport]);

  // CSV export
  const handleExport = () => {
    if (!data) return;
    const headers = ['Student', 'Email', 'Funding', 'Property', 'City', 'Room Type', 'Move-in Date', 'Lease End', 'Monthly Rent', 'Status'];
    const rows = data.rows.map(r => [
      r.student?.name ?? '',
      r.student?.email ?? '',
      r.fundingType,
      r.property?.propertyName ?? '',
      r.property?.city ?? '',
      r.property?.roomType ?? '',
      r.moveInDate ? new Date(r.moveInDate).toLocaleDateString('en-ZA') : '',
      r.leaseEndDate ? new Date(r.leaseEndDate).toLocaleDateString('en-ZA') : '',
      `R${r.monthlyRent}`,
      r.paymentStatus,
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosy-collection-${MONTH_NAMES[month - 1]}-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3, gap: 2 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Monthly Collection</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Active tenants and expected rent for{' '}
              <strong>{MONTH_NAMES[month - 1]} {year}</strong>
            </Typography>
          </Box>

          <Stack direction="row" sx={{ gap: 1.5, flexWrap: 'wrap' }}>
            {/* Month selector */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Month</InputLabel>
              <Select label="Month" value={month} onChange={e => setMonth(Number(e.target.value))}>
                {MONTH_NAMES.map((m, i) => (
                  <MenuItem key={m} value={i + 1}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Year selector */}
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <InputLabel>Year</InputLabel>
              <Select label="Year" value={year} onChange={e => setYear(Number(e.target.value))}>
                {yearOptions.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<FileDownloadRoundedIcon />}
              onClick={handleExport}
              disabled={!data || data.rows.length === 0}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Export CSV
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>
        ) : data && (
          <>
            {/* Summary cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<PeopleRoundedIcon />}
                  label="Active Tenants"
                  value={data.summary.totalActiveTenants}
                  color="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<AttachMoneyRoundedIcon />}
                  label="Total Expected"
                  value={`R${data.summary.totalExpected.toLocaleString()}`}
                  color="success"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<SchoolRoundedIcon />}
                  label="NSFAS Tenants"
                  value={data.summary.byFunding.NSFAS}
                  sub="funded by NSFAS"
                  color="info"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={<HomeRoundedIcon />}
                  label="Private / Self-funded"
                  value={data.summary.byFunding.Private + data.summary.byFunding['Self-funded']}
                  sub="private or self-funded"
                  color="warning"
                />
              </Grid>
            </Grid>

            {/* Funding breakdown pills */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Funding breakdown:</Typography>
                {Object.entries(data.summary.byFunding).map(([type, count]) => (
                  <Chip
                    key={type}
                    label={`${type}: ${count}`}
                    size="small"
                    color={fundingChipColor(type)}
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Paper>

            {/* Tenants table */}
            {data.rows.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 8, textAlign: 'center' }}>
                <PeopleRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">
                  No active tenants for {MONTH_NAMES[month - 1]} {year}.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Tenant</TableCell>
                      <TableCell sx={{ fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>Property</TableCell>
                      <TableCell sx={{ fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>Funding</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Monthly Rent</TableCell>
                      <TableCell sx={{ fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>Move-in</TableCell>
                      <TableCell sx={{ fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>Lease End</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Payment Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.rows.map((row) => (
                      <TableRow key={row.requestId} hover>
                        {/* Tenant */}
                        <TableCell>
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: 'primary.main' }}>
                              {(row.student?.name ?? row.student?.email ?? '?')[0].toUpperCase()}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                {row.student?.name ?? '—'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                {row.student?.email ?? ''}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Property */}
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                            {row.property?.propertyName ?? '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                            {row.property?.city ?? ''}{row.property?.roomType ? ` · ${row.property.roomType}` : ''}
                          </Typography>
                        </TableCell>

                        {/* Funding */}
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Chip
                            size="small"
                            label={row.fundingType}
                            color={fundingChipColor(row.fundingType)}
                            variant="outlined"
                          />
                        </TableCell>

                        {/* Rent */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.dark' }}>
                            R{row.monthlyRent.toLocaleString()}
                          </Typography>
                        </TableCell>

                        {/* Move-in */}
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(row.moveInDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Typography>
                        </TableCell>

                        {/* Lease end */}
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(row.leaseEndDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Typography>
                        </TableCell>

                        {/* Payment status */}
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              row.paymentStatus === 'expected' ? 'Expected'
                              : row.paymentStatus === 'upcoming' ? 'Upcoming'
                              : 'Inactive'
                            }
                            color={
                              row.paymentStatus === 'expected' ? 'warning'
                              : row.paymentStatus === 'upcoming' ? 'info'
                              : 'default'
                            }
                            variant="filled"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Footer total */}
                <Divider />
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'flex-end', alignItems: 'center', px: 2, py: 1.5, gap: 2 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {data.rows.length} tenant{data.rows.length !== 1 ? 's' : ''}
                  </Typography>
                  <Divider orientation="vertical" flexItem />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Total Expected: <span style={{ color: '#2e7d32' }}>R{data.summary.totalExpected.toLocaleString()}</span>
                  </Typography>
                </Stack>
              </TableContainer>
            )}
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
