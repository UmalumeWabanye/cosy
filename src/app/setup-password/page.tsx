"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import SvgIcon from '@mui/material/SvgIcon';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';

// ── Styled ─────────────────────────────────────────────────────────────────────
const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: { maxWidth: '450px' },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

const PageContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100dvh',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(4) },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
  },
}));

const theme = createTheme({
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
  },
  shape: { borderRadius: 8 },
});

function CosyLogo() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Box
        sx={{
          width: 32, height: 32, borderRadius: 1.5,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <SvgIcon sx={{ color: '#fff', fontSize: 18 }}>
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </SvgIcon>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1 }}>
        Cosy
      </Typography>
    </Box>
  );
}

// ── Inner component (uses useSearchParams) ─────────────────────────────────────
function SetupPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken, setUser } = useAuthStore();

  const token = searchParams.get('token') ?? '';

  const [inviteInfo, setInviteInfo] = useState<{ name: string; email: string; role: string } | null>(null);
  const [validating, setValidating] = useState(true);
  const [tokenError, setTokenError] = useState('');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenError('No invite token found in this link.');
      setValidating(false);
      return;
    }
    api
      .get(`/auth/invite/${token}`)
      .then((res) => {
        setInviteInfo(res.data);
        setValidating(false);
      })
      .catch((err) => {
        setTokenError(err?.response?.data?.message || 'This invite link is invalid or has expired.');
        setValidating(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (password.length < 6) {
      setSubmitError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setSubmitError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/auth/setup-password', { token, password });
      const { token: jwt, user } = res.data;

      localStorage.setItem('token', jwt);
      setToken(jwt);
      setUser(user);

      setDone(true);

      // Role-aware redirect after short delay
      setTimeout(() => {
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (user.role === 'landlord') {
          router.push('/landlord/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 1500);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Could not complete setup. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state
  if (validating) {
    return (
      <Card variant="outlined">
        <CosyLogo />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
        <Typography align="center" color="text.secondary" variant="body2">
          Validating your invite link…
        </Typography>
      </Card>
    );
  }

  // ── Invalid token
  if (tokenError) {
    return (
      <Card variant="outlined">
        <CosyLogo />
        <Alert severity="error">{tokenError}</Alert>
        <Typography variant="body2" color="text.secondary">
          Please ask your admin to send a new invite.
        </Typography>
      </Card>
    );
  }

  // ── Success
  if (done) {
    return (
      <Card variant="outlined">
        <CosyLogo />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
          <CheckCircleRoundedIcon sx={{ fontSize: 56, color: 'success.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Account ready!</Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting you to your dashboard…
          </Typography>
        </Box>
      </Card>
    );
  }

  // ── Set password form
  return (
    <Card variant="outlined">
      <CosyLogo />

      <Box>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
          Set up your account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome, <strong>{inviteInfo?.name}</strong>! You're joining as a{' '}
          <strong style={{ textTransform: 'capitalize' }}>{inviteInfo?.role}</strong>. Create a
          password to continue.
        </Typography>
      </Box>

      {submitError && <Alert severity="error">{submitError}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <TextField
            id="email"
            value={inviteInfo?.email ?? ''}
            disabled
            fullWidth
            size="small"
            variant="outlined"
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="password">New Password</FormLabel>
          <TextField
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            fullWidth
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? (
                        <VisibilityOffRoundedIcon fontSize="small" />
                      ) : (
                        <VisibilityRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="confirm">Confirm Password</FormLabel>
          <TextField
            id="confirm"
            type={showConfirm ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            required
            fullWidth
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowConfirm((v) => !v)}>
                      {showConfirm ? (
                        <VisibilityOffRoundedIcon fontSize="small" />
                      ) : (
                        <VisibilityRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={submitting}
          sx={{ py: 1.2, fontWeight: 600, textTransform: 'none', mt: 1 }}
        >
          {submitting ? <CircularProgress size={22} color="inherit" /> : 'Create Account & Sign In'}
        </Button>
      </Box>
    </Card>
  );
}

// ── Page export — wraps in Suspense for useSearchParams ────────────────────────
export default function SetupPasswordPage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <PageContainer direction="column" sx={{ justifyContent: 'center' }}>
        <Suspense
          fallback={
            <MuiCard variant="outlined" sx={{ maxWidth: 450, mx: 'auto', p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            </MuiCard>
          }
        >
          <SetupPasswordForm />
        </Suspense>
      </PageContainer>
    </ThemeProvider>
  );
}
