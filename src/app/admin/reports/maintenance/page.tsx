'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';

import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

type MaintenanceStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';

interface MaintenanceRow {
  maintenanceId: string;
  property: { _id?: string; propertyName?: string; city?: string; universityNearby?: string; address?: string } | null;
  landlord: { _id?: string; name?: string; email?: string } | null;
  student: { _id?: string; name?: string; email?: string } | null;
  roomNumber: string;
  category: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  description: string;
  expectedDate?: string;
  landlordNote: string;
  acknowledgedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  ageDays: number;
  unresolved: boolean;
  overdue: boolean;
  awaitingFollowUp: boolean;
  acknowledged: boolean;
  acknowledgementHours: number | null;
}

interface MaintenanceSummary {
  totalTickets: number;
  unresolvedCount: number;
  overdueCount: number;
  awaitingFollowUpCount: number;
  acknowledgedCount: number;
  acknowledgedWithin24h: number;
  acknowledgedWithin72h: number;
  averageAcknowledgementHours: number | null;
  statusCounts: Record<MaintenanceStatus, number>;
  priorityCounts: Record<MaintenancePriority, number>;
}

interface MaintenanceReportPayload {
  summary: MaintenanceSummary;
  rows: MaintenanceRow[];
  landlordRows: Array<{
    landlord: { _id?: string; name?: string; email?: string } | null;
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    acknowledged: number;
    overdue: number;
    averageAckHours: number | null;
  }>;
  propertyRows: Array<{
    property: { _id?: string; propertyName?: string; city?: string; universityNearby?: string } | null;
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    overdue: number;
  }>;
}

function hoursLabel(value: number | null) {
  if (value === null) return 'No response yet';
  if (value < 24) return `${value}h`;
  return `${Math.round(value / 24)}d`;
}

function statusLabel(status: MaintenanceStatus) {
  if (status === 'in_progress') return 'In progress';
  if (status === 'resolved') return 'Resolved';
  if (status === 'closed') return 'Closed';
  return 'Open';
}

function statusColor(status: MaintenanceStatus) {
  if (status === 'in_progress') return 'info';
  if (status === 'resolved') return 'success';
  if (status === 'closed') return 'default';
  return 'warning';
}

function priorityColor(priority: MaintenancePriority) {
  if (priority === 'urgent') return 'error';
  if (priority === 'high') return 'warning';
  if (priority === 'low') return 'success';
  return 'info';
}

function StatCard({ icon, label, value, caption, color }: { icon: React.ReactNode; label: string; value: string; caption?: string; color: string }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
          <Box sx={{ color }}>{icon}</Box>
        </Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
        {caption && <Typography variant="caption" color="text.secondary">{caption}</Typography>}
      </CardContent>
    </Card>
  );
}

export default function AdminMaintenanceOversightPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<MaintenanceReportPayload | null>(null);
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [unresolvedOnly, setUnresolvedOnly] = useState(false);
  const [overdueOnly, setOverdueOnly] = useState(false);

  const openLandlordProfile = (landlordId?: string) => {
    if (!landlordId) return;
    router.push(`/admin/users?landlordId=${landlordId}`);
  };

  const openPropertyDetails = (propertyId?: string) => {
    if (!propertyId) return;
    router.push(`/browse/${propertyId}`);
  };

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/admin/reports/maintenance');
        setData(res.data?.data ?? null);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load maintenance oversight report');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') load();
  }, [isAuthenticated, user]);

  const cityOptions = useMemo(() => {
    const values = Array.from(new Set((data?.rows ?? []).map((row) => row.property?.city).filter(Boolean))) as string[];
    return values.sort((a, b) => a.localeCompare(b));
  }, [data]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.rows ?? []).filter((row) => {
      if (cityFilter !== 'all' && row.property?.city !== cityFilter) return false;
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && row.priority !== priorityFilter) return false;
      if (unresolvedOnly && !row.unresolved) return false;
      if (overdueOnly && !row.overdue) return false;
      if (!query) return true;

      const haystack = [
        row.property?.propertyName,
        row.property?.city,
        row.property?.universityNearby,
        row.landlord?.name,
        row.landlord?.email,
        row.student?.name,
        row.student?.email,
        row.roomNumber,
        row.category,
        row.description,
        row.landlordNote,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [data, cityFilter, statusFilter, priorityFilter, search, unresolvedOnly, overdueOnly]);

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Maintenance Oversight</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Track response speed, bottlenecks, and overdue tickets across all landlord properties.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : !data ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No maintenance oversight data available.</Typography>
          </Paper>
        ) : (
          <Stack sx={{ gap: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<BuildRoundedIcon />} label="Total Tickets" value={String(data.summary.totalTickets)} color="#1976d2" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<WarningAmberRoundedIcon />} label="Unresolved" value={String(data.summary.unresolvedCount)} caption={`${data.summary.awaitingFollowUpCount} need follow-up`} color="#ed6c02" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<PriorityHighRoundedIcon />} label="Overdue" value={String(data.summary.overdueCount)} caption="Open for 7+ days" color="#d32f2f" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<ScheduleRoundedIcon />} label="Avg Acknowledgement" value={hoursLabel(data.summary.averageAcknowledgementHours)} caption="Based on first landlord response" color="#6a1b9a" />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<CheckCircleRoundedIcon />} label="Acknowledged" value={String(data.summary.acknowledgedCount)} caption={`Within 24h: ${data.summary.acknowledgedWithin24h}`} color="#2e7d32" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<ApartmentRoundedIcon />} label="Open Tickets" value={String(data.summary.statusCounts.open)} color="#ef6c00" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<BuildRoundedIcon />} label="In Progress" value={String(data.summary.statusCounts.in_progress)} color="#0288d1" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<PersonRoundedIcon />} label="Acknowledged in 72h" value={String(data.summary.acknowledgedWithin72h)} color="#2e7d32" />
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction={{ xs: 'column', lg: 'row' }} sx={{ gap: 1.5, flexWrap: 'wrap' }}>
                <TextField
                  select
                  size="small"
                  label="City"
                  value={cityFilter}
                  onChange={(event) => setCityFilter(event.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="all">All cities</MenuItem>
                  {cityOptions.map((city) => <MenuItem key={city} value={city}>{city}</MenuItem>)}
                </TextField>

                <TextField
                  select
                  size="small"
                  label="Status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="all">All statuses</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in_progress">In progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </TextField>

                <TextField
                  select
                  size="small"
                  label="Priority"
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                  sx={{ minWidth: 170 }}
                >
                  <MenuItem value="all">All priorities</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </TextField>

                <TextField
                  label="Search"
                  size="small"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Property, landlord, room, category"
                  sx={{ minWidth: { xs: '100%', md: 320 }, flex: 1 }}
                />

                <Chip
                  clickable
                  label="Unresolved only"
                  color={unresolvedOnly ? 'warning' : 'default'}
                  variant={unresolvedOnly ? 'filled' : 'outlined'}
                  onClick={() => setUnresolvedOnly((value) => !value)}
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  clickable
                  label="Overdue only"
                  color={overdueOnly ? 'error' : 'default'}
                  variant={overdueOnly ? 'filled' : 'outlined'}
                  onClick={() => setOverdueOnly((value) => !value)}
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
            </Paper>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <Paper variant="outlined" sx={{ p: 0, overflow: 'hidden' }}>
                  <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Maintenance Tickets</Typography>
                    <Typography variant="caption" color="text.secondary">Showing {filteredRows.length} of {data.summary.totalTickets} tickets</Typography>
                  </Box>
                  {filteredRows.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">No tickets match the selected filters.</Typography>
                    </Box>
                  ) : (
                    <TableContainer sx={{ overflowX: 'auto' }}>
                      <Table size="small" sx={{ minWidth: 1280 }}>
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Landlord</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Age</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Response</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredRows.map((row) => (
                            <TableRow key={row.maintenanceId} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.property?.propertyName || 'Unknown property'}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {row.property?.city || 'Unknown city'}{row.property?.universityNearby ? ` · Near ${row.property.universityNearby}` : ''}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{row.landlord?.name || 'Unknown'}</Typography>
                                <Typography variant="caption" color="text.secondary">{row.landlord?.email || ''}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{row.student?.name || 'Unknown'}</Typography>
                                <Typography variant="caption" color="text.secondary">{row.student?.email || ''}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.roomNumber || '—'}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{row.category}</Typography>
                              </TableCell>
                              <TableCell>
                                <Chip size="small" label={row.priority} color={priorityColor(row.priority)} sx={{ textTransform: 'capitalize' }} />
                              </TableCell>
                              <TableCell>
                                <Chip size="small" label={statusLabel(row.status)} color={statusColor(row.status)} sx={{ textTransform: 'capitalize' }} />
                                {row.overdue && <Chip size="small" color="error" label="Overdue" sx={{ ml: 0.75 }} />}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.ageDays}d</Typography>
                                <Typography variant="caption" color="text.secondary">Since created</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{hoursLabel(row.acknowledgementHours)}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {row.acknowledged ? 'Acknowledged' : 'Waiting'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                                  <Button size="small" variant="outlined" sx={{ textTransform: 'none' }} onClick={() => openPropertyDetails(row.property?._id)}>
                                    Property
                                  </Button>
                                  <Button size="small" variant="outlined" sx={{ textTransform: 'none' }} onClick={() => openLandlordProfile(row.landlord?._id)}>
                                    Landlord
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack sx={{ gap: 2 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Landlord Response Patterns</Typography>
                    <Stack sx={{ gap: 1.25 }}>
                      {data.landlordRows.slice(0, 6).map((row) => (
                        <Box key={row.landlord?._id || row.landlord?.email || row.landlord?.name} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.landlord?.name || 'Unknown landlord'}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{row.landlord?.email || ''}</Typography>
                          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mt: 0.75 }}>
                            <Chip size="small" label={`${row.total} tickets`} />
                            <Chip size="small" color={row.overdue > 0 ? 'error' : 'success'} label={`${row.overdue} overdue`} />
                            <Chip size="small" variant="outlined" label={`Ack ${hoursLabel(row.averageAckHours)}`} />
                          </Stack>
                        </Box>
                      ))}
                      {data.landlordRows.length === 0 && (
                        <Typography color="text.secondary" variant="body2">No landlord response data available.</Typography>
                      )}
                    </Stack>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Problem Properties</Typography>
                    <Stack sx={{ gap: 1.25 }}>
                      {data.propertyRows.slice(0, 6).map((row) => (
                        <Box key={row.property?._id || row.property?.propertyName} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.property?.propertyName || 'Unknown property'}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{row.property?.city || 'Unknown city'}</Typography>
                          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mt: 0.75 }}>
                            <Chip size="small" label={`${row.total} tickets`} />
                            <Chip size="small" color={row.overdue > 0 ? 'error' : 'warning'} label={`${row.overdue} overdue`} />
                          </Stack>
                        </Box>
                      ))}
                      {data.propertyRows.length === 0 && (
                        <Typography color="text.secondary" variant="body2">No property response data available.</Typography>
                      )}
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        )}
      </Box>
    </AdminLayout>
  );
}