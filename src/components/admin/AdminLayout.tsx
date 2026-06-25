"use client";

import React, { useState, useEffect, useRef } from 'react';
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
import InputBase from '@mui/material/InputBase';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import { drawerClasses } from '@mui/material/Drawer';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AltRouteRoundedIcon from '@mui/icons-material/AltRouteRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import Collapse from '@mui/material/Collapse';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
const DRAWER_WIDTH = 240;

export const adminTheme = createTheme({
  typography: {
    fontFamily: [
      'Inter',
      'SF Pro Display',
      '-apple-system',
      'BlinkMacSystemFont',
      'sans-serif',
    ].join(','),
  },
  shape: { borderRadius: 8 },
  palette: {
    mode: 'dark',
    primary: { main: '#5e6ad2', dark: '#4a55c4', light: '#828fff' },
    secondary: { main: '#27a644' },
    background: { default: '#010102', paper: '#0f1011' },
    text: { primary: '#f7f8f8', secondary: '#8a8f98', disabled: '#62666d' },
    divider: '#23252a',
  },
});

function getBreadcrumb(pathname: string): string[] {
  if (pathname === '/admin/dashboard') return ['Admin', 'Dashboard'];
  if (pathname.startsWith('/admin/profile')) return ['Admin', 'Profile'];
  if (pathname.startsWith('/admin/users')) return ['Admin', 'Users'];
  if (pathname.startsWith('/admin/notifications')) return ['Admin', 'Notifications'];
  if (pathname.startsWith('/admin/queue')) return ['Admin', 'Queue Jobs'];
  if (pathname.startsWith('/admin/reports/analytics')) return ['Admin', 'Reports', 'Analytics'];
  if (pathname.startsWith('/admin/reports/property-health')) return ['Admin', 'Reports', 'Property Health'];
  if (pathname.startsWith('/admin/reports/transport')) return ['Admin', 'Reports', 'Transport Oversight'];
  if (pathname.startsWith('/admin/reports/maintenance')) return ['Admin', 'Reports', 'Maintenance Oversight'];
  if (pathname.startsWith('/admin/reports/collection')) return ['Admin', 'Reports', 'Monthly Collection'];
  if (pathname.startsWith('/admin/reports')) return ['Admin', 'Reports'];
  return ['Admin'];
}

