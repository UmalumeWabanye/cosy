'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/services/api';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

export default function AdminProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', idNumber: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, user?.role]);

  useEffect(() => {
    if (!user) return;
    setAvatarPreview(user.avatar ?? '');
    setForm({
      name: user.name ?? '',
      phone: user.phone ?? '',
      idNumber: user.idNumber ?? '',
    });
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    setSuccess('');
    setError('');
    try {
      const payload: Record<string, string> = {
        name: form.name,
        phone: form.phone,
        idNumber: form.idNumber,
      };

      if (avatarPreview && avatarPreview !== user?.avatar) {
        payload.avatar = avatarPreview;
      }

      const res = await api.patch('/auth/me', payload);
      if (res.data?.user) {
        setUser(res.data.user);
      }
      setSuccess('Admin profile updated successfully.');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to update admin profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    setPasswordSuccess('');
    setPasswordError('');

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    if (pwForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSuccess('Password updated successfully.');
    } catch (e: any) {
      setPasswordError(e?.response?.data?.message ?? 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (isLoading) return null;

  const initials = (user?.name ?? user?.email ?? 'A')[0].toUpperCase();

  return (
    <AdminLayout>
      <Box className="modern-shell" sx={{ px: { xs: 2, md: 4 }, pt: { xs: 2, md: 3 }, pb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' }, mb: 3, gap: 1.5 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Admin Profile</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage internal identity, contact details, and control-center account security for the admin platform.
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card variant="outlined" className="glass-card" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack sx={{ alignItems: 'center', textAlign: 'center', gap: 1.5 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar src={avatarPreview || undefined} sx={{ width: 96, height: 96, fontSize: 34, fontWeight: 700, bgcolor: 'primary.main' }}>
                      {!avatarPreview && initials}
                    </Avatar>
                    <Tooltip title="Change photo">
                      <IconButton
                        size="small"
                        onClick={() => fileInputRef.current?.click()}
                        sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'background.paper', boxShadow: 2 }}
                      >
                        <CameraAltRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user?.email}</Typography>

                  <Paper variant="outlined" className="glass-card" sx={{ p: 2, width: '100%', textAlign: 'left', borderRadius: 2.5 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1 }}>
                      <VerifiedUserRoundedIcon color="primary" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Admin Identity</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      This profile is separate from student and landlord flows and is used only for internal administration.
                    </Typography>
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper variant="outlined" className="glass-card" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, '& .MuiOutlinedInput-root': { borderRadius: 1.75 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Account Details</Typography>
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Full Name" size="small" fullWidth value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Phone Number" size="small" fullWidth value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Email Address" size="small" fullWidth value={user?.email ?? ''} disabled helperText="Email is controlled by the current account." />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Admin ID / Passport Number" size="small" fullWidth value={form.idNumber} onChange={(e) => setForm((current) => ({ ...current, idNumber: e.target.value }))} helperText="Used for internal identity and access governance only." />
                </Grid>
              </Grid>

              <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 2.5 }}>
                <Button
                  variant="contained"
                  startIcon={savingProfile ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
                  onClick={handleProfileSave}
                  disabled={savingProfile}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.75, boxShadow: '0 12px 24px rgba(24,104,201,0.18)', transition: 'transform 0.18s ease, box-shadow 0.18s ease', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 16px 30px rgba(24,104,201,0.22)' } }}
                >
                  {savingProfile ? 'Saving...' : 'Save Admin Profile'}
                </Button>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Security</Typography>
              {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}
              {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Current Password"
                    type={showCurrent ? 'text' : 'password'}
                    size="small"
                    fullWidth
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm((current) => ({ ...current, currentPassword: e.target.value }))}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <IconButton size="small" onClick={() => setShowCurrent((value) => !value)}>
                            {showCurrent ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                          </IconButton>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="New Password"
                    type={showNew ? 'text' : 'password'}
                    size="small"
                    fullWidth
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm((current) => ({ ...current, newPassword: e.target.value }))}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <IconButton size="small" onClick={() => setShowNew((value) => !value)}>
                            {showNew ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                          </IconButton>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Confirm Password"
                    type="password"
                    size="small"
                    fullWidth
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm((current) => ({ ...current, confirmPassword: e.target.value }))}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 2.5 }}>
                <Button
                  variant="outlined"
                  startIcon={savingPassword ? <CircularProgress size={16} /> : <LockRoundedIcon />}
                  onClick={handlePasswordSave}
                  disabled={savingPassword || !pwForm.currentPassword || !pwForm.newPassword}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.75 }}
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}