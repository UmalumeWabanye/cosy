'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import StudentLayout from '@/components/student/StudentLayout';
import api from '@/services/api';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';

import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded';

interface Notif {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

function typeColor(type: string) {
  if (type === 'new_request' || type === 'request_updated') return '#1976d2';
  if (type === 'new_user' || type === 'user_invited') return '#2e7d32';
  return '#ed6c02';
}
function typeIcon(type: string) {
  if (type === 'request_updated') return <UpdateRoundedIcon sx={{ fontSize: 18 }} />;
  if (type === 'new_request') return <HomeRoundedIcon sx={{ fontSize: 18 }} />;
  if (type === 'new_user' || type === 'user_invited') return <HowToRegRoundedIcon sx={{ fontSize: 18 }} />;
  return <NotificationsRoundedIcon sx={{ fontSize: 18 }} />;
}
function groupLabel(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function StudentNotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await api.get('/student/notifications?limit=50');
      setNotifs(res.data.data ?? []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/login'); }, [isAuthenticated, isLoading, router]);
  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const markRead = async (id: string) => {
    await api.patch(`/student/notifications/${id}/read`);
    setNotifs(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
  };
  const markAllRead = async () => {
    await api.patch('/student/notifications/read-all');
    setNotifs(n => n.map(x => ({ ...x, isRead: true })));
  };
  const deleteNotif = async (id: string) => {
    await api.delete(`/student/notifications/${id}`);
    setNotifs(n => n.filter(x => x._id !== id));
  };
  const handleClick = async (n: Notif) => {
    if (!n.isRead) await markRead(n._id);
    if (n.link) router.push(n.link);
  };

  // Group by date
  const groups: Record<string, Notif[]> = {};
  notifs.forEach(n => {
    const label = groupLabel(n.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });

  const unreadCount = notifs.filter(n => !n.isRead).length;

  if (isLoading) return null;

  return (
    <StudentLayout>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 700, mx: 'auto' }}>
        <Stack sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Notifications</Typography>
            {unreadCount > 0 && (
              <Chip label={`${unreadCount} unread`} size="small"
                sx={{ bgcolor: 'rgba(25,118,210,0.1)', color: 'primary.main', fontWeight: 700, fontSize: 11 }} />
            )}
          </Stack>
          {unreadCount > 0 && (
            <Button size="small" startIcon={<DoneAllRoundedIcon />} onClick={markAllRead}
              sx={{ textTransform: 'none', fontWeight: 600 }}>
              Mark all read
            </Button>
          )}
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : notifs.length === 0 ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <NotificationsRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">No notifications yet</Typography>
          </Paper>
        ) : (
          Object.entries(groups).map(([label, items]) => (
            <Box key={label} sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, px: 0.5 }}>
                {label}
              </Typography>
              <Paper elevation={0} sx={{ mt: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                {items.map((n, i) => (
                  <React.Fragment key={n._id}>
                    {i > 0 && <Divider />}
                    <Box
                      onClick={() => handleClick(n)}
                      sx={{
                        p: 2, cursor: n.link ? 'pointer' : 'default', display: 'flex', gap: 1.5, alignItems: 'flex-start',
                        bgcolor: n.isRead ? 'transparent' : `${typeColor(n.type)}08`,
                        transition: 'background 0.2s',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Box sx={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        bgcolor: `${typeColor(n.type)}15`, color: typeColor(n.type),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {typeIcon(n.type)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1, mb: 0.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: n.isRead ? 500 : 700, lineHeight: 1.3 }}>
                            {n.title}
                          </Typography>
                          {!n.isRead && (
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: typeColor(n.type), flexShrink: 0 }} />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                          {n.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10, mt: 0.5, display: 'block' }}>
                          {new Date(n.createdAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      <Stack sx={{ flexDirection: 'row', gap: 0.5, flexShrink: 0 }}>
                        {!n.isRead && (
                          <Tooltip title="Mark as read">
                            <IconButton size="small" onClick={e => { e.stopPropagation(); markRead(n._id); }}
                              sx={{ color: typeColor(n.type) }}>
                              <DoneAllRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={e => { e.stopPropagation(); deleteNotif(n._id); }}
                            sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </React.Fragment>
                ))}
              </Paper>
            </Box>
          ))
        )}
      </Box>
    </StudentLayout>
  );
}
