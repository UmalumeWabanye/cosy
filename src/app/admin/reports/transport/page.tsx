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

import AltRouteRoundedIcon from '@mui/icons-material/AltRouteRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

interface TransportSchedule {
  routeName?: string;
  pickupFromResidence?: string;
  departureToCampus?: string;
  returnPickupFromCampus?: string;
  arrivalAtResidence?: string;
  days?: string[];
}

interface TransportRow {
  propertyId: string;
  propertyName: string;
  city?: string;
  universityNearby?: string;
  landlord: { id: string; name?: string; email?: string } | null;
  transport: {
    mode: 'none' | 'private' | 'campus_route' | 'both';
    providerName?: string;
    contact?: string;
    notes?: string;
    scheduleCount: number;
    completeScheduleCount: number;
    schedules: TransportSchedule[];
  };
}

interface TransportPayload {
  summary: {
    totalTransportEnabledProperties: number;
    modeCounts: { private: number; campus_route: number; both: number };
    propertiesWithNoSchedules: number;
    propertiesWithIncompleteSchedules: number;
    propertiesWithMissingProviderInfo: number;
  };
  rows: TransportRow[];
}

function modeLabel(mode: string) {
  if (mode === 'private') return 'Private';
  if (mode === 'campus_route') return 'Campus Route';
  if (mode === 'both') return 'Private + Campus';
  return 'Unknown';
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <Card elevation={0} className="glass-card" sx={{ height: '100%', borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
          <Box sx={{ color }}>{icon}</Box>
        </Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

export default function AdminTransportOversightPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<TransportPayload | null>(null);
  const [cityFilter, setCityFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');

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
        const res = await api.get('/admin/reports/transport');
        setData(res.data?.data ?? null);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load transport oversight report');
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
    return (data?.rows ?? []).filter((row) => {
      if (cityFilter !== 'all' && row.city !== cityFilter) return false;
      if (modeFilter !== 'all' && row.transport.mode !== modeFilter) return false;
      return true;
    });
  }, [data, cityFilter, modeFilter]);

  return (
    <AdminLayout>
      <Box className="modern-shell" sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Transport Oversight</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor private transport and campus route setup quality across landlord listings.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : !data ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No transport oversight data available.</Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<ApartmentRoundedIcon />} label="Transport-enabled Listings" value={data.summary.totalTransportEnabledProperties} color="#1976d2" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<AltRouteRoundedIcon />} label="Private + Campus" value={data.summary.modeCounts.both} color="#6a1b9a" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<WarningAmberRoundedIcon />} label="Missing Schedules" value={data.summary.propertiesWithNoSchedules} color="#ed6c02" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard icon={<VerifiedRoundedIcon />} label="Incomplete Setup Alerts" value={data.summary.propertiesWithIncompleteSchedules + data.summary.propertiesWithMissingProviderInfo} color="#d32f2f" />
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5 }}>
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
                  label="Transport mode"
                  value={modeFilter}
                  onChange={(event) => setModeFilter(event.target.value)}
                  sx={{ minWidth: 220 }}
                >
                  <MenuItem value="all">All modes</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                  <MenuItem value="campus_route">Campus Route</MenuItem>
                  <MenuItem value="both">Private + Campus</MenuItem>
                </TextField>
              </Stack>
            </Paper>

            {filteredRows.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
                <Typography color="text.secondary">No listings match the selected filters.</Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto', maxHeight: 600, borderRadius: 3 }}>
                <Table
                  stickyHeader
                  size="small"
                  sx={{
                    minWidth: 960,
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
                      <TableCell sx={{ fontWeight: 700 }}>Transport Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Provider</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Schedule Quality</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Routes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRows.map((row) => {
                      const missingProvider = ['private', 'both'].includes(row.transport.mode) && (!row.transport.providerName || !row.transport.contact);
                      const noSchedules = row.transport.scheduleCount === 0;
                      const partialSchedules = row.transport.scheduleCount > 0 && row.transport.completeScheduleCount < row.transport.scheduleCount;

                      return (
                        <TableRow key={row.propertyId} hover sx={{ '& td': { transition: 'background-color 0.2s ease' }, '&:hover td': { bgcolor: 'rgba(24,104,201,0.05)' } }}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.propertyName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.city || 'Unknown city'}
                              {row.universityNearby ? ` · Near ${row.universityNearby}` : ''}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.landlord?.name || 'Unknown'}</Typography>
                            <Typography variant="caption" color="text.secondary">{row.landlord?.email || ''}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" color="secondary" label={modeLabel(row.transport.mode)} sx={{ height: 24, fontWeight: 700 }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.transport.providerName || 'Not set'}</Typography>
                            <Typography variant="caption" color="text.secondary">{row.transport.contact || 'No contact set'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: row.transport.notes ? 'text.primary' : 'text.secondary' }}>
                              {row.transport.notes || 'No transport notes'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
                              {noSchedules && <Chip size="small" color="warning" label="No schedules" sx={{ height: 24, fontWeight: 600 }} />}
                              {partialSchedules && <Chip size="small" color="warning" label="Partial schedules" sx={{ height: 24, fontWeight: 600 }} />}
                              {missingProvider && <Chip size="small" color="error" label="Provider info missing" sx={{ height: 24, fontWeight: 600 }} />}
                              {!noSchedules && !partialSchedules && !missingProvider && <Chip size="small" color="success" label="Complete" sx={{ height: 24, fontWeight: 600 }} />}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.transport.completeScheduleCount}/{row.transport.scheduleCount}</Typography>
                            <Typography variant="caption" color="text.secondary">Complete routes</Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
