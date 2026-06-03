"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MuiDrawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { drawerClasses } from '@mui/material/Drawer';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DirectionsBusRoundedIcon from '@mui/icons-material/DirectionsBusRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
const DRAWER_WIDTH = 240;

export const studentTheme = createTheme({
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
  },
  shape: { borderRadius: 8 },
  palette: { primary: { main: '#1976d2', dark: '#1565c0' } },
});

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/dashboard' },
  { label: 'Browse Properties', icon: <SearchRoundedIcon />, path: '/browse' },
  { label: 'My Applications', icon: <AssignmentRoundedIcon />, path: '/applications' },
  { label: 'Viewing Bookings', icon: <EventAvailableRoundedIcon />, path: '/viewings' },
  { label: 'Messages', icon: <ChatRoundedIcon />, path: '/messages' },
  { label: 'Roommates', icon: <GroupsRoundedIcon />, path: '/roommates' },
  { label: 'Saved Listings', icon: <BookmarkRoundedIcon />, path: '/saved-listings' },
  { label: 'Maintenance', icon: <HandymanRoundedIcon />, path: '/maintenance' },
  { label: 'Transportation', icon: <DirectionsBusRoundedIcon />, path: '/transportation' },
  { label: 'Notifications', icon: <NotificationsRoundedIcon />, path: '/notifications', badge: true },
];

function getBreadcrumb(pathname: string): string[] {
  if (pathname === '/dashboard') return ['Home', 'Dashboard'];
  if (pathname.startsWith('/browse') && pathname !== '/browse') return ['Home', 'Browse', 'Property Detail'];
  if (pathname.startsWith('/browse')) return ['Home', 'Browse Properties'];
  if (pathname.startsWith('/applications')) return ['Home', 'My Applications'];
  if (pathname.startsWith('/viewings')) return ['Home', 'Viewing Bookings'];
  if (pathname.startsWith('/messages')) return ['Home', 'Messages'];
  if (pathname.startsWith('/roommates')) return ['Home', 'Roommates'];
  if (pathname.startsWith('/saved-listings')) return ['Home', 'Saved Listings'];
  if (pathname.startsWith('/maintenance')) return ['Home', 'Maintenance'];
  if (pathname.startsWith('/notifications')) return ['Home', 'Notifications'];
  if (pathname.startsWith('/profile')) return ['Home', 'Profile'];
  return ['Home'];
}

interface SideMenuProps {
  user: { name?: string; email?: string; fundingType?: string; isVerified?: boolean } | null;
  messageCount: number;
  notificationCount: number;
  canAccessMaintenance: boolean;
  canAccessTransportation: boolean;
  pathname: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

function SideMenu({ user, messageCount, notificationCount, canAccessMaintenance, canAccessTransportation, pathname, onNavigate, onLogout }: SideMenuProps) {
  const navItems = NAV_ITEMS.filter((item) => {
    if (item.path === '/maintenance' && !canAccessMaintenance) return false;
    if (item.path === '/transportation' && !canAccessTransportation) return false;
    return true;
  });

  return (
    <>
      {/* Brand */}
      <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1, p: 2, pt: 2.5 }}>
        <Box sx={{
          width: 30, height: 30, borderRadius: 1.5,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(25,118,210,0.35)',
          transition: 'box-shadow 0.3s, transform 0.2s',
          '&:hover': { boxShadow: '0 4px 16px rgba(25,118,210,0.55)', transform: 'scale(1.08)' },
        }}>
          <ApartmentRoundedIcon sx={{ color: '#fff', fontSize: 17 }} />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>Cosy</Typography>
          <Typography variant="caption" color="text.secondary">Student Portal</Typography>
        </Box>
      </Stack>

      <Divider />

