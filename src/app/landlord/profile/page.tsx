'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import LandlordLayout from '@/components/landlord/LandlordLayout';
import api from '@/services/api';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape',
];

const PROPERTY_TYPES = [
  'Apartment / Flat', 'House / Townhouse', 'Student Accommodation',
  'Bachelor Unit', 'Shared Room / Commune', 'Mixed (multiple types)',
];

const UNIT_COUNTS = ['1', '2-5', '6-10', '11-20', '21-50', '50+'];

export default function LandlordProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState('');
  const [form, setForm] = useState({
    phone: '',
    whatsapp: '',
    city: '',
    province: '',
    propertyType: '',
    numberOfProperties: '',
    idNumber: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'landlord')) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, user?.role]);

  useEffect(() => {
    if (!user) return;
    setAvatarPreview(user.avatar ?? '');
    setForm({
      phone: user.phone ?? '',
      whatsapp: user.whatsapp ?? '',
      city: user.city ?? '',
      province: user.province ?? '',
      propertyType: user.propertyType ?? '',
      numberOfProperties: user.numberOfProperties ?? '',
      idNumber: user.idNumber ?? '',
    });
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const completionItems = [form.phone, form.whatsapp, form.city, form.province, form.propertyType, form.numberOfProperties, form.idNumber];
  const profileComplete = completionItems.every((value) => value.trim().length > 0);

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const payload: Record<string, string | boolean> = {
        ...form,
        profileComplete,
      };

      if (avatarPreview && avatarPreview !== user?.avatar) {
        payload.avatar = avatarPreview;
      }

      const res = await api.put('/auth/profile', payload);
      if (res.data?.user) {
        setUser(res.data.user);
      }
      setSuccess(profileComplete ? 'Verification profile updated.' : 'Profile saved. Complete the remaining items to finish verification.');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to update landlord profile.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return null;

  const initials = (user?.name ?? user?.email ?? 'L')[0].toUpperCase();

  return (
    <LandlordLayout>
      <Box className="modern-shell" sx={{ px: { xs: 2, md: 4 }, pt: { xs: 2, md: 3 }, pb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' }, mb: 3, gap: 1.5 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Landlord Profile</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your public verification details, contact information, and supply-side account identity.
            </Typography>
          </Box>
          <Chip
            color={profileComplete ? 'success' : 'warning'}
            icon={<VerifiedRoundedIcon />}
            label={profileComplete ? 'Verification Complete' : 'Verification Incomplete'}
          />
        </Stack>

        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card variant="outlined" className="glass-card" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack sx={{ alignItems: 'center', textAlign: 'center', gap: 1.5 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar src={avatarPreview || undefined} sx={{ width: 96, height: 96, fontSize: 34, fontWeight: 700, bgcolor: '#10b981' }}>
                      {!avatarPreview && initials}
                    </Avatar>
                    <Tooltip title="Change photo">
                      <IconButton
                        size="small"
                        onClick={() => fileInputRef.current?.click()}
                        sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'background.paper', boxShadow: 2 }}
                      >
                        <CameraAltRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                  </Box>

                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{user?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                  </Box>

                  <Paper variant="outlined" className="glass-card" sx={{ p: 2, width: '100%', textAlign: 'left', borderRadius: 2.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Verification Checklist</Typography>
                    <Stack sx={{ gap: 1 }}>
                      {[
                        ['Phone number', Boolean(form.phone)],
                        ['WhatsApp number', Boolean(form.whatsapp)],
                        ['City and province', Boolean(form.city && form.province)],
                        ['Property type', Boolean(form.propertyType)],
                        ['Portfolio size', Boolean(form.numberOfProperties)],
                        ['ID or passport number', Boolean(form.idNumber)],
                      ].map(([label, complete]) => (
                        <Stack key={String(label)} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">{label}</Typography>
                          <Chip
                            size="small"
                            color={complete ? 'success' : 'default'}
                            icon={complete ? <CheckCircleRoundedIcon /> : undefined}
                            label={complete ? 'Done' : 'Pending'}
                          />
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper variant="outlined" className="glass-card" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, '& .MuiOutlinedInput-root': { borderRadius: 1.75 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Verification Details</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.75 }}>Phone Number</FormLabel>
                    <TextField value={form.phone} size="small" placeholder="+27 81 234 5678" onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.75 }}>WhatsApp Number</FormLabel>
                    <TextField value={form.whatsapp} size="small" placeholder="+27 81 234 5678" onChange={(e) => setForm((current) => ({ ...current, whatsapp: e.target.value }))} />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.75 }}>City</FormLabel>
                    <TextField value={form.city} size="small" placeholder="Cape Town" onChange={(e) => setForm((current) => ({ ...current, city: e.target.value }))} />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.75 }}>Province</FormLabel>
                    <TextField select value={form.province} size="small" onChange={(e) => setForm((current) => ({ ...current, province: e.target.value }))}>
                      <MenuItem value=""><em>Select province</em></MenuItem>
                      {PROVINCES.map((province) => <MenuItem key={province} value={province}>{province}</MenuItem>)}
                    </TextField>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.75 }}>Property Type</FormLabel>
                    <TextField select value={form.propertyType} size="small" onChange={(e) => setForm((current) => ({ ...current, propertyType: e.target.value }))}>
                      <MenuItem value=""><em>Select type</em></MenuItem>
                      {PROPERTY_TYPES.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                    </TextField>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.75 }}>Portfolio Size</FormLabel>
                    <TextField select value={form.numberOfProperties} size="small" onChange={(e) => setForm((current) => ({ ...current, numberOfProperties: e.target.value }))}>
                      <MenuItem value=""><em>Select range</em></MenuItem>
                      {UNIT_COUNTS.map((count) => <MenuItem key={count} value={count}>{count}</MenuItem>)}
                    </TextField>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 0.75 }}>SA ID / Passport Number</FormLabel>
                    <TextField
                      value={form.idNumber}
                      size="small"
                      placeholder="9901015800085"
                      helperText="Used for verification and internal compliance only."
                      onChange={(e) => setForm((current) => ({ ...current, idNumber: e.target.value }))}
                    />
                  </FormControl>
                </Grid>
              </Grid>

              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 3, gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  Students will see a stronger trust signal once all verification fields are complete.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.75, boxShadow: '0 12px 24px rgba(4,120,87,0.18)', transition: 'transform 0.18s ease, box-shadow 0.18s ease', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 16px 30px rgba(4,120,87,0.22)' } }}
                >
                  {saving ? 'Saving...' : 'Save Verification Profile'}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </LandlordLayout>
  );
}