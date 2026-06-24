'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import StudentLayout from '@/components/student/StudentLayout';
import api from '@/services/api';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DirectionsBusRoundedIcon from '@mui/icons-material/DirectionsBusRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';

type TransportMode = 'private' | 'campus_route' | 'both';

type Schedule = {
  day?: string;
  time?: string;
  route?: string;
  destination?: string;
  duration?: string;
  frequency?: string;
};

type TransportationData = {
  enabled: boolean;
  mode?: TransportMode;
  providerName?: string;
  contact?: string;
  notes?: string;
  schedules?: Schedule[];
};

type Property = {
  _id: string;
  propertyName?: string;
  city?: string;
  address?: string;
  distanceFromCampus?: number;
  transportation?: TransportationData;
};

type ActiveProperty = {
  request: string;
  property: Property | null;
  moveInDate: string;
  roomNumber?: string;
};

const TRANSPORT_MODE_META: Record<TransportMode, { label: string; color: string }> = {
  private: { label: 'Private Transport', color: '#d32f2f' },
  campus_route: { label: 'Campus Route', color: '#1976d2' },
  both: { label: 'Private + Campus', color: '#2e7d32' },
};

const TABS: Array<{ key: 'all' | TransportMode; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'private', label: 'Private' },
  { key: 'campus_route', label: 'Campus' },
  { key: 'both', label: 'Both' },
];

function modeIcon(mode?: TransportMode) {
  return mode === 'private' ? DirectionsCarRoundedIcon : DirectionsBusRoundedIcon;
}

