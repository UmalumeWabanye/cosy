'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface TenantRow {
  requestId: string;
  student: { _id: string; name: string; email: string; fundingType?: string; phone?: string; university?: string } | null;
  property: { _id: string; propertyName: string; city?: string; price: number; roomType?: string } | null;
  moveInDate: string;
  leaseDuration: number;
  leaseEndDate: string;
  fundingType: string;
  monthlyRent: number;
  applicationStatus: 'pending' | 'approved' | 'rejected';
  paymentStatus: 'expected' | 'pending' | 'inactive';
  isActiveInMonth: boolean;
}

interface CollectionSummary {
  totalActiveTenants: number;
  totalExpected: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  byFunding: { NSFAS: number; Private: number; 'Self-funded': number };
}

interface CollectionData {
  month: number;
  year: number;
  properties: { total: number; active: number };
  rows: TenantRow[];
  summary: CollectionSummary;
}

function StatCard({ icon, label, value, sub, color = 'primary' }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <Card elevation={0} className="glass-card" sx={{ borderRadius: 3 }}>
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
    if (!isLoading && (!isAuthenticated || user?.role !== 'landlord')) router.push('/');
  }, [isLoading, isAuthenticated, user, router]);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/landlord/reports/collection?month=${month}&year=${year}`);
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

  const handleExport = () => {
    if (!data) return;
    const headers = ['Student', 'Email', 'Funding', 'Property', 'City', 'Room Type', 'Application Status', 'Move-in Date', 'Lease End', 'Monthly Rent', 'Payment Status'];
    const rows = data.rows.map((row) => [
      row.student?.name ?? '',
      row.student?.email ?? '',
      row.fundingType,
      row.property?.propertyName ?? '',
      row.property?.city ?? '',
      row.property?.roomType ?? '',
      row.applicationStatus,
      row.moveInDate ? new Date(row.moveInDate).toLocaleDateString('en-ZA') : '',
      row.leaseEndDate ? new Date(row.leaseEndDate).toLocaleDateString('en-ZA') : '',
      `R${row.monthlyRent}`,
      row.paymentStatus,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${value}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `cosy-landlord-collection-${MONTH_NAMES[month - 1]}-${year}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  if (isLoading) return null;

  return (
    <LandlordLayout>
      <Box className="modern-shell" sx={{ p: { xs: 2, md: 4 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3, gap: 2 }}>
          <Box>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 0.5 }}>
              <ReceiptLongRoundedIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>Monthly Collection Report</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Track tenants, expected rent, and application status for {MONTH_NAMES[month - 1]} {year}.
            </Typography>
          </Box>

          <Stack direction="row" sx={{ gap: 1.5, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Month</InputLabel>
              <Select label="Month" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {MONTH_NAMES.map((m, index) => <MenuItem key={m} value={index + 1}>{m}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <InputLabel>Year</InputLabel>
              <Select label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {yearOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="outlined" startIcon={<FileDownloadRoundedIcon />} onClick={handleExport} disabled={!data || data.rows.length === 0} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Export CSV
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>
        ) : data ? (
          <>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<PeopleRoundedIcon />} label="Active Tenants" value={data.summary.totalActiveTenants} color="primary" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<AttachMoneyRoundedIcon />} label="Total Expected" value={`R${data.summary.totalExpected.toLocaleString()}`} color="success" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<ApartmentRoundedIcon />} label="Properties Tracked" value={data.properties.total} sub={`${data.properties.active} active listings`} color="info" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<AssignmentRoundedIcon />} label="Applications" value={data.summary.totalApplications} sub={`${data.summary.pendingApplications} pending`} color="warning" />
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Funding breakdown:</Typography>
                {Object.entries(data.summary.byFunding).map(([type, count]) => (
                  <Chip key={type} label={`${type}: ${count}`} size="small" color={fundingChipColor(type)} variant="outlined" sx={{ fontWeight: 600 }} />
                ))}
              </Stack>
            </Paper>

            {data.rows.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 8, textAlign: 'center' }}>
                <PeopleRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No active tenants for {MONTH_NAMES[month - 1]} {year}.</Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto', maxHeight: 620, borderRadius: 3 }}>
                <Table
                  stickyHeader
                  size="small"
                  sx={{
                    minWidth: 900,
                    '& .MuiTableCell-root': { py: 1.25 },
                    '& .MuiTableCell-stickyHeader': {
                      bgcolor: 'rgba(255,255,255,0.94)',
                      backdropFilter: 'blur(12px)',
                      boxShadow: 'inset 0 -1px 0 rgba(5,150,105,0.14), 0 10px 22px rgba(4,120,87,0.06)',
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Tenant</TableCell>
                      <TableCell sx={{ fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>Property</TableCell>
                      <TableCell sx={{ fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>Funding</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Application</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Monthly Rent</TableCell>
                      <TableCell sx={{ fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>Move-in</TableCell>
                      <TableCell sx={{ fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>Lease End</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Payment Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.rows.map((row) => (
                      <TableRow key={row.requestId} hover sx={{ '& td': { transition: 'background-color 0.2s ease' }, '&:hover td': { bgcolor: 'rgba(5,150,105,0.05)' } }}>
                        <TableCell>
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: 'primary.main' }}>
                              {(row.student?.name ?? row.student?.email ?? '?')[0].toUpperCase()}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{row.student?.name ?? '—'}</Typography>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{row.student?.email ?? ''}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>{row.property?.propertyName ?? '—'}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                            {row.property?.city ?? ''}{row.property?.roomType ? ` · ${row.property.roomType}` : ''}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Chip size="small" label={row.fundingType} color={fundingChipColor(row.fundingType)} variant="outlined" sx={{ height: 24, fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={row.applicationStatus === 'approved' ? 'Approved' : row.applicationStatus === 'rejected' ? 'Rejected' : 'Pending'}
                            color={row.applicationStatus === 'approved' ? 'success' : row.applicationStatus === 'rejected' ? 'error' : 'warning'}
                            sx={{ height: 24, fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.dark' }}>
                            R{row.monthlyRent.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(row.moveInDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(row.leaseEndDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={row.paymentStatus === 'expected' ? 'Expected' : row.paymentStatus === 'pending' ? 'Pending' : 'Inactive'}
                            color={row.paymentStatus === 'expected' ? 'warning' : row.paymentStatus === 'pending' ? 'info' : 'default'}
                            sx={{ height: 24, fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Divider />
                <Stack direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'center', px: 2, py: 1.5, gap: 2 }}>
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
        ) : null}
      </Box>
    </LandlordLayout>
  );
}
