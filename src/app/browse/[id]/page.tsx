'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StarIcon from '@mui/icons-material/Star';
import WifiIcon from '@mui/icons-material/Wifi';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import KitchenIcon from '@mui/icons-material/Kitchen';
import TvIcon from '@mui/icons-material/Tv';
import NatureIcon from '@mui/icons-material/Nature';
import LockIcon from '@mui/icons-material/Lock';
import ShowerIcon from '@mui/icons-material/Shower';
import SatelliteIcon from '@mui/icons-material/Satellite';
import VerifiedIcon from '@mui/icons-material/Verified';
import api from '@/services/api';

const theme = createTheme({
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
  },
  shape: { borderRadius: 8 },
});

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <WifiIcon />, Parking: <LocalParkingIcon />, Gym: <FitnessCenterIcon />,
  Laundry: <LocalLaundryServiceIcon />, Kitchen: <KitchenIcon />, 'TV Lounge': <TvIcon />,
  Garden: <NatureIcon />, Security: <LockIcon />, 'Water Heater': <ShowerIcon />, DSTV: <SatelliteIcon />,
};

interface Property {
  _id: string; name: string; description: string;
  location: { address: string; city: string; university: string; postalCode: string };
  pricing: { minRent: number; maxRent: number; deposit: number };
  images: string[]; amenities: string[]; nsfasAccreditation: boolean;
  rooms: { total: number; available: number };
  rating: number; reviewCount: number; reviews: any[];
  owner: { name: string; email: string }; createdAt: string;
}

export default function PropertyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const propertyId = params.id as string;

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/properties/${propertyId}`);
        setProperty(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };
    if (propertyId) fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography color="text.secondary">Loading property details...</Typography>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  if (error || !property) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ mb: 2, color: 'text.secondary' }}>{error || 'Property not found'}</Typography>
            <Button variant="contained" component={Link} href="/browse" sx={{ textTransform: 'none' }}>
              Back to Browse
            </Button>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  const handleApplyClick = () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    router.push(`/browse/${propertyId}/request`);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
        {/* Sub-header */}
        <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', py: 2, px: 2 }}>
          <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button component={Link} href="/browse" variant="text" sx={{ textTransform: 'none' }}>
              ← Back to Browse
            </Button>
            <Button onClick={handleApplyClick} variant="contained" sx={{ textTransform: 'none', fontWeight: 700 }}>
              Apply Now
            </Button>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid size={{ xs: 12, md: 8 }}>
              {/* Image Gallery */}
              <Card variant="outlined" sx={{ mb: 3, overflow: 'hidden' }}>
                {property.images && property.images.length > 0 ? (
                  <>
                    <Box sx={{ height: 400, overflow: 'hidden' }}>
                      <img
                        src={property.images[activeImageIndex]}
                        alt={property.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                    {property.images.length > 1 && (
                      <Box sx={{ display: 'flex', gap: 1, p: 2, overflowX: 'auto' }}>
                        {property.images.map((img, i) => (
                          <Box
                            key={i}
                            onClick={() => setActiveImageIndex(i)}
                            sx={{
                              flexShrink: 0, width: 80, height: 80, borderRadius: 1, overflow: 'hidden',
                              border: '2px solid', cursor: 'pointer',
                              borderColor: i === activeImageIndex ? 'primary.main' : 'transparent',
                              opacity: i === activeImageIndex ? 1 : 0.6,
                              '&:hover': { opacity: 1 },
                            }}
                          >
                            <img src={img} alt={`${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                    <Typography color="text.disabled">No images available</Typography>
                  </Box>
                )}
              </Card>

              {/* Description */}
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>About this property</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {property.description}
                  </Typography>
                </CardContent>
              </Card>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Amenities</Typography>
                    <Grid container spacing={1.5}>
                      {property.amenities.map((amenity) => (
                        <Grid key={amenity} size={{ xs: 6, sm: 4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Box sx={{ color: 'primary.main', display: 'flex' }}>
                              {amenityIcons[amenity] || null}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{amenity}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Reviews */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Reviews</Typography>
                  {property.reviewCount > 0 ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Typography variant="h3" sx={{ fontWeight: 800 }}>{property.rating.toFixed(1)}</Typography>
                        <Box>
                          <Box sx={{ display: 'flex', color: 'warning.main' }}>
                            {[1,2,3,4,5].map((s) => (
                              <StarIcon key={s} sx={{ fontSize: 18, opacity: s <= Math.round(property.rating) ? 1 : 0.3 }} />
                            ))}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {property.reviewCount} {property.reviewCount === 1 ? 'review' : 'reviews'}
                          </Typography>
                        </Box>
                      </Box>
                      {property.reviews.map((review: any) => (
                        <Box key={review._id} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{review.student?.name || 'Anonymous'}</Typography>
                            <Typography variant="caption" color="text.secondary">{new Date(review.createdAt).toLocaleDateString()}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', color: 'warning.main', mb: 0.5 }}>
                            {[1,2,3,4,5].map((s) => <StarIcon key={s} sx={{ fontSize: 14, opacity: s <= review.rating ? 1 : 0.3 }} />)}
                          </Box>
                          {review.comment && <Typography variant="body2" color="text.secondary">{review.comment}</Typography>}
                          <Divider sx={{ mt: 2 }} />
                        </Box>
                      ))}
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">No reviews yet</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{property.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 2 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'primary.main', mt: 0.3 }} />
                    <Box>
                      <Typography variant="body2">{property.location.address}</Typography>
                      <Typography variant="body2" color="text.secondary">{property.location.city}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', color: 'warning.main' }}>
                      {[1,2,3,4,5].map((s) => <StarIcon key={s} sx={{ fontSize: 16, opacity: s <= Math.round(property.rating) ? 1 : 0.3 }} />)}
                    </Box>
                    <Typography variant="body2">{property.rating.toFixed(1)} ({property.reviewCount})</Typography>
                  </Box>

                  {/* Pricing */}
                  <Box sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.100', borderRadius: 1, p: 2, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">Monthly Rent Range</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', my: 0.5 }}>
                      R{property.pricing.minRent.toLocaleString()} – R{property.pricing.maxRent.toLocaleString()}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Deposit</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>R{property.pricing.deposit.toLocaleString()}</Typography>
                    </Box>
                  </Box>

                  {/* Rooms */}
                  <Grid container spacing={1.5} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Available</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>{property.rooms.available}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Total</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{property.rooms.total}</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* NSFAS */}
                  {property.nsfasAccreditation && (
                    <Box sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200', borderRadius: 1, p: 1.5, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <VerifiedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.dark' }}>NSFAS Accredited</Typography>
                      </Box>
                      <Typography variant="caption" color="success.main">Accepts NSFAS funding</Typography>
                    </Box>
                  )}

                  {/* Owner */}
                  <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">Property Owner</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{property.owner.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{property.owner.email}</Typography>
                  </Box>

                  <Button onClick={handleApplyClick} variant="contained" fullWidth sx={{ mb: 1, textTransform: 'none', fontWeight: 700, py: 1.5 }}>
                    Apply Now
                  </Button>
                  <Button onClick={() => router.push('/browse')} variant="outlined" fullWidth sx={{ textTransform: 'none' }}>
                    Back to Browse
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
