'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

export default function AdminAccessPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.replace('/');
      return;
    }

    const hasPortalAccess = typeof window !== 'undefined'
      && window.sessionStorage.getItem('cosy_admin_portal_access') === 'granted';

    if (hasPortalAccess) {
      router.replace('/admin/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessKey.trim()) {
      setError('Access key is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await api.post('/admin/access/verify', { accessKey: accessKey.trim() });

      window.sessionStorage.setItem('cosy_admin_portal_access', 'granted');
      router.replace('/admin/dashboard');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Invalid admin access key.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'grey.100', p: 2 }}>
      <Paper variant="outlined" sx={{ width: '100%', maxWidth: 460, p: 3, borderRadius: 3 }}>
        <Stack sx={{ gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Admin Platform Access</Typography>
            <Typography variant="body2" color="text.secondary">
              This portal is isolated from the public website. Enter your admin access key to continue.
            </Typography>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 1.5 }}>
            <TextField
              type="password"
              label="Access Key"
              value={accessKey}
              onChange={(e) => {
                setAccessKey(e.target.value);
                if (error) setError('');
              }}
              fullWidth
              autoFocus
            />
            <Button variant="contained" type="submit" disabled={submitting} sx={{ fontWeight: 700 }}>
              {submitting ? 'Verifying...' : 'Enter Admin Platform'}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
