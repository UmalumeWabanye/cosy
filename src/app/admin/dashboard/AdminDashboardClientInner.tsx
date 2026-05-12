"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const defaultTheme = createTheme();

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

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <Avatar sx={{ bgcolor: color, width: 52, height: 52 }}>{icon}</Avatar>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function AdminDashboardClientInner() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const redirectRef = React.useRef(false);
  const [open, setOpen] = useState(true);
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
        const [propertiesRes, requestsRes] = await Promise.all([
          api.get('/admin/properties'),
          api.get('/requests'),
        ]);
        const rawProps = propertiesRes.data?.data ?? propertiesRes.data;
        const rawReqs = requestsRes.data?.data ?? requestsRes.data;
        setProperties(Array.isArray(rawProps) ? rawProps : []);
        setRequests(Array.isArray(rawReqs) ? rawReqs : []);
      } catch (_err) {
        // show empty state
      } finally {
        setLoadingData(false);
      }
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

  const activeProperties = properties.filter((p) => p.isActive).length;
  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const recentProperties = [...properties]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const statusColor = (status: string) => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'error';
    return 'warning';
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        {/* ── AppBar ── */}
        <AppBar position="absolute" open={open}>
          <Toolbar sx={{ pr: '24px' }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={() => setOpen(true)}
              sx={{ mr: '36px', ...(open && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
              Admin Dashboard
            </Typography>
            <Tooltip title="Go to site">
              <IconButton color="inherit" onClick={() => router.push('/')}>
                <HomeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={`${pendingRequests} pending requests`}>
              <IconButton color="inherit">
                <Badge badgeContent={pendingRequests} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Sign out">
              <IconButton color="inherit" onClick={() => router.push('/login')}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* ── Sidebar Drawer ── */}
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, flexGrow: 1, pl: 1 }}>
              Cosy Admin
            </Typography>
            <IconButton onClick={() => setOpen(false)}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <ListItem disablePadding>
              <ListItemButton selected>
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => router.push('/admin/properties')}>
                <ListItemIcon><ApartmentIcon /></ListItemIcon>
                <ListItemText primary="Properties" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => router.push('/admin/requests')}>
                <ListItemIcon>
                  <Badge badgeContent={pendingRequests || undefined} color="error">
                    <AssignmentIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary="Requests" />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={() => router.push('/admin/properties/new')}>
                <ListItemIcon><AddIcon /></ListItemIcon>
                <ListItemText primary="Add Property" />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>

        {/* ── Main Content ── */}
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

            {/* ── Stat Cards ── */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Total Properties"
                  value={properties.length}
                  icon={<ApartmentIcon />}
                  color="#1976d2"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Active Properties"
                  value={activeProperties}
                  icon={<TrendingUpIcon />}
                  color="#2e7d32"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Pending Requests"
                  value={pendingRequests}
                  icon={<PendingActionsIcon />}
                  color="#ed6c02"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Total Requests"
                  value={requests.length}
                  icon={<FormatListBulletedIcon />}
                  color="#7b1fa2"
                />
              </Grid>
            </Grid>

            {/* ── Recent Properties Table ── */}
            <Grid container spacing={3}>
              <Grid size={12}>
                <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recent Properties
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => router.push('/admin/properties/new')}
                    >
                      Add New
                    </Button>
                  </Box>
                  {loadingData ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : recentProperties.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      No properties yet. Add your first one!
                    </Typography>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Name</strong></TableCell>
                          <TableCell><strong>City</strong></TableCell>
                          <TableCell><strong>Min Rent</strong></TableCell>
                          <TableCell><strong>Available Rooms</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentProperties.map((p) => (
                          <TableRow key={p._id} hover>
                            <TableCell>{p.name}</TableCell>
                            <TableCell>{p.location?.city}</TableCell>
                            <TableCell>R{p.pricing?.minRent?.toLocaleString()}</TableCell>
                            <TableCell>{p.rooms?.available}</TableCell>
                            <TableCell>
                              <Chip
                                label={p.isActive ? 'Active' : 'Inactive'}
                                color={p.isActive ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                variant="outlined"
                                sx={{ mr: 1 }}
                                onClick={() => router.push(`/admin/properties/${p._id}`)}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => router.push(`/admin/properties/${p._id}/edit`)}
                              >
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  {properties.length > 5 && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button size="small" onClick={() => router.push('/admin/properties')}>
                        View all {properties.length} properties →
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* ── Recent Requests ── */}
              <Grid size={12}>
                <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recent Requests
                    </Typography>
                    <Button size="small" onClick={() => router.push('/admin/requests')}>
                      View all →
                    </Button>
                  </Box>
                  {loadingData ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : requests.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      No requests yet.
                    </Typography>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Property</strong></TableCell>
                          <TableCell><strong>Applicant</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Date</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {requests.slice(0, 5).map((r) => (
                          <TableRow key={r._id} hover>
                            <TableCell>{r.property?.name ?? '—'}</TableCell>
                            <TableCell>{r.user?.name ?? r.user?.email ?? '—'}</TableCell>
                            <TableCell>
                              <Chip
                                label={r.status}
                                color={statusColor(r.status) as any}
                                size="small"
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell>
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* ── Footer ── */}
            <Box sx={{ pt: 4, pb: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                {'© '}
                {new Date().getFullYear()}{' '}
                Cosy Admin Panel
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
