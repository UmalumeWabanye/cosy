'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import StudentLayout from '@/components/student/StudentLayout';
import SaveButton from '@/components/SaveButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Rating from '@mui/material/Rating';
import Chip from '@mui/material/Chip';
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
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import api from '@/services/api';

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <WifiIcon />, Parking: <LocalParkingIcon />, Gym: <FitnessCenterIcon />,
  Laundry: <LocalLaundryServiceIcon />, Kitchen: <KitchenIcon />, 'TV Lounge': <TvIcon />,
  Garden: <NatureIcon />, Security: <LockIcon />, 'Water Heater': <ShowerIcon />, DSTV: <SatelliteIcon />,
};

interface Property {
  _id: string;
  propertyName: string;
  name?: string;
  description: string;
  city: string;
  address: string;
  universityNearby: string;
  price: number;
  roomType: string;
  nsfasAccredited: boolean;
  images: Array<{ url?: string; publicId?: string } | string>;
  amenities: string[];
  distanceFromCampus?: number;
  isAvailable: boolean;
  transportation?: {
    enabled?: boolean;
    mode?: 'none' | 'private' | 'campus_route' | 'both';
    providerName?: string;
    contact?: string;
    notes?: string;
    schedules?: Array<{
      routeName?: string;
      pickupFromResidence?: string;
      departureToCampus?: string;
      returnPickupFromCampus?: string;
      arrivalAtResidence?: string;
      days?: string[];
    }>;
  };
  createdBy: { _id?: string; name?: string; email?: string; avatar?: string };
  createdAt: string;
}

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  student: { name?: string };
}

