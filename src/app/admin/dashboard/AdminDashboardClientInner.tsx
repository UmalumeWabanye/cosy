"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

import { alpha, createTheme, ThemeProvider, useColorScheme } from '@mui/material/styles';import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
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
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import { drawerClasses } from '@mui/material/Drawer';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { BarChart } from '@mui/x-charts/BarChart';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Property {
  _id: string;
  name: string;
  location: { city: string; address: string };
  pricing: { minRent: number; maxRent: number; deposit: number };
  rooms: { total: number; available: number };
  isActive: boolean;
  createdAt: string;
}

interface RequestItem {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  property?: { name: string };
  user?: { name: string; email: string };
  createdAt?: string;
}

// ─── Theme ───────────────────────────────────────────────────────────────────

const theme = createTheme({
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

// ─── Color Mode Toggle ────────────────────────────────────────────────────────

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

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  interval?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  data?: number[];
  color?: string;
}

function StatCard({ title, value, interval, trend = 'neutral', trendLabel, data = [], color }: StatCardProps) {
  const trendColors = {
    up: 'success' as const,
    down: 'error' as const,
    neutral: 'default' as const,
  };

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <CardContent>
        <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
          {value}
        </Typography>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
          {trend !== 'neutral' && (
            <Chip
              size="small"
              color={trendColors[trend]}
              icon={trend === 'up' ? <TrendingUpRoundedIcon /> : <TrendingDownRoundedIcon />}
              label={trendLabel}
              sx={{ fontWeight: 600, height: 22, fontSize: 11 }}
            />
          )}
          {interval && (
            <Typography variant="caption" color="text.secondary">{interval}</Typography>
          )}
        </Stack>
      </CardContent>
      {data.length > 0 && (
        <Box sx={{ px: 2, pb: 2 }}>
          <SparkLineChart
            data={data}
            height={60}
            color={color ?? '#1976d2'}
            curve="linear"
            showHighlight
            showTooltip
          />
        </Box>
      )}
    </Card>
  );
}

// ─── SideMenu (desktop) ───────────────────────────────────────────────────────

