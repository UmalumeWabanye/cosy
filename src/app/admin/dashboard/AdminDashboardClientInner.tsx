"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import LandlordProfileWizard from '@/components/LandlordProfileWizard';

import { alpha, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';

import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';

interface Property {
  _id: string; name: string;
  location: { city: string; address: string };
  pricing: { minRent: number; maxRent: number; deposit: number };
  rooms: { total: number; available: number };
  isActive: boolean; createdAt: string;
}
interface RequestItem {
  _id: string; status: 'pending' | 'approved' | 'rejected';
  property?: { name: string };
  user?: { name: string; email: string };
  createdAt?: string;
}

const theme = createTheme({
  typography: { fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(',') },
  shape: { borderRadius: 8 },
});

const DRAWER_WIDTH = 240;

function StatCard({ title, value, interval, trend = 'neutral', trendLabel, data = [], color = '#1976d2' }: {
  title: string; value: string | number; interval?: string;
  trend?: 'up' | 'down' | 'neutral'; trendLabel?: string; data?: number[]; color?: string;
}) {
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{title}</Typography>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{value}</Typography>
          {trend !== 'neutral' && trendLabel && (
            <Chip size="small" label={trendLabel}
              color={trend === 'up' ? 'success' : 'error'}
              sx={{ height: 22, fontSize: 11, fontWeight: 700, borderRadius: 1 }} />
          )}
        </Stack>
        {interval && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{interval}</Typography>}
      </CardContent>
      {data.length > 0 && (
        <Box sx={{ px: 2, pb: 2, mt: 'auto' }}>
          <SparkLineChart data={data} height={56} color={color} curve="natural" area showHighlight showTooltip
            sx={{ '& .MuiLineElement-root': { strokeWidth: 2 } }} />
        </Box>
      )}
    </Card>
  );
}

