'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import StudentLayout from '@/components/student/StudentLayout';
import api from '@/services/api';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

const UNIVERSITIES = [
  'University of Cape Town', 'Stellenbosch University', 'University of Pretoria',
  'University of the Witwatersrand', 'University of KwaZulu-Natal',
  'University of Johannesburg', 'Rhodes University', 'Nelson Mandela University',
  'North-West University', 'University of the Free State', 'CPUT',
  'Tshwane University of Technology', 'Durban University of Technology',
  'Walter Sisulu University', 'Other',
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', university: '', fundingType: '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        phone: (user as any).phone ?? '',
        university: user.university ?? '',
        fundingType: user.fundingType ?? '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.patch('/auth/me', form);
      setSuccess('Profile updated successfully.');
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to save profile.');
    } finally { setSaving(false); }
  };

  const handlePwChange = async () => {
    setPwError(''); setPwSuccess('');
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }
    if (pwForm.newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    setPwSaving(true);
    try {
      await api.patch('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPw });
      setPwSuccess('Password changed successfully.');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (e: any) {
      setPwError(e.response?.data?.message ?? 'Failed to change password.');
    } finally { setPwSaving(false); }
  };

  if (isLoading) return null;

  return (
    <StudentLayout>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 720, mx: 'auto' }}>

        {/* Header */}
        <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{
            width: 64, height: 64, fontSize: 24, fontWeight: 700,
            background: 'linear-gradient(135deg, #1976d2, #1565c0)',
            boxShadow: '0 4px 16px rgba(25,118,210,0.3)',
          }}>
            {(user?.name ?? 'S')[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            {user?.fundingType && (
              <Chip label={user.fundingType} size="small" sx={{ mt: 0.5, fontSize: 11, height: 20, bgcolor: 'rgba(25,118,210,0.08)', color: 'primary.main', fontWeight: 600 }} />
            )}
          </Box>
        </Stack>

        {/* Personal Info */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1, mb: 2 }}>
            <PersonRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Personal Information</Typography>
          </Stack>

          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2.5 }}>
            <TextField
              label="Full Name" value={form.name} size="small" fullWidth
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <TextField
              label="Phone Number" value={form.phone} size="small" fullWidth
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+27 XX XXX XXXX"
            />
            <TextField
              select label="University" value={form.university} size="small" fullWidth
              onChange={e => setForm(f => ({ ...f, university: e.target.value }))}
            >
              {UNIVERSITIES.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
            </TextField>
            <TextField
              select label="Funding Type" value={form.fundingType} size="small" fullWidth
              onChange={e => setForm(f => ({ ...f, fundingType: e.target.value }))}
            >
              {['NSFAS', 'Private', 'Self-funded', 'Bursary', 'Other'].map(f => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            label="Email Address" value={user?.email ?? ''} size="small" fullWidth disabled
            helperText="Email cannot be changed"
            sx={{ mb: 2.5 }}
          />

          <Button
            variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
            onClick={handleSave} disabled={saving}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </Paper>

        {/* Change Password */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1, mb: 2 }}>
            <LockRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Change Password</Typography>
          </Stack>

          {pwSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{pwSuccess}</Alert>}
          {pwError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{pwError}</Alert>}

          <Stack sx={{ gap: 2, mb: 2.5 }}>
            <TextField
              label="Current Password" type="password" size="small" fullWidth value={pwForm.current}
              onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
            />
            <TextField
              label="New Password" type="password" size="small" fullWidth value={pwForm.newPw}
              onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))}
            />
            <TextField
              label="Confirm New Password" type="password" size="small" fullWidth value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
            />
          </Stack>

          <Button
            variant="outlined" startIcon={pwSaving ? <CircularProgress size={16} /> : <LockRoundedIcon />}
            onClick={handlePwChange} disabled={pwSaving}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
          >
            {pwSaving ? 'Updating…' : 'Update Password'}
          </Button>
        </Paper>
      </Box>
    </StudentLayout>
  );
}
