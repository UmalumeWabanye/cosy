'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import StudentLayout from '@/components/student/StudentLayout';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
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

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <WifiIcon />, Parking: <LocalParkingIcon />, Gym: <FitnessCenterIcon />,
  Laundry: <LocalLaundryServiceIcon />, Kitchen: <KitchenIcon />, 'TV Lounge': <TvIcon />,
  Garden: <NatureIcon />, Security: <LockIcon />, 'Water Heater': <ShowerIcon />, DSTV: <SatelliteIcon />,
};

interface Property {
  _id: string;
  propertyName: string;
  description: string;
  city: string;
  address: string;
  universityNearby: string;
  price: number;
  roomType: string;
  nsfasAccredited: boolean;
  images: { url: string; publicId?: string }[];
  amenities: string[];
  distanceFromCampus?: number;
  isAvailable: boolean;
  createdBy: { name: string; email: string };
  createdAt: string;
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
        setProperty(response.data);
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
      <StudentLayout>
        <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography color="text.secondary">Loading property details...</Typography>
          </Box>
        </Box>
      </StudentLayout>
    );
  }

  if (error || !property) {
    return (
      <StudentLayout>
        <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ mb: 2, color: 'text.secondary' }}>{error || 'Property not found'}</Typography>
            <Button variant="contained" component={Link} href="/browse" sx={{ textTransform: 'none' }}>
              Back to Browse
            </Button>
          </Box>
        </Box>
      </StudentLayout>
    );
  }

  const handleApplyClick = () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    router.push(`/browse/${propertyId}/request`);
  };

  return (
    <StudentLayout>
      <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
        {/* Sub-header */}
        <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', py: 1.5, px: 2 }}>
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
                        src={property.images[activeImageIndex]?.url}
                        alt={property.propertyName}
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
                            <img src={img.url} alt={`${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No reviews yet</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{property.propertyName}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 2 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'primary.main', mt: 0.3 }} />
                    <Box>
                      <Typography variant="body2">{property.address}</Typography>
                      <Typography variant="body2" color="text.secondary">{property.city}</Typography>
                    </Box>
                  </Box>

                  {/* University */}
                  <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">Near</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{property.universityNearby}</Typography>
                    {property.distanceFromCampus != null && (
                      <Typography variant="caption" color="text.secondary">{property.distanceFromCampus} km from campus</Typography>
                    )}
                  </Box>

                  {/* Pricing */}
                  <Box sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.100', borderRadius: 1, p: 2, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">Monthly Rent</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', my: 0.5 }}>
                      R{property.price.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{property.roomType} room</Typography>
                  </Box>

                  {/* NSFAS */}
                  {property.nsfasAccredited && (
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
                    <Typography variant="caption" color="text.secondary">Listed by</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{property.createdBy?.name ?? '—'}</Typography>
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
    </StudentLayout>
  );
}
