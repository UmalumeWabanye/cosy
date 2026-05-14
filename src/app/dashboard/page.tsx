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

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import WavingHandRoundedIcon from '@mui/icons-material/WavingHandRounded';

const STATUS_COLORS: Record<string, string> = {
  pending: '#ed6c02', approved: '#2e7d32', rejected: '#d32f2f',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', approved: 'Approved', rejected: 'Rejected',
};

interface Stats { totalApplications: number; pending: number; approved: number; saved: number; }
interface RecentRequest {
  _id: string; status: string; createdAt: string;
  property?: { propertyName?: string; city?: string; images?: string[] };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalApplications: 0, pending: 0, approved: 0, saved: 0 });
  const [recent, setRecent] = useState<RecentRequest[]>([]);
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
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, [isAuthenticated]);

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
                          ? <img src={r.property.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    </Box>
                  </React.Fragment>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>
      </Box>
    </StudentLayout>
  );
}
