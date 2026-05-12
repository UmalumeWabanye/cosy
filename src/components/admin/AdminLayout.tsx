"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

import { createTheme, ThemeProvider, useColorScheme } from '@mui/material/styles';
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
import { drawerClasses } from '@mui/material/Drawer';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';

const DRAWER_WIDTH = 240;

export const adminTheme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-toolpad-color-scheme' },
  colorSchemes: { light: true, dark: true },
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

function ColorModeToggle() {
  const { mode, setMode } = useColorScheme();
  if (!mode) return null;
  return (
    <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
      <IconButton
        size="small"
        onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
      >
        {mode === 'dark' ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, mt: 1 }}>
        <Box
          sx={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, hsl(210,98%,60%) 0%, hsl(210,100%,35%) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <DashboardRoundedIcon sx={{ color: '#fff', fontSize: 18 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.3 }}>
          Cosy Admin
        </Typography>
      </Box>

      <Divider />

      {/* Nav */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
        <List dense>
          {NAV_ITEMS.map(({ label, icon, path }) => {
            const selected = pathname === path || (path !== '/admin/dashboard' && pathname.startsWith(path) && path !== '/admin/properties/new');
            const badge = label === 'Requests' ? pendingCount : 0;
            return (
              <ListItem key={label} disablePadding sx={{ px: 1 }}>
                <ListItemButton
                  selected={selected}
                  onClick={() => onNavigate(path)}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.5,
                    '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'primary.contrastText' } },
                    '&.Mui-selected:hover': { bgcolor: 'primary.dark' },
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
                    slotProps={{ primary: { style: { fontSize: 14, fontWeight: selected ? 600 : 400 } } }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* User footer */}
      <Stack direction="row" sx={{ p: 2, gap: 1.5, alignItems: 'center' }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
          {(user?.name ?? user?.email ?? 'A')[0].toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
            {user?.name ?? 'Admin'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
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
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, hsl(210,98%,60%) 0%, hsl(210,100%,35%) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <DashboardRoundedIcon sx={{ color: '#fff', fontSize: 16 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Cosy Admin</Typography>
          </Stack>
          <Stack direction="row" sx={{ gap: 0.5 }}>
            <ColorModeToggle />
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
