"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import OutlinedInput from '@mui/material/OutlinedInput';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import SvgIcon from '@mui/material/SvgIcon';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';

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

function GoogleIcon() {
  return (
    <SvgIcon>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
      </svg>
    </SvgIcon>
  );
}

function FacebookIcon() {
  return (
    <SvgIcon>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor" />
      </svg>
    </SvgIcon>
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
    backgroundImage: 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
  },
}));

const theme = createTheme({
  typography: { fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(',') },
  shape: { borderRadius: 8 },
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

  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
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

      if (user.role === 'admin') {
        router.push('/admin/dashboard');
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
      <SignInContainer direction="column" sx={{ justifyContent: 'center' }}>
        <Card variant="outlined">
          <CosyIcon />

          <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', fontWeight: 700 }}>
            Sign in
          </Typography>

          {serverError && <Alert severity="error" sx={{ width: '100%' }}>{serverError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
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
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>

            <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />

            <ForgotPassword open={forgotOpen} onClose={() => setForgotOpen(false)} />

            <Button type="submit" fullWidth variant="contained" disabled={loading}
              sx={{ py: 1.2, fontWeight: 600, textTransform: 'none' }}
              onClick={validateInputs}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
            </Button>

            <Link component="button" type="button" onClick={() => setForgotOpen(true)} variant="body2" sx={{ alignSelf: 'center' }}>
              Forgot your password?
            </Link>
          </Box>

          <Divider>or</Divider>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} onClick={() => alert('Google sign-in not yet configured')}>
              Sign in with Google
            </Button>
            <Button fullWidth variant="outlined" startIcon={<FacebookIcon />} onClick={() => alert('Facebook sign-in not yet configured')}>
              Sign in with Facebook
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              Don&apos;t have an account?{' '}
              <Link href="/register" variant="body2" sx={{ alignSelf: 'center' }}>Sign up</Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </ThemeProvider>
  );
}
