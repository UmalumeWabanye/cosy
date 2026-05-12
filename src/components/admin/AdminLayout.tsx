"use client";

import React, { useState } from 'react';
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
import InputBase from '@mui/material/InputBase';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import { drawerClasses } from '@mui/material/Drawer';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';


const DRAWER_WIDTH = 240;

export const adminTheme = createTheme({
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'sans-serif',
    ].join(','),
  },
  shape: { borderRadius: 8 },
});

function getBreadcrumb(pathname: string): string[] {
  if (pathname === '/admin/dashboard') return ['Admin', 'Dashboard'];
  if (pathname === '/admin/properties/new') return ['Admin', 'Properties', 'New Property'];
  if (/\/admin\/properties\/[^/]+\/edit/.test(pathname)) return ['Admin', 'Properties', 'Edit Property'];
  if (/\/admin\/properties\/[^/]+/.test(pathname)) return ['Admin', 'Properties', 'View Property'];
  if (pathname.startsWith('/admin/properties')) return ['Admin', 'Properties'];
  if (pathname.startsWith('/admin/requests')) return ['Admin', 'Requests'];
  return ['Admin'];
}

function ContentHeader({ pathname, pendingCount, onNavigate }: {
  pathname: string;
  pendingCount: number;
  onNavigate: (path: string) => void;
}) {
  const breadcrumb = getBreadcrumb(pathname);
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        justifyContent: 'space-between',
        pb: 2,
        mb: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
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
              onClick={i === 0 ? () => onNavigate('/admin/dashboard') : undefined}
            >
              {crumb}
            </Typography>
          </React.Fragment>
        ))}
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5,
            border: '1px solid', borderColor: 'divider', borderRadius: 2,
            bgcolor: 'background.paper', minWidth: 180,
            '&:focus-within': { borderColor: 'primary.main' },
          }}
        >
          <SearchRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <InputBase placeholder="Search…" sx={{ fontSize: 13, flex: 1 }} inputProps={{ 'aria-label': 'search' }} />
        </Stack>

        <Stack
          direction="row"
          sx={{
            alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5,
            border: '1px solid', borderColor: 'divider', borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <CalendarTodayRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary', whiteSpace: 'nowrap' }}>
            {today}
          </Typography>
        </Stack>

        <Tooltip title={`${pendingCount} pending requests`}>
          <IconButton
            size="small"
            onClick={() => onNavigate('/admin/requests')}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
          >
            <Badge badgeContent={pendingCount > 0 ? ' ' : undefined} color="error" variant="dot">
              <NotificationsRoundedIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/admin/dashboard' },
  { label: 'Properties', icon: <ApartmentRoundedIcon />, path: '/admin/properties' },
  { label: 'Requests', icon: <AssignmentRoundedIcon />, path: '/admin/requests' },
  { label: 'Add Property', icon: <AddRoundedIcon />, path: '/admin/properties/new' },
];

interface SideMenuInnerProps {
  user: { name?: string; email?: string } | null;
  pendingCount?: number;
  pathname: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

function SideMenuInner({ user, pendingCount = 0, pathname, onNavigate, onLogout }: SideMenuInnerProps) {
  return (
    <>
      {/* Brand */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, p: 2, pt: 2.5 }}>
        <Box
          sx={{
            width: 30, height: 30, borderRadius: 1.5,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <ApartmentRoundedIcon sx={{ color: '#fff', fontSize: 17 }} />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>Cosy Admin</Typography>
          <Typography variant="caption" color="text.secondary">Web app</Typography>
        </Box>
      </Stack>

      <Divider />

      {/* Nav */}
      <Box sx={{ pt: 1 }}>
        <List dense disablePadding>
          {NAV_ITEMS.map(({ label, icon, path }) => {
            const selected = pathname === path || (path !== '/admin/dashboard' && pathname.startsWith(path) && path !== '/admin/properties/new');
            const badge = label === 'Requests' ? pendingCount : 0;
            return (
              <ListItem key={label} disablePadding sx={{ px: 1, mb: 0.25 }}>
                <ListItemButton
                  selected={selected}
                  onClick={() => onNavigate(path)}
                  sx={{
                    borderRadius: 1.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                      '&:hover': { bgcolor: 'primary.dark' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {badge > 0 ? (
                      <Badge badgeContent={badge} color="error" variant="dot">
                        {icon}
                      </Badge>
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

      <Box sx={{ flexGrow: 1 }} />

      <Divider />

      {/* User footer — matches dashboard exactly */}
      <Stack direction="row" sx={{ p: 1.5, gap: 1, alignItems: 'center' }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13, flexShrink: 0 }}>
          {(user?.name ?? user?.email ?? 'A')[0].toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
            {user?.name ?? 'Admin'}
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

interface AdminLayoutProps {
  children: React.ReactNode;
  pendingCount?: number;
}

function AdminLayoutInner({ children, pendingCount = 0 }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (path: string) => {
    setMobileOpen(false);
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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
        <SideMenuInner
          user={user}
          pendingCount={pendingCount}
          pathname={pathname}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      </MuiDrawer>

      {/* Mobile temporary drawer */}
      <MuiDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          [`& .${drawerClasses.paper}`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <SideMenuInner
          user={user}
          pendingCount={pendingCount}
          pathname={pathname}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      </MuiDrawer>

      {/* Mobile AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { xs: 'flex', md: 'none' },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundImage: 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28, height: 28, borderRadius: 1,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ApartmentRoundedIcon sx={{ color: '#fff', fontSize: 16 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Cosy Admin</Typography>
          </Stack>
          <Stack direction="row" sx={{ gap: 0.5 }}>
            <IconButton>
              <Badge badgeContent={pendingCount || undefined} color="error">
                <NotificationsRoundedIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={() => setMobileOpen(true)}>
              <MenuRoundedIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: `${DRAWER_WIDTH}px` },
          mt: { xs: '64px', md: 0 },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {/* Breadcrumb / top bar — visible on all admin screens */}
        <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 1.5, md: 2.5 } }}>
          <ContentHeader pathname={pathname} pendingCount={pendingCount} onNavigate={handleNavigate} />
        </Box>
        {children}
      </Box>
    </Box>
  );
}

export default function AdminLayout({ children, pendingCount }: AdminLayoutProps) {
  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <AdminLayoutInner pendingCount={pendingCount}>{children}</AdminLayoutInner>
    </ThemeProvider>
  );
}
