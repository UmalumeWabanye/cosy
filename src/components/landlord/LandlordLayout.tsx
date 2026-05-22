"use client";

import React, { useEffect, useRef, useState } from 'react';
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
import Badge from '@mui/material/Badge';
import InputBase from '@mui/material/InputBase';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { drawerClasses } from '@mui/material/Drawer';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const DRAWER_WIDTH = 240;

export const landlordTheme = createTheme({
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
  if (pathname === '/landlord/dashboard') return ['Landlord', 'Dashboard'];
  if (pathname.startsWith('/landlord/profile')) return ['Landlord', 'Profile'];
  if (pathname.startsWith('/landlord/notifications')) return ['Landlord', 'Notifications'];
  if (pathname.startsWith('/landlord/reports/collection')) return ['Landlord', 'Reports', 'Monthly Collection'];
  if (pathname.startsWith('/landlord/reports')) return ['Landlord', 'Reports'];
  if (pathname === '/landlord/properties/new') return ['Landlord', 'Properties', 'New Property'];
  if (/\/landlord\/properties\/[^/]+\/edit/.test(pathname)) return ['Landlord', 'Properties', 'Edit Property'];
  if (/\/landlord\/properties\/[^/]+/.test(pathname)) return ['Landlord', 'Properties', 'View Property'];
  if (pathname.startsWith('/landlord/properties')) return ['Landlord', 'Properties'];
  if (pathname.startsWith('/landlord/requests')) return ['Landlord', 'Applications'];
  if (pathname.startsWith('/landlord/viewings')) return ['Landlord', 'Viewings'];
  if (pathname.startsWith('/landlord/maintenance')) return ['Landlord', 'Maintenance'];
  if (pathname.startsWith('/landlord/analytics')) return ['Landlord', 'Analytics'];
  return ['Landlord'];
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
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const displayDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  // Poll unread count every 30 s
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
    setTimeout(() => dateInputRef.current?.showPicker?.(), 50);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    setSelectedDate(val);
    setCalAnchor(null);
    onNavigate(`/landlord/viewings?date=${val}`);
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
              onClick={i === 0 ? () => onNavigate('/landlord/dashboard') : undefined}
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
          component="form"
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const input = e.currentTarget.querySelector('input');
            const query = input?.value.trim() ?? '';
            onNavigate(query ? `/landlord/properties?search=${encodeURIComponent(query)}` : '/landlord/properties');
          }}
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
              '&:hover': { borderColor: 'primary.main', boxShadow: '0 0 0 2px rgba(16,185,129,0.12)' },
            }}
          >
            <CalendarTodayRoundedIcon sx={{ fontSize: 14, color: selectedDate !== todayStr ? 'primary.main' : 'text.secondary' }} />
            <Typography variant="caption" sx={{ fontWeight: 500, color: selectedDate !== todayStr ? 'primary.main' : 'text.secondary', whiteSpace: 'nowrap' }}>
              {displayDate}
            </Typography>
          </Stack>
        </Tooltip>

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
            onClick={() => onNavigate('/landlord/notifications')}
            sx={{
              border: '1px solid', borderColor: 'divider', borderRadius: 1.5,
              transition: 'border-color 0.2s, box-shadow 0.2s',
              '&:hover': { borderColor: 'primary.main', boxShadow: '0 0 0 2px rgba(16,185,129,0.12)' },
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
  { label: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/landlord/dashboard' },
  { label: 'Properties', icon: <ApartmentRoundedIcon />, path: '/landlord/properties' },
  { label: 'Applications', icon: <AssignmentRoundedIcon />, path: '/landlord/requests' },
  { label: 'Add Property', icon: <AddRoundedIcon />, path: '/landlord/properties/new' },
  { label: 'Messages', icon: <ChatRoundedIcon />, path: '/landlord/messages' },
  { label: 'Viewings', icon: <CalendarTodayRoundedIcon />, path: '/landlord/viewings' },
  { label: 'Maintenance', icon: <HandymanRoundedIcon />, path: '/landlord/maintenance' },
  { label: 'Monthly Collection', icon: <ReceiptLongRoundedIcon />, path: '/landlord/reports/collection' },
  { label: 'Analytics', icon: <InsightsRoundedIcon />, path: '/landlord/analytics' },
];

interface SideMenuInnerProps {
  user: { name?: string; email?: string } | null;
  pathname: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

function SideMenuInner({ user, pathname, onNavigate, onLogout }: SideMenuInnerProps) {
  return (
    <>
      {/* Brand */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, p: 2, pt: 2.5 }}>
        <Box
          sx={{
            width: 30, height: 30, borderRadius: 1.5,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(16,185,129,0.35)',
            transition: 'box-shadow 0.3s, transform 0.2s',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(16,185,129,0.55)',
              transform: 'scale(1.08)',
            },
          }}
        >
          <ApartmentRoundedIcon sx={{ color: '#fff', fontSize: 17 }} />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>Cosy Landlord</Typography>
          <Typography variant="caption" color="text.secondary">Property Manager</Typography>
        </Box>
      </Stack>

      <Divider />

      {/* Nav */}
      <Box sx={{ pt: 1 }}>
        <List dense disablePadding>
          {NAV_ITEMS.map(({ label, icon, path }) => {
            const selected = pathname === path || (path !== '/landlord/dashboard' && pathname.startsWith(path) && path !== '/landlord/properties/new');
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
                      bgcolor: 'rgba(16,185,129,0.08)',
                      boxShadow: '0 2px 8px rgba(16,185,129,0.10)',
                    },
                    '&.Mui-selected': {
                      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      boxShadow: '0 2px 12px rgba(16,185,129,0.30)',
                      '& .MuiListItemIcon-root': { color: '#fff' },
                      '&:hover': {
                        background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                        transform: 'translateX(2px)',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {icon}
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

      {/* User footer */}
      <Stack
        direction="row"
        onClick={() => onNavigate('/landlord/profile')}
        sx={{ p: 1.5, gap: 1, alignItems: 'center', cursor: 'pointer', borderRadius: 1.5, transition: 'bgcolor 0.2s', '&:hover': { bgcolor: 'rgba(16,185,129,0.08)' } }}
      >
        <Avatar sx={{
          width: 34, height: 34, bgcolor: '#10b981', fontSize: 13, flexShrink: 0,
          transition: 'box-shadow 0.2s, transform 0.2s',
          '&:hover': { boxShadow: '0 0 0 3px rgba(16,185,129,0.25)', transform: 'scale(1.08)' },
        }}>
          {(user?.name ?? user?.email ?? 'L')[0].toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
            {user?.name ?? 'Landlord'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {user?.email ?? ''}
          </Typography>
        </Box>
        <Tooltip title="Sign out">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onLogout(); }}>
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </>
  );
}

interface LandlordLayoutProps {
  children: React.ReactNode;
}

function LandlordLayoutInner({ children }: LandlordLayoutProps) {
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
    router.push('/');
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
          mt: 0,
          minHeight: '100vh',
          bgcolor: 'background.default',
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
            bgcolor: 'background.default',
            px: { xs: 2, md: 3 },
            pt: { xs: 1.5, md: 2 },
            pb: 0,
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          }}
        >
          <ContentHeader pathname={pathname} onNavigate={handleNavigate} onOpenMenu={() => setMobileOpen(true)} />
        </Box>
        {children}
      </Box>
    </Box>
  );
}

export default function LandlordLayout({ children }: LandlordLayoutProps) {
  return (
    <ThemeProvider theme={landlordTheme}>
      <CssBaseline />
      <LandlordLayoutInner>{children}</LandlordLayoutInner>
    </ThemeProvider>
  );
}
