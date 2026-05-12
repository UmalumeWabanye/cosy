'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';

const theme = createTheme({
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
  },
  shape: { borderRadius: 8 },
});

interface PropertyData {
  _id: string; name: string; city: string; images?: string[];
  roomTypes: Array<{ type: string; pricePerMonth: number }>;
}
interface SavedListing { _id: string; propertyId: PropertyData; notes: string; createdAt: string; }
interface Request {
  _id: string; propertyId: PropertyData; moveInDate: string; leaseDuration: string;
  fundingType: string; status: 'pending' | 'approved' | 'rejected'; createdAt: string;
}

const statusColor: Record<string, 'warning' | 'success' | 'error'> = {
  pending: 'warning', approved: 'success', rejected: 'error',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout } = useAuthStore();
  const [tab, setTab] = useState(0);
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  const fetchSaved = async () => {
    try { setLoadingData(true); const r = await api.get('/saved'); setSavedListings(r.data.data || []); }
    catch (e: any) { setError(e.response?.data?.message || 'Failed to load saved listings'); }
    finally { setLoadingData(false); }
  };

  const fetchRequests = async () => {
    try { setLoadingData(true); const r = await api.get('/requests/my'); setRequests(r.data.data || []); }
    catch (e: any) { setError(e.response?.data?.message || 'Failed to load requests'); }
    finally { setLoadingData(false); }
  };

  useEffect(() => {
    if (tab === 1) fetchSaved();
    if (tab === 2) fetchRequests();
  }, [tab]);

  if (isLoading) return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    </ThemeProvider>
  );

  if (!isAuthenticated || !user) return null;

  const getMinPrice = (property: PropertyData) => {
    if (!property.roomTypes?.length) return 0;
    return Math.min(...property.roomTypes.map((rt) => rt.pricePerMonth));
  };

  const handleLogout = () => { logout(); router.push('/'); };
  const handleRemoveSaved = async (id: string) => {
    await api.delete(`/saved/${id}`);
    setSavedListings((prev) => prev.filter((i) => i._id !== id));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', py: 2, px: 2 }}>
          <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: 1, background: 'linear-gradient(135deg, #1976d2, #1565c0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 14 }}>C</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>Cosy</Typography>
              </Box>
            </Link>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{user.name}</Typography>
              <Button onClick={handleLogout} variant="outlined" size="small" sx={{ textTransform: 'none' }}>Logout</Button>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>My Dashboard</Typography>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Tab icon={<HomeOutlinedIcon />} iconPosition="start" label="Overview" sx={{ textTransform: 'none', fontFamily: 'inherit' }} />
            <Tab icon={<BookmarkBorderIcon />} iconPosition="start" label="Saved" sx={{ textTransform: 'none', fontFamily: 'inherit' }} />
            <Tab icon={<AssignmentOutlinedIcon />} iconPosition="start" label="Requests" sx={{ textTransform: 'none', fontFamily: 'inherit' }} />
            <Tab icon={<PersonOutlinedIcon />} iconPosition="start" label="Profile" sx={{ textTransform: 'none', fontFamily: 'inherit' }} />
          </Tabs>

          {/* Overview */}
          {tab === 0 && (
            <Grid container spacing={3}>
              {[
                { label: 'Saved Listings', value: savedListings.length },
                { label: 'Pending Requests', value: requests.filter((r) => r.status === 'pending').length },
                { label: 'Approved Requests', value: requests.filter((r) => r.status === 'approved').length },
              ].map((stat) => (
                <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
                  <Card variant="outlined" sx={{ boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px' }}>
                    <CardContent>
                      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mt: 1 }}>{stat.value}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Saved */}
          {tab === 1 && (
            loadingData ? (
              <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : savedListings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ mb: 2, color: 'text.secondary' }}>No saved listings yet.</Typography>
                <Button variant="contained" component={Link} href="/browse" sx={{ textTransform: 'none' }}>Browse Properties</Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {savedListings.map((listing) => (
                  <Grid key={listing._id} size={{ xs: 12, sm: 6 }}>
                    <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column' }}>
                      {listing.propertyId.images?.[0] && (
                        <CardMedia component="img" height={180} image={listing.propertyId.images[0]} alt={listing.propertyId.name} />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{listing.propertyId.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{listing.propertyId.city}</Typography>
                        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, mb: 1 }}>
                          R{getMinPrice(listing.propertyId).toLocaleString()} / month
                        </Typography>
                        {listing.notes && <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>"{listing.notes}"</Typography>}
                      </CardContent>
                      <Box sx={{ display: 'flex', gap: 1, p: 2, pt: 0 }}>
                        <Button variant="contained" fullWidth size="small" component={Link} href={`/browse/${listing.propertyId._id}`} sx={{ textTransform: 'none' }}>View</Button>
                        <Button variant="outlined" size="small" onClick={() => handleRemoveSaved(listing._id)} startIcon={<DeleteOutlinedIcon />} sx={{ textTransform: 'none', color: 'error.main', borderColor: 'error.light' }}>Remove</Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )
          )}

          {/* Requests */}
          {tab === 2 && (
            loadingData ? (
              <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : requests.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ mb: 2, color: 'text.secondary' }}>No requests yet.</Typography>
                <Button variant="contained" component={Link} href="/browse" sx={{ textTransform: 'none' }}>Browse Properties</Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {requests.map((request) => (
                  <Card key={request._id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{request.propertyId.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{request.propertyId.city}</Typography>
                        </Box>
                        <Chip label={request.status} color={statusColor[request.status]} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                      </Box>
                      <Grid container spacing={2}>
                        {[
                          { label: 'Move-in', value: new Date(request.moveInDate).toLocaleDateString() },
                          { label: 'Lease', value: request.leaseDuration },
                          { label: 'Funding', value: request.fundingType },
                          { label: 'Price', value: `R${getMinPrice(request.propertyId).toLocaleString()}` },
                        ].map((item) => (
                          <Grid key={item.label} size={{ xs: 6, sm: 3 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>{item.label}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value}</Typography>
                          </Grid>
                        ))}
                      </Grid>
                      <Box sx={{ mt: 2 }}>
                        <Button variant="outlined" size="small" component={Link} href={`/browse/${request.propertyId._id}`} sx={{ textTransform: 'none' }}>View Property</Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )
          )}

          {/* Profile */}
          {tab === 3 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>My Profile</Typography>
                <Grid container spacing={3}>
                  {[
                    { label: 'Name', value: user.name },
                    { label: 'Email', value: user.email },
                    { label: 'Role', value: user.role },
                    { label: 'University', value: user.university },
                  ].map((item) => (
                    <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>{item.label}</Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>{item.value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
