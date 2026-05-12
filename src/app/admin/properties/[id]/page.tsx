'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayout';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';

import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

interface RoomType { type: string; quantity: number; availableQuantity: number; pricePerMonth: number; description: string; }
interface Property {
  _id: string; name: string; description: string;
  location: { address: string; city: string; postalCode: string; university: string };
  pricing: { minRent: number; maxRent: number; deposit: number };
  roomTypes: RoomType[];
  rooms: { total: number; available: number };
  amenities: string[]; images: string[]; nsfasAccreditation: boolean; isActive: boolean; createdAt: string; owner: string;
}

export default function ViewPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const propertyId = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) router.push('/');
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin' || !propertyId) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/properties/${propertyId}`);
        setProperty(res.data.data);
      } catch (e: any) { setError(e.response?.data?.message || 'Failed to load property'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [isAuthenticated, user, propertyId]);

  if (isLoading) return null;
  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : error || !property ? (
          <Alert severity="error">{error || 'Property not found'}</Alert>
        ) : (
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{  justifyContent: 'space-between', alignItems: { sm: 'flex-start' }, mb: 4, gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }} >{property.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} >{property.location.address}, {property.location.city}</Typography>
                <Stack direction="row" sx={{ mt: 1, gap: 1 }}>
                  <Chip size="small" label={property.isActive ? 'Active' : 'Inactive'} color={property.isActive ? 'success' : 'default'} />
                  {property.nsfasAccreditation && <Chip size="small" label="NSFAS Accredited" color="info" />}
                </Stack>
              </Box>
              <Button variant="contained" startIcon={<EditRoundedIcon />} onClick={() => router.push(`/admin/properties/${property._id}/edit`)}>
                Edit Property
              </Button>
            </Stack>

            {/* Images */}
            {property.images && property.images.length > 0 && (
              <Paper variant="outlined" sx={{ mb: 4, overflow: 'hidden' }}>
                <Box component="img" src={property.images[selectedImageIndex]} alt="Property" sx={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }} />
                {property.images.length > 1 && (
                  <Stack direction="row" sx={{  p: 1.5, bgcolor: 'action.hover', overflowX: 'auto', gap: 1 }}>
                    {property.images.map((img, i) => (
                      <Box key={i} component="img" src={img} onClick={() => setSelectedImageIndex(i)} sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1, cursor: 'pointer', border: '2px solid', borderColor: i === selectedImageIndex ? 'primary.main' : 'transparent', flexShrink: 0 }} />
                    ))}
                  </Stack>
                )}
              </Paper>
            )}

            {/* Description */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1"  sx={{ mb: 1, fontWeight: 700 }}>Description</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{property.description}</Typography>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 3 }} >
              {/* Location */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle1"  sx={{ mb: 2, fontWeight: 700 }}>Location</Typography>
                  {[['Address', property.location.address], ['City', property.location.city], ...(property.location.postalCode ? [['Postal Code', property.location.postalCode]] : []), ['University', property.location.university]].map(([label, val]) => (
                    <Box key={label} sx={{ mb: 1.5 }} >
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }} >{val}</Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
              {/* Pricing */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle1"  sx={{ mb: 2, fontWeight: 700 }}>Pricing</Typography>
                  {[['Min Rent', `R${property.pricing.minRent.toLocaleString()}`], ['Max Rent', `R${property.pricing.maxRent.toLocaleString()}`], ['Deposit', `R${property.pricing.deposit.toLocaleString()}`]].map(([label, val]) => (
                    <Box key={label} sx={{ mb: 1.5 }} >
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="body2"  color="primary.main" sx={{ fontWeight: 600 }}>{val}</Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            </Grid>

            {/* Rooms */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1"  sx={{ mb: 2, fontWeight: 700 }}>Rooms</Typography>
              <Stack direction="row" sx={{  mb: 2, gap: 4 }}>
                <Box><Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Total</Typography><Typography variant="h4"  color="primary.main">{property.rooms.total}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Available</Typography><Typography variant="h4"  color="success.main">{property.rooms.available}</Typography></Box>
              </Stack>
              {property.roomTypes && property.roomTypes.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2"  sx={{ mb: 2, fontWeight: 600 }}>Room Types</Typography>
                  <Stack sx={{ gap: 1.5 }}>
                    {property.roomTypes.map((rt, i) => (
                      <Paper key={i} variant="outlined" sx={{ p: 2 }}>
                        <Stack direction="row" sx={{  justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }} >{rt.type}</Typography>
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }} >R{rt.pricePerMonth.toLocaleString()}/mo</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">Qty: {rt.quantity} · Available: {rt.availableQuantity}</Typography>
                        {rt.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} >{rt.description}</Typography>}
                      </Paper>
                    ))}
                  </Stack>
                </>
              )}
            </Paper>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle1"  sx={{ mb: 2, fontWeight: 700 }}>Amenities</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {property.amenities.map(a => (
                    <Chip key={a} icon={<CheckRoundedIcon />} label={a} size="small" color="primary" variant="outlined" />
                  ))}
                </Box>
              </Paper>
            )}
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
