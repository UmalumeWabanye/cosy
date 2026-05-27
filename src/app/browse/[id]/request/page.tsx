'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import StudentLayout from '@/components/student/StudentLayout';
import api from '@/services/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { trackEvent } from '@/utils/analytics';

interface Property {
  _id: string;
  propertyName: string;
  city: string;
  address: string;
  universityNearby: string;
  price: number;
  roomType: string;
  nsfasAccredited: boolean;
  images: { url: string }[];
  isAvailable: boolean;
}

export default function RequestPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const propertyId = params.id as string;
  const source = searchParams.get('source') || 'direct';

  const [property, setProperty] = useState<Property | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    moveInDate: '',
    leaseDuration: '12',
    fundingType: '',
    message: '',
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'student')) router.push('/');
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/properties/${propertyId}`);
        setProperty(res.data);
      } catch {
        setError('Failed to load property.');
      } finally {
        setLoadingProperty(false);
      }
    };
    if (propertyId) fetch();
  }, [propertyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.moveInDate || !form.fundingType) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/requests', {
        property: propertyId,
        moveInDate: form.moveInDate,
        leaseDuration: Number(form.leaseDuration),
        fundingType: form.fundingType,
        message: form.message,
      });
      trackEvent('application-submit', {
        propertyId,
        source,
        fundingType: form.fundingType,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loadingProperty) {
    return (
      <StudentLayout>
        <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </StudentLayout>
    );
  }

  if (submitted) {
    return (
      <StudentLayout>
        <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <Card variant="outlined" sx={{ maxWidth: 480, width: '100%', textAlign: 'center', p: 4, borderRadius: 3 }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Application Submitted!</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Your application for <strong>{property?.propertyName}</strong> has been sent. You'll be notified when the landlord responds.
            </Typography>
            <Stack spacing={1.5}>
              <Button variant="contained" onClick={() => router.push('/applications')} sx={{ textTransform: 'none', fontWeight: 600 }}>
                View My Applications
              </Button>
              <Button variant="outlined" onClick={() => router.push('/browse')} sx={{ textTransform: 'none' }}>
                Browse More Properties
              </Button>
            </Stack>
          </Card>
        </Box>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 960, mx: 'auto' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Apply for Accommodation</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Fill in the details below to submit your application.</Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
          {/* Property summary card */}
          {property && (
            <Card variant="outlined" sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0, borderRadius: 2 }}>
              {property.images?.[0]?.url && (
                <Box sx={{ height: 160, overflow: 'hidden' }}>
                  <img src={property.images[0].url} alt={property.propertyName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              )}
              {!property.images?.[0]?.url && (
                <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                  <ApartmentRoundedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                </Box>
              )}
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>{property.propertyName}</Typography>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 1 }}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">{property.address}, {property.city}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Near {property.universityNearby}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  <Chip label={`R${property.price.toLocaleString()}/mo`} size="small" color="primary" variant="outlined" />
                  <Chip label={property.roomType} size="small" variant="outlined" />
                  {property.nsfasAccredited && <Chip label="NSFAS" size="small" color="success" />}
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1, width: '100%' }}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Stack spacing={2.5}>
                  {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                  <TextField
                    label="Preferred Move-in Date"
                    name="moveInDate"
                    type="date"
                    value={form.moveInDate}
                    onChange={handleChange}
                    required
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: new Date().toISOString().split('T')[0] } }}
                  />

                  <TextField
                    label="Lease Duration (months)"
                    name="leaseDuration"
                    select
                    value={form.leaseDuration}
                    onChange={handleChange}
                    required
                    fullWidth
                  >
                    {[3, 6, 9, 12, 24].map(m => (
                      <MenuItem key={m} value={String(m)}>{m} months</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Funding Type"
                    name="fundingType"
                    select
                    value={form.fundingType}
                    onChange={handleChange}
                    required
                    fullWidth
                  >
                    <MenuItem value="NSFAS">NSFAS</MenuItem>
                    <MenuItem value="Private">Private / Bursary</MenuItem>
                    <MenuItem value="Self-funded">Self-funded</MenuItem>
                  </TextField>

                  <TextField
                    label="Message to Landlord (optional)"
                    name="message"
                    multiline
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Introduce yourself, mention your course, any special requirements…"
                  />

                  <Stack direction="row" spacing={1.5}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      sx={{ textTransform: 'none', fontWeight: 700, flex: 1, py: 1.5 }}
                    >
                      {submitting ? <CircularProgress size={20} color="inherit" /> : 'Submit Application'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => router.back()}
                      sx={{ textTransform: 'none' }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Box>
    </StudentLayout>
  );
}
