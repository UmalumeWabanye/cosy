'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';

const theme = createTheme({
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
  },
  shape: { borderRadius: 8 },
});

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: '100vh',
  minHeight: '100%',
  padding: theme.spacing(2),
  alignItems: 'center',
  justifyContent: 'center',
  background:
    'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
}));

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (!email) { setError('Please enter your email address'); setLoading(false); return; }
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) { setSuccess('Password reset email sent! Check your inbox.'); setSubmitted(true); setEmail(''); }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to send reset email');
    } finally { setLoading(false); }
  };

  return (
    <ThemeProvider theme={theme}>
      <SignInContainer className="cinema-public-page cinema-reveal">
        <Card
          className="cinema-panel"
          variant="outlined"
          sx={{
            width: '100%',
            maxWidth: 450,
            boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1, background: 'linear-gradient(135deg, #1976d2, #1565c0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 16 }}>C</Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Cosy</Typography>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Reset Password</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Enter your email and we'll send you a reset link.
            </Typography>

            {error && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200', borderRadius: 1 }}>
                <Typography variant="body2" color="error">{error}</Typography>
              </Box>
            )}
            {success && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200', borderRadius: 1 }}>
                <Typography variant="body2" color="success.dark">{success}</Typography>
              </Box>
            )}

            {!submitted ? (
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl>
                  <FormLabel htmlFor="email">Email Address</FormLabel>
                  <OutlinedInput
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    size="small"
                    required
                  />
                </FormControl>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{ mt: 1, py: 1.2, fontWeight: 600, textTransform: 'none', bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'text.secondary' } }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  If an account exists with this email, you'll receive a reset link shortly.
                </Typography>
                <Button variant="text" onClick={() => { setSubmitted(false); setSuccess(''); }} sx={{ textTransform: 'none' }}>
                  Try another email
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 2 }}><Typography variant="caption" sx={{ color: 'text.secondary' }}>or</Typography></Divider>

            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Remember your password?{' '}
              <Link href="/login" style={{ color: 'inherit', fontWeight: 600 }}>Sign in</Link>
            </Typography>
          </CardContent>
        </Card>
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          <Link href="/" style={{ color: 'inherit' }}>← Back to Home</Link>
        </Typography>
      </SignInContainer>
    </ThemeProvider>
  );
}
