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
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

const DEFAULT_AMENITIES = ['WiFi','Parking','Gym','Laundry','Kitchen','TV Lounge','Garden','Security','DSTV','Water Heater'];
const UNIVERSITIES = ['University of Cape Town','Stellenbosch University','University of the Western Cape','University of Johannesburg','University of Pretoria','Wits University','University of KwaZulu-Natal','North West University','University of Free State','Rhodes University'];

interface RoomType { type: string; quantity: string; availableQuantity: string; pricePerMonth: string; description: string; leaseDuration: string; }

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const propertyId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [customAmenities, setCustomAmenities] = useState([...DEFAULT_AMENITIES]);
  const [newAmenityInput, setNewAmenityInput] = useState('');
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '', description: '', address: '', city: '', postalCode: '', university: '',
    minRent: '', maxRent: '', deposit: '', totalRooms: '', availableRooms: '',
    roomTypes: [] as RoomType[], amenities: [] as string[], nsfasAccreditation: false,
    isActive: true, images: [] as string[],
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) router.push('/');
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin' || !propertyId) return;
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const res = await api.get(`/admin/properties/${propertyId}`);
        const p = res.data.data;
        const propAmens = p.amenities || [];
        setCustomAmenities(Array.from(new Set([...DEFAULT_AMENITIES, ...propAmens])));
        setFormData({
          name: p.name, description: p.description, address: p.location.address,
          city: p.location.city, postalCode: p.location.postalCode || '', university: p.location.university,
          minRent: p.pricing.minRent.toString(), maxRent: p.pricing.maxRent.toString(), deposit: p.pricing.deposit.toString(),
          totalRooms: p.rooms.total.toString(), availableRooms: p.rooms.available.toString(),
          roomTypes: (p.roomTypes || []).map((rt: any) => ({ type: rt.type, quantity: rt.quantity.toString(), availableQuantity: rt.availableQuantity.toString(), pricePerMonth: rt.pricePerMonth.toString(), description: rt.description || '', leaseDuration: rt.leaseDuration || '' })),
          amenities: propAmens, nsfasAccreditation: p.nsfasAccreditation, isActive: p.isActive, images: p.images || [],
        });
      } catch (e: any) { setError(e.response?.data?.message || 'Failed to load property'); }
      finally { setLoadingData(false); }
    };
    fetchData();
  }, [isAuthenticated, user, propertyId]);

  if (isLoading || loadingData) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>;
  if (!isAuthenticated || user?.role !== 'admin') return null;

  const set = (field: string, value: any) => setFormData(p => ({ ...p, [field]: value }));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    Promise.all(files.map(f => new Promise<string>(res => { const r = new FileReader(); r.onloadend = () => res(r.result as string); r.readAsDataURL(f); }))).then(p => setImagePreviews(prev => [...prev, ...p]));
    setNewImages(prev => [...prev, ...files]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.description || !formData.address || !formData.city || !formData.university || !formData.minRent || !formData.maxRent || !formData.deposit || !formData.totalRooms || formData.availableRooms === '') { setError('Please fill in all required fields'); return; }
    const avail = parseInt(formData.availableRooms), total = parseInt(formData.totalRooms);
    if (avail > total) { setError('Available rooms cannot exceed total rooms'); return; }
    if (formData.roomTypes.length > 0) {
      for (const rt of formData.roomTypes) { if (!rt.type || !rt.quantity || rt.quantity === '0' || !rt.leaseDuration) { setError('Please fill in all room type fields'); return; } }
      const qty = formData.roomTypes.reduce((s, rt) => s + parseInt(rt.quantity || '0'), 0);
      if (qty !== total) { setError(`Room types total (${qty}) must equal total rooms (${total})`); return; }
    }
    setLoading(true);
    try {
      const res = await api.put(`/admin/properties/${propertyId}`, { name: formData.name, description: formData.description, address: formData.address, city: formData.city, postalCode: formData.postalCode, university: formData.university, minRent: parseInt(formData.minRent), maxRent: parseInt(formData.maxRent), deposit: parseInt(formData.deposit), totalRooms: total, availableRooms: avail, roomTypes: formData.roomTypes.length > 0 ? formData.roomTypes : undefined, amenities: formData.amenities, nsfasAccreditation: formData.nsfasAccreditation, isActive: formData.isActive, images: formData.images });
      if (!res.data.success) { setError('Failed to update property'); return; }
      if (newImages.length > 0) {
        setUploadingImage(true);
        const uploaded: string[] = [];
        for (const file of newImages) { try { const fd = new FormData(); fd.append('file', file); const up = await api.post(`/admin/properties/${propertyId}/upload-image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); if (up.data.imageUrl) uploaded.push(up.data.imageUrl); } catch {} }
        if (uploaded.length) await api.put(`/admin/properties/${propertyId}`, { images: [...formData.images, ...uploaded] });
        setUploadingImage(false);
      }
      router.push('/admin/properties');
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to update property'); }
    finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 760, mx: 'auto' }}>
        <Stack direction="row" sx={{  justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Edit Property</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Update your accommodation listing</Typography>
          </Box>
          <Button variant="outlined" onClick={() => router.push('/admin/properties')}>Cancel</Button>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Paper variant="outlined" sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
          <Typography variant="subtitle1"  sx={{ mb: 2, fontWeight: 700 }}>Basic Information</Typography>
          <Stack sx={{ gap: 2.5 }}>
            <TextField required label="Property Name" value={formData.name} onChange={e => set('name', e.target.value)} fullWidth />
            <TextField required label="Description" multiline rows={4} value={formData.description} onChange={e => set('description', e.target.value)} fullWidth />
          </Stack>

          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1"  sx={{ mb: 2, fontWeight: 700 }}>Location</Typography>
          <Stack sx={{ gap: 2.5 }}>
            <TextField required label="Address" value={formData.address} onChange={e => set('address', e.target.value)} fullWidth />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField required label="City" value={formData.city} onChange={e => set('city', e.target.value)} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Postal Code" value={formData.postalCode} onChange={e => set('postalCode', e.target.value)} fullWidth /></Grid>
            </Grid>
            <FormControl required fullWidth>
              <InputLabel>Nearby University</InputLabel>
              <Select label="Nearby University" value={formData.university} onChange={e => set('university', e.target.value)}>
                {UNIVERSITIES.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>

          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1"  sx={{ mb: 2, fontWeight: 700 }}>Pricing (R)</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField required type="number" label="Min Rent" value={formData.minRent} onChange={e => set('minRent', e.target.value)} fullWidth /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField required type="number" label="Max Rent" value={formData.maxRent} onChange={e => set('maxRent', e.target.value)} fullWidth /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField required type="number" label="Deposit" value={formData.deposit} onChange={e => set('deposit', e.target.value)} fullWidth /></Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1"  sx={{ mb: 2, fontWeight: 700 }}>Rooms</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }} >
            <Grid size={{ xs: 12, sm: 6 }}><TextField required type="number" label="Total Rooms" value={formData.totalRooms} onChange={e => set('totalRooms', e.target.value)} fullWidth /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField required type="number" label="Available Rooms" value={formData.availableRooms} onChange={e => set('availableRooms', e.target.value)} fullWidth /></Grid>
          </Grid>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" sx={{  justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} >Room Types (optional)</Typography>
              <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => set('roomTypes', [...formData.roomTypes, { type: '', quantity: '', availableQuantity: '', pricePerMonth: '', description: '', leaseDuration: '' }])}>Add Room Type</Button>
            </Stack>
            {formData.roomTypes.length === 0 ? (
              <Typography variant="caption" color="text.secondary">No room types configured.</Typography>
            ) : formData.roomTypes.map((rt, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
                <Stack direction="row" sx={{  justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} >Room Type {i + 1}</Typography>
                  <IconButton size="small" color="error" onClick={() => set('roomTypes', formData.roomTypes.filter((_, j) => j !== i))}><DeleteRoundedIcon fontSize="small" /></IconButton>
                </Stack>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}><TextField size="small" label="Type" value={rt.type} onChange={e => { const u = [...formData.roomTypes]; u[i] = { ...u[i], type: e.target.value }; set('roomTypes', u); }} fullWidth /></Grid>
                  <Grid size={{ xs: 6, sm: 3 }}><TextField size="small" type="number" label="Qty" value={rt.quantity} onChange={e => { const u = [...formData.roomTypes]; u[i] = { ...u[i], quantity: e.target.value }; set('roomTypes', u); }} fullWidth /></Grid>
                  <Grid size={{ xs: 6, sm: 3 }}><TextField size="small" type="number" label="Available" value={rt.availableQuantity} onChange={e => { const u = [...formData.roomTypes]; u[i] = { ...u[i], availableQuantity: e.target.value }; set('roomTypes', u); }} fullWidth /></Grid>
                  <Grid size={{ xs: 12, sm: 6 }}><TextField size="small" type="number" label="Price/Month (R)" value={rt.pricePerMonth} onChange={e => { const u = [...formData.roomTypes]; u[i] = { ...u[i], pricePerMonth: e.target.value }; set('roomTypes', u); }} fullWidth /></Grid>
                  <Grid size={{ xs: 12, sm: 6 }}><TextField size="small" label="Lease Duration" value={rt.leaseDuration} onChange={e => { const u = [...formData.roomTypes]; u[i] = { ...u[i], leaseDuration: e.target.value }; set('roomTypes', u); }} fullWidth /></Grid>
                  <Grid size={{ xs: 12 }}><TextField size="small" label="Description (optional)" value={rt.description} onChange={e => { const u = [...formData.roomTypes]; u[i] = { ...u[i], description: e.target.value }; set('roomTypes', u); }} fullWidth /></Grid>
                </Grid>
              </Paper>
            ))}
          </Paper>

          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1"  sx={{ mb: 2, fontWeight: 700 }}>Amenities</Typography>
          <Stack direction="row" sx={{ mb: 2, gap: 1 }}>
            <TextField size="small" label="Add amenity" value={newAmenityInput} onChange={e => setNewAmenityInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newAmenityInput.trim() && !customAmenities.includes(newAmenityInput.trim())) { setCustomAmenities(p => [...p, newAmenityInput.trim()]); setNewAmenityInput(''); } }}} sx={{ flexGrow: 1 }} />
            <Button variant="outlined" onClick={() => { if (newAmenityInput.trim() && !customAmenities.includes(newAmenityInput.trim())) { setCustomAmenities(p => [...p, newAmenityInput.trim()]); setNewAmenityInput(''); } }}>Add</Button>
          </Stack>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {customAmenities.map(a => (
              <Chip key={a} label={a} onClick={() => set('amenities', formData.amenities.includes(a) ? formData.amenities.filter(x => x !== a) : [...formData.amenities, a])} color={formData.amenities.includes(a) ? 'primary' : 'default'} variant={formData.amenities.includes(a) ? 'filled' : 'outlined'} onDelete={() => setCustomAmenities(p => p.filter(x => x !== a))} deleteIcon={<CloseRoundedIcon />} size="small" />
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1"  sx={{ mb: 2, fontWeight: 700 }}>Images</Typography>
          {formData.images.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {formData.images.map((src, i) => (
                <Box key={i} sx={{ position: 'relative' }}>
                  <Box component="img" src={src} sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }} />
                  <IconButton size="small" sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'error.main', color: '#fff', '&:hover': { bgcolor: 'error.dark' }, p: 0.25 }} onClick={() => set('images', formData.images.filter((_, j) => j !== i))}><CloseRoundedIcon sx={{ fontSize: 14 }} /></IconButton>
                </Box>
              ))}
            </Box>
          )}
          {imagePreviews.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {imagePreviews.map((src, i) => (
                <Box key={i} sx={{ position: 'relative' }}>
                  <Box component="img" src={src} sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1, border: '2px solid', borderColor: 'primary.main' }} />
                  <IconButton size="small" sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'error.main', color: '#fff', '&:hover': { bgcolor: 'error.dark' }, p: 0.25 }} onClick={() => { setImagePreviews(p => p.filter((_, j) => j !== i)); setNewImages(p => p.filter((_, j) => j !== i)); }}><CloseRoundedIcon sx={{ fontSize: 14 }} /></IconButton>
                </Box>
              ))}
            </Box>
          )}
          <Button variant="outlined" component="label" disabled={uploadingImage}>
            Add More Images
            <input type="file" hidden multiple accept="image/*" onChange={handleImageSelect} />
          </Button>

          <Divider sx={{ my: 3 }} />
          <Stack sx={{ gap: 1 }}>
            <FormControlLabel control={<Checkbox checked={formData.nsfasAccreditation} onChange={e => set('nsfasAccreditation', e.target.checked)} />} label="NSFAS Accredited" />
            <FormControlLabel control={<Checkbox checked={formData.isActive} onChange={e => set('isActive', e.target.checked)} />} label="Active (visible to students)" />
          </Stack>

          <Divider sx={{ my: 3 }} />
          <Stack direction="row" sx={{ gap: 2 }}>
            <Button type="submit" variant="contained" disabled={loading || uploadingImage} startIcon={loading || uploadingImage ? <CircularProgress size={16} /> : undefined} sx={{ flex: 1 }}>
              {loading ? 'Saving…' : uploadingImage ? 'Uploading…' : 'Save Changes'}
            </Button>
            <Button variant="outlined" onClick={() => router.push('/admin/properties')} sx={{ flex: 1 }}>Cancel</Button>
          </Stack>
        </Paper>
      </Box>
    </AdminLayout>
  );
}
