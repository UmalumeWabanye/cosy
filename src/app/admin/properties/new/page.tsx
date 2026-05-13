'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import Collapse from '@mui/material/Collapse';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import BedRoundedIcon from '@mui/icons-material/BedRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_AMENITIES = ['WiFi','Parking','Gym','Laundry','Kitchen','TV Lounge','Garden','Security','DSTV','Water Heater'];
const UNIVERSITIES = ['University of Cape Town','Stellenbosch University','University of the Western Cape','University of Johannesburg','University of Pretoria','Wits University','University of KwaZulu-Natal','North West University','University of Free State','Rhodes University'];

const STEPS = [
  { label: 'Basics',    icon: <HomeWorkRoundedIcon sx={{ fontSize: 18 }} />,      desc: 'Name & description' },
  { label: 'Location',  icon: <LocationOnRoundedIcon sx={{ fontSize: 18 }} />,    desc: 'Address & university' },
  { label: 'Pricing',   icon: <AttachMoneyRoundedIcon sx={{ fontSize: 18 }} />,   desc: 'Rent & deposit' },
  { label: 'Rooms',     icon: <BedRoundedIcon sx={{ fontSize: 18 }} />,           desc: 'Room types & capacity' },
  { label: 'Amenities', icon: <StarRoundedIcon sx={{ fontSize: 18 }} />,          desc: 'Features & perks' },
  { label: 'Photos',    icon: <PhotoCameraRoundedIcon sx={{ fontSize: 18 }} />,   desc: 'Upload images' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface RoomType { type: string; quantity: string; availableQuantity: string; pricePerMonth: string; description: string; leaseDuration: string; }

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current, total, steps }: { current: number; total: number; steps: typeof STEPS }) {
  const pct = Math.round(((current) / total) * 100);
  return (
    <Box sx={{ mb: 4 }}>
      {/* Step chips */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <Box key={s.label} sx={{
              display: 'flex', alignItems: 'center', gap: 0.75,
              px: 1.5, py: 0.6, borderRadius: 6,
              transition: 'all 0.25s ease',
              bgcolor: done ? '#e8f5e9' : active ? '#e3f2fd' : 'transparent',
              border: '1.5px solid',
              borderColor: done ? '#a5d6a7' : active ? '#90caf9' : 'divider',
            }}>
              {done
                ? <CheckRoundedIcon sx={{ fontSize: 14, color: '#2e7d32' }} />
                : <Box sx={{ color: active ? '#1565c0' : 'text.disabled', display: 'flex' }}>{s.icon}</Box>
              }
              <Typography variant="caption" sx={{
                fontWeight: 600, fontSize: 12,
                color: done ? '#2e7d32' : active ? '#1565c0' : 'text.disabled',
              }}>
                {s.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Progress bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1, bgcolor: '#e3f2fd', borderRadius: 4, height: 6, overflow: 'hidden' }}>
          <Box sx={{
            height: '100%', borderRadius: 4,
            background: 'linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)',
            width: `${pct}%`,
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1565c0', minWidth: 36, textAlign: 'right' }}>
          {pct}%
        </Typography>
      </Box>

      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.75, display: 'block' }}>
        Step {current + 1} of {total} — {steps[current]?.desc}
      </Typography>
    </Box>
  );
}

