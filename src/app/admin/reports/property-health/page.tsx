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

import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import HomeRepairServiceRoundedIcon from '@mui/icons-material/HomeRepairServiceRounded';
import AltRouteRoundedIcon from '@mui/icons-material/AltRouteRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';

type HealthStatus = 'healthy' | 'review' | 'critical';

interface PropertyHealthRow {
  propertyId: string;
  propertyName: string;
  city?: string;
  universityNearby?: string;
  landlord: { id: string; name?: string; email?: string } | null;
  availability: {
    isAvailable: boolean;
    publishedAgeDays: number;
  };
  inventory: {
    roomType?: string;
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number | null;
    vacancyGap: number | null;
    occupancyRate: number | null;
    roomCountMismatch: boolean;
    lowOccupancy: boolean;
  };
  content: {
    missingImages: boolean;
    missingDescription: boolean;
    missingAmenities: boolean;
    missingRules: boolean;
  };
  transport: {
    enabled: boolean;
    mode: 'none' | 'private' | 'campus_route' | 'both';
    scheduleCount: number;
    completeScheduleCount: number;
    incomplete: boolean;
  };
  maintenance: {
    total: number;
    open: number;
    inProgress: number;
    urgent: number;
  };
  health: {
    score: number;
    status: HealthStatus;
  };
}

interface PropertyHealthPayload {
  summary: {
    totalProperties: number;
    healthyCount: number;
    reviewCount: number;
    criticalCount: number;
    missingRoomTotalsCount: number;
    roomCountMismatchCount: number;
    lowOccupancyCount: number;
    transportIncompleteCount: number;
    maintenanceOpenCount: number;
    urgentMaintenanceCount: number;
    incompleteContentCount: number;
  };
  rows: PropertyHealthRow[];
}

function healthLabel(status: HealthStatus) {
  if (status === 'healthy') return 'Healthy';
  if (status === 'review') return 'Needs review';
  return 'Critical';
}

function healthColor(status: HealthStatus) {
  if (status === 'healthy') return 'success';
  if (status === 'review') return 'warning';
  return 'error';
}

