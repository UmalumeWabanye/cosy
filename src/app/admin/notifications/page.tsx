'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';

import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

function typeIcon(type: string) {
  if (type === 'new_request' || type === 'request_updated')
    return <AssignmentRoundedIcon fontSize="small" sx={{ color: '#1976d2' }} />;
  if (type === 'new_user' || type === 'user_invited')
    return <PersonAddRoundedIcon fontSize="small" sx={{ color: '#2e7d32' }} />;
  return <NotificationsRoundedIcon fontSize="small" sx={{ color: '#ed6c02' }} />;
}

function typeBg(type: string): string {
  if (type === 'new_request' || type === 'request_updated') return 'rgba(25,118,210,0.07)';
  if (type === 'new_user' || type === 'user_invited') return 'rgba(46,125,50,0.07)';
  return 'rgba(237,108,2,0.07)';
}

function groupByDate(items: Notification[]) {
  const groups: Record<string, Notification[]> = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  for (const n of items) {
    const d = new Date(n.createdAt);
    let label: string;
    if (d.toDateString() === today.toDateString()) label = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }
  return groups;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/admin/notifications?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data.data ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${API}/admin/notifications/${id}/read`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    const token = localStorage.getItem('token');
    await fetch(`${API}/admin/notifications/read-all`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotif = async (id: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${API}/admin/notifications/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    const deleted = notifications.find(n => n._id === id);
    if (deleted && !deleted.isRead) setUnreadCount(c => Math.max(0, c - 1));
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const handleClick = async (n: Notification) => {
    if (!n.isRead) await markRead(n._id);
    if (n.link) router.push(n.link);
  };

  const groups = groupByDate(notifications);

  return (
    <AdminLayout>
      <Box className="modern-shell" sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>

        {/* Header */}
        <Stack sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              background: 'linear-gradient(135deg, #1976d2, #1565c0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(25,118,210,0.3)',
            }}>
              <NotificationsRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Notifications</Typography>
              <Typography variant="caption" color="text.secondary">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </Typography>
            </Box>
          </Stack>
          {unreadCount > 0 && (
            <Button size="small" startIcon={<DoneAllRoundedIcon />} onClick={markAllRead}
              sx={{ textTransform: 'none', fontWeight: 600 }}>
              Mark all as read
            </Button>
          )}
        </Stack>

        {loading ? (
          <Stack sx={{ gap: 1.5 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
        ) : notifications.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
            <NotificationsRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">No notifications yet</Typography>
          </Paper>
        ) : (
          <Stack sx={{ gap: 3 }}>
            {Object.entries(groups).map(([date, items]) => (
              <Box key={date}>
                <Typography variant="caption" sx={{
                  fontWeight: 700, color: 'text.secondary',
                  textTransform: 'uppercase', letterSpacing: 0.8, mb: 1, display: 'block',
                }}>
                  {date}
                </Typography>
                <Stack sx={{ gap: 0.75 }}>
                  {items.map((n) => (
                    <Paper key={n._id} elevation={0} sx={{
                      display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5,
                      borderRadius: 2, border: '1px solid',
                      borderColor: n.isRead ? 'divider' : 'primary.light',
                      bgcolor: n.isRead ? 'background.paper' : typeBg(n.type),
                      cursor: n.link ? 'pointer' : 'default',
                      transition: 'box-shadow 0.2s, transform 0.15s',
                      '&:hover': n.link ? { boxShadow: '0 2px 12px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' } : {},
                    }} onClick={() => handleClick(n)}>

                      {/* Icon */}
                      <Box sx={{
                        width: 36, height: 36, borderRadius: 1.5, bgcolor: 'background.paper',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      }}>
                        {typeIcon(n.type)}
                      </Box>

                      {/* Content */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1, mb: 0.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: n.isRead ? 500 : 700 }} noWrap>
                            {n.title}
                          </Typography>
                          {!n.isRead && (
                            <FiberManualRecordRoundedIcon sx={{ fontSize: 8, color: 'primary.main', flexShrink: 0 }} />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                          {n.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
                          {new Date(n.createdAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>

                      {/* Actions */}
                      <Stack sx={{ flexDirection: 'row', gap: 0.5, flexShrink: 0 }}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        {!n.isRead && (
                          <Tooltip title="Mark as read">
                            <IconButton size="small" onClick={() => markRead(n._id)}>
                              <CheckCircleRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => deleteNotif(n._id)}>
                            <DeleteRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </AdminLayout>
  );
}