      {/* Nav */}
      <Box sx={{ pt: 1, flexGrow: 1 }}>
        <List dense disablePadding>
          {navItems.map(({ label, icon, path }) => {
            const selected = pathname === path || (path !== '/dashboard' && path !== '/browse' && pathname.startsWith(path));
            const count = path === '/messages' ? messageCount : path === '/notifications' ? notificationCount : 0;
            return (
              <ListItem key={label} disablePadding sx={{ px: 1, mb: 0.25 }}>
                <ListItemButton
                  selected={selected}
                  onClick={() => onNavigate(path)}
                  sx={{
                    borderRadius: 1.5,
                    transition: 'background 0.2s, box-shadow 0.2s, transform 0.15s',
                    '&:hover': {
                      transform: 'translateX(2px)',
                      bgcolor: 'rgba(25,118,210,0.08)',
                      boxShadow: '0 2px 8px rgba(25,118,210,0.10)',
                    },
                    '&.Mui-selected': {
                      background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
                      color: '#fff',
                      boxShadow: '0 2px 12px rgba(25,118,210,0.30)',
                      '& .MuiListItemIcon-root': { color: '#fff' },
                      '&:hover': {
                        background: 'linear-gradient(90deg, #1565c0 0%, #0d47a1 100%)',
                        transform: 'translateX(2px)',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {count > 0 ? (
                      <Badge badgeContent={count} color="error" max={99}>{icon}</Badge>
                    ) : icon}
                  </ListItemIcon>
                            <ListItemText
                    primary={label}
                    slotProps={{ primary: { sx: { fontSize: 14, fontWeight: selected ? 600 : 400 } } }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* User footer — click avatar/name to go to profile */}
      <Stack sx={{ flexDirection: 'row', p: 1.5, gap: 1, alignItems: 'center' }}>
        <Tooltip title="View Profile">
          <Avatar
            onClick={() => onNavigate('/profile')}
            sx={{
              width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13, flexShrink: 0,
              cursor: 'pointer',
              transition: 'box-shadow 0.2s, transform 0.2s',
              '&:hover': { boxShadow: '0 0 0 3px rgba(25,118,210,0.25)', transform: 'scale(1.08)' },
            }}>
            {(user?.name ?? user?.email ?? 'S')[0].toUpperCase()}
          </Avatar>
        </Tooltip>
        <Box
          sx={{ flexGrow: 1, minWidth: 0, cursor: 'pointer' }}
          onClick={() => onNavigate('/profile')}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
            {user?.name ?? 'Student'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {user?.email ?? ''}
          </Typography>
          {user?.isVerified ? (
            <Chip
              size="small"
              label="Verified"
              color="success"
              sx={{ mt: 0.4, height: 18, fontSize: 10, fontWeight: 700 }}
            />
          ) : null}
        </Box>
        <Tooltip title="Sign out">
          <IconButton size="small" onClick={onLogout}>
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </>
  );
}

interface StudentLayoutProps {
  children: React.ReactNode;
}

function StudentLayoutInner({ children }: StudentLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [canAccessMaintenance, setCanAccessMaintenance] = useState(false);
  const [canAccessTransportation, setCanAccessTransportation] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          if (!cancelled) {
            setMessageCount(0);
            setNotificationCount(0);
            setCanAccessMaintenance(false);
            setCanAccessTransportation(false);
          }
          return;
        }

        const [notificationsRes, messagesRes, activePropertiesRes] = await Promise.all([
          fetch(`${API}/student/notifications?limit=1`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/maintenance/active-properties`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (notificationsRes.ok) {
          const notificationData = await notificationsRes.json();
          if (!cancelled) setNotificationCount(notificationData.unreadCount ?? 0);
        }

        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          if (!cancelled) {
            const unreadMessages = Array.isArray(messagesData.data)
              ? messagesData.data.reduce((sum: number, conv: any) => sum + (conv.unreadCount ?? 0), 0)
              : 0;
            setMessageCount(unreadMessages);
          }
        }

        if (activePropertiesRes.ok) {
          const activePropertiesData = await activePropertiesRes.json();
          const hasActiveMoveIn = Array.isArray(activePropertiesData.data) && activePropertiesData.data.length > 0;
          if (!cancelled) {
            setCanAccessMaintenance(hasActiveMoveIn);
            setCanAccessTransportation(hasActiveMoveIn);
          }
        } else if (!cancelled) {
          setCanAccessMaintenance(false);
          setCanAccessTransportation(false);
        }
      } catch { /* silent */ }
    };
    load();
    const id = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [pathname]);

  const handleNavigate = (path: string) => { setMobileOpen(false); router.push(path); };
  const handleLogout = () => { logout(); router.replace('/'); };

  const breadcrumb = getBreadcrumb(pathname);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop permanent sidebar */}
      <MuiDrawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          [`& .${drawerClasses.paper}`]: {
            backgroundColor: 'background.paper',
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <SideMenu
          user={user}
          messageCount={messageCount}
          notificationCount={notificationCount}
          canAccessMaintenance={canAccessMaintenance}
          canAccessTransportation={canAccessTransportation}
          pathname={pathname}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      </MuiDrawer>

      {/* Mobile drawer */}
      <MuiDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          [`& .${drawerClasses.paper}`]: { width: DRAWER_WIDTH, display: 'flex', flexDirection: 'column' },
        }}
      >
        <SideMenu
          user={user}
          messageCount={messageCount}
          notificationCount={notificationCount}
          canAccessMaintenance={canAccessMaintenance}
          canAccessTransportation={canAccessTransportation}
          pathname={pathname}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      </MuiDrawer>

      {/* Main content */}
      <Box component="main" sx={{
        flexGrow: 1,
        ml: { md: `${DRAWER_WIDTH}px` },
        mt: 0,
        minHeight: '100vh',
        bgcolor: 'grey.50',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
        maxWidth: '100vw',
      }}>
        {/* Sticky breadcrumb bar */}
        <Box sx={{
          position: 'sticky', top: 0, zIndex: 100,
          bgcolor: 'background.paper',
          px: { xs: 2, md: 3 }, py: 1.5,
          borderBottom: '1px solid', borderColor: 'divider',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}>
          <IconButton size="small" onClick={() => setMobileOpen(true)} sx={{ display: { xs: 'inline-flex', md: 'none' }, mr: 0.5 }}>
            <MenuRoundedIcon fontSize="small" />
          </IconButton>
          {breadcrumb.map((crumb, i) => (
            <React.Fragment key={crumb}>
              {i > 0 && <ChevronRightRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
              <Typography
                variant="body2"
                sx={{
                  color: i === breadcrumb.length - 1 ? 'text.primary' : 'text.secondary',
                  fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
                  cursor: i === 0 ? 'pointer' : 'default',
                }}
                onClick={i === 0 ? () => handleNavigate('/dashboard') : undefined}
              >
                {crumb}
              </Typography>
            </React.Fragment>
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Notifications">
            <IconButton size="small" onClick={() => handleNavigate('/notifications')} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
              <Badge badgeContent={notificationCount || undefined} color="error" max={99}>
                <NotificationsRoundedIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Profile">
            <IconButton size="small" onClick={() => handleNavigate('/profile')} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
              <PersonRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {user?.fundingType && (
            <Chip
              label={user.fundingType}
              size="small"
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                fontSize: 11,
                height: 22,
                bgcolor: 'rgba(25,118,210,0.08)',
                color: 'primary.main',
                fontWeight: 600,
              }}
            />
          )}
        </Box>
        {children}
      </Box>
    </Box>
  );
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <ThemeProvider theme={studentTheme}>
      <CssBaseline />
      <StudentLayoutInner>{children}</StudentLayoutInner>
    </ThemeProvider>
  );
}
