'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import StudentLayout from '@/components/student/StudentLayout';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';


interface SavedListing {
  _id: string;
  propertyId: {
    _id: string;
    propertyName?: string;
    city?: string;
    address?: string;
    universityNearby?: string;
    price?: number;
    roomType?: string;
    images?: { url: string }[];
    nsfasAccredited?: boolean;
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
      const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setSavedListings(data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load saved listings');
    } finally { setLoading(false); }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this saved listing?')) return;
    try {
      await api.delete(`/saved/${id}`);
      setSavedListings(prev => prev.filter(l => l._id !== id));
    } catch (e: any) { setError(e.response?.data?.message || 'Failed to remove'); }
  };

  const handleEditNotes = async (id: string) => {
    try {
      await api.patch(`/saved/${id}`, { notes: editNotes });
      setSavedListings(prev => prev.map(l => l._id === id ? { ...l, notes: editNotes } : l));
      setEditingId(null); setEditNotes('');
    } catch (e: any) { setError(e.response?.data?.message || 'Failed to update notes'); }
  };

  return (
    <StudentLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
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
            <Stack spacing={2}>
              {savedListings.map((listing) => {
                const prop = listing.propertyId;
                const imgUrl = prop?.images?.[0]?.url;
                return (
                <Card key={listing._id} variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.09)' } }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }}>
                    {/* Image */}
                    <Box sx={{ width: { xs: '100%', sm: 160 }, height: { xs: 160, sm: 'auto' }, flexShrink: 0, minHeight: { sm: 130 } }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={prop?.propertyName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <Box sx={{ width: '100%', height: '100%', minHeight: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                          <Typography color="text.disabled">No image</Typography>
                        </Box>
                      )}
                    </Box>

                    <CardContent sx={{ flex: 1, p: { xs: 2, sm: 2.5 } }}>
                      {/* Title row */}
                      <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography
                          variant="subtitle1"
                          component={Link}
                          href={`/browse/${prop?._id}`}
                          sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none', lineHeight: 1.3, '&:hover': { textDecoration: 'underline' } }}
                        >
                          {prop?.propertyName ?? 'Property'}
                        </Typography>
                        {prop?.nsfasAccredited && (
                          <Chip icon={<VerifiedIcon sx={{ fontSize: 12 }} />} label="NSFAS" size="small" color="success" variant="outlined" sx={{ fontSize: 11 }} />
                        )}
                      </Stack>

                      {prop?.city && (
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 1 }}>
                          <LocationOnOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {prop.address ? `${prop.address}, ` : ''}{prop.city}
                          </Typography>
                        </Stack>
                      )}

                      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', mb: 1.5 }}>
                        {prop?.price != null && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Rent</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                              R{prop.price.toLocaleString()}/mo
                            </Typography>
                          </Box>
                        )}
                        {prop?.roomType && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Type</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{prop.roomType}</Typography>
                          </Box>
                        )}
                      </Stack>

                      {/* Notes */}
                      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Notes</Typography>
                        {editingId === listing._id ? (
                          <Box>
                            <TextField fullWidth multiline rows={2} size="small" value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Add personal notes..." />
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              <Button size="small" variant="contained" startIcon={<CheckIcon />} onClick={() => handleEditNotes(listing._id)} sx={{ textTransform: 'none' }}>Save</Button>
                              <Button size="small" variant="outlined" startIcon={<CloseIcon />} onClick={() => { setEditingId(null); setEditNotes(''); }} sx={{ textTransform: 'none' }}>Cancel</Button>
                            </Stack>
                          </Box>
                        ) : (
                          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'flex-start' }, gap: 1 }}>
                            <Typography variant="body2" sx={{ flex: 1, color: listing.notes ? 'text.primary' : 'text.disabled', fontStyle: listing.notes ? 'italic' : 'normal', minHeight: 24 }}>
                              {listing.notes || 'No notes added yet.'}
                            </Typography>
                            <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
                              <Button size="small" variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => { setEditingId(listing._id); setEditNotes(listing.notes); }} sx={{ textTransform: 'none', fontSize: 11 }}>Edit</Button>
                              <Button size="small" variant="outlined" color="error" startIcon={<DeleteOutlinedIcon />} onClick={() => handleRemove(listing._id)} sx={{ textTransform: 'none', fontSize: 11 }}>Remove</Button>
                            </Stack>
                          </Stack>
                        )}
                      </Box>
                    </CardContent>
                  </Stack>
                </Card>
                );
              })}
            </Stack>
          )}
      </Box>
    </StudentLayout>
  );
}
