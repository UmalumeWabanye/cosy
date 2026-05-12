"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

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
}

export default function AdminDashboardClientInner() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const redirectRef = React.useRef(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
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
        setProperties(propertiesRes.data.data || propertiesRes.data || []);
        setRequests(requestsRes.data.data || requestsRes.data || []);
      } catch (err) {
        // swallow for now; template will show empty state
      } finally {
        setLoadingData(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchData();
    }
  }, [isAuthenticated, user]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated || user?.role !== 'admin') return null;

  const pendingRequests = requests.filter((r) => r.status === 'pending').length;

  // Temporary debug panel to surface auth state during troubleshooting.
  const debugToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  return (
    <Box sx={{ display: 'flex' }}>
      <div style={{ position: 'fixed', right: 12, top: 12, zIndex: 9999 }}>
        <div style={{ background: '#fff', padding: 8, borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
          <strong style={{ display: 'block', marginBottom: 6 }}>DEBUG</strong>
          <div style={{ fontSize: 12, whiteSpace: 'pre-wrap', maxWidth: 320 }}>
            {`isLoading: ${String(isLoading)}\n`}
            {`isAuthenticated: ${String(isAuthenticated)}\n`}
            {`user.role: ${user?.role ?? 'null'}\n`}
            {`token: ${debugToken ? '[present]' : '[missing]'}`}
          </div>
        </div>
      </div>
      <CssBaseline />
      <AppBar position="absolute">
        <Toolbar sx={{ pr: '24px' }}>
          <IconButton edge="start" color="inherit" aria-label="open drawer" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={() => router.push('/')}>Back</Button>
        </Toolbar>
      </AppBar>

      <Drawer variant="temporary" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            <ListItem>
              <ListItemButton>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton onClick={() => router.push('/admin/properties')}>
                <ListItemText primary="Properties" />
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton onClick={() => router.push('/admin/requests')}>
                <ListItemText primary="Requests" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {/* Summary cards layout using flex wrap */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box sx={{ flex: '1 1 240px' }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">Total Properties</Typography>
                  <Typography variant="h4">{properties.length}</Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 240px' }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">Active Properties</Typography>
                  <Typography variant="h4">{properties.filter((p) => p.isActive).length}</Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 240px' }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">Pending Requests</Typography>
                  <Typography variant="h4">{pendingRequests}</Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 240px' }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">Total Requests</Typography>
                  <Typography variant="h4">{requests.length}</Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Properties table */}
          <Box>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Your Properties
              </Typography>
              {loadingData ? (
                <Typography>Loading...</Typography>
              ) : properties.length === 0 ? (
                <Typography>No properties yet</Typography>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Location</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Price</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Rooms</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((p) => (
                        <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: 8 }}>{p.name}</td>
                          <td style={{ padding: 8 }}>{p.location.city}</td>
                          <td style={{ padding: 8 }}>R{p.pricing.minRent.toLocaleString()}</td>
                          <td style={{ padding: 8 }}>{p.rooms.available}</td>
                          <td style={{ padding: 8 }}>{p.isActive ? 'Active' : 'Inactive'}</td>
                          <td style={{ padding: 8 }}>
                            <Button size="small" onClick={() => router.push(`/admin/properties/${p._id}`)}>
                              View
                            </Button>
                            <Button size="small" onClick={() => router.push(`/admin/properties/${p._id}/edit`)}>
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              )}
            </Paper>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
