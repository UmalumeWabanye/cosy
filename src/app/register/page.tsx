'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

// ── Icons ──────────────────────────────────────────────────────────────────────
function CosyIcon() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Box sx={{
        width: 32, height: 32, borderRadius: 1.5,
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <SvgIcon sx={{ color: '#fff', fontSize: 18 }}>
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </SvgIcon>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1 }}>Cosy</Typography>
    </Box>
  );
}

// ── Styled components ──────────────────────────────────────────────────────────
const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: { maxWidth: '450px' },
  boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100dvh',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(4) },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage: 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
  },
}));

const theme = createTheme({
  typography: { fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(',') },
  shape: { borderRadius: 8 },
});

// ── Main page ──────────────────────────────────────────────────────────────────
function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAuthStore();

  const isLandlord = searchParams.get('role') === 'landlord';

  const [nameError, setNameError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateInputs = () => {
    const nameEl = document.getElementById('name') as HTMLInputElement;
    const emailEl = document.getElementById('email') as HTMLInputElement;
    const passwordEl = document.getElementById('password') as HTMLInputElement;
    const confirmEl = document.getElementById('confirmPassword') as HTMLInputElement;
    let valid = true;

    if (!nameEl?.value || nameEl.value.trim().length < 2) {
      setNameError(true); setNameErrorMessage('Please enter your full name.'); valid = false;
    } else { setNameError(false); setNameErrorMessage(''); }

    if (!emailEl?.value || !/\S+@\S+\.\S+/.test(emailEl.value)) {
      setEmailError(true); setEmailErrorMessage('Please enter a valid email address.'); valid = false;
    } else { setEmailError(false); setEmailErrorMessage(''); }

    if (!passwordEl?.value || passwordEl.value.length < 6) {
      setPasswordError(true); setPasswordErrorMessage('Password must be at least 6 characters.'); valid = false;
    } else { setPasswordError(false); setPasswordErrorMessage(''); }

    if (!confirmEl?.value || confirmEl.value !== passwordEl?.value) {
      setConfirmPasswordError(true); setConfirmPasswordErrorMessage('Passwords do not match.'); valid = false;
    } else { setConfirmPasswordError(false); setConfirmPasswordErrorMessage(''); }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateInputs()) return;

    const data = new FormData(e.currentTarget);
    const name = data.get('name') as string;
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    const payload: Record<string, string> = { name, email, password };

    if (isLandlord) {
      payload.role = 'admin';
    } else {
      payload.university = data.get('university') as string;
      payload.fundingType = data.get('fundingType') as string;
    }

    try {
      setLoading(true);
      setServerError('');
      const response = await api.post('/auth/register', payload);
      const res = response.data;

      const token = res.token;
      let user = null;
      if (res.user) {
        user = res.user;
      } else if (res._id) {
        user = { id: res._id, email: res.email, name: res.name, role: res.role, university: res.university, fundingType: res.fundingType };
      }

      if (!token || !user) {
        setServerError(res.message || 'Unexpected response from server. Please try again.');
        return;
      }

      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      // Landlords → landlord dashboard with onboarding wizard, students → account setup
      if (isLandlord) {
        localStorage.setItem('showLandlordWizard', 'true');
        router.push('/landlord/dashboard');
      } else {
        router.push('/setup-account');
      }
    } catch (err: any) {
      setServerError(err?.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" sx={{ justifyContent: 'center' }}>
        <Card variant="outlined">
          <CosyIcon />

          <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', fontWeight: 700 }}>
            {isLandlord ? 'Create Landlord Account' : 'Sign up'}
          </Typography>
          {isLandlord && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: -1 }}>
              You'll be set up as a landlord and taken straight to your dashboard.
            </Typography>
          )}

          {serverError && <Alert severity="error" sx={{ width: '100%' }}>{serverError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl>
              <FormLabel htmlFor="name">Full name</FormLabel>
              <TextField
                error={nameError}
                helperText={nameErrorMessage}
                autoComplete="name"
                name="name"
                required
                fullWidth
                id="name"
                placeholder="Jon Snow"
                color={nameError ? 'error' : 'primary'}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                required
                fullWidth
                variant="outlined"
                color={emailError ? 'error' : 'primary'}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                color={passwordError ? 'error' : 'primary'}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword(v => !v)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="confirmPassword">Confirm password</FormLabel>
              <TextField
                error={confirmPasswordError}
                helperText={confirmPasswordErrorMessage}
                name="confirmPassword"
                placeholder="••••••"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                color={confirmPasswordError ? 'error' : 'primary'}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowConfirmPassword(v => !v)}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </FormControl>

            <Button type="submit" fullWidth variant="contained" disabled={loading}
              onClick={validateInputs}
              sx={{ py: 1.2, fontWeight: 600, textTransform: 'none' }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : (isLandlord ? 'Create Landlord Account' : 'Sign up')}
            </Button>

            <Typography sx={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <Link href="/login" variant="body2" sx={{ alignSelf: 'center' }}>Sign in</Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </ThemeProvider>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
