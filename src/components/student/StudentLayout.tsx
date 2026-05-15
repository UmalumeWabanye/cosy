"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import MuiDrawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
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
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

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
  { label: 'Saved Listings', icon: <BookmarkRoundedIcon />, path: '/saved-listings' },
  { label: 'Notifications', icon: <NotificationsRoundedIcon />, path: '/notifications', badge: true },
];

function getBreadcrumb(pathname: string): string[] {
  if (pathname === '/dashboard') return ['Home', 'Dashboard'];
  if (pathname.startsWith('/browse') && pathname !== '/browse') return ['Home', 'Browse', 'Property Detail'];
  if (pathname.startsWith('/browse')) return ['Home', 'Browse Properties'];
  if (pathname.startsWith('/applications')) return ['Home', 'My Applications'];
  if (pathname.startsWith('/saved-listings')) return ['Home', 'Saved Listings'];
  if (pathname.startsWith('/notifications')) return ['Home', 'Notifications'];
  if (pathname.startsWith('/profile')) return ['Home', 'Profile'];
  return ['Home'];
}

interface SideMenuProps {
  user: { name?: string; email?: string; fundingType?: string } | null;
  unreadCount: number;
  pathname: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

function SideMenu({ user, unreadCount, pathname, onNavigate, onLogout }: SideMenuProps) {
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
          {NAV_ITEMS.map(({ label, icon, path, badge }) => {
            const selected = pathname === path || (path !== '/dashboard' && path !== '/browse' && pathname.startsWith(path));
            const count = badge ? unreadCount : 0;
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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API}/student/notifications?limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setUnreadCount(data.unreadCount ?? 0);
      } catch { /* silent */ }
    };
    load();
    const id = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [pathname]);

  const handleNavigate = (path: string) => { setMobileOpen(false); router.push(path); };
  const handleLogout = () => { logout(); router.push('/'); };

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
        <SideMenu user={user} unreadCount={unreadCount} pathname={pathname} onNavigate={handleNavigate} onLogout={handleLogout} />
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
        <SideMenu user={user} unreadCount={unreadCount} pathname={pathname} onNavigate={handleNavigate} onLogout={handleLogout} />
      </MuiDrawer>

      {/* Mobile AppBar */}
      <AppBar position="fixed" elevation={0} sx={{
        display: { xs: 'flex', md: 'none' },
        bgcolor: 'background.paper', color: 'text.primary',
        borderBottom: '1px solid', borderColor: 'divider', backgroundImage: 'none',
      }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56 }}>
          <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: 1,
              background: 'linear-gradient(135deg, #1976d2, #1565c0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ApartmentRoundedIcon sx={{ color: '#fff', fontSize: 16 }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {breadcrumb[breadcrumb.length - 1]}
            </Typography>
          </Stack>
          <Stack sx={{ flexDirection: 'row', gap: 0.5 }}>
            <IconButton onClick={() => handleNavigate('/notifications')}>
              <Badge badgeContent={unreadCount || undefined} color="error">
                <NotificationsRoundedIcon />
              </Badge>
            </IconButton>
            <Tooltip title="Profile">
              <IconButton onClick={() => handleNavigate('/profile')}>
                <PersonRoundedIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={() => setMobileOpen(true)}>
              <MenuRoundedIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box component="main" sx={{
        flexGrow: 1,
        ml: { md: `${DRAWER_WIDTH}px` },
        mt: { xs: '56px', md: 0 },
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
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          gap: 0.5,
        }}>
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
          {user?.fundingType && (
            <Chip
              label={user.fundingType}
              size="small"
              sx={{ fontSize: 11, height: 22, bgcolor: 'rgba(25,118,210,0.08)', color: 'primary.main', fontWeight: 600 }}
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
