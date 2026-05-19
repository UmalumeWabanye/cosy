'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

const ADMIN_PORTAL_KEY = process.env.NEXT_PUBLIC_ADMIN_PORTAL_KEY || 'cosy-admin';

export default function AdminAccessPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');

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

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    if (accessKey.trim() !== ADMIN_PORTAL_KEY) {
      setError('Invalid admin access key.');
      return;
    }

    window.sessionStorage.setItem('cosy_admin_portal_access', 'granted');
    router.replace('/admin/dashboard');
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
            <Button variant="contained" type="submit" sx={{ fontWeight: 700 }}>
              Enter Admin Platform
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
