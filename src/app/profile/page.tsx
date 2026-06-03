'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
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
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

const UNIVERSITIES = [
  'University of Cape Town','Stellenbosch University','University of Pretoria',
  'University of the Witwatersrand','University of KwaZulu-Natal',
  'University of Johannesburg','Rhodes University','Nelson Mandela University',
  'North-West University','University of the Free State','CPUT',
  'Tshwane University of Technology','Durban University of Technology',
  'Walter Sisulu University','Other',
];
const FUNDING_TYPES = ['NSFAS','Private','Self-funded','Bursary','Other'];

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout, setUser } = useAuthStore() as any;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState('');

  const [form, setForm] = useState({ name: '', phone: '', university: '', course: '', fundingType: '', idNumber: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const [notifPrefs, setNotifPrefs] = useState({
    emailApplicationUpdates: true,
    emailNewListings: false,
    pushApplicationUpdates: true,
    pushMessages: true,
  });
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState('');
  const [notifError, setNotifError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [prefRemember, setPrefRemember] = useState(true);
  const [prefNsfasFirst, setPrefNsfasFirst] = useState(false);
  const [prefCompact, setPrefCompact] = useState(false);
  const [livingPreference, setLivingPreference] = useState<'individual' | 'shared' | 'noPreference'>('noPreference');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        phone: (user as any).phone ?? '',
        university: user.university ?? '',
        course: (user as any).course ?? '',
        fundingType: user.fundingType ?? '',
        idNumber: (user as any).idNumber ?? '',
      });
      setAvatarPreview((user as any).avatar ?? '');
    }
  }, [user]);

  useEffect(() => {
    if (user && (user as any).livingPreference) {
      setLivingPreference((user as any).livingPreference);
    }
  }, [user]);

  useEffect(() => {
    const prefs = (user as any)?.notificationPreferences;
    if (!prefs) return;
    setNotifPrefs({
      emailApplicationUpdates: prefs.emailApplicationUpdates ?? true,
      emailNewListings: prefs.emailNewListings ?? false,
      pushApplicationUpdates: prefs.pushApplicationUpdates ?? true,
      pushMessages: prefs.pushMessages ?? true,
    });
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const payload: any = { ...form };
      if (avatarPreview && avatarPreview !== (user as any)?.avatar) payload.avatar = avatarPreview;
      const res = await api.patch('/auth/me', payload);
      if (res.data?.user && setUser) setUser(res.data.user);
      setSuccess('Profile updated successfully.');
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Failed to save profile.');
    } finally { setSaving(false); }
  };

  const handlePwChange = async () => {
    setPwError(''); setPwSuccess('');
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }
    if (pwForm.newPw.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    setPwSaving(true);
    try {
      await api.patch('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPw });
      setPwSuccess('Password changed successfully.');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (e: any) {
      setPwError(e.response?.data?.message ?? 'Failed to change password.');
    } finally { setPwSaving(false); }
  };

  const handleLogout = () => { logout(); router.replace('/'); };

  const handleSaveNotificationPrefs = async () => {
    setNotifSaving(true);
    setNotifError('');
    setNotifSuccess('');
    try {
      const existingPrefs = ((user as any)?.notificationPreferences || {}) as Record<string, boolean>;
      const payload = {
        notificationPreferences: {
          ...existingPrefs,
          ...notifPrefs,
        },
      };

      const res = await api.patch('/auth/me', payload);
      if (res.data?.user && setUser) setUser(res.data.user);
      setNotifSuccess('Notification preferences saved.');
    } catch (e: any) {
      setNotifError(e.response?.data?.message ?? 'Failed to save notification preferences.');
    } finally {
      setNotifSaving(false);
    }
  };

  if (isLoading) return null;

  const initials = (user?.name ?? user?.email ?? 'S')[0].toUpperCase();

  return (
    <StudentLayout>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 700, mx: 'auto' }}>

        {/* Profile Header */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', background: 'linear-gradient(135deg,#f0f7ff 0%,#ffffff 100%)' }}>
          <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, gap: 2.5 }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar src={avatarPreview || undefined} sx={{ width: 88, height: 88, fontSize: 32, fontWeight: 700, background: 'linear-gradient(135deg,#1976d2,#1565c0)', boxShadow: '0 4px 20px rgba(25,118,210,0.3)' }}>
                {!avatarPreview && initials}
              </Avatar>
              <Tooltip title="Change photo">
                <IconButton size="small" onClick={() => fileInputRef.current?.click()} sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'primary.main', color: '#fff', width: 28, height: 28, border: '2px solid white', '&:hover': { bgcolor: 'primary.dark' } }}>
                  <CameraAltRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </Box>
            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{user?.email}</Typography>
              <Stack sx={{ flexDirection: 'row', gap: 1, mt: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                {user?.fundingType && <Chip label={user.fundingType} size="small" sx={{ fontSize: 11, height: 22, bgcolor: 'rgba(25,118,210,0.1)', color: 'primary.main', fontWeight: 600 }} />}
                {user?.university && <Chip icon={<SchoolRoundedIcon sx={{ fontSize: '13px !important' }} />} label={user.university} size="small" variant="outlined" sx={{ fontSize: 11, height: 22 }} />}
                {(user as any)?.course && <Chip label={(user as any).course} size="small" variant="outlined" sx={{ fontSize: 11, height: 22 }} />}
              </Stack>
            </Box>
            <Button variant="outlined" color="error" size="small" startIcon={<LogoutRoundedIcon />} onClick={handleLogout} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, alignSelf: { xs: 'center', sm: 'flex-start' }, whiteSpace: 'nowrap' }}>
              Log Out
            </Button>
          </Stack>
        </Paper>

        {/* Settings Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
            sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13, minWidth: 100 } }}>
            <Tab icon={<PersonRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Account" />
            <Tab icon={<LockRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Security" />
            <Tab icon={<NotificationsRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Notifications" />
            <Tab icon={<SettingsRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Preferences" />
          </Tabs>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>

            {/* Account */}
            <TabPanel value={tab} index={0}>
              {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}
              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2.5 }}>
                <TextField label="Full Name" value={form.name} size="small" fullWidth onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <TextField label="Phone Number" value={form.phone} size="small" fullWidth onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+27 XX XXX XXXX" />
                <TextField select label="University" value={form.university} size="small" fullWidth onChange={e => setForm(f => ({ ...f, university: e.target.value }))}>
                  <MenuItem value=""><em>Select university</em></MenuItem>
                  {UNIVERSITIES.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                </TextField>
                <TextField select label="Funding Type" value={form.fundingType} size="small" fullWidth onChange={e => setForm(f => ({ ...f, fundingType: e.target.value }))}>
                  <MenuItem value=""><em>Select type</em></MenuItem>
                  {FUNDING_TYPES.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </TextField>
                <TextField
                  label="Course / Programme"
                  value={form.course}
                  size="small"
                  fullWidth
                  onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                  placeholder="e.g. BCom Accounting"
                />
                <TextField
                  label="SA ID / Passport Number"
                  value={form.idNumber}
                  size="small"
                  fullWidth
                  onChange={e => setForm(f => ({ ...f, idNumber: e.target.value }))}
                  placeholder="e.g. 9901015800085"
                  helperText="Used for identity verification only"
                  sx={{ gridColumn: { sm: '1 / -1' } }}
                />
              </Box>
              <TextField label="Email Address" value={user?.email ?? ''} size="small" fullWidth disabled helperText="Email cannot be changed" sx={{ mb: 2.5 }} />
              <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />} onClick={handleSave} disabled={saving} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </TabPanel>

            {/* Security */}
            <TabPanel value={tab} index={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Change Password</Typography>
              {pwSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{pwSuccess}</Alert>}
              {pwError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{pwError}</Alert>}
              <Stack sx={{ gap: 2, mb: 2.5 }}>
                <TextField label="Current Password" type={showCurrent ? 'text' : 'password'} size="small" fullWidth value={pwForm.current}
                  onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                  slotProps={{ input: { endAdornment: <IconButton size="small" onClick={() => setShowCurrent(v => !v)}>{showCurrent ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}</IconButton> } }} />
                <TextField label="New Password" type={showNew ? 'text' : 'password'} size="small" fullWidth value={pwForm.newPw}
                  onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} helperText="At least 6 characters"
                  slotProps={{ input: { endAdornment: <IconButton size="small" onClick={() => setShowNew(v => !v)}>{showNew ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}</IconButton> } }} />
                <TextField label="Confirm New Password" type="password" size="small" fullWidth value={pwForm.confirm}
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                  error={!!pwForm.confirm && pwForm.newPw !== pwForm.confirm}
                  helperText={!!pwForm.confirm && pwForm.newPw !== pwForm.confirm ? 'Passwords do not match' : ''} />
              </Stack>
              <Button variant="outlined" startIcon={pwSaving ? <CircularProgress size={16} /> : <LockRoundedIcon />} onClick={handlePwChange} disabled={pwSaving || !pwForm.current || !pwForm.newPw} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                {pwSaving ? 'Updating…' : 'Update Password'}
              </Button>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'error.main' }}>Danger Zone</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Permanently delete your account and all associated data. This cannot be undone.</Typography>
              <Button variant="outlined" color="error" size="small" startIcon={<DeleteForeverRoundedIcon />} onClick={() => setDeleteDialog(true)} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                Delete Account
              </Button>
            </TabPanel>

            {/* Notifications */}
            <TabPanel value={tab} index={2}>
              {notifSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{notifSuccess}</Alert>}
              {notifError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{notifError}</Alert>}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Email Notifications</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>Choose what updates you receive by email.</Typography>
              <Stack sx={{ gap: 1.5, mb: 3 }}>
                {([
                  { key: 'emailApplicationUpdates', label: 'Application status updates', sub: 'When your applications are approved or rejected' },
                  { key: 'emailNewListings', label: 'New property listings', sub: 'When new properties matching your preferences are added' },
                ] as const).map(item => (
                  <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography><Typography variant="caption" color="text.secondary">{item.sub}</Typography></Box>
                    <Switch size="small" checked={notifPrefs[item.key]} onChange={e => setNotifPrefs(p => ({ ...p, [item.key]: e.target.checked }))} />
                  </Box>
                ))}
              </Stack>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Push Notifications</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>In-app notifications shown while you're using Cosy.</Typography>
              <Stack sx={{ gap: 1.5 }}>
                {([
                  { key: 'pushApplicationUpdates', label: 'Application updates', sub: 'Real-time status changes on your applications' },
                  { key: 'pushMessages', label: 'Messages & alerts', sub: 'Important system notifications and messages' },
                ] as const).map(item => (
                  <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography><Typography variant="caption" color="text.secondary">{item.sub}</Typography></Box>
                    <Switch size="small" checked={notifPrefs[item.key]} onChange={e => setNotifPrefs(p => ({ ...p, [item.key]: e.target.checked }))} />
                  </Box>
                ))}
              </Stack>
              <Button
                variant="contained"
                startIcon={notifSaving ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
                onClick={handleSaveNotificationPrefs}
                disabled={notifSaving}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                {notifSaving ? 'Saving…' : 'Save Notification Settings'}
              </Button>
            </TabPanel>

            {/* Preferences */}
            <TabPanel value={tab} index={3}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>App Preferences</Typography>
              <Stack sx={{ gap: 1.5, mb: 3 }}>
                {[
                  { label: 'Show NSFAS properties by default', sub: 'Filter browse to show accredited properties first', val: prefNsfasFirst, set: setPrefNsfasFirst },
                  { label: 'Compact view for listings', sub: 'Use smaller cards to see more properties at once', val: prefCompact, set: setPrefCompact },
                  { label: 'Remember last search filters', sub: 'Restore your search filters when you return to Browse', val: prefRemember, set: setPrefRemember },
                ].map(item => (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography><Typography variant="caption" color="text.secondary">{item.sub}</Typography></Box>
                    <Switch size="small" checked={item.val} onChange={e => item.set(e.target.checked)} />
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Account Actions</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Living Preferences for Roommates</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>Help us match you with compatible roommates based on your housing preferences.</Typography>
              <Stack sx={{ gap: 1 }}>
                {[
                  { val: 'individual' as const, label: 'Individual Living', desc: 'I prefer to live alone or have my own space' },
                  { val: 'shared' as const, label: 'Shared Housing', desc: 'I\'m open to sharing accommodation with roommates' },
                  { val: 'noPreference' as const, label: 'No Preference', desc: 'I\'m flexible with either option' },
                ].map(opt => (
                  <Box
                    key={opt.val}
                    onClick={() => { setLivingPreference(opt.val); api.patch('/auth/me', { livingPreference: opt.val }).catch(() => {}); }}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1.5px solid',
                      borderColor: livingPreference === opt.val ? 'primary.main' : 'divider',
                      bgcolor: livingPreference === opt.val ? 'rgba(25,118,210,0.05)' : 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{opt.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{opt.desc}</Typography>
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Account Actions</Typography>
              <Button variant="outlined" startIcon={<LogoutRoundedIcon />} onClick={handleLogout} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
                Log Out
              </Button>
            </TabPanel>
          </Box>
        </Paper>
      </Box>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Delete Account?</DialogTitle>
        <DialogContent><Typography color="text.secondary">This will permanently remove your account, applications, and saved listings. This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialog(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => { setDeleteDialog(false); handleLogout(); }} sx={{ textTransform: 'none', borderRadius: 2 }}>Delete &amp; Logout</Button>
        </DialogActions>
      </Dialog>
    </StudentLayout>
  );
}