export default function PropertyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewsTotal, setReviewsTotal] = useState(0);

  const propertyId = params.id as string;

  const fetchReviews = async (id: string) => {
    try {
      const res = await api.get(`/reviews/property/${id}`);
      setReviews(res.data.data ?? []);
      setAvgRating(res.data.avgRating ?? null);
      setReviewsTotal(res.data.total ?? 0);
    } catch { /* silent — reviews are supplementary */ }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/properties/${propertyId}`);
        setProperty(response.data);
        await fetchReviews(propertyId);
      } catch (err: unknown) {
        const message = typeof err === 'object' && err && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
        setError(message || 'Failed to load property');
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

  const handleMessageOwner = async () => {
    if (!isAuthenticated) { router.push('/'); return; }
    const recipientId = property?.createdBy?._id;
    if (!recipientId) return;
    try {
      const created = await api.post('/messages', { recipientId, propertyId });
      const conversationId = created?.data?.data?._id;
      router.push(conversationId ? `/messages?conversationId=${conversationId}` : '/messages');
    } catch {
      router.push('/messages');
    }
  };

  const handleBookViewing = () => {
    if (!isAuthenticated) { router.push('/'); return; }
    router.push(`/viewings?propertyId=${propertyId}`);
  };

  const getImageUrl = (image?: { url?: string } | string) => {
    if (!image) return '';
    return typeof image === 'string' ? image : image.url || '';
  };

  const propertyName = property.propertyName || property.name || 'Accommodation';
  const transportModeLabel =
    property.transportation?.mode === 'private'
      ? 'Private residence transport'
      : property.transportation?.mode === 'campus_route'
        ? 'Campus shuttle route'
        : property.transportation?.mode === 'both'
          ? 'Private and campus-route transport'
          : 'Transport support';

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
                        src={getImageUrl(property.images[activeImageIndex])}
                        alt={propertyName}
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
                            <img src={getImageUrl(img)} alt={`${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

              {property.transportation?.enabled && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Transportation Schedule</Typography>
                    <Chip size="small" color="secondary" label={transportModeLabel} sx={{ mb: 1.5, fontWeight: 700 }} />

                    {(property.transportation.providerName || property.transportation.contact) && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {property.transportation.providerName ? `Provider: ${property.transportation.providerName}` : ''}
                        {property.transportation.providerName && property.transportation.contact ? ' · ' : ''}
                        {property.transportation.contact ? `Contact: ${property.transportation.contact}` : ''}
                      </Typography>
                    )}

                    {property.transportation.notes && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {property.transportation.notes}
                      </Typography>
                    )}

                    {property.transportation.schedules?.length ? (
                      <Stack sx={{ gap: 1.25 }}>
                        {property.transportation.schedules.map((schedule, index) => (
                          <Box key={`${schedule.routeName || 'route'}-${index}`} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {schedule.routeName || `Route ${index + 1}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {schedule.days?.length ? `Days: ${schedule.days.join(', ')}` : 'Days: Not specified'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              To campus: {schedule.pickupFromResidence || 'Residence pickup TBD'}
                              {schedule.departureToCampus ? ` at ${schedule.departureToCampus}` : ''}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Return: {schedule.returnPickupFromCampus || 'Campus pickup TBD'}
                              {schedule.arrivalAtResidence ? `, arrives ${schedule.arrivalAtResidence}` : ''}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Transport is available for this residence. Contact the provider for full departure and return times.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )}

                  {/* Reviews */}
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Student Reviews</Typography>
                    {reviewsTotal > 0 && avgRating !== null && (
                      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                        <Rating value={avgRating} precision={0.1} readOnly size="small" />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{avgRating.toFixed(1)}</Typography>
                        <Typography variant="caption" color="text.secondary">({reviewsTotal} {reviewsTotal === 1 ? 'review' : 'reviews'})</Typography>
                      </Stack>
                    )}
                  </Stack>

                  {reviews.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <StarRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary" variant="body2">No reviews yet</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reviews are submitted by students who completed their stay here.
                      </Typography>
                    </Box>
                  ) : (
                    <Stack sx={{ gap: 0 }}>
                      {reviews.map((review, i) => (
                        <Box key={review._id}>
                          {i > 0 && <Divider sx={{ my: 2 }} />}
                          <Stack direction="row" sx={{ gap: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36, fontSize: 13, bgcolor: 'primary.light', color: 'primary.dark', flexShrink: 0 }}>
                              {(review.student?.name || 'S')[0].toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {review.student?.name || 'Student'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(review.createdAt).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}
                                </Typography>
                              </Stack>
                              <Rating value={review.rating} readOnly size="small" sx={{ mb: review.comment ? 0.75 : 0 }} />
                              {review.comment && (
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mt: 0.5 }}>
                                  {review.comment}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>
                <CardContent>
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{propertyName}</Typography>
                    <SaveButton propertyId={propertyId} size="small" />
                  </Stack>
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
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary">{property.roomType} room</Typography>
                      {avgRating !== null && (
                        <Chip
                          icon={<StarRoundedIcon sx={{ fontSize: '14px !important', color: '#f59e0b !important' }} />}
                          label={`${avgRating.toFixed(1)} (${reviewsTotal})`}
                          size="small"
                          sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: '#fef3c7', color: '#92400e' }}
                        />
                      )}
                    </Stack>
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
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Avatar src={property.createdBy?.avatar || undefined} sx={{ width: 32, height: 32, fontSize: 12 }}>
                        {(property.createdBy?.name || 'L')[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{property.createdBy?.name ?? '—'}</Typography>
                        <Typography variant="caption" color="text.secondary">{property.createdBy?.email || ''}</Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Button onClick={handleApplyClick} variant="contained" fullWidth sx={{ mb: 1, textTransform: 'none', fontWeight: 700, py: 1.5 }}>
                    Apply Now
                  </Button>
                  <Button onClick={handleBookViewing} variant="outlined" startIcon={<EventAvailableRoundedIcon />} fullWidth sx={{ textTransform: 'none', mb: 1 }}>
                    Book Viewing
                  </Button>
                  <Button onClick={handleMessageOwner} variant="outlined" startIcon={<ChatRoundedIcon />} fullWidth sx={{ textTransform: 'none', mb: 1 }}>
                    Message Owner
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
