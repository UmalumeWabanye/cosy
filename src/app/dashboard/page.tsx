'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import StudentLayout from '@/components/student/StudentLayout';
import api from '@/services/api';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import WavingHandRoundedIcon from '@mui/icons-material/WavingHandRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';

const STATUS_COLORS: Record<string, string> = {
  pending: '#ed6c02', approved: '#2e7d32', rejected: '#d32f2f',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', approved: 'Approved', rejected: 'Rejected',
};

interface Stats { totalApplications: number; pending: number; approved: number; saved: number; }
interface RecentRequest {
  _id: string; status: string; createdAt: string;
  roomNumber?: string;
  moveInDate?: string;
  property?: { propertyName?: string; city?: string; images?: Array<string | { url?: string }> };
}

interface Recommendation {
  _id: string;
  propertyName?: string;
  city?: string;
  price?: number;
  roomType?: string;
  universityNearby?: string;
  nsfasAccredited?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalApplications: 0, pending: 0, approved: 0, saved: 0 });
  const [recent, setRecent] = useState<RecentRequest[]>([]);
  const [activeTenancy, setActiveTenancy] = useState<RecentRequest | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingSaving, setOnboardingSaving] = useState(false);
  const [onboardingError, setOnboardingError] = useState('');
  const [onboarding, setOnboarding] = useState({
    budgetMin: '',
    budgetMax: '',
    campus: '',
    commutePreference: 'any',
    moveInDate: '',
    roomPreference: 'Any',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const [reqRes, savedRes] = await Promise.all([
          api.get('/requests/my').catch(() => ({ data: [] })),
          api.get('/saved').catch(() => ({ data: { data: [] } })),
        ]);
        const reqs: RecentRequest[] = Array.isArray(reqRes.data) ? reqRes.data : (reqRes.data.data ?? []);
        const saved = Array.isArray(savedRes.data) ? savedRes.data : (savedRes.data.data ?? []);
        setStats({
          totalApplications: reqs.length,
          pending: reqs.filter(r => r.status === 'pending').length,
          approved: reqs.filter(r => r.status === 'approved').length,
          saved: saved.length,
        });
        setRecent(reqs.slice(0, 5));
        setActiveTenancy(reqs.find((r) => r.status === 'approved' && r.roomNumber) || reqs.find((r) => r.status === 'approved') || null);

        const onboardingData = (user as any)?.studentOnboarding;
        if (!onboardingData?.completed) {
          setOnboardingOpen(true);
        } else {
          setOnboarding({
            budgetMin: onboardingData?.budgetMin ? String(onboardingData.budgetMin) : '',
            budgetMax: onboardingData?.budgetMax ? String(onboardingData.budgetMax) : '',
            campus: onboardingData?.campus || '',
            commutePreference: onboardingData?.commutePreference || 'any',
            moveInDate: onboardingData?.moveInDate ? String(onboardingData.moveInDate).slice(0, 10) : '',
            roomPreference: onboardingData?.roomPreference || 'Any',
          });

          const params = new URLSearchParams();
          if (onboardingData?.campus) params.set('university', onboardingData.campus);
          if (onboardingData?.budgetMin) params.set('minPrice', String(onboardingData.budgetMin));
          if (onboardingData?.budgetMax) params.set('maxPrice', String(onboardingData.budgetMax));
          if (onboardingData?.roomPreference && onboardingData.roomPreference !== 'Any') params.set('roomType', onboardingData.roomPreference);
          if (user?.fundingType === 'NSFAS') params.set('fundingType', 'nsfas');

          const recommendationRes = await api.get(`/properties?${params.toString()}`);
          const recommendationList = Array.isArray(recommendationRes.data)
            ? recommendationRes.data
            : (recommendationRes.data.properties || recommendationRes.data.data || []);
          setRecommendations(recommendationList.slice(0, 4));
        }

        await api.post('/student/saved-searches/alerts/run').catch(() => null);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, [isAuthenticated, user]);

  const saveOnboarding = async () => {
    setOnboardingSaving(true);
    setOnboardingError('');
    try {
      await api.patch('/auth/me', {
        studentOnboarding: {
          completed: true,
          budgetMin: onboarding.budgetMin ? Number(onboarding.budgetMin) : null,
          budgetMax: onboarding.budgetMax ? Number(onboarding.budgetMax) : null,
          campus: onboarding.campus,
          commutePreference: onboarding.commutePreference,
          moveInDate: onboarding.moveInDate || null,
          roomPreference: onboarding.roomPreference,
        },
      });
      setOnboardingOpen(false);
      window.location.reload();
    } catch (e: any) {
      setOnboardingError(e?.response?.data?.message || 'Failed to save onboarding preferences.');
    } finally {
      setOnboardingSaving(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const STAT_CARDS = [
    {
      label: 'Total Applications', value: stats.totalApplications,
      icon: <AssignmentRoundedIcon sx={{ fontSize: 22, color: '#1976d2' }} />,
      bg: 'rgba(25,118,210,0.08)', color: '#1976d2',
      action: () => router.push('/applications'),
    },
    {
      label: 'Pending Review', value: stats.pending,
      icon: <HourglassTopRoundedIcon sx={{ fontSize: 22, color: '#ed6c02' }} />,
      bg: 'rgba(237,108,2,0.08)', color: '#ed6c02',
      action: () => router.push('/applications'),
    },
    {
      label: 'Approved', value: stats.approved,
      icon: <CheckCircleRoundedIcon sx={{ fontSize: 22, color: '#2e7d32' }} />,
      bg: 'rgba(46,125,50,0.08)', color: '#2e7d32',
      action: () => router.push('/applications'),
    },
    {
      label: 'Saved Properties', value: stats.saved,
      icon: <BookmarkRoundedIcon sx={{ fontSize: 22, color: '#7b1fa2' }} />,
      bg: 'rgba(123,31,162,0.08)', color: '#7b1fa2',
      action: () => router.push('/saved-listings'),
    },
  ];

  if (isLoading) return null;

  const getImageUrl = (image?: string | { url?: string }) => {
    if (!image) return '';
    return typeof image === 'string' ? image : image.url || '';
  };

  return (
    <StudentLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>

        {/* Welcome banner */}
        <Paper elevation={0} sx={{
          p: 3, mb: 3, borderRadius: 3,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 60%, #0d47a1 100%)',
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <Box sx={{
            position: 'absolute', top: -20, right: -20, width: 120, height: 120,
            borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)',
          }} />
          <Box sx={{
            position: 'absolute', bottom: -30, right: 60, width: 80, height: 80,
            borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)',
          }} />
          <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48, fontSize: 20, fontWeight: 700 }}>
              {(user?.name ?? 'S')[0].toUpperCase()}
            </Avatar>
            <Box>
              <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                  {greeting()}, {user?.name?.split(' ')[0] ?? 'Student'}!
                </Typography>
                <WavingHandRoundedIcon sx={{ fontSize: 20, color: '#FFD54F' }} />
              </Stack>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.25 }}>
                {user?.university ?? 'Welcome to Cosy — your accommodation companion'}
              </Typography>
            </Box>
          </Stack>
          {user?.fundingType && (
            <Chip
              label={user.fundingType}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, fontSize: 11, mt: 0.5 }}
            />
          )}
        </Paper>

        {activeTenancy?.property && (
          <Paper elevation={0} sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'success.light',
            bgcolor: 'rgba(46,125,50,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            flexWrap: 'wrap',
          }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.dark' }}>
                Active Tenancy: {activeTenancy.property.propertyName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activeTenancy.property.city}
                {activeTenancy.roomNumber ? ` · Room ${activeTenancy.roomNumber}` : ''}
              </Typography>
            </Box>
            <Button size="small" variant="outlined" color="success" onClick={() => router.push('/maintenance')} sx={{ textTransform: 'none' }}>
              Manage Maintenance
            </Button>
          </Paper>
        )}

        {/* Profile completion nudge */}
        {!loading && user && !(user as any).profileComplete && (
          <Paper elevation={0} sx={{
            p: 2, mb: 2.5, borderRadius: 2.5,
            border: '1px solid', borderColor: 'warning.light',
            bgcolor: 'rgba(237,108,2,0.06)',
            display: 'flex', alignItems: 'center', gap: 2,
          }}>
            <AccountCircleRoundedIcon sx={{ color: 'warning.main', fontSize: 32, flexShrink: 0 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                Complete your profile to unlock all features
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Add your university, funding type, and ID number so landlords can review your applications.
              </Typography>
            </Box>
            <Button
              size="small"
              variant="contained"
              color="warning"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => router.push('/profile')}
              sx={{ textTransform: 'none', fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              Complete Profile
            </Button>
          </Paper>
        )}

        {/* Stats grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)' }, gap: 2, mb: 3 }}>
          {loading
            ? [...Array(4)].map((_, i) => <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 2 }} />)
            : STAT_CARDS.map(card => (
              <Paper key={card.label} elevation={0} onClick={card.action} sx={{
                p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 16px ${card.color}30` },
              }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: 1.5, bgcolor: card.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5,
                }}>
                  {card.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: card.color, lineHeight: 1 }}>
                  {card.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mt: 0.25, display: 'block' }}>
                  {card.label}
                </Typography>
              </Paper>
            ))
          }
        </Box>

        {/* Quick actions + Recent activity */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>

          {/* Quick Actions */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Quick Actions</Typography>
            <Stack sx={{ gap: 1.5 }}>
              {[
                { label: 'Browse Properties', sub: 'Find your next accommodation', icon: <SearchRoundedIcon />, path: '/browse', color: '#1976d2' },
                { label: 'View Applications', sub: 'Track your application status', icon: <AssignmentRoundedIcon />, path: '/applications', color: '#ed6c02' },
                { label: 'Saved Listings', sub: 'Properties you bookmarked', icon: <BookmarkRoundedIcon />, path: '/saved-listings', color: '#7b1fa2' },
                { label: 'My Profile', sub: 'Update your details', icon: <HomeRoundedIcon />, path: '/profile', color: '#2e7d32' },
              ].map(item => (
                <Box
                  key={item.label}
                  onClick={() => router.push(item.path)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2,
                    border: '1px solid', borderColor: 'divider', cursor: 'pointer',
                    transition: 'background 0.15s, transform 0.15s',
                    '&:hover': { bgcolor: `${item.color}10`, transform: 'translateX(3px)' },
                  }}
                >
                  <Box sx={{
                    width: 36, height: 36, borderRadius: 1.5,
                    bgcolor: `${item.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    '& svg': { fontSize: 18, color: item.color },
                  }}>
                    {item.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{item.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.sub}</Typography>
                  </Box>
                  <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Recent applications */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Recent Applications</Typography>
              <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => router.push('/applications')}
                sx={{ textTransform: 'none', fontSize: 12 }}>
                View all
              </Button>
            </Stack>
            {loading ? (
              <Stack sx={{ gap: 1 }}>
                {[...Array(3)].map((_, i) => <Skeleton key={i} height={60} sx={{ borderRadius: 1.5 }} />)}
              </Stack>
            ) : recent.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <AssignmentRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">No applications yet</Typography>
                <Button size="small" sx={{ mt: 1, textTransform: 'none' }} onClick={() => router.push('/browse')}>
                  Browse properties
                </Button>
              </Box>
            ) : (
              <Stack sx={{ gap: 0 }}>
                {recent.map((r, i) => (
                  <React.Fragment key={r._id}>
                    {i > 0 && <Divider />}
                    <Box
                      onClick={() => router.push('/applications')}
                      sx={{
                        py: 1.5, px: 0.5, display: 'flex', alignItems: 'center', gap: 1.5,
                        cursor: 'pointer', borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Box sx={{
                        width: 40, height: 40, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0,
                        bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {r.property?.images?.[0]
                          ? <img src={getImageUrl(r.property.images[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <HomeRoundedIcon sx={{ color: 'text.disabled', fontSize: 20 }} />}
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {r.property?.propertyName ?? 'Property'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                          {r.property?.city} · {new Date(r.createdAt).toLocaleDateString('en-ZA')}
                        </Typography>
                      </Box>
                      <Chip
                        label={STATUS_LABELS[r.status] ?? r.status}
                        size="small"
                        sx={{
                          height: 20, fontSize: 10, fontWeight: 700,
                          bgcolor: `${STATUS_COLORS[r.status]}18`,
                          color: STATUS_COLORS[r.status],
                        }}
                      />
                      {r.status === 'approved' && r.roomNumber && (
                        <Chip
                          label={`Room ${r.roomNumber}`}
                          size="small"
                          variant="outlined"
                          color="success"
                          sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                        />
                      )}
                    </Box>
                  </React.Fragment>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>

        <Paper elevation={0} sx={{ p: 2.5, mt: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Personalized For You</Typography>
            <Button size="small" sx={{ textTransform: 'none' }} onClick={() => setOnboardingOpen(true)}>Update Preferences</Button>
          </Stack>
          {recommendations.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Complete onboarding preferences to unlock personalized property recommendations.</Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
              {recommendations.map((item) => (
                <Paper key={item._id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.propertyName || 'Property'}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.city || 'Unknown city'}{item.universityNearby ? ` · Near ${item.universityNearby}` : ''}</Typography>
                  <Stack direction="row" sx={{ mt: 1, gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                    {item.price ? <Chip size="small" label={`R${item.price.toLocaleString()}/mo`} /> : null}
                    {item.roomType ? <Chip size="small" variant="outlined" label={item.roomType} /> : null}
                    {item.nsfasAccredited ? <Chip size="small" color="info" label="NSFAS" /> : null}
                    <Button size="small" sx={{ textTransform: 'none' }} onClick={() => router.push(`/browse/${item._id}`)}>View</Button>
                  </Stack>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      </Box>

      <Dialog open={onboardingOpen} onClose={() => !onboardingSaving && setOnboardingOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Student Onboarding Assistant</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 1.5, pt: '12px !important' }}>
          {onboardingError ? <Alert severity="error">{onboardingError}</Alert> : null}
          <TextField label="Budget Minimum (R)" type="number" value={onboarding.budgetMin} onChange={(e) => setOnboarding((p) => ({ ...p, budgetMin: e.target.value }))} />
          <TextField label="Budget Maximum (R)" type="number" value={onboarding.budgetMax} onChange={(e) => setOnboarding((p) => ({ ...p, budgetMax: e.target.value }))} />
          <TextField label="Preferred Campus / University" value={onboarding.campus} onChange={(e) => setOnboarding((p) => ({ ...p, campus: e.target.value }))} />
          <TextField select label="Commute Preference" value={onboarding.commutePreference} onChange={(e) => setOnboarding((p) => ({ ...p, commutePreference: e.target.value }))}>
            <MenuItem value="any">Any</MenuItem>
            <MenuItem value="walk">Walking distance preferred</MenuItem>
            <MenuItem value="shuttle">Shuttle/transport preferred</MenuItem>
          </TextField>
          <TextField label="Preferred Move-In Date" type="date" value={onboarding.moveInDate} onChange={(e) => setOnboarding((p) => ({ ...p, moveInDate: e.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField select label="Room Preference" value={onboarding.roomPreference} onChange={(e) => setOnboarding((p) => ({ ...p, roomPreference: e.target.value }))}>
            <MenuItem value="Any">Any</MenuItem>
            <MenuItem value="Single">Single</MenuItem>
            <MenuItem value="Sharing">Sharing</MenuItem>
            <MenuItem value="Ensuite">Ensuite</MenuItem>
            <MenuItem value="Bachelor">Bachelor</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOnboardingOpen(false)} disabled={onboardingSaving}>Cancel</Button>
          <Button variant="contained" onClick={saveOnboarding} disabled={onboardingSaving}>{onboardingSaving ? 'Saving…' : 'Save Preferences'}</Button>
        </DialogActions>
      </Dialog>
    </StudentLayout>
  );
}
