'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

const ROOM_TYPES = ['Single', 'Sharing', 'Ensuite', 'Bachelor'];

export default function NewLandlordPropertyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    propertyName: '',
    city: '',
    address: '',
    universityNearby: '',
    price: '',
    roomType: 'Single',
    description: '',
    distanceFromCampus: '',
    amenities: '',
    nsfasAccredited: false,
    isAvailable: true,
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'landlord')) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.propertyName || !form.city || !form.address || !form.universityNearby || !form.price || !form.roomType) {
      setError('Please fill all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post('/properties', {
        propertyName: form.propertyName,
        city: form.city,
        address: form.address,
        universityNearby: form.universityNearby,
        price: Number(form.price),
        roomType: form.roomType,
        description: form.description || undefined,
        distanceFromCampus: form.distanceFromCampus ? Number(form.distanceFromCampus) : undefined,
        amenities: form.amenities
          ? form.amenities.split(',').map((item) => item.trim()).filter(Boolean)
          : [],
        nsfasAccredited: form.nsfasAccredited,
        isAvailable: form.isAvailable,
      });
      router.push('/landlord/properties');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return null;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3, gap: 1.5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Add Property</Typography>
          <Typography variant="body2" color="text.secondary">This listing is owned by your landlord account only.</Typography>
        </Box>
        <Button variant="outlined" onClick={() => router.push('/landlord/properties')} sx={{ textTransform: 'none' }}>Cancel</Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, maxWidth: 860 }} component="form" onSubmit={submit}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack sx={{ gap: 2 }}>
          <TextField label="Property Name" required value={form.propertyName} onChange={(e) => setForm((prev) => ({ ...prev, propertyName: e.target.value }))} />
          <TextField label="Address" required value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}>
            <TextField label="City" required fullWidth value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
            <TextField label="Nearby University" required fullWidth value={form.universityNearby} onChange={(e) => setForm((prev) => ({ ...prev, universityNearby: e.target.value }))} />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}>
            <TextField label="Price (ZAR)" type="number" required fullWidth value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} />
            <TextField label="Room Type" select required fullWidth value={form.roomType} onChange={(e) => setForm((prev) => ({ ...prev, roomType: e.target.value }))}>
              {ROOM_TYPES.map((roomType) => <MenuItem key={roomType} value={roomType}>{roomType}</MenuItem>)}
            </TextField>
          </Stack>

          <TextField label="Distance From Campus (km)" type="number" value={form.distanceFromCampus} onChange={(e) => setForm((prev) => ({ ...prev, distanceFromCampus: e.target.value }))} />
          <TextField label="Amenities (comma separated)" value={form.amenities} onChange={(e) => setForm((prev) => ({ ...prev, amenities: e.target.value }))} />
          <TextField label="Description" multiline rows={4} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />

          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}>
            <FormControlLabel control={<Checkbox checked={form.nsfasAccredited} onChange={(e) => setForm((prev) => ({ ...prev, nsfasAccredited: e.target.checked }))} />} label="NSFAS Accredited" />
            <FormControlLabel control={<Checkbox checked={form.isAvailable} onChange={(e) => setForm((prev) => ({ ...prev, isAvailable: e.target.checked }))} />} label="Available" />
          </Stack>

          <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 1.25 }}>
            <Button variant="outlined" onClick={() => router.push('/landlord/properties')} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading} sx={{ textTransform: 'none', fontWeight: 700 }}>
              {loading ? <CircularProgress size={18} /> : 'Create Property'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