// ─── Empty state for room types ───────────────────────────────────────────────
function RoomTypesEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <Box sx={{ textAlign: 'center', py: 5, px: 3, border: '1.5px dashed', borderColor: 'divider', borderRadius: 3 }}>
      <BedRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1.5 }} />
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>No room types added yet</Typography>
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>
        Add specific room types to help students filter exactly what they need.
      </Typography>
      <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={onAdd} sx={{ textTransform: 'none', fontWeight: 600 }}>
        Add Room Type
      </Button>
    </Box>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function FormSkeleton() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 760, mx: 'auto' }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Skeleton variant="text" width={180} height={36} sx={{ borderRadius: 1 }} />
          <Skeleton variant="text" width={260} height={20} sx={{ borderRadius: 1 }} />
        </Box>
        <Skeleton variant="rounded" width={80} height={34} sx={{ borderRadius: 2 }} />
      </Stack>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} variant="rounded" width={90} height={30} sx={{ borderRadius: 6 }} />)}
        </Box>
        <Skeleton variant="rounded" height={6} sx={{ borderRadius: 4, mb: 1 }} />
        <Skeleton variant="text" width={200} height={16} />
      </Box>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Skeleton variant="text" width={160} height={28} sx={{ mb: 2 }} />
        <Stack spacing={2.5}>
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
        </Stack>
      </Paper>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NewPropertyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [customAmenities, setCustomAmenities] = useState([...DEFAULT_AMENITIES]);
  const [newAmenityInput, setNewAmenityInput] = useState('');
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '', description: '', address: '', city: '', postalCode: '', university: '',
    minRent: '', maxRent: '', deposit: '', totalRooms: '', availableRooms: '',
    roomTypes: [] as RoomType[], amenities: [] as string[], nsfasAccreditation: false,
  });

  const set = (field: string, value: any) => setFormData(p => ({ ...p, [field]: value }));

  const changeStep = (next: number) => {
    setAnimating(true);
    setError('');
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 180);
  };

  const validateStep = (): string => {
    if (step === 0) {
      if (!formData.name.trim()) return 'Property name is required.';
      if (!formData.description.trim()) return 'Description is required.';
    }
    if (step === 1) {
      if (!formData.address.trim()) return 'Address is required.';
      if (!formData.city.trim()) return 'City is required.';
      if (!formData.university) return 'Please select a nearby university.';
    }
    if (step === 2) {
      if (!formData.minRent) return 'Minimum rent is required.';
      if (!formData.maxRent) return 'Maximum rent is required.';
      if (!formData.deposit) return 'Deposit amount is required.';
      if (parseInt(formData.minRent) > parseInt(formData.maxRent)) return 'Min rent cannot exceed max rent.';
    }
    if (step === 3) {
      if (!formData.totalRooms) return 'Total rooms is required.';
      if (formData.availableRooms === '') return 'Available rooms is required.';
      const avail = parseInt(formData.availableRooms), total = parseInt(formData.totalRooms);
      if (avail > total) return 'Available rooms cannot exceed total rooms.';
      if (formData.roomTypes.length > 0) {
        for (const rt of formData.roomTypes) {
          if (!rt.type || !rt.quantity || rt.quantity === '0' || !rt.leaseDuration)
            return 'Please fill in all room type fields (type, quantity, lease duration).';
        }
        const qty = formData.roomTypes.reduce((s, rt) => s + parseInt(rt.quantity || '0'), 0);
        if (qty !== parseInt(formData.totalRooms)) return `Room types total (${qty}) must equal total rooms (${formData.totalRooms}).`;
      }
    }
    return '';
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    if (step < STEPS.length - 1) changeStep(step + 1);
  };

  const handleBack = () => { if (step > 0) changeStep(step - 1); };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    Promise.all(files.map(f => new Promise<string>(res => {
      const r = new FileReader(); r.onloadend = () => res(r.result as string); r.readAsDataURL(f);
    }))).then(p => setImagePreviews(prev => [...prev, ...p]));
    setNewImages(prev => [...prev, ...files]);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/admin/properties', {
        name: formData.name, description: formData.description,
        address: formData.address, city: formData.city, postalCode: formData.postalCode,
        university: formData.university,
        minRent: parseInt(formData.minRent), maxRent: parseInt(formData.maxRent),
        deposit: parseInt(formData.deposit),
        totalRooms: parseInt(formData.totalRooms), availableRooms: parseInt(formData.availableRooms),
        roomTypes: formData.roomTypes.length > 0 ? formData.roomTypes : undefined,
        amenities: formData.amenities, nsfasAccreditation: formData.nsfasAccreditation,
      });
      if (!res.data.success) { setError('Failed to create property'); return; }
      const pid = res.data.data._id;
      if (newImages.length > 0) {
        setUploadingImage(true);
        const uploaded: string[] = [];
        for (const file of newImages) {
          try {
            const fd = new FormData(); fd.append('file', file);
            const up = await api.post(`/admin/properties/${pid}/upload-image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (up.data.imageUrl) uploaded.push(up.data.imageUrl);
          } catch {}
        }
        if (uploaded.length) await api.put(`/admin/properties/${pid}`, { images: uploaded });
        setUploadingImage(false);
      }
      setSuccess(true);
      setTimeout(() => router.push('/admin/properties'), 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <AdminLayout><FormSkeleton /></AdminLayout>;
  if (!isAuthenticated || user?.role !== 'admin') return null;

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) return (
    <AdminLayout>
      <Fade in>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2, textAlign: 'center', px: 4 }}>
          <Box sx={{
            width: 80, height: 80, borderRadius: '50%', bgcolor: '#e8f5e9',
            display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1,
          }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 44, color: '#2e7d32' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a2332' }}>Property Created!</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 340 }}>
            Your listing is live. Redirecting you to Properties…
          </Typography>
          <LinearProgress sx={{ width: 200, borderRadius: 4, mt: 1 }} />
        </Box>
      </Fade>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 760, mx: 'auto' }}>

        {/* Header */}
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a2332', letterSpacing: '-0.01em' }}>
              Add New Property
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Complete each section to publish your listing.
            </Typography>
          </Box>
          <Button
            variant="outlined" size="small"
            onClick={() => router.push('/admin/properties')}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Cancel
          </Button>
        </Stack>

        {/* Step indicator + progress */}
        <StepIndicator current={step} total={STEPS.length} steps={STEPS} />

        {/* Error */}
        <Collapse in={!!error}>
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>
        </Collapse>

        {/* Step panels */}
        <Fade in={!animating} timeout={220}>
          <Paper
            variant="outlined"
            sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3, borderColor: 'divider', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 24px rgba(21,101,192,0.07)' } }}
          >

            {/* ── STEP 0: Basics ──────────────────────────────────────── */}
            {step === 0 && (
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HomeWorkRoundedIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Basic Information</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Give your listing a clear name and description.</Typography>
                  </Box>
                </Box>
                <TextField
                  required label="Property Name" placeholder="e.g., Cosy Student Residence"
                  value={formData.name} onChange={e => set('name', e.target.value)}
                  fullWidth variant="outlined"
                  slotProps={{ htmlInput: { maxLength: 80 } }}
                  helperText={`${formData.name.length}/80`}
                />
                <TextField
                  required label="Description" placeholder="Describe your property — location benefits, safety features, nearby transport, etc."
                  multiline rows={5} value={formData.description} onChange={e => set('description', e.target.value)}
                  fullWidth variant="outlined"
                  slotProps={{ htmlInput: { maxLength: 1000 } }}
                  helperText={`${formData.description.length}/1000`}
                />
                <FormControlLabel
                  control={<Checkbox checked={formData.nsfasAccreditation} onChange={e => set('nsfasAccreditation', e.target.checked)} sx={{ color: '#1565c0' }} />}
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>NSFAS Accredited</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Check if your property qualifies for NSFAS-funded students</Typography>
                    </Box>
                  }
                />
              </Stack>
            )}

            {/* ── STEP 1: Location ────────────────────────────────────── */}
            {step === 1 && (
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LocationOnRoundedIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Location</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Where is the property located?</Typography>
                  </Box>
                </Box>
                <TextField required label="Street Address" placeholder="e.g., 123 Main Street" value={formData.address} onChange={e => set('address', e.target.value)} fullWidth />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 7 }}>
                    <TextField required label="City" value={formData.city} onChange={e => set('city', e.target.value)} fullWidth />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <TextField label="Postal Code" value={formData.postalCode} onChange={e => set('postalCode', e.target.value)} fullWidth />
                  </Grid>
                </Grid>
                <FormControl required fullWidth>
                  <InputLabel>Nearest University</InputLabel>
                  <Select label="Nearest University" value={formData.university} onChange={e => set('university', e.target.value)}>
                    {UNIVERSITIES.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
            )}

            {/* ── STEP 2: Pricing ─────────────────────────────────────── */}
            {step === 2 && (
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AttachMoneyRoundedIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Pricing</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>All amounts in South African Rand (R).</Typography>
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField required type="number" label="Min Rent / month" placeholder="e.g., 3500" value={formData.minRent} onChange={e => set('minRent', e.target.value)} fullWidth slotProps={{ input: { startAdornment: <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>R</Typography> } }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField required type="number" label="Max Rent / month" placeholder="e.g., 5500" value={formData.maxRent} onChange={e => set('maxRent', e.target.value)} fullWidth slotProps={{ input: { startAdornment: <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>R</Typography> } }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField required type="number" label="Deposit" placeholder="e.g., 5500" value={formData.deposit} onChange={e => set('deposit', e.target.value)} fullWidth slotProps={{ input: { startAdornment: <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>R</Typography> } }} />
                  </Grid>
                </Grid>
                {formData.minRent && formData.maxRent && (
                  <Fade in>
                    <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #90caf9' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1565c0' }}>
                        Rent range: R{parseInt(formData.minRent).toLocaleString()} – R{parseInt(formData.maxRent).toLocaleString()} / month
                      </Typography>
                    </Box>
                  </Fade>
                )}
              </Stack>
            )}

            {/* ── STEP 3: Rooms ───────────────────────────────────────── */}
            {step === 3 && (
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BedRoundedIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Rooms & Capacity</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Set capacity and optionally break down by room type.</Typography>
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField required type="number" label="Total Rooms" value={formData.totalRooms} onChange={e => set('totalRooms', e.target.value)} fullWidth />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField required type="number" label="Currently Available" value={formData.availableRooms} onChange={e => set('availableRooms', e.target.value)} fullWidth />
                  </Grid>
                </Grid>

                {/* Room types */}
                <Box>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Room Types <Typography component="span" variant="caption" sx={{ color: 'text.disabled' }}>(optional)</Typography></Typography>
                    {formData.roomTypes.length > 0 && (
                      <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => set('roomTypes', [...formData.roomTypes, { type: '', quantity: '', availableQuantity: '', pricePerMonth: '', description: '', leaseDuration: '' }])} sx={{ textTransform: 'none', fontWeight: 600 }}>
                        Add type
                      </Button>
                    )}
                  </Stack>

                  {formData.roomTypes.length === 0 ? (
                    <RoomTypesEmpty onAdd={() => set('roomTypes', [{ type: '', quantity: '', availableQuantity: '', pricePerMonth: '', description: '', leaseDuration: '' }])} />
                  ) : (
                    <Stack spacing={2}>
                      {formData.roomTypes.map((rt, i) => (
                        <Fade in key={i}>
                          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fafbff', borderColor: '#dde8f8' }}>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1565c0' }}>Room Type {i + 1}</Typography>
                              <Tooltip title="Remove this room type">
                                <IconButton size="small" color="error" onClick={() => set('roomTypes', formData.roomTypes.filter((_, j) => j !== i))}>
                                  <DeleteRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 6 }}><TextField size="small" label="Type" placeholder="e.g., Single, Double" value={rt.type} onChange={e => { const u = [...formData.roomTypes]; u[i] = { ...u[i], type: e.target.value }; set('roomTypes', u); }} fullWidth /></Grid>
                              <Grid size={{ xs: 6, sm: 3 }}><TextField size="small" type="number" label="Total qty" value={rt.quantity} onChange={e => { const u = [...formData.roomTypes]; u[i] = { ...u[i], quantity: e.target.value }; set('roomTypes', u); }} fullWidth /></Grid>
                              <Grid size={{ xs: 6, sm: 3 }}><TextField size="small" type="number" label="Available" value={rt.availableQuantity} onChange={e => { const u = [...formData.roomTypes]; u[i] = { ...u[i], availableQuantity: e.target.value }; set('roomTypes', u); }} fullWidth /></Grid>
                              <Grid size={{ xs: 12, sm: 6 }}><TextField size="small" type="number" label="Price/month (R)" value={rt.pricePerMonth} onChange={e => { const u = [...formData.roomTypes]; u[i] = { ...u[i], pricePerMonth: e.target.value }; set('roomTypes', u); }} fullWidth /></Grid>
                              <Grid size={{ xs: 12, sm: 6 }}><TextField size="small" label="Lease Duration" placeholder="e.g., 1 year, Flexible" value={rt.leaseDuration} onChange={e => { const u = [...formData.roomTypes]; u[i] = { ...u[i], leaseDuration: e.target.value }; set('roomTypes', u); }} fullWidth /></Grid>
                              <Grid size={{ xs: 12 }}><TextField size="small" label="Description (optional)" value={rt.description} onChange={e => { const u = [...formData.roomTypes]; u[i] = { ...u[i], description: e.target.value }; set('roomTypes', u); }} fullWidth /></Grid>
                            </Grid>
                          </Paper>
                        </Fade>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Stack>
            )}

            {/* ── STEP 4: Amenities ───────────────────────────────────── */}
            {step === 4 && (
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <StarRoundedIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Amenities</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Select all that apply. Click a chip to toggle it.</Typography>
                  </Box>
                </Box>

                {formData.amenities.length > 0 && (
                  <Fade in>
                    <Box sx={{ px: 1.5, py: 1, bgcolor: '#e8f5e9', borderRadius: 2, border: '1px solid #a5d6a7' }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                        {formData.amenities.length} amenit{formData.amenities.length === 1 ? 'y' : 'ies'} selected
                      </Typography>
                    </Box>
                  </Fade>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {customAmenities.map(a => (
                    <Chip
                      key={a} label={a}
                      onClick={() => set('amenities', formData.amenities.includes(a) ? formData.amenities.filter(x => x !== a) : [...formData.amenities, a])}
                      color={formData.amenities.includes(a) ? 'primary' : 'default'}
                      variant={formData.amenities.includes(a) ? 'filled' : 'outlined'}
                      onDelete={() => setCustomAmenities(p => p.filter(x => x !== a))}
                      deleteIcon={<CloseRoundedIcon />}
                      size="medium"
                      sx={{ transition: 'all 0.15s ease' }}
                    />
                  ))}
                </Box>

                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small" label="Add custom amenity" value={newAmenityInput}
                    onChange={e => setNewAmenityInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newAmenityInput.trim() && !customAmenities.includes(newAmenityInput.trim())) {
                          setCustomAmenities(p => [...p, newAmenityInput.trim()]); setNewAmenityInput('');
                        }
                      }
                    }}
                    sx={{ flex: 1 }}
                  />
                  <Button variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}
                    onClick={() => { if (newAmenityInput.trim() && !customAmenities.includes(newAmenityInput.trim())) { setCustomAmenities(p => [...p, newAmenityInput.trim()]); setNewAmenityInput(''); } }}>
                    Add
                  </Button>
                </Stack>
              </Stack>
            )}

            {/* ── STEP 5: Photos ──────────────────────────────────────── */}
            {step === 5 && (
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PhotoCameraRoundedIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Property Photos</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Photos significantly increase enquiries. This step is optional.</Typography>
                  </Box>
                </Box>

                {imagePreviews.length === 0 ? (
                  <Box
                    component="label"
                    sx={{
                      border: '2px dashed', borderColor: '#90caf9', borderRadius: 3,
                      textAlign: 'center', py: 6, px: 3, cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#e3f2fd', borderColor: '#1565c0' },
                    }}
                  >
                    <input type="file" hidden multiple accept="image/*" onChange={handleImageSelect} />
                    <CloudUploadRoundedIcon sx={{ fontSize: 44, color: '#90caf9', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1565c0', mb: 0.5 }}>Click to upload photos</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>JPG, PNG, WEBP — up to 10 files</Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 1.5 }}>
                      {imagePreviews.map((src, i) => (
                        <Fade in key={i}>
                          <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', aspectRatio: '4/3' }}>
                            <Box component="img" src={src} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            <IconButton
                              size="small"
                              sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', p: 0.4, '&:hover': { bgcolor: 'error.main' } }}
                              onClick={() => { setImagePreviews(p => p.filter((_, j) => j !== i)); setNewImages(p => p.filter((_, j) => j !== i)); }}
                            >
                              <CloseRoundedIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                            {i === 0 && <Chip label="Cover" size="small" sx={{ position: 'absolute', bottom: 4, left: 4, bgcolor: '#1565c0', color: '#fff', fontSize: 10, height: 20 }} />}
                          </Box>
                        </Fade>
                      ))}
                      <Box
                        component="label"
                        sx={{ border: '2px dashed', borderColor: '#90caf9', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '4/3', cursor: 'pointer', '&:hover': { bgcolor: '#e3f2fd' }, transition: '0.2s' }}
                      >
                        <input type="file" hidden multiple accept="image/*" onChange={handleImageSelect} />
                        <AddRoundedIcon sx={{ color: '#90caf9', fontSize: 28 }} />
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{imagePreviews.length} photo{imagePreviews.length !== 1 ? 's' : ''} selected</Typography>
                  </>
                )}
              </Stack>
            )}

          </Paper>
        </Fade>

        {/* Navigation buttons */}
        <Stack direction="row" sx={{ mt: 3, gap: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined" startIcon={<ArrowBackRoundedIcon />}
            onClick={handleBack} disabled={step === 0}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, minWidth: 120 }}
          >
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              variant="contained" endIcon={<ArrowForwardRoundedIcon />}
              onClick={handleNext}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, minWidth: 140, bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' } }}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || uploadingImage}
              startIcon={loading || uploadingImage ? <CircularProgress size={16} color="inherit" /> : <CheckCircleRoundedIcon />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, minWidth: 180, bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' } }}
            >
              {loading ? 'Creating…' : uploadingImage ? 'Uploading photos…' : 'Create Property'}
            </Button>
          )}
        </Stack>

      </Box>
    </AdminLayout>
  );
}