interface SideMenuProps {
  user: { name?: string; email?: string } | null;
  pendingCount: number;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

function SideMenu({ user, pendingCount, onNavigate, onLogout }: SideMenuProps) {
  return (
    <MuiDrawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
          width: 240,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
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
          {[
            { label: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/admin/dashboard', selected: true },
            { label: 'Properties', icon: <ApartmentRoundedIcon />, path: '/admin/properties', selected: false },
            { label: 'Requests', icon: <AssignmentRoundedIcon />, path: '/admin/requests', selected: false, badge: pendingCount },
            { label: 'Add Property', icon: <AddRoundedIcon />, path: '/admin/properties/new', selected: false },
          ].map(({ label, icon, path, selected, badge }) => (
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
                  {badge ? (
                    <Badge badgeContent={badge} color="error" variant="dot">
                      {icon}
                    </Badge>
                  ) : icon}
                </ListItemIcon>
                <ListItemText primary={label} slotProps={{ primary: { style: { fontSize: 14, fontWeight: selected ? 600 : 400 } } }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider />

      {/* User */}
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
        <ColorModeToggle />
        <Tooltip title="Sign out">
          <IconButton size="small" onClick={onLogout}>
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </MuiDrawer>
  );
}

// ─── AppNavbar (mobile) ───────────────────────────────────────────────────────

interface AppNavbarProps {
  pendingCount: number;
  onToggleMobile: () => void;
}

function AppNavbar({ pendingCount, onToggleMobile }: AppNavbarProps) {
  return (
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
          <IconButton onClick={onToggleMobile}>
            <MenuRoundedIcon />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

// ─── Main Dashboard Component ────────────────────────────────────────────────

export default function AdminDashboardClientInner() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const redirectRef = React.useRef(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      if (!redirectRef.current) {
        redirectRef.current = true;
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [propRes, reqRes] = await Promise.all([
          api.get('/admin/properties'),
          api.get('/requests'),
        ]);
        const rawProps = propRes.data?.data ?? propRes.data;
        const rawReqs = reqRes.data?.data ?? reqRes.data;
        setProperties(Array.isArray(rawProps) ? rawProps : []);
        setRequests(Array.isArray(rawReqs) ? rawReqs : []);
      } catch { /* show empty state */ }
      finally { setLoadingData(false); }
    };
    if (isAuthenticated && user?.role === 'admin') fetchData();
  }, [isAuthenticated, user]);

  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  if (!isAuthenticated || user?.role !== 'admin') return null;

  const activeProps = properties.filter((p) => p.isActive).length;
  const pendingReqs = requests.filter((r) => r.status === 'pending').length;
  const approvedReqs = requests.filter((r) => r.status === 'approved').length;
  const recentProps = [...properties]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Build monthly bar-chart data from properties.createdAt
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { label: monthNames[d.getMonth()], month: d.getMonth(), year: d.getFullYear() };
  });
  const barData = last6Months.map(({ month, year }) =>
    properties.filter((p) => {
      const d = new Date(p.createdAt);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length
  );

  // Sparkline-style data (last 7 values accumulated)
  const propSparkline = last6Months.map((_, i) =>
    properties.filter((p) => new Date(p.createdAt) <= new Date(now.getFullYear(), now.getMonth() - 5 + i + 1, 1)).length
  );
  const reqSparkline = last6Months.map((_, i) =>
    requests.filter((r) => r.createdAt && new Date(r.createdAt) <= new Date(now.getFullYear(), now.getMonth() - 5 + i + 1, 1)).length
  );

  const statusColor = (s: string) => s === 'approved' ? 'success' : s === 'rejected' ? 'error' : 'warning';

  return (
    <ThemeProvider theme={theme}>
      <Box
        data-toolpad-color-scheme="light"
        sx={{ display: 'flex', minHeight: '100vh' }}
      >
        <CssBaseline enableColorScheme />

        {/* Desktop sidebar */}
        <SideMenu
          user={user}
          pendingCount={pendingReqs}
          onNavigate={router.push}
          onLogout={() => router.push('/login')}
        />

        {/* Mobile navbar */}
        <AppNavbar pendingCount={pendingReqs} onToggleMobile={() => setMobileOpen(true)} />

        {/* Mobile drawer */}
        <MuiDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: 'block', md: 'none' }, [`& .${drawerClasses.paper}`]: { width: 240 } }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Menu</Typography>
            {[
              { label: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/admin/dashboard' },
              { label: 'Properties', icon: <ApartmentRoundedIcon />, path: '/admin/properties' },
              { label: 'Requests', icon: <AssignmentRoundedIcon />, path: '/admin/requests' },
              { label: 'Add Property', icon: <AddRoundedIcon />, path: '/admin/properties/new' },
              { label: 'Back to site', icon: <HomeRoundedIcon />, path: '/' },
            ].map(({ label, icon, path }) => (
              <ListItemButton key={label} onClick={() => { router.push(path); setMobileOpen(false); }} sx={{ borderRadius: 1.5, mb: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            ))}
          </Box>
        </MuiDrawer>

        {/* Main */}
        <Box
          component="main"
          sx={(t) => ({
            flexGrow: 1,
            bgcolor: alpha(t.palette.background.default, 1),
            overflow: 'auto',
            minHeight: '100vh',
            ml: { xs: 0, md: '240px' },
          })}
        >
          <Box sx={{ px: { xs: 2, md: 4 }, pt: { xs: 9, md: 4 }, pb: 6 }}>
            {/* Page title */}
            <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Overview
            </Typography>

              {/* ── Stat Cards ── */}
              <Grid container spacing={2} columns={12} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <StatCard
                    title="Total Properties"
                    value={properties.length}
                    interval="All time"
                    trend="up"
                    trendLabel="+added"
                    data={propSparkline}
                    color="#1976d2"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <StatCard
                    title="Active Properties"
                    value={activeProps}
                    interval="Currently live"
                    trend={activeProps > 0 ? 'up' : 'neutral'}
                    trendLabel={`${properties.length > 0 ? Math.round((activeProps / properties.length) * 100) : 0}%`}
                    data={propSparkline.map((v) => v)}
                    color="#2e7d32"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <StatCard
                    title="Pending Requests"
                    value={pendingReqs}
                    interval="Awaiting review"
                    trend={pendingReqs > 0 ? 'down' : 'neutral'}
                    trendLabel={pendingReqs > 0 ? 'Action needed' : undefined}
                    data={reqSparkline}
                    color="#ed6c02"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <StatCard
                    title="Approved Requests"
                    value={approvedReqs}
                    interval="All time"
                    trend={approvedReqs > 0 ? 'up' : 'neutral'}
                    trendLabel={approvedReqs > 0 ? `+${approvedReqs}` : undefined}
                    data={reqSparkline}
                    color="#7b1fa2"
                  />
                </Grid>
              </Grid>

              {/* ── Bar Chart ── */}
              <Grid container spacing={2} columns={12} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <Card variant="outlined" sx={{ width: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Properties added per month
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Last 6 months
                      </Typography>
                      <Box sx={{ width: '100%', overflowX: 'auto' }}>
                        <BarChart
                          height={200}
                          borderRadius={6}
                          xAxis={[{ scaleType: 'band', data: last6Months.map((m) => m.label), categoryGapRatio: 0.5 }]}
                          yAxis={[{ width: 32 }]}
                          series={[{ data: barData, label: 'Properties', color: '#1976d2' }]}
                          margin={{ top: 16, right: 12, bottom: 24, left: 40 }}
                          sx={{ width: '100%' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Card variant="outlined" sx={{ width: '100%', height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Request breakdown
                      </Typography>
                      <Stack spacing={2}>
                        {[
                          { label: 'Pending', count: pendingReqs, color: 'warning' as const, icon: <PendingActionsRoundedIcon fontSize="small" /> },
                          { label: 'Approved', count: approvedReqs, color: 'success' as const, icon: <CheckCircleRoundedIcon fontSize="small" /> },
                          { label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length, color: 'error' as const, icon: <TrendingDownRoundedIcon fontSize="small" /> },
                        ].map(({ label, count, color, icon }) => (
                          <Stack key={label} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                              <Chip icon={icon} label={label} size="small" color={color} variant="outlined" />
                            </Stack>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{count}</Typography>
                          </Stack>
                        ))}
                        <Divider />
                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Total</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>{requests.length}</Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* ── Details ── */}
              <Typography component="h2" variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Details
              </Typography>

              <Grid container spacing={2} columns={12}>
                {/* Properties table */}
                <Grid size={{ xs: 12, lg: 7 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ pb: 0 }}>
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Recent Properties
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AddRoundedIcon />}
                          onClick={() => router.push('/admin/properties/new')}
                        >
                          Add new
                        </Button>
                      </Stack>
                    </CardContent>
                    {loadingData ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={28} />
                      </Box>
                    ) : recentProps.length === 0 ? (
                      <Box sx={{ px: 2, pb: 3 }}>
                        <Typography color="text.secondary" variant="body2">No properties yet. Add your first one!</Typography>
                      </Box>
                    ) : (
                      <Box sx={{ overflowX: 'auto' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase' }}>City</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase' }}>Min Rent</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase' }}>Rooms</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase' }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase' }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentProps.map((p) => (
                            <TableRow key={p._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                              <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
                              <TableCell>{p.location?.city}</TableCell>
                              <TableCell>R{p.pricing?.minRent?.toLocaleString()}</TableCell>
                              <TableCell>{p.rooms?.available}</TableCell>
                              <TableCell>
                                <Chip label={p.isActive ? 'Active' : 'Inactive'} color={p.isActive ? 'success' : 'default'} size="small" />
                              </TableCell>
                              <TableCell align="right">
                                <Stack direction="row" sx={{ gap: 0.5, justifyContent: 'flex-end' }}>
                                  <Button size="small" variant="outlined" sx={{ minWidth: 0, px: 1.5 }} onClick={() => router.push(`/admin/properties/${p._id}`)}>View</Button>
                                  <Button size="small" variant="outlined" sx={{ minWidth: 0, px: 1.5 }} onClick={() => router.push(`/admin/properties/${p._id}/edit`)}>Edit</Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      </Box>
                    )}
                    {properties.length > 5 && (
                      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button size="small" endIcon={<ChevronRightRoundedIcon />} onClick={() => router.push('/admin/properties')}>
                          View all {properties.length} properties
                        </Button>
                      </Box>
                    )}
                  </Card>
                </Grid>

                {/* Requests table */}
                <Grid size={{ xs: 12, lg: 5 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ pb: 0 }}>
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Recent Requests
                        </Typography>
                        <Button size="small" endIcon={<ChevronRightRoundedIcon />} onClick={() => router.push('/admin/requests')}>
                          View all
                        </Button>
                      </Stack>
                    </CardContent>
                    {loadingData ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={28} />
                      </Box>
                    ) : requests.length === 0 ? (
                      <Box sx={{ px: 2, pb: 3 }}>
                        <Typography color="text.secondary" variant="body2">No requests yet.</Typography>
                      </Box>
                    ) : (
                      <Box sx={{ overflowX: 'auto' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase' }}>Property</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase' }}>Applicant</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', textTransform: 'uppercase' }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {requests.slice(0, 8).map((r) => (
                            <TableRow key={r._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                              <TableCell sx={{ maxWidth: 140 }}>
                                <Typography variant="body2" noWrap>{r.property?.name ?? '—'}</Typography>
                              </TableCell>
                              <TableCell sx={{ maxWidth: 120 }}>
                                <Typography variant="body2" noWrap>{r.user?.name ?? r.user?.email ?? '—'}</Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={r.status}
                                  color={statusColor(r.status) as any}
                                  size="small"
                                  sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      </Box>
                    )}
                  </Card>
                </Grid>
              </Grid>

              {/* Footer */}
              <Box sx={{ pt: 4, pb: 1 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  © {new Date().getFullYear()} Cosy Admin Panel
                </Typography>
              </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