function ContentHeader({ pathname, onNavigate, onOpenMenu }: {
  pathname: string;
  onNavigate: (path: string) => void;
  onOpenMenu?: () => void;
}) {
  const breadcrumb = getBreadcrumb(pathname);
  const [unreadCount, setUnreadCount] = useState(0);
  const [calAnchor, setCalAnchor] = useState<HTMLElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const todayStr = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const displayDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  // Poll unread notifications count every 30 s
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API}/admin/notifications?limit=1`, {
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

  const handleCalClick = (e: React.MouseEvent<HTMLElement>) => {
    setCalAnchor(e.currentTarget);
    // Open native date picker after popover renders
    setTimeout(() => dateInputRef.current?.showPicker?.(), 50);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    setSelectedDate(val);
    setCalAnchor(null);
    onNavigate(`/admin/dashboard?date=${val}`);
  };

  return (
    <Stack
      direction="row"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        pb: 1.5,
        mb: 0,
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={() => onOpenMenu?.()}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
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
              onClick={i === 0 ? () => onNavigate('/admin/dashboard') : undefined}
            >
              {crumb}
            </Typography>
          </React.Fragment>
        ))}
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, display: { xs: 'none', md: 'flex' } }}>
        {/* Search */}
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

        {/* Clickable calendar chip */}
        <Tooltip title="Filter by date">
          <Stack
            direction="row"
            onClick={handleCalClick}
            sx={{
              alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5,
              border: '1px solid', borderColor: 'divider', borderRadius: 2,
              bgcolor: 'background.paper', cursor: 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              '&:hover': { borderColor: 'primary.main', boxShadow: '0 0 0 2px rgba(25,118,210,0.12)' },
            }}
          >
            <CalendarTodayRoundedIcon sx={{ fontSize: 14, color: selectedDate !== todayStr ? 'primary.main' : 'text.secondary' }} />
            <Typography variant="caption" sx={{ fontWeight: 500, color: selectedDate !== todayStr ? 'primary.main' : 'text.secondary', whiteSpace: 'nowrap' }}>
              {displayDate}
            </Typography>
          </Stack>
        </Tooltip>

        {/* Hidden native date input — opened programmatically */}
        <Popover
          open={Boolean(calAnchor)}
          anchorEl={calAnchor}
          onClose={() => setCalAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { p: 1.5, borderRadius: 2, overflow: 'visible' } } }}
        >
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            style={{ fontSize: 14, border: 'none', outline: 'none', background: 'transparent', cursor: 'pointer' }}
          />
        </Popover>

        {/* Notifications bell */}
        <Tooltip title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}>
          <IconButton
            size="small"
            onClick={() => onNavigate('/admin/notifications')}
            sx={{
              border: '1px solid', borderColor: 'divider', borderRadius: 1.5,
              transition: 'border-color 0.2s, box-shadow 0.2s',
              '&:hover': { borderColor: 'primary.main', boxShadow: '0 0 0 2px rgba(25,118,210,0.12)' },
            }}
          >
            <Badge badgeContent={unreadCount > 0 ? unreadCount : undefined} color="error" max={99}>
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
  { label: 'Users', icon: <PeopleRoundedIcon />, path: '/admin/users' },
  { label: 'Notifications', icon: <NotificationsRoundedIcon />, path: '/admin/notifications' },
  { label: 'Queue Jobs', icon: <StorageRoundedIcon />, path: '/admin/queue' },
];

const REPORT_SUB_ITEMS = [
  { label: 'Analytics', icon: <InsightsRoundedIcon />, path: '/admin/reports/analytics' },
  { label: 'Property Health', icon: <FactCheckRoundedIcon />, path: '/admin/reports/property-health' },
  { label: 'Transport Oversight', icon: <AltRouteRoundedIcon />, path: '/admin/reports/transport' },
  { label: 'Maintenance Oversight', icon: <BuildRoundedIcon />, path: '/admin/reports/maintenance' },
  { label: 'Monthly Collection', icon: <ReceiptLongRoundedIcon />, path: '/admin/reports/collection' },
];

interface SideMenuInnerProps {
  user: { name?: string; email?: string } | null;
  pendingCount?: number;
  pathname: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

function SideMenuInner({ user, pendingCount = 0, pathname, onNavigate, onLogout }: SideMenuInnerProps) {
  const reportsOpen = pathname.startsWith('/admin/reports');
  const [reportsExpanded, setReportsExpanded] = React.useState(reportsOpen);
  return (
    <>
      {/* Brand */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, p: 2, pt: 2.5 }}>
        <Box
          sx={{
            width: 28, height: 28, borderRadius: '6px',
            background: '#5e6ad2',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <ApartmentRoundedIcon sx={{ color: '#fff', fontSize: 16 }} />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.1, color: '#f7f8f8', letterSpacing: '-0.01em' }}>Cosy Admin</Typography>
          <Typography variant="caption" sx={{ color: '#62666d', fontSize: 11 }}>Control Center</Typography>
        </Box>
      </Stack>

      <Divider sx={{ borderColor: '#23252a' }} />

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
                    borderRadius: '6px',
                    transition: 'background 0.15s',
                    color: selected ? '#f7f8f8' : '#8a8f98',
                    '&:hover': {
                      bgcolor: '#141516',
                      color: '#d0d6e0',
                    },
                    '&.Mui-selected': {
                      bgcolor: '#18191a',
                      color: '#f7f8f8',
                      '& .MuiListItemIcon-root': { color: '#5e6ad2' },
                      '&:hover': { bgcolor: '#1c1d1e' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 34, color: selected ? '#5e6ad2' : '#62666d' }}>
                    {badge > 0 ? (
                      <Badge badgeContent={badge} color="error" variant="dot">
                        {icon}
                      </Badge>
                    ) : icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    slotProps={{ primary: { sx: { fontSize: 13, fontWeight: selected ? 500 : 400, letterSpacing: '-0.01em' } } }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}

          {/* Reports — collapsible */}
          <ListItem disablePadding sx={{ px: 1, mb: 0.25 }}>
            <ListItemButton
              onClick={() => setReportsExpanded(v => !v)}
              sx={{
                borderRadius: '6px',
                transition: 'background 0.15s',
                color: pathname.startsWith('/admin/reports') ? '#f7f8f8' : '#8a8f98',
                ...(pathname.startsWith('/admin/reports') && { bgcolor: '#18191a' }),
                '&:hover': { bgcolor: '#141516', color: '#d0d6e0' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34, color: pathname.startsWith('/admin/reports') ? '#5e6ad2' : '#62666d' }}>
                <BarChartRoundedIcon />
              </ListItemIcon>
              <ListItemText
                primary="Reports"
                slotProps={{ primary: { sx: { fontSize: 13, fontWeight: pathname.startsWith('/admin/reports') ? 500 : 400, letterSpacing: '-0.01em' } } }}
              />
              <ExpandMoreRoundedIcon
                fontSize="small"
                sx={{
                  color: '#62666d',
                  transition: 'transform 0.25s',
                  transform: reportsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  fontSize: 16,
                }}
              />
            </ListItemButton>
          </ListItem>

          <Collapse in={reportsExpanded} timeout={250} unmountOnExit>
            <List dense disablePadding>
              {REPORT_SUB_ITEMS.map(({ label, icon, path }) => {
                const selected = pathname === path || pathname.startsWith(path);
                return (
                  <ListItem key={label} disablePadding sx={{ pl: 2.5, pr: 1, mb: 0.25 }}>
                    <ListItemButton
                      selected={selected}
                      onClick={() => onNavigate(path)}
                      sx={{
                        borderRadius: '6px',
                        transition: 'background 0.15s',
                        color: selected ? '#f7f8f8' : '#8a8f98',
                        '&:hover': { bgcolor: '#141516', color: '#d0d6e0' },
                        '&.Mui-selected': {
                          bgcolor: '#18191a',
                          color: '#f7f8f8',
                          '& .MuiListItemIcon-root': { color: '#5e6ad2' },
                          '&:hover': { bgcolor: '#1c1d1e' },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 30, color: selected ? '#5e6ad2' : '#62666d', '& svg': { fontSize: 16 } }}>
                        {icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={label}
                        slotProps={{ primary: { sx: { fontSize: 12, fontWeight: selected ? 500 : 400 } } }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        </List>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ borderColor: '#23252a' }} />

      {/* User footer */}
      <Stack
        direction="row"
        onClick={() => onNavigate('/admin/profile')}
        sx={{
          p: 1.5, gap: 1, alignItems: 'center', cursor: 'pointer',
          borderRadius: '6px', mx: 1, mb: 1,
          transition: 'background 0.15s',
          '&:hover': { bgcolor: '#141516' },
        }}
      >
        <Avatar sx={{ width: 30, height: 30, bgcolor: '#5e6ad2', fontSize: 12, flexShrink: 0, fontFamily: 'Inter, sans-serif' }}>
          {(user?.name ?? user?.email ?? 'A')[0].toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2, color: '#d0d6e0', fontSize: 13 }} noWrap>
            {user?.name ?? 'Admin'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#62666d', display: 'block', fontSize: 11 }} noWrap>
            {user?.email ?? ''}
          </Typography>
        </Box>
        <Tooltip title="Sign out">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onLogout(); }} sx={{ color: '#62666d', '&:hover': { color: '#8a8f98' } }}>
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user?.role !== 'admin') return;
    const hasPortalAccess = window.sessionStorage.getItem('cosy_admin_portal_access') === 'granted';
    if (!hasPortalAccess) {
      router.replace('/admin-access');
    }
  }, [router, user?.role]);

  const handleNavigate = (path: string) => {
    setMobileOpen(false);
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop permanent sidebar */}
      <MuiDrawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          [`& .${drawerClasses.paper}`]: {
            background: '#0f1011',
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid #23252a',
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
            background: '#0f1011',
            borderRight: '1px solid #23252a',
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

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: `${DRAWER_WIDTH}px` },
          minHeight: '100vh',
          background: '#010102',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          maxWidth: '100vw',
        }}
      >
        {/* Sticky top bar */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            bgcolor: 'rgba(15,16,17,0.92)',
            px: { xs: 2, md: 3 },
            pt: { xs: 1.5, md: 2 },
            pb: 0,
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #23252a',
          }}
        >
          <ContentHeader pathname={pathname} onNavigate={handleNavigate} onOpenMenu={() => setMobileOpen(true)} />
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
