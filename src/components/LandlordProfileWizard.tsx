'use client';

import React, { useState, useRef } from 'react';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';

import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';

// ─── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  'Verify email',
  'Basic details',
  'Add a profile picture',
  'WhatsApp number',
  'Property information',
  'Identity information',
];

// ─── Province list ─────────────────────────────────────────────────────────────
const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape',
];

const PROPERTY_TYPES = [
  'Apartment / Flat', 'House / Townhouse', 'Student Accommodation',
  'Bachelor Unit', 'Shared Room / Commune', 'Mixed (multiple types)',
];

const UNIT_COUNTS = ['1', '2–5', '6–10', '11–20', '21–50', '50+'];

// ─── Step indicator item ───────────────────────────────────────────────────────
function StepItem({ label, index, currentStep }: { label: string; index: number; currentStep: number }) {
  const done = index < currentStep;
  const active = index === currentStep;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
      {done ? (
        <CheckCircleRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />
      ) : (
        <RadioButtonUncheckedRoundedIcon
          sx={{ color: active ? '#fff' : 'rgba(255,255,255,0.45)', fontSize: 22 }}
        />
      )}
      <Typography
        variant="body2"
        sx={{
          color: active ? '#fff' : done ? '#fff' : 'rgba(255,255,255,0.55)',
          fontWeight: active || done ? 700 : 400,
          fontSize: 14,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LandlordProfileWizard({ open, onClose }: Props) {
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [propertyType, setPropertyType] = useState('');
  const [numberOfProperties, setNumberOfProperties] = useState('');
  const [idNumber, setIdNumber] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLast = step === STEPS.length - 1;

  // Avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveToBackend = async (partial: Record<string, string | boolean>) => {
    try {
      const res = await api.put('/auth/profile', partial);
      if (res.data?.user) setUser({ ...user!, ...res.data.user });
    } catch {
      // non-critical, continue
    }
  };

  const handleNext = async () => {
    setError('');
    setLoading(true);
    try {
      if (step === 1) {
        if (!phone.trim() || !city.trim() || !province) {
          setError('Please fill in all fields.'); setLoading(false); return;
        }
        await saveToBackend({ phone, city, province });
      } else if (step === 2) {
        if (avatar) {
          // Upload avatar as base64 — backend Cloudinary or just stores URL
          await saveToBackend({ avatar });
        }
      } else if (step === 3) {
        const wa = sameAsPhone ? phone : whatsapp;
        if (!wa.trim()) { setError('Please enter a WhatsApp number.'); setLoading(false); return; }
        await saveToBackend({ whatsapp: wa });
      } else if (step === 4) {
        if (!propertyType || !numberOfProperties) {
          setError('Please fill in all fields.'); setLoading(false); return;
        }
        await saveToBackend({ propertyType, numberOfProperties });
      } else if (step === 5) {
        if (!idNumber.trim()) { setError('Please enter your ID or passport number.'); setLoading(false); return; }
        await saveToBackend({ idNumber, profileComplete: true });
      }

      if (isLast) {
        onClose();
      } else {
        setStep(s => s + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (isLast) { onClose(); } else { setStep(s => s + 1); }
  };

  // ─── Step content ────────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 4 }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: '50%',
              bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MarkEmailReadRoundedIcon sx={{ fontSize: 40, color: '#1976d2' }} />
            </Box>
            <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 320 }}>
              We've sent a confirmation email to <strong>{user?.email}</strong>. Please verify your email address to keep your account secure.
            </Typography>
            <Button variant="outlined" size="small" sx={{ textTransform: 'none', borderRadius: 2 }}
              onClick={() => api.post('/auth/resend-verification').catch(() => {})}>
              Resend email
            </Button>
          </Box>
        );

      case 1:
        return (
          <Stack spacing={2.5}>
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>Phone number</FormLabel>
              <TextField
                fullWidth placeholder="+27 81 234 5678" value={phone}
                onChange={e => setPhone(e.target.value)}
                slotProps={{ htmlInput: { inputMode: 'tel' } }}
              />
            </FormControl>
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>City</FormLabel>
              <TextField fullWidth placeholder="e.g. Cape Town" value={city} onChange={e => setCity(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>Province</FormLabel>
              <TextField select fullWidth value={province} onChange={e => setProvince(e.target.value)}
                slotProps={{ select: { displayEmpty: true } }}
              >
                <MenuItem value="" disabled>Select province</MenuItem>
                {PROVINCES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </FormControl>
          </Stack>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Typography variant="body2" color="text.secondary">Upload a picture of yourself below</Typography>
            <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
              <Avatar
                src={avatar || undefined}
                sx={{
                  width: 140, height: 140,
                  bgcolor: avatar ? 'transparent' : '#e3f2fd',
                  border: '3px solid #e0e0e0',
                  fontSize: 48, color: '#90caf9',
                }}
              >
                {!avatar && (user?.name?.[0]?.toUpperCase() || '?')}
              </Avatar>
              <Box sx={{
                position: 'absolute', bottom: 4, right: 4,
                bgcolor: '#1976d2', borderRadius: '50%', width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 2,
              }}>
                <CameraAltRoundedIcon sx={{ color: '#fff', fontSize: 16 }} />
              </Box>
              {avatar && (
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', top: 0, right: 0, bgcolor: '#fff', boxShadow: 1, '&:hover': { bgcolor: '#fff' } }}
                  onClick={e => { e.stopPropagation(); setAvatar(''); setAvatarFile(null); }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            <Button variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }}
              onClick={() => fileInputRef.current?.click()}>
              {avatar ? 'Change photo' : 'Choose photo'}
            </Button>
          </Box>
        );

      case 3:
        return (
          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">
              Tenants will use this number to contact you directly.
            </Typography>
            <Box
              component="button"
              type="button"
              onClick={() => { setSameAsPhone(v => !v); if (!sameAsPhone) setWhatsapp(phone); }}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
                border: '1.5px solid', borderColor: sameAsPhone ? '#1976d2' : '#e0e0e0',
                borderRadius: 2, cursor: 'pointer', bgcolor: sameAsPhone ? '#e3f2fd' : 'transparent',
                textAlign: 'left', width: '100%',
              }}
            >
              <Box sx={{
                width: 20, height: 20, borderRadius: '50%', border: '2px solid',
                borderColor: sameAsPhone ? '#1976d2' : '#bdbdbd',
                bgcolor: sameAsPhone ? '#1976d2' : 'transparent',
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {sameAsPhone && <Box sx={{ width: 8, height: 8, bgcolor: '#fff', borderRadius: '50%' }} />}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: sameAsPhone ? 600 : 400, color: 'text.primary' }}>
                Same as my phone number {phone ? `(${phone})` : ''}
              </Typography>
            </Box>
            {!sameAsPhone && (
              <FormControl>
                <FormLabel sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>WhatsApp number</FormLabel>
                <TextField
                  fullWidth placeholder="+27 81 234 5678" value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  slotProps={{ htmlInput: { inputMode: 'tel' } }}
                />
              </FormControl>
            )}
          </Stack>
        );

      case 4:
        return (
          <Stack spacing={2.5}>
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>Type of properties you list</FormLabel>
              <TextField select fullWidth value={propertyType} onChange={e => setPropertyType(e.target.value)}>
                <MenuItem value="" disabled>Select type</MenuItem>
                {PROPERTY_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </FormControl>
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>Number of units / properties</FormLabel>
              <TextField select fullWidth value={numberOfProperties} onChange={e => setNumberOfProperties(e.target.value)}>
                <MenuItem value="" disabled>Select range</MenuItem>
                {UNIT_COUNTS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </FormControl>
          </Stack>
        );

      case 5:
        return (
          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">
              Your ID or passport number is used to verify your identity. It is stored securely and never shared.
            </Typography>
            <FormControl>
              <FormLabel sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>South African ID / Passport number</FormLabel>
              <TextField
                fullWidth placeholder="e.g. 9001015009087"
                value={idNumber} onChange={e => setIdNumber(e.target.value)}
                slotProps={{ htmlInput: { maxLength: 20 } }}
              />
            </FormControl>
          </Stack>
        );

      default:
        return null;
    }
  };

  const canSkip = step === 0 || step === 2;

  return (
    <Dialog
      open={open}
      onClose={() => {}} // prevent accidental close
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3, overflow: 'hidden',
            width: { xs: '95vw', sm: 720 },
            maxHeight: '90vh',
            display: 'flex', flexDirection: 'row',
            m: 2,
          },
        },
      }}
    >
      {/* ── Left: Steps panel ─────────────────────────────────────────────── */}
      <Box sx={{
        width: 220, flexShrink: 0,
        bgcolor: '#1565c0',
        p: 3.5,
        display: { xs: 'none', sm: 'flex' },
        flexDirection: 'column',
        gap: 0.5,
      }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', mb: 2.5, fontSize: 16 }}>
          Complete your profile
        </Typography>
        <Stack spacing={1.2}>
          {STEPS.map((label, i) => (
            <StepItem key={label} label={label} index={i} currentStep={step} />
          ))}
        </Stack>
      </Box>

      {/* ── Right: Content panel ──────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 3, sm: 4 }, minWidth: 0 }}>
        {/* Close / skip button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Step title */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#1a2027' }}>
          {STEPS[step]}
        </Typography>

        {/* Mobile step counter */}
        <Typography variant="caption" sx={{ display: { sm: 'none' }, color: 'text.secondary', mb: 1 }}>
          Step {step + 1} of {STEPS.length}
        </Typography>

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {renderContent()}
        </Box>

        {/* Footer buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, mt: 2, pt: 2, borderTop: '1px solid #f0f0f0' }}>
          {canSkip && (
            <Button variant="text" sx={{ textTransform: 'none', color: 'text.secondary', borderRadius: 2 }} onClick={handleSkip}>
              Skip
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          {step > 0 && (
            <Button variant="outlined" sx={{ textTransform: 'none', borderRadius: 2 }} onClick={() => setStep(s => s - 1)}>
              Back
            </Button>
          )}
          <Button
            variant="contained"
            disabled={loading}
            onClick={handleNext}
            sx={{
              textTransform: 'none', fontWeight: 600, borderRadius: 2, minWidth: 110,
              bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' },
            }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : isLast ? 'Finish' : 'Continue'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
