'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/services/api';
import StudentLayout from '@/components/student/StudentLayout';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

interface Property {
  _id: string;
  propertyName?: string;
  name?: string;
  city?: string;
  address?: string;
  price?: number;
  roomType?: string;
  images?: Array<{ url?: string } | string>;
  nsfasAccredited?: boolean;
}

interface Request {
  _id: string;
  property: Property;
  moveInDate: string;
  leaseDuration: number;
  fundingType: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: '#ed6c02', bg: 'rgba(237,108,2,0.10)'  },
  approved: { label: 'Approved', color: '#2e7d32', bg: 'rgba(46,125,50,0.10)'  },
  rejected: { label: 'Rejected', color: '#d32f2f', bg: 'rgba(211,47,47,0.10)'  },
};

export default function RequestsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'student')) router.push('/');
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const res = await api.get('/requests/my');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setRequests(data);
      } catch (e: unknown) {
        const message = typeof e === 'object' && e && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
        setError(message || 'Failed to load applications');
      } finally { setLoading(false); }
    };
    load();
  }, [isAuthenticated]);

  if (isLoading) return (
    <StudentLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    </StudentLayout>
  );

  if (!isAuthenticated || user?.role !== 'student') return null;

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const getPropertyTitle = (property?: Property) => property?.propertyName || property?.name || 'Property';
  const getPropertyImage = (property?: Property) => {
    const image = property?.images?.[0];
    if (!image) return '';
    return typeof image === 'string' ? image : image.url || '';
  };

  return (
    <StudentLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 3, gap: 1.5 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>My Applications</Typography>
            <Typography variant="body2" color="text.secondary">Track your accommodation applications</Typography>
          </Box>
          <Button variant="contained" component={Link} href="/browse" sx={{ textTransform: 'none', fontWeight: 600, alignSelf: { xs: 'flex-start', sm: 'auto' } }}>
            + New Application
          </Button>
        </Stack>

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        <Box sx={{ overflowX: 'auto', pb: 0.5, mb: 3 }}>
          <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
              <ToggleButton key={s} value={s} sx={{ textTransform: 'capitalize', fontFamily: 'inherit', px: { xs: 1.5, sm: 2 }, fontSize: { xs: 12, sm: 13 } }}>
                {s === 'all' ? `All (${requests.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${requests.filter(r => r.status === s).length})`}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Card variant="outlined" sx={{ textAlign: 'center', py: 8 }}>
            <ApartmentRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>
              {filter === 'all' ? 'No applications yet. Browse properties to get started!' : `No ${filter} applications.`}
            </Typography>
            <Button variant="contained" component={Link} href="/browse" sx={{ textTransform: 'none' }}>
              Browse Properties
            </Button>
          </Card>
        ) : (
          <Stack spacing={2}>
            {filtered.map(req => {
              const prop = req.property;
              const status = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
              const firstImage = prop?.images?.[0];
              const imgUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url;
              return (
                <Card key={req._id} variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.09)' } }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }}>
                    <Box sx={{ width: { xs: '100%', sm: 150 }, height: { xs: 160, sm: 'auto' }, flexShrink: 0, minHeight: { sm: 120 } }}>
                      {imgUrl ? (
                        <img src={getPropertyImage(prop) || imgUrl} alt={getPropertyTitle(prop)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <Box sx={{ width: '100%', height: '100%', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                          <ApartmentRoundedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                        </Box>
                      )}
                    </Box>
                    <CardContent sx={{ flex: 1, p: { xs: 2, sm: 2.5 } }}>
                      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5, gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{getPropertyTitle(prop)}</Typography>
                        <Chip label={status.label} size="small" sx={{ fontWeight: 700, bgcolor: status.bg, color: status.color, flexShrink: 0 }} />
                      </Stack>
                      {prop?.city && (
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                          <LocationOnOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">{prop.address ? `${prop.address}, ` : ''}{prop.city}</Typography>
                        </Stack>
                      )}
                      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', mb: 1.5 }}>
                        {prop?.price != null && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Rent</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>R{prop.price.toLocaleString()}/mo</Typography>
                          </Box>
                        )}
                        <Box>
                          <Typography variant="caption" color="text.secondary">Move-in</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(req.moveInDate).toLocaleDateString('en-ZA')}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Lease</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{req.leaseDuration} months</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
                          <Chip label={req.fundingType} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                          {prop?.roomType && <Chip label={prop.roomType} size="small" variant="outlined" sx={{ fontSize: 11 }} />}
                          {prop?.nsfasAccredited && <Chip label="NSFAS" size="small" color="success" sx={{ fontSize: 11 }} />}
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <CalendarTodayOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">{new Date(req.createdAt).toLocaleDateString('en-ZA')}</Typography>
                          {prop?._id && (
                            <Button size="small" variant="outlined" onClick={() => router.push(`/browse/${prop._id}`)} sx={{ textTransform: 'none', fontSize: 11, px: 1.5, py: 0.25, minWidth: 0 }}>
                              View
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
    </StudentLayout>
  );
}
