"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
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
  padding: theme.spacing(3.5),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: { maxWidth: '520px' },
  borderRadius: 18,
  boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100dvh',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(4) },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage: 'linear-gradient(135deg, #f6fbff 0%, #e8f3ff 46%, #deeeff 100%)',
    backgroundRepeat: 'no-repeat',
  },
}));

const theme = createTheme({
  typography: { fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(',') },
  shape: { borderRadius: 12 },
});

// ── ForgotPassword dialog ──────────────────────────────────────────────────────
function ForgotPassword({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose}
      slotProps={{ paper: { component: 'form', onSubmit: (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); onClose(); }, sx: { backgroundImage: 'none' } } }}>
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        <DialogContentText>Enter your account's email address, and we'll send you a link to reset your password.</DialogContentText>
        <OutlinedInput autoFocus required margin="dense" id="reset-email" name="email" placeholder="Email address" type="email" fullWidth />
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" type="submit">Continue</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const [redirect] = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('redirect') || '';
  });

  const getSafeRedirect = () => {
    if (!redirect.startsWith('/')) return '';
    if (redirect.startsWith('//')) return '';
    return redirect;
  };

  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateInputs = () => {
    const emailEl = document.getElementById('email') as HTMLInputElement;
    const passwordEl = document.getElementById('password') as HTMLInputElement;
    let valid = true;

    if (!emailEl?.value || !/\S+@\S+\.\S+/.test(emailEl.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!passwordEl?.value || passwordEl.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      valid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateInputs()) return;

    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    try {
      setLoading(true);
      setServerError('');
      const response = await api.post('/auth/login', { email, password });
      const res = response.data;

      const token = res.token;
      let user = null;
      if (res.user) {
        user = res.user;
      } else if (res._id) {
        user = { id: res._id, email: res.email, name: res.name, role: res.role, university: res.university, fundingType: res.fundingType };
      }

      if (!token || !user) {
        setServerError('Unexpected response from server. Please try again.');
        return;
      }

      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);

      const safeRedirect = getSafeRedirect();

      if (safeRedirect) {
        router.push(safeRedirect);
      } else if (user.role === 'admin') {
        router.push('/admin-access');
      } else if (user.role === 'landlord') {
        router.push('/landlord/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Login failed';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <SignInContainer className="cinema-public-page cinema-reveal" direction="column" sx={{ justifyContent: 'center' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
          <Grid container spacing={{ xs: 3, md: 5 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ maxWidth: 620, color: '#0f2942' }}>
                <Typography sx={{ color: '#1565c0', fontSize: 12, fontWeight: 800, letterSpacing: 1.3, textTransform: 'uppercase', mb: 1.5 }}>
                  Cosy Access
                </Typography>
                <Typography sx={{ fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em', fontSize: { xs: '2.3rem', sm: '3rem', md: '3.8rem' }, mb: 2.5 }}>
                  Welcome back to your student housing workspace.
                </Typography>
                <Typography sx={{ color: 'rgba(15,41,66,0.75)', fontSize: 16, lineHeight: 1.7, mb: 4, maxWidth: 620 }}>
                  Sign in to manage applications, schedule viewings, and keep your accommodation journey moving from one place.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: 'wrap', rowGap: 1.2 }}>
                  <Chip label="Verified platform" sx={{ bgcolor: 'rgba(25,118,210,0.1)', color: '#1565c0', fontWeight: 700 }} />
                  <Chip label="Fast approvals" sx={{ bgcolor: 'rgba(25,118,210,0.1)', color: '#1565c0', fontWeight: 700 }} />
                  <Chip label="Secure messaging" sx={{ bgcolor: 'rgba(25,118,210,0.1)', color: '#1565c0', fontWeight: 700 }} />
                </Stack>
                <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.74)', border: '1px solid rgba(25,118,210,0.16)', backdropFilter: 'blur(6px)' }}>
                  <Typography sx={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.9, color: '#1565c0', fontWeight: 700, mb: 0.7 }}>
                    Why Sign In
                  </Typography>
                  <Typography sx={{ color: '#24415e', lineHeight: 1.7, fontSize: 14 }}>
                    Continue where you left off, access your saved listings, and keep communication centralized with landlords or student applicants.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="cinema-panel" variant="outlined">
                <CosyIcon />

                <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', fontWeight: 700 }}>
                  Sign in
                </Typography>

                {serverError && <Alert severity="error" sx={{ width: '100%' }}>{serverError}</Alert>}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2, '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}>
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
                      autoFocus
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
                      autoComplete="current-password"
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

                  <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />

                  <ForgotPassword open={forgotOpen} onClose={() => setForgotOpen(false)} />

                  <Button type="submit" fullWidth variant="contained" disabled={loading}
                    sx={{ py: 1.25, fontWeight: 700, textTransform: 'none', borderRadius: '9999px' }}
                    onClick={validateInputs}>
                    {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
                  </Button>

                  <Link component="button" type="button" onClick={() => setForgotOpen(true)} variant="body2" sx={{ alignSelf: 'center', color: '#1976d2', fontWeight: 600 }}>
                    Forgot your password?
                  </Link>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography sx={{ textAlign: 'center' }}>
                    Don&apos;t have an account?{' '}
                    <Link href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'} variant="body2" sx={{ alignSelf: 'center', color: '#1976d2', fontWeight: 600 }}>Sign up</Link>
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </SignInContainer>
    </ThemeProvider>
  );
}
