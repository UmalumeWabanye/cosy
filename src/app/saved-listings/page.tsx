'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import Navbar from '@/components/Navbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const theme = createTheme({
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
  },
  shape: { borderRadius: 8 },
});

interface SavedListing {
  _id: string;
  propertyId: {
    _id: string; name: string; description: string;
    location: { address: string; city: string; university: string };
    pricing: { minRent: number; maxRent: number };
    images: string[]; rating: number; reviewCount: number;
    rooms: { available: number; total: number }; nsfasAccreditation: boolean;
  };
  notes: string; createdAt: string;
}

export default function SavedListingsPage() {
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => { fetchSavedListings(); }, []);

  const fetchSavedListings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/saved');
      if (res.data.success) setSavedListings(res.data.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load saved listings');
    } finally { setLoading(false); }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this saved listing?')) return;
    try {
      const res = await api.delete(`/saved/${id}`);
      if (res.data.success) setSavedListings((prev) => prev.filter((l) => l._id !== id));
    } catch (e: any) { setError(e.response?.data?.message || 'Failed to remove'); }
  };

  const handleEditNotes = async (id: string) => {
    try {
      const res = await api.patch(`/saved/${id}`, { notes: editNotes });
      if (res.data.success) {
        setSavedListings((prev) => prev.map((l) => l._id === id ? { ...l, notes: editNotes } : l));
        setEditingId(null); setEditNotes('');
      }
    } catch (e: any) { setError(e.response?.data?.message || 'Failed to update notes'); }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Saved Listings</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {savedListings.length} {savedListings.length === 1 ? 'property' : 'properties'} saved
            </Typography>
          </Box>

          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress /></Box>
          ) : savedListings.length === 0 ? (
            <Card variant="outlined" sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>No saved listings yet</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Browse properties and save your favorites.
              </Typography>
              <Button variant="contained" component={Link} href="/browse" sx={{ textTransform: 'none' }}>
                Browse Properties
              </Button>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {savedListings.map((listing) => (
                <Card key={listing._id} variant="outlined" sx={{ boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px', '&:hover': { boxShadow: 'hsla(220, 30%, 5%, 0.1) 0px 10px 25px 0px' }, transition: 'box-shadow 0.2s' }}>
                  <CardContent>
                    <Grid container spacing={3}>
                      {/* Image */}
                      <Grid size={{ xs: 12, sm: 3 }}>
                        {listing.propertyId.images?.[0] ? (
                          <Box sx={{ height: 160, borderRadius: 1, overflow: 'hidden' }}>
                            <img src={listing.propertyId.images[0]} alt={listing.propertyId.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </Box>
                        ) : (
                          <Box sx={{ height: 160, bgcolor: 'grey.200', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography color="text.disabled">No image</Typography>
                          </Box>
                        )}
                      </Grid>

                      {/* Details */}
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="subtitle1"
                            component={Link}
                            href={`/browse/${listing.propertyId._id}`}
                            sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                          >
                            {listing.propertyId.name}
                          </Typography>
                          {listing.propertyId.nsfasAccreditation && (
                            <Chip icon={<VerifiedIcon sx={{ fontSize: 12 }} />} label="NSFAS" size="small" color="success" variant="outlined" sx={{ fontSize: 11 }} />
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                          <LocationOnOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {listing.propertyId.location.address}, {listing.propertyId.location.city}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Rent</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                              R{listing.propertyId.pricing.minRent?.toLocaleString()} – R{listing.propertyId.pricing.maxRent?.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Available</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {listing.propertyId.rooms.available}/{listing.propertyId.rooms.total}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{listing.propertyId.rating.toFixed(1)}</Typography>
                          <Typography variant="body2" color="text.secondary">({listing.propertyId.reviewCount})</Typography>
                        </Box>
                      </Grid>

                      {/* Notes + Actions */}
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Divider orientation="vertical" sx={{ display: { xs: 'none', sm: 'block' }, mr: 2 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>Notes</Typography>
                        {editingId === listing._id ? (
                          <Box sx={{ mt: 1 }}>
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              size="small"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="Add personal notes..."
                            />
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Button size="small" variant="contained" startIcon={<CheckIcon />} onClick={() => handleEditNotes(listing._id)} sx={{ textTransform: 'none' }}>Save</Button>
                              <Button size="small" variant="outlined" startIcon={<CloseIcon />} onClick={() => { setEditingId(null); setEditNotes(''); }} sx={{ textTransform: 'none' }}>Cancel</Button>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" sx={{ color: listing.notes ? 'text.primary' : 'text.disabled', fontStyle: listing.notes ? 'italic' : 'normal', mb: 2, minHeight: 40 }}>
                              {listing.notes || 'No notes added yet.'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Button size="small" variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => { setEditingId(listing._id); setEditNotes(listing.notes); }} sx={{ textTransform: 'none' }}>Edit</Button>
                              <Button size="small" variant="outlined" color="error" startIcon={<DeleteOutlinedIcon />} onClick={() => handleRemove(listing._id)} sx={{ textTransform: 'none' }}>Remove</Button>
                            </Box>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