function StatCard({ icon, label, value, caption, color }: { icon: React.ReactNode; label: string; value: string; caption?: string; color: string }) {
  return (
    <Card elevation={0} className="glass-card" sx={{ height: '100%', borderRadius: 3 }}>
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

export default function PropertyHealthPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<PropertyHealthPayload | null>(null);
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [issuesOnly, setIssuesOnly] = useState(false);

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
        const res = await api.get('/admin/reports/property-health');
        setData(res.data?.data ?? null);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load property health report');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') load();
  }, [isAuthenticated, user]);

  const cityOptions = useMemo(() => {
    const values = Array.from(new Set((data?.rows ?? []).map((row) => row.city).filter(Boolean))) as string[];
    return values.sort((a, b) => a.localeCompare(b));
  }, [data]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.rows ?? []).filter((row) => {
      if (cityFilter !== 'all' && row.city !== cityFilter) return false;
      if (statusFilter !== 'all' && row.health.status !== statusFilter) return false;
      if (issuesOnly && row.health.status === 'healthy') return false;
      if (!query) return true;

      const haystack = [
        row.propertyName,
        row.city,
        row.universityNearby,
        row.landlord?.name,
        row.landlord?.email,
        row.inventory.roomType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [data, cityFilter, statusFilter, search, issuesOnly]);

  const openLandlordProfile = (landlordId?: string) => {
    if (!landlordId) return;
    router.push(`/admin/users?landlordId=${landlordId}`);
  };

  const openPropertyRooms = (propertyId?: string) => {
    if (!propertyId) return;
    router.push(`/landlord/properties/${propertyId}/rooms`);
  };

  return (
    <AdminLayout>
      <Box className="modern-shell" sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Property Health</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Catch incomplete listings, occupancy drift, transport gaps, and maintenance-heavy properties before they become problems.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : !data ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No property health data available.</Typography>
          </Paper>
        ) : (
          <Stack sx={{ gap: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<FactCheckRoundedIcon />} label="Healthy" value={String(data.summary.healthyCount)} color="#2e7d32" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<WarningAmberRoundedIcon />} label="Needs Review" value={String(data.summary.reviewCount)} color="#ed6c02" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<HomeRepairServiceRoundedIcon />} label="Critical" value={String(data.summary.criticalCount)} color="#d32f2f" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<InsightsRoundedIcon />} label="Total Properties" value={String(data.summary.totalProperties)} color="#1976d2" />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<ApartmentRoundedIcon />} label="Missing Room Totals" value={String(data.summary.missingRoomTotalsCount)} color="#6a1b9a" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<AltRouteRoundedIcon />} label="Transport Gaps" value={String(data.summary.transportIncompleteCount)} color="#0288d1" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<HomeRepairServiceRoundedIcon />} label="Open Maintenance" value={String(data.summary.maintenanceOpenCount)} color="#ef6c00" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<WarningAmberRoundedIcon />} label="Content Gaps" value={String(data.summary.incompleteContentCount)} color="#d32f2f" />
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 1.5, flexWrap: 'wrap' }}>
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
                  label="Health"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="all">All health</MenuItem>
                  <MenuItem value="healthy">Healthy</MenuItem>
                  <MenuItem value="review">Needs review</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </TextField>

                <TextField
                  label="Search"
                  size="small"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Property, landlord, room type"
                  sx={{ minWidth: { xs: '100%', md: 320 }, flex: 1 }}
                />

                <Chip
                  clickable
                  label="Issues only"
                  color={issuesOnly ? 'warning' : 'default'}
                  variant={issuesOnly ? 'filled' : 'outlined'}
                  onClick={() => setIssuesOnly((value) => !value)}
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 0, overflow: 'hidden' }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Property Health Review</Typography>
                <Typography variant="caption" color="text.secondary">Showing {filteredRows.length} of {data.summary.totalProperties} properties</Typography>
              </Box>
              {filteredRows.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No properties match the selected filters.</Typography>
                </Box>
              ) : (
                <TableContainer sx={{ overflowX: 'auto', maxHeight: 620, borderRadius: 3 }}>
                  <Table
                    stickyHeader
                    size="small"
                    sx={{
                      minWidth: 1280,
                      '& .MuiTableCell-root': { py: 1.25 },
                      '& .MuiTableCell-stickyHeader': {
                        bgcolor: 'rgba(255,255,255,0.94)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: 'inset 0 -1px 0 rgba(24,104,201,0.12), 0 10px 22px rgba(17,67,124,0.06)',
                      },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Landlord</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Health</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Rooms</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Content</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Transport</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Maintenance</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRows.map((row) => (
                        <TableRow key={row.propertyId} hover sx={{ '& td': { transition: 'background-color 0.2s ease' }, '&:hover td': { bgcolor: 'rgba(24,104,201,0.05)' } }}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.propertyName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.city || 'Unknown city'}{row.universityNearby ? ` · Near ${row.universityNearby}` : ''}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {row.availability.isAvailable ? 'Available' : 'Unavailable'} · Listed {row.availability.publishedAgeDays}d ago
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.landlord?.name || 'Unknown'}</Typography>
                            <Typography variant="caption" color="text.secondary">{row.landlord?.email || ''}</Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                              <Chip size="small" label={`${row.health.score}%`} color={healthColor(row.health.status)} sx={{ fontWeight: 700, height: 24 }} />
                              <Chip size="small" variant="outlined" label={healthLabel(row.health.status)} />
                              {row.inventory.lowOccupancy && <Chip size="small" color="warning" label="Low occupancy" />}
                              {row.inventory.roomCountMismatch && <Chip size="small" color="error" label="Room mismatch" />}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.inventory.occupiedRooms}/{row.inventory.totalRooms || '—'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Vacant {row.inventory.vacancyGap ?? '—'} · {row.inventory.occupancyRate !== null ? `${row.inventory.occupancyRate}% occupancy` : 'No room total'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                              {row.content.missingImages && <Chip size="small" color="warning" label="No images" />}
                              {row.content.missingDescription && <Chip size="small" color="warning" label="No description" />}
                              {row.content.missingAmenities && <Chip size="small" color="warning" label="No amenities" />}
                              {row.content.missingRules && <Chip size="small" color="warning" label="No rules" />}
                              {!row.content.missingImages && !row.content.missingDescription && !row.content.missingAmenities && !row.content.missingRules && (
                                <Chip size="small" color="success" label="Complete" />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                              {row.transport.enabled ? (
                                <>
                                  <Chip size="small" label={row.transport.mode} sx={{ textTransform: 'capitalize', height: 24, fontWeight: 600 }} />
                                  {row.transport.incomplete && <Chip size="small" color="error" label="Incomplete" />}
                                  {!row.transport.incomplete && <Chip size="small" color="success" label="Complete" />}
                                </>
                              ) : (
                                <Chip size="small" variant="outlined" label="Transport off" />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                              <Chip size="small" label={`${row.maintenance.open} open`} color={row.maintenance.open > 0 ? 'warning' : 'success'} />
                              {row.maintenance.urgent > 0 && <Chip size="small" color="error" label={`${row.maintenance.urgent} urgent`} />}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                              <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }} onClick={() => openPropertyRooms(row.propertyId)}>
                                Rooms
                              </Button>
                              <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }} onClick={() => openLandlordProfile(row.landlord?.id)}>
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
          </Stack>
        )}
      </Box>
    </AdminLayout>
  );
}