'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import SvgIcon from '@mui/material/SvgIcon';

import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

// ── Constants ─────────────────────────────────────────────────────────────────
const UNIVERSITIES = [
  'University of Cape Town', 'Stellenbosch University', 'University of Pretoria',
  'University of the Witwatersrand', 'University of KwaZulu-Natal',
  'University of Johannesburg', 'Rhodes University', 'Nelson Mandela University',
  'North-West University', 'University of the Free State', 'CPUT',
  'Tshwane University of Technology', 'Durban University of Technology',
  'Walter Sisulu University', 'Other',
];

const FUNDING_TYPES = [
  { value: 'NSFAS', label: 'NSFAS' },
  { value: 'Private', label: 'Private Bursary' },
  { value: 'Self-funded', label: 'Self-funded' },
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year', 'Postgrad'];

const STEPS = [
  { icon: <AccountCircleRoundedIcon />, title: 'Profile photo', subtitle: 'Add a photo so landlords can put a face to the name.' },
  { icon: <SchoolRoundedIcon />, title: 'Your studies', subtitle: 'Tell us about your university and year of study.' },
  { icon: <AttachMoneyRoundedIcon />, title: 'Funding', subtitle: 'How are you funding your studies?' },
  { icon: <BadgeRoundedIcon />, title: 'Identity verification', subtitle: 'Your ID or passport number helps landlords verify you.' },
];

// ── Theme ─────────────────────────────────────────────────────────────────────
const theme = createTheme({
  typography: { fontFamily: ['Inter', '-apple-system', 'sans-serif'].join(',') },
  shape: { borderRadius: 10 },
});

// ── CosyLogo ──────────────────────────────────────────────────────────────────
function CosyLogo() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{
        width: 30, height: 30, borderRadius: 1.5,
        background: 'linear-gradient(135deg, #1976d2, #1565c0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <SvgIcon sx={{ color: '#fff', fontSize: 16 }}>
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </SvgIcon>
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.3px' }}>Cosy</Typography>
    </Box>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SetupAccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const [avatar, setAvatar] = useState('');
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [fundingType, setFundingType] = useState('');
  const [idNumber, setIdNumber] = useState('');

  const totalSteps = STEPS.length;
  const progress = ((step) / totalSteps) * 100;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      setAvatar((user as any).avatar ?? '');
      setUniversity(user.university ?? '');
      setCourse((user as any).course ?? '');
      setYearOfStudy((user as any).yearOfStudy ?? '');
      setFundingType(user.fundingType ?? '');
      setIdNumber((user as any).idNumber ?? '');
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveStep = async () => {
    setError('');
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      if (step === 0 && avatar) payload.avatar = avatar;
      if (step === 1) {
        if (!university) { setError('Please select your university.'); setSaving(false); return false; }
        payload.university = university;
        if (!course.trim()) { setError('Please enter your course/programme.'); setSaving(false); return false; }
        payload.course = course.trim();
        if (yearOfStudy) payload.yearOfStudy = yearOfStudy;
      }
      if (step === 2) {
        if (!fundingType) { setError('Please select a funding type.'); setSaving(false); return false; }
        payload.fundingType = fundingType;
      }
      if (step === 3) {
        if (!idNumber.trim()) { setError('Please enter your ID or passport number.'); setSaving(false); return false; }
        payload.idNumber = idNumber.trim();
        payload.profileComplete = 'true';
      }

      if (Object.keys(payload).length > 0) {
        const res = await api.patch('/auth/me', payload);
        if (res.data?.user) setUser(res.data.user);
      }
      return true;
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Something went wrong. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    const ok = await saveStep();
    if (!ok) return;
    if (step === totalSteps - 1) {
      setDone(true);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    setError('');
    if (step === totalSteps - 1) { setDone(true); } else { setStep(s => s + 1); }
  };

  const initials = (user?.name ?? user?.email ?? 'S')[0].toUpperCase();

  if (isLoading) return null;

  // ── Done screen ────────────────────────────────────────────────────────────
  if (done) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: 'grey.50' }}>
          <Paper elevation={0} sx={{ maxWidth: 440, width: '100%', p: { xs: 4, sm: 5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 72, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>You're all set!</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Your profile is ready. Start browsing student accommodation across South Africa.
            </Typography>
            <Stack spacing={1.5}>
              <Button variant="contained" size="large" onClick={() => router.push('/browse')}
                sx={{ textTransform: 'none', fontWeight: 700, py: 1.5, borderRadius: 2 }}>
                Browse Properties
              </Button>
              <Button variant="outlined" onClick={() => router.push('/dashboard')}
                sx={{ textTransform: 'none', borderRadius: 2 }}>
                Go to Dashboard
              </Button>
            </Stack>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

  const currentStep = STEPS[step];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="cinema-public-page cinema-reveal" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50' }}>
        {/* Top bar */}
        <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', px: { xs: 2, sm: 4 }, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <CosyLogo />
          <Chip label={`Step ${step + 1} of ${totalSteps}`} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: 12 }} />
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 3, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }} />

        <Box sx={{ flex: 1, display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'center', p: { xs: 2, sm: 4 }, pt: { xs: 4, sm: 4 } }}>
          <Paper className="cinema-panel" elevation={0} sx={{ maxWidth: 520, width: '100%', p: { xs: 3, sm: 5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>

            {/* Step header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.50', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', flexShrink: 0 }}>
                {currentStep.icon}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{currentStep.title}</Typography>
                <Typography variant="body2" color="text.secondary">{currentStep.subtitle}</Typography>
              </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

            {/* ── Step 0: Avatar ────────────────────────────────────── */}
            {step === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 2 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={avatar || undefined}
                    sx={{ width: 120, height: 120, fontSize: 44, fontWeight: 700, bgcolor: 'primary.main', boxShadow: '0 4px 20px rgba(25,118,210,0.25)' }}
                  >
                    {!avatar && initials}
                  </Avatar>
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    size="small"
                    sx={{ position: 'absolute', bottom: 4, right: 4, bgcolor: 'primary.main', color: '#fff', width: 34, height: 34, border: '2px solid white', '&:hover': { bgcolor: 'primary.dark' } }}
                  >
                    <CameraAltRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Tap the camera icon to upload a photo. You can always change this later.
                </Typography>
              </Box>
            )}

            {/* ── Step 1: Studies ───────────────────────────────────── */}
            {step === 1 && (
              <Stack spacing={2.5}>
                <TextField
                  select label="University / Institution" value={university} fullWidth required
                  onChange={e => setUniversity(e.target.value)}
                >
                  <MenuItem value=""><em>Select your institution</em></MenuItem>
                  {UNIVERSITIES.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                </TextField>
                <TextField
                  label="Course / Programme"
                  value={course}
                  fullWidth
                  required
                  onChange={e => setCourse(e.target.value)}
                  placeholder="e.g. BSc Computer Science"
                />
                <TextField
                  select label="Year of Study" value={yearOfStudy} fullWidth
                  onChange={e => setYearOfStudy(e.target.value)}
                >
                  <MenuItem value=""><em>Select year (optional)</em></MenuItem>
                  {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </TextField>
              </Stack>
            )}

            {/* ── Step 2: Funding ───────────────────────────────────── */}
            {step === 2 && (
              <Stack spacing={1.5}>
                {FUNDING_TYPES.map(({ value, label }) => (
                  <Box
                    key={value}
                    onClick={() => setFundingType(value)}
                    sx={{
                      p: 2, borderRadius: 2, border: '2px solid', cursor: 'pointer',
                      borderColor: fundingType === value ? 'primary.main' : 'divider',
                      bgcolor: fundingType === value ? 'primary.50' : 'background.paper',
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: 'primary.light' },
                    }}
                  >
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body1" sx={{ fontWeight: fundingType === value ? 700 : 500 }}>{label}</Typography>
                      {fundingType === value && <CheckCircleRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}

            {/* ── Step 3: ID ────────────────────────────────────────── */}
            {step === 3 && (
              <Stack spacing={2}>
                <TextField
                  label="SA ID Number or Passport Number"
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  fullWidth
                  required
                  placeholder="e.g. 9901015800085"
                  helperText="This is used for identity verification only. It will not be shared publicly."
                />
              </Stack>
            )}

            {/* Navigation buttons */}
            <Stack direction="row" spacing={1.5} sx={{ mt: 4 }}>
              {step > 0 && (
                <Button variant="outlined" onClick={() => setStep(s => s - 1)} sx={{ textTransform: 'none', minWidth: 90 }}>
                  Back
                </Button>
              )}
              <Box sx={{ flex: 1 }} />
              <Button variant="text" color="inherit" onClick={handleSkip} sx={{ textTransform: 'none', color: 'text.secondary' }}>
                {step === totalSteps - 1 ? 'Skip for now' : 'Skip'}
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={saving}
                sx={{ textTransform: 'none', fontWeight: 700, minWidth: 100, borderRadius: 2 }}
              >
                {saving ? <CircularProgress size={20} color="inherit" /> : step === totalSteps - 1 ? 'Finish' : 'Continue'}
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