function safeDate(dateStr?: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TransportationPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [activeProperties, setActiveProperties] = useState<ActiveProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const loadTransportation = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/maintenance/active-properties');
      const data = Array.isArray(res?.data?.data) ? res.data.data : [];
      setActiveProperties(data);
    } catch {
      setError('Failed to load transportation schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadTransportation();
    }
  }, [isAuthenticated, loadTransportation]);

  const transportProperties = useMemo(() => {
    return activeProperties
      .map((entry) => entry.property)
      .filter((property): property is Property => Boolean(property?._id))
      .filter((property) => Boolean(property.transportation?.enabled));
  }, [activeProperties]);

  const filteredProperties = useMemo(() => {
    const tab = TABS[selectedTab]?.key ?? 'all';
    if (tab === 'all') return transportProperties;
    return transportProperties.filter((property) => property.transportation?.mode === tab);
  }, [selectedTab, transportProperties]);

  if (isLoading) return null;

  return (
    <StudentLayout>
      <Box className="modern-shell" sx={{ p: { xs: 2, md: 3 }, minHeight: '100%' }}>
        <Paper
          elevation={0}
          className="glass-card stagger-in"
          sx={{
            p: { xs: 2.25, md: 3 },
            mb: 3,
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'radial-gradient(640px 280px at 0% 0%, rgba(24,104,201,0.14), transparent 65%), radial-gradient(540px 260px at 100% 100%, rgba(0,137,123,0.12), transparent 62%)',
            }}
          />
          <Stack sx={{ position: 'relative' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.2 }}>
              Transportation Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 720 }}>
              Explore your approved property's transport routes, pickup windows, and provider contacts in one place.
            </Typography>
            <Stack direction="row" sx={{ mt: 2, gap: 1, flexWrap: 'wrap' }}>
              <Chip size="small" label={`${transportProperties.length} active option${transportProperties.length === 1 ? '' : 's'}`} sx={{ fontWeight: 700, bgcolor: 'rgba(24,104,201,0.1)', color: 'primary.main' }} />
              <Chip size="small" label={`${activeProperties.length} current tenancy`} sx={{ fontWeight: 700, bgcolor: 'rgba(0,137,123,0.1)', color: 'secondary.main' }} />
            </Stack>
          </Stack>
        </Paper>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : activeProperties.length === 0 ? (
          <Paper elevation={0} className="glass-card" sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
            <DirectionsBusRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              No active tenancy found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Transportation is unlocked once your approved move-in date becomes active.
            </Typography>
            <Button variant="outlined" onClick={() => router.push('/applications')} sx={{ textTransform: 'none' }}>
              View My Applications
            </Button>
          </Paper>
        ) : transportProperties.length === 0 ? (
          <Paper elevation={0} className="glass-card" sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
            <DirectionsBusRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              No transportation configured
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your current property has no schedule yet. Ask your landlord for transport details.
            </Typography>
          </Paper>
        ) : (
          <Stack sx={{ gap: 2.5 }}>
            {activeProperties.map((entry) => {
              if (!entry.property) return null;
              return (
                <Paper
                  key={entry.request}
                  elevation={0}
                  className="glass-card stagger-in"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(46,125,50,0.05)',
                  }}
                >
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                      <HomeRoundedIcon sx={{ color: 'success.main' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {entry.property.propertyName || 'Property'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Move-in date: {safeDate(entry.moveInDate)}{entry.roomNumber ? ` · Room ${entry.roomNumber}` : ''}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip size="small" color="success" label="Active" sx={{ fontWeight: 700 }} />
                  </Stack>
                </Paper>
              );
            })}

            <Paper elevation={0} className="glass-card" sx={{ borderRadius: 2 }}>
              <Tabs
                value={selectedTab}
                onChange={(_, value) => setSelectedTab(value)}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 700,
                    letterSpacing: 0.1,
                    minHeight: 54,
                  },
                  '& .MuiTabs-indicator': {
                    height: 4,
                    borderRadius: 4,
                    bgcolor: 'primary.main',
                  },
                  '& .MuiTab-root.Mui-selected': { color: 'primary.main' },
                }}
              >
                {TABS.map((tab) => (
                  <Tab key={tab.key} label={tab.label} />
                ))}
              </Tabs>
            </Paper>

            {filteredProperties.length === 0 ? (
              <Paper elevation={0} className="glass-card" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  No schedules in this category
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose another tab to view available transportation options.
                </Typography>
              </Paper>
            ) : (
              filteredProperties.map((property) => {
                const transport = property.transportation;
                if (!transport?.enabled) return null;

                const mode = transport.mode ?? 'campus_route';
                const modeMeta = TRANSPORT_MODE_META[mode];
                const ModeIcon = modeIcon(mode);
                const schedules = Array.isArray(transport.schedules) ? transport.schedules : [];

                return (
                  <Card
                    key={property._id}
                    elevation={0}
                    className="glass-card stagger-in"
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      transition: 'transform 0.24s ease, box-shadow 0.24s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 22px 42px rgba(17,67,124,0.15)',
                      },
                    }}
                  >
                    <Box sx={{ height: 5, bgcolor: modeMeta.color }} />

                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, flexWrap: 'wrap' }}>
                        <Box>
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <ModeIcon sx={{ fontSize: 20, color: modeMeta.color }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {modeMeta.label}
                            </Typography>
                          </Stack>
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                            <HomeRoundedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {property.propertyName || 'Property'}
                            </Typography>
                          </Stack>
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                            <LocationOnRoundedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.secondary">
                              {property.city || property.address || '-'}
                            </Typography>
                            {typeof property.distanceFromCampus === 'number' ? (
                              <>
                                <Typography variant="caption" color="text.secondary">·</Typography>
                                <MapRoundedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {property.distanceFromCampus} km from campus
                                </Typography>
                              </>
                            ) : null}
                          </Stack>
                        </Box>
                        <Chip icon={<CheckCircleRoundedIcon />} size="small" color="success" label="Available" sx={{ fontWeight: 700 }} />
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      {(transport.providerName || transport.contact) ? (
                        <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(25,118,210,0.06)' }}>
                          {transport.providerName ? (
                            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: transport.contact ? 1 : 0 }}>
                              <PersonRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                              <Typography variant="body2">
                                <Typography component="span" sx={{ fontWeight: 700 }}>Provider: </Typography>
                                {transport.providerName}
                              </Typography>
                            </Stack>
                          ) : null}
                          {transport.contact ? (
                            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                              <PhoneRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                <Typography component="span" sx={{ fontWeight: 700 }}>Contact: </Typography>
                                {transport.contact}
                              </Typography>
                            </Stack>
                          ) : null}
                        </Box>
                      ) : null}

                      {transport.notes ? (
                        <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,193,7,0.12)' }}>
                          <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1 }}>
                            <InfoRoundedIcon sx={{ fontSize: 16, color: 'warning.dark', mt: 0.2 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                              {transport.notes}
                            </Typography>
                          </Stack>
                        </Box>
                      ) : null}

                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />
                        Schedule
                      </Typography>

                      {schedules.length === 0 ? (
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                          <Typography variant="body2" color="text.secondary">
                            Schedule details have not been posted yet.
                          </Typography>
                        </Paper>
                      ) : (
                        <Stack sx={{ gap: 1 }}>
                          {schedules.map((schedule, index) => (
                            <Paper key={`${property._id}-schedule-${index}`} elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {schedule.day || 'Any day'}
                                </Typography>
                                {schedule.time ? (
                                  <Chip
                                    size="small"
                                    icon={<AccessTimeRoundedIcon />}
                                    label={schedule.time}
                                    variant="outlined"
                                  />
                                ) : null}
                              </Stack>
                              <Stack direction="row" sx={{ mt: 1, gap: 2, flexWrap: 'wrap' }}>
                                {schedule.route ? (
                                  <Typography variant="caption" color="text.secondary">
                                    Route: <Typography component="span" variant="caption" sx={{ fontWeight: 700 }}>{schedule.route}</Typography>
                                  </Typography>
                                ) : null}
                                {schedule.destination ? (
                                  <Typography variant="caption" color="text.secondary">
                                    Destination: <Typography component="span" variant="caption" sx={{ fontWeight: 700 }}>{schedule.destination}</Typography>
                                  </Typography>
                                ) : null}
                                {schedule.duration ? (
                                  <Typography variant="caption" color="text.secondary">
                                    Duration: <Typography component="span" variant="caption" sx={{ fontWeight: 700 }}>{schedule.duration}</Typography>
                                  </Typography>
                                ) : null}
                                {schedule.frequency ? (
                                  <Typography variant="caption" color="text.secondary">
                                    Frequency: <Typography component="span" variant="caption" sx={{ fontWeight: 700 }}>{schedule.frequency}</Typography>
                                  </Typography>
                                ) : null}
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Stack>
        )}
      </Box>
    </StudentLayout>
  );
}