const PRIMARY_NAV = [
  { label: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/admin/dashboard' },
  { label: 'Properties', icon: <ApartmentRoundedIcon />, path: '/admin/properties' },
  { label: 'Applications', icon: <AssignmentRoundedIcon />, path: '/admin/requests' },
  { label: 'Add Property', icon: <AddRoundedIcon />, path: '/admin/properties/new' },
  { label: 'Users', icon: <PeopleRoundedIcon />, path: '/admin/users' },
  { label: 'Reports', icon: <BarChartRoundedIcon />, path: '/admin/reports' },
];
const SECONDARY_NAV: { label: string; icon: React.ReactNode; path: string }[] = [];

function NavList({ items, pathname, pendingCount = 0, onNavigate }: {
  items: { label: string; icon: React.ReactNode; path: string }[];
  pathname: string; pendingCount?: number; onNavigate: (p: string) => void;
}) {
  return (
    <List dense disablePadding>
      {items.map(({ label, icon, path }) => {
        const selected = pathname === path || (path.startsWith('/admin') && path !== '/admin/dashboard' && pathname.startsWith(path));
        const badge = label === 'Applications' ? pendingCount : 0;
        return (
          <ListItem key={label} disablePadding sx={{ px: 1, mb: 0.25 }}>
            <ListItemButton selected={selected} onClick={() => onNavigate(path)} sx={{
              borderRadius: 1.5,
              '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'primary.contrastText' }, '&:hover': { bgcolor: 'primary.dark' } },
            }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {badge > 0 ? <Badge badgeContent={badge} color="error" variant="dot">{icon}</Badge> : icon}
              </ListItemIcon>
              <ListItemText primary={label} slotProps={{ primary: { sx: { fontSize: 14, fontWeight: selected ? 600 : 400 } } }} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}

function SideMenu({ user, pendingCount, pathname, onNavigate, onLogout }: {
  user: { name?: string; email?: string } | null; pendingCount: number;
  pathname: string; onNavigate: (p: string) => void; onLogout: () => void;
}) {
  return (
    <MuiDrawer variant="permanent" sx={{
      display: { xs: 'none', md: 'block' }, width: DRAWER_WIDTH, flexShrink: 0,
      [`& .${drawerClasses.paper}`]: { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' },
    }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, p: 2, pt: 2.5 }}>
        <Box sx={{ width: 30, height: 30, borderRadius: 1.5, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ApartmentRoundedIcon sx={{ color: '#fff', fontSize: 17 }} />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>Cosy Admin</Typography>
          <Typography variant="caption" color="text.secondary">Web app</Typography>
        </Box>
      </Stack>

      <Divider />

      <Box sx={{ pt: 1 }}>
        <NavList items={PRIMARY_NAV} pathname={pathname} pendingCount={pendingCount} onNavigate={onNavigate} />
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ pb: 1 }}>
        <NavList items={SECONDARY_NAV} pathname={pathname} onNavigate={onNavigate} />
      </Box>

      <Divider />

      <Stack direction="row" sx={{ p: 1.5, gap: 1, alignItems: 'center' }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13, flexShrink: 0 }}>
          {(user?.name ?? user?.email ?? 'A')[0].toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>{user?.name ?? 'Admin'}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{user?.email ?? ''}</Typography>
        </Box>
        <Tooltip title="Sign out">
          <IconButton size="small" onClick={onLogout}><LogoutRoundedIcon fontSize="small" /></IconButton>
        </Tooltip>
      </Stack>
    </MuiDrawer>
  );
}

function AppNavbar({ pendingCount, onToggleMobile }: { pendingCount: number; onToggleMobile: () => void }) {
  const { user } = useAuth();
  const { logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleProfile = () => { handleClose(); window.location.href = '/profile'; };
  const handleSignOut = () => { handleClose(); logout(); window.location.href = '/'; };

  return (
    <AppBar position="fixed" elevation={0} sx={{ display: { xs: 'flex', md: 'none' }, bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider', backgroundImage: 'none' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: 1, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ApartmentRoundedIcon sx={{ color: '#fff', fontSize: 16 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Cosy Admin</Typography>
        </Stack>
        <Stack direction="row" sx={{ gap: 0.5 }}>
          <IconButton><Badge badgeContent={pendingCount || undefined} color="error"><NotificationsRoundedIcon /></Badge></IconButton>
          {/* Avatar + menu for mobile admin (Profile / Logout) */}
          <IconButton onClick={handleOpen} aria-controls={open ? 'admin-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined}>
            <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: 13 }}>{(user?.name ?? user?.email ?? 'A')[0].toUpperCase()}</Avatar>
          </IconButton>
          <IconButton onClick={onToggleMobile}><MenuRoundedIcon /></IconButton>
          <Menu id="admin-menu" anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <MenuItem onClick={handleProfile}>Profile</MenuItem>
            <MenuItem onClick={handleSignOut}>Logout</MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

function ContentHeader({ breadcrumb, pendingCount, onNavigate }: { breadcrumb: string[]; pendingCount: number; onNavigate: (p: string) => void }) {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <Stack direction="row" sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'space-between', pb: 2, mb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
        {breadcrumb.map((crumb, i) => (
          <React.Fragment key={crumb}>
            {i > 0 && <ChevronRightRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
            <Typography variant="body2" sx={{ color: i === breadcrumb.length - 1 ? 'text.primary' : 'text.secondary', fontWeight: i === breadcrumb.length - 1 ? 600 : 400, cursor: i === 0 ? 'pointer' : 'default' }}
              onClick={i === 0 ? () => onNavigate('/admin/dashboard') : undefined}>{crumb}</Typography>
          </React.Fragment>
        ))}
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', minWidth: 180, '&:focus-within': { borderColor: 'primary.main' } }}>
          <SearchRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <InputBase placeholder="Search…" sx={{ fontSize: 13, flex: 1 }} inputProps={{ 'aria-label': 'search' }} />
        </Stack>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
          <CalendarTodayRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary', whiteSpace: 'nowrap' }}>{today}</Typography>
        </Stack>
        <Tooltip title={`${pendingCount} pending requests`}>
          <IconButton size="small" onClick={() => onNavigate('/admin/requests')} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
            <Badge badgeContent={pendingCount > 0 ? ' ' : undefined} color="error" variant="dot">
              <NotificationsRoundedIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

export default function AdminDashboardClientInner() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout } = useAuthStore();
  const redirectRef = React.useRef(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  // Show onboarding wizard for newly registered landlords
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('showLandlordWizard') === 'true') {
      localStorage.removeItem('showLandlordWizard');
      setShowWizard(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      if (!redirectRef.current) { redirectRef.current = true; router.push('/'); }
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [propRes, reqRes] = await Promise.all([api.get('/properties/mine'), api.get('/requests')]);
        const rp = propRes.data?.data ?? propRes.data;
        const rr = reqRes.data?.data ?? reqRes.data;
        setProperties(Array.isArray(rp) ? rp : []);
        setRequests(Array.isArray(rr) ? rr : []);
      } catch { /* silent */ } finally { setLoadingData(false); }
    };
    if (isAuthenticated && user?.role === 'admin') fetchData();
  }, [isAuthenticated, user]);

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>;
  if (!isAuthenticated || user?.role !== 'admin') return null;

  const activeProps = properties.filter(p => p.isActive).length;
  const pendingReqs = requests.filter(r => r.status === 'pending').length;
  const approvedReqs = requests.filter(r => r.status === 'approved').length;
  const rejectedReqs = requests.filter(r => r.status === 'rejected').length;
  const recentProps = [...properties].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { label: monthNames[d.getMonth()], month: d.getMonth(), year: d.getFullYear() };
  });
  const barData = last6Months.map(({ month, year }) => properties.filter(p => { const d = new Date(p.createdAt); return d.getMonth() === month && d.getFullYear() === year; }).length);
  const reqBarData = last6Months.map(({ month, year }) => requests.filter(r => { if (!r.createdAt) return false; const d = new Date(r.createdAt); return d.getMonth() === month && d.getFullYear() === year; }).length);
  const propSparkline = last6Months.map((_, i) => properties.filter(p => new Date(p.createdAt) <= new Date(now.getFullYear(), now.getMonth() - 5 + i + 1, 1)).length);
  const reqSparkline = last6Months.map((_, i) => requests.filter(r => r.createdAt && new Date(r.createdAt) <= new Date(now.getFullYear(), now.getMonth() - 5 + i + 1, 1)).length);
  const statusColor = (s: string) => s === 'approved' ? 'success' : s === 'rejected' ? 'error' : 'warning';

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline enableColorScheme />

        {/* Landlord onboarding wizard */}
        <LandlordProfileWizard open={showWizard} onClose={() => setShowWizard(false)} />

        <SideMenu user={user} pendingCount={pendingReqs} pathname={pathname ?? ''} onNavigate={router.push} onLogout={() => { logout(); router.push('/'); }} />
        <AppNavbar pendingCount={pendingReqs} onToggleMobile={() => setMobileOpen(true)} />

        <MuiDrawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: 'block', md: 'none' }, [`& .${drawerClasses.paper}`]: { width: DRAWER_WIDTH } }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Menu</Typography>
            {[...PRIMARY_NAV, ...SECONDARY_NAV].map(({ label, icon, path }) => (
              <ListItemButton key={label} onClick={() => { router.push(path); setMobileOpen(false); }} sx={{ borderRadius: 1.5, mb: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            ))}
          </Box>
        </MuiDrawer>

        <Box component="main" sx={t => ({ flexGrow: 1, overflow: 'auto', minHeight: '100vh', bgcolor: alpha(t.palette.background.default, 1) })}>
          <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 9, md: 2.5 }, pb: 6 }}>

            <ContentHeader breadcrumb={['Dashboard', 'Overview']} pendingCount={pendingReqs} onNavigate={router.push} />

            <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mt: { xs: 0, md: 2.5 }, mb: 2.5 }}>Overview</Typography>

            {/* Stat Cards */}
            <Grid container spacing={2} columns={12} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Total Properties" value={properties.length} interval="All time"
                  trend="up" trendLabel={`+${properties.length}`} data={propSparkline} color="#1976d2" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Active Properties" value={activeProps} interval="Currently live"
                  trend={activeProps > 0 ? 'up' : 'neutral'}
                  trendLabel={properties.length > 0 ? `+${Math.round((activeProps / properties.length) * 100)}%` : undefined}
                  data={propSparkline} color="#2e7d32" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Pending Requests" value={pendingReqs} interval="Awaiting review"
                  trend={pendingReqs > 0 ? 'down' : 'neutral'}
                  trendLabel={pendingReqs > 0 ? `-${pendingReqs}` : undefined}
                  data={reqSparkline} color="#ed6c02" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Approved Requests" value={approvedReqs} interval="All time"
                  trend={approvedReqs > 0 ? 'up' : 'neutral'}
                  trendLabel={approvedReqs > 0 ? `+${approvedReqs}` : undefined}
                  data={reqSparkline} color="#7b1fa2" />
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={2} columns={12} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Properties &amp; Requests over time</Typography>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 0.25 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>{properties.length}</Typography>
                          <Chip size="small" label={`+${barData.reduce((a, b) => a + b, 0)} listed`} color="success" sx={{ height: 20, fontSize: 11, fontWeight: 700, borderRadius: 1 }} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">Cumulative over last 6 months</Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ width: '100%', overflowX: 'auto', mt: 1 }}>
                      <LineChart height={220}
                        xAxis={[{ scaleType: 'band', data: last6Months.map(m => m.label) }]}
                        yAxis={[{ width: 36 }]}
                        series={[
                          { data: propSparkline, label: 'Properties', color: '#1976d2', area: true, showMark: false },
                          { data: reqSparkline, label: 'Requests', color: '#7b1fa2', area: true, showMark: false },
                        ]}
                        margin={{ top: 16, right: 12, bottom: 24, left: 40 }}
                        sx={{ width: '100%', '& .MuiAreaElement-root': { fillOpacity: 0.12 }, '& .MuiLineElement-root': { strokeWidth: 2 } }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Monthly activity</Typography>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 0.25 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>{requests.length}</Typography>
                          {pendingReqs > 0 && <Chip size="small" label={`${pendingReqs} pending`} color="warning" sx={{ height: 20, fontSize: 11, fontWeight: 700, borderRadius: 1 }} />}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">Properties &amp; requests per month</Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ width: '100%', overflowX: 'auto', mt: 1 }}>
                      <BarChart height={220} borderRadius={4}
                        xAxis={[{ scaleType: 'band', data: last6Months.map(m => m.label), categoryGapRatio: 0.4, barGapRatio: 0.2 }]}
                        yAxis={[{ width: 36 }]}
                        series={[
                          { data: barData, label: 'Properties', color: '#1976d2', stack: 'a' },
                          { data: reqBarData, label: 'Requests', color: 'hsl(210,98%,75%)', stack: 'a' },
                        ]}
                        margin={{ top: 16, right: 12, bottom: 24, left: 40 }}
                        sx={{ width: '100%' }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Details */}
            <Typography component="h2" variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Details</Typography>
            <Grid container spacing={2} columns={12}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <Card variant="outlined">
                  <CardContent sx={{ pb: 0 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Recent Properties</Typography>
                      <Button size="small" variant="contained" startIcon={<AddRoundedIcon />} onClick={() => router.push('/admin/properties/new')}>Add new</Button>
                    </Stack>
                  </CardContent>
                  {loadingData ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
                  ) : recentProps.length === 0 ? (
                    <Box sx={{ px: 2, pb: 3 }}><Typography color="text.secondary" variant="body2">No properties yet. Add your first one!</Typography></Box>
                  ) : (
                    <Box sx={{ overflowX: 'auto' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {['Name', 'City', 'Min Rent', 'Rooms', 'Status', ''].map(h => (
                              <TableCell key={h} align={h === '' ? 'right' : 'left'} sx={{ fontWeight: 600, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentProps.map(p => (
                            <TableRow key={p._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                              <TableCell sx={{ fontWeight: 500, maxWidth: 160 }}><Typography variant="body2" noWrap>{p.name}</Typography></TableCell>
                              <TableCell><Typography variant="body2">{p.location?.city}</Typography></TableCell>
                              <TableCell><Typography variant="body2">R{p.pricing?.minRent?.toLocaleString()}</Typography></TableCell>
                              <TableCell><Typography variant="body2">{p.rooms?.available}</Typography></TableCell>
                              <TableCell><Chip label={p.isActive ? 'Active' : 'Inactive'} color={p.isActive ? 'success' : 'default'} size="small" /></TableCell>
                              <TableCell align="right">
                                <Stack direction="row" sx={{ gap: 0.5, justifyContent: 'flex-end' }}>
                                  <Button size="small" variant="outlined" sx={{ minWidth: 0, px: 1.5, fontSize: 12 }} onClick={() => router.push(`/admin/properties/${p._id}`)}>View</Button>
                                  <Button size="small" variant="outlined" sx={{ minWidth: 0, px: 1.5, fontSize: 12 }} onClick={() => router.push(`/admin/properties/${p._id}/edit`)}>Edit</Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  )}
                  {properties.length > 5 && (
                    <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button size="small" endIcon={<ChevronRightRoundedIcon />} onClick={() => router.push('/admin/properties')}>View all {properties.length}</Button>
                    </Box>
                  )}
                </Card>
              </Grid>

              <Grid size={{ xs: 12, lg: 5 }}>
                <Stack sx={{ gap: 2 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Request breakdown</Typography>
                      <Stack spacing={1.5}>
                        {[
                          { label: 'Pending', count: pendingReqs, color: 'warning' as const, icon: <PendingActionsRoundedIcon fontSize="small" /> },
                          { label: 'Approved', count: approvedReqs, color: 'success' as const, icon: <CheckCircleRoundedIcon fontSize="small" /> },
                          { label: 'Rejected', count: rejectedReqs, color: 'error' as const, icon: <TrendingDownRoundedIcon fontSize="small" /> },
                        ].map(({ label, count, color, icon }) => (
                          <Stack key={label} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Chip icon={icon} label={label} size="small" color={color} variant="outlined" />
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

                  <Card variant="outlined">
                    <CardContent sx={{ pb: 0 }}>
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Recent Requests</Typography>
                        <Button size="small" endIcon={<ChevronRightRoundedIcon />} onClick={() => router.push('/admin/requests')}>View all</Button>
                      </Stack>
                    </CardContent>
                    {loadingData ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
                    ) : requests.length === 0 ? (
                      <Box sx={{ px: 2, pb: 2 }}><Typography color="text.secondary" variant="body2">No requests yet.</Typography></Box>
                    ) : (
                      <Box sx={{ overflowX: 'auto' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              {['Applicant', 'Property', 'Status'].map(h => (
                                <TableCell key={h} sx={{ fontWeight: 600, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {requests.slice(0, 6).map(r => (
                              <TableRow key={r._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell sx={{ maxWidth: 110 }}><Typography variant="body2" noWrap>{r.user?.name ?? r.user?.email ?? '—'}</Typography></TableCell>
                                <TableCell sx={{ maxWidth: 110 }}><Typography variant="body2" noWrap>{r.property?.name ?? '—'}</Typography></TableCell>
                                <TableCell><Chip label={r.status} color={statusColor(r.status) as any} size="small" sx={{ textTransform: 'capitalize', fontWeight: 600 }} /></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    )}
                  </Card>
                </Stack>
              </Grid>
            </Grid>

            <Box sx={{ pt: 4 }}>
              <Typography variant="body2" color="text.secondary" align="center">© {new Date().getFullYear()} Cosy Admin Panel</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
