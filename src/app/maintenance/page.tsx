'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import StudentLayout from '@/components/student/StudentLayout';
import api from '@/services/api';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';

import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import PauseCircleRoundedIcon from '@mui/icons-material/PauseCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

const CATEGORIES = [
  'Plumbing', 'Electrical', 'Heating / Cooling', 'Internet / WiFi',
  'Locks / Security', 'Appliances', 'Structural', 'Pest Control', 'Other',
];

const PRIORITY_CONFIG = {
  low:    { label: 'Low',    color: '#2e7d32', bg: '#e8f5e9' },
  medium: { label: 'Medium', color: '#1565c0', bg: '#e3f2fd' },
  high:   { label: 'High',   color: '#e65100', bg: '#fff3e0' },
  urgent: { label: 'Urgent', color: '#c62828', bg: '#ffebee' },
};

const STATUS_CONFIG = {
  open:        { label: 'Open',        color: '#1565c0', bg: '#e3f2fd', Icon: PauseCircleRoundedIcon },
  in_progress: { label: 'In Progress', color: '#e65100', bg: '#fff3e0', Icon: AutorenewRoundedIcon },
  resolved:    { label: 'Resolved',    color: '#2e7d32', bg: '#e8f5e9', Icon: CheckCircleRoundedIcon },
  closed:      { label: 'Closed',      color: '#616161', bg: '#f5f5f5', Icon: CancelRoundedIcon },
};

interface ActiveProperty {
  request: string;
  property: { _id: string; propertyName?: string; city?: string; address?: string } | null;
  moveInDate: string;
}

interface Ticket {
  _id: string;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  expectedDate?: string;
  landlordNote?: string;
  createdAt: string;
  updatedAt: string;
  property?: { _id: string; propertyName?: string; city?: string };
}

export default function MaintenancePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeProperties, setActiveProperties] = useState<ActiveProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Submit dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ propertyId: '', category: '', description: '', priority: 'medium' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Cancel dialog
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading, router]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [ticketsRes, propsRes] = await Promise.all([
        api.get('/maintenance/my'),
        api.get('/maintenance/active-properties'),
      ]);
      setTickets(ticketsRes.data?.data ?? []);
      setActiveProperties(propsRes.data?.data ?? []);
    } catch {
      setError('Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

  const openDialog = () => {
    setForm({ propertyId: activeProperties.length === 1 ? (activeProperties[0].property?._id ?? '') : '', category: '', description: '', priority: 'medium' });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.propertyId) { setFormError('Please select a property'); return; }
    if (!form.category) { setFormError('Please select a category'); return; }
    if (form.description.trim().length < 10) { setFormError('Description must be at least 10 characters'); return; }
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/maintenance', {
        propertyId: form.propertyId,
        category: form.category,
        description: form.description.trim(),
        priority: form.priority,
      });
      setDialogOpen(false);
      await load();
    } catch (e: any) {
      setFormError(e?.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await api.delete(`/maintenance/${cancelId}`);
      setTickets(t => t.filter(x => x._id !== cancelId));
      setCancelId(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to cancel request');
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) return null;

  return (
    <StudentLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Stack sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Maintenance Requests</Typography>
            <Typography variant="body2" color="text.secondary">
              Report issues at your current property and track when they'll be fixed.
            </Typography>
          </Box>
          {activeProperties.length > 0 && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={openDialog}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              New Request
            </Button>
          )}
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : activeProperties.length === 0 ? (
          /* No active tenancy */
          <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <HandymanRoundedIcon sx={{ fontSize: 52, color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>No active tenancy found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Maintenance requests are only available once your application is approved and your move-in date has passed.
            </Typography>
            <Button variant="outlined" onClick={() => router.push('/applications')} sx={{ textTransform: 'none' }}>
              View My Applications
            </Button>
          </Paper>
        ) : (
          <>
            {/* Current tenancy info strip */}
            {activeProperties.map(ap => ap.property && (
              <Paper key={ap.request} elevation={0} sx={{
                p: 2, mb: 2.5, borderRadius: 2,
                border: '1px solid', borderColor: 'success.light',
                bgcolor: 'rgba(46,125,50,0.05)',
                display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
              }}>
                <HomeRoundedIcon sx={{ color: 'success.main', flexShrink: 0 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{ap.property.propertyName}</Typography>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                    <LocationOnRoundedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">{ap.property.city}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5 }}>·</Typography>
                    <CalendarMonthRoundedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">
                      Moved in {new Date(ap.moveInDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Typography>
                  </Stack>
                </Box>
                <Chip label="Active Tenancy" size="small" color="success" sx={{ fontWeight: 700 }} />
              </Paper>
            ))}

            {/* Tickets list */}
            {tickets.length === 0 ? (
              <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <HandymanRoundedIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>No maintenance requests yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  If something needs fixing, click "New Request" to notify your landlord.
                </Typography>
              </Paper>
            ) : (
              <Stack sx={{ gap: 2 }}>
                {tickets.map(ticket => {
                  const sCfg = STATUS_CONFIG[ticket.status];
                  const pCfg = PRIORITY_CONFIG[ticket.priority];
                  const StatusIcon = sCfg.Icon;
                  return (
                    <Paper key={ticket._id} elevation={0} sx={{
                      borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden',
                      transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
                    }}>
                      {/* Status accent bar */}
                      <Box sx={{ height: 4, bgcolor: sCfg.color }} />
                      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{ticket.category}</Typography>
                            {ticket.property && (
                              <Typography variant="caption" color="text.secondary">
                                {ticket.property.propertyName} · {ticket.property.city}
                              </Typography>
                            )}
                          </Box>
                          <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                            <Chip
                              icon={<StatusIcon sx={{ fontSize: '14px !important' }} />}
                              label={sCfg.label}
                              size="small"
                              sx={{ bgcolor: sCfg.bg, color: sCfg.color, fontWeight: 700, fontSize: 11, '& .MuiChip-icon': { color: sCfg.color } }}
                            />
                            <Chip
                              label={pCfg.label}
                              size="small"
                              sx={{ bgcolor: pCfg.bg, color: pCfg.color, fontWeight: 700, fontSize: 11 }}
                            />
                          </Stack>
                        </Stack>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                          {ticket.description}
                        </Typography>

                        {/* Landlord response */}
                        {(ticket.landlordNote || ticket.expectedDate) && (
                          <Box sx={{
                            p: 1.5, mb: 2, borderRadius: 1.5,
                            bgcolor: 'rgba(25,118,210,0.05)', border: '1px solid', borderColor: 'primary.light',
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block', mb: 0.5 }}>
                              Landlord response
                            </Typography>
                            {ticket.expectedDate && (
                              <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <CalendarMonthRoundedIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  Expected by {new Date(ticket.expectedDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </Typography>
                              </Stack>
                            )}
                            {ticket.landlordNote && (
                              <Typography variant="caption" color="text.secondary">{ticket.landlordNote}</Typography>
                            )}
                          </Box>
                        )}

                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Submitted {new Date(ticket.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {ticket.updatedAt !== ticket.createdAt && ` · Updated ${new Date(ticket.updatedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}`}
                          </Typography>
                          {ticket.status === 'open' && (
                            <Tooltip title="Cancel this request">
                              <Button
                                size="small" variant="text" color="error"
                                startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: '14px !important' }} />}
                                onClick={() => setCancelId(ticket._id)}
                                sx={{ textTransform: 'none', fontSize: 12 }}
                              >
                                Cancel
                              </Button>
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </>
        )}
      </Box>

      {/* Submit dialog */}
      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>New Maintenance Request</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Stack sx={{ gap: 2 }}>
            {activeProperties.length > 1 && (
              <FormControl fullWidth size="small">
                <InputLabel>Property</InputLabel>
                <Select
                  value={form.propertyId}
                  label="Property"
                  onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))}
                  sx={{ borderRadius: 1.5 }}
                >
                  {activeProperties.map(ap => ap.property && (
                    <MenuItem key={ap.request} value={ap.property._id}>
                      {ap.property.propertyName} — {ap.property.city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth size="small">
              <InputLabel>Category *</InputLabel>
              <Select
                value={form.category}
                label="Category *"
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                sx={{ borderRadius: 1.5 }}
              >
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={form.priority}
                label="Priority"
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                sx={{ borderRadius: 1.5 }}
              >
                <MenuItem value="low">Low — Minor inconvenience</MenuItem>
                <MenuItem value="medium">Medium — Needs attention soon</MenuItem>
                <MenuItem value="high">High — Affects daily living</MenuItem>
                <MenuItem value="urgent">Urgent — Safety or health risk</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Describe the issue *"
              multiline rows={4} fullWidth
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              inputProps={{ maxLength: 1000 }}
              helperText={`${form.description.length}/1000 — Be specific: location in the property, how long it's been happening, etc.`}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />

            {formError && <Alert severity="error" sx={{ borderRadius: 1.5 }}>{formError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting} sx={{ textTransform: 'none', borderRadius: 1.5 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}>
            {submitting ? 'Submitting…' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel confirm dialog */}
      <Dialog open={!!cancelId} onClose={() => !cancelling && setCancelId(null)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Cancel Request?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This will permanently remove the maintenance request. Your landlord will no longer see it.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setCancelId(null)} disabled={cancelling} sx={{ textTransform: 'none', borderRadius: 1.5 }}>Keep It</Button>
          <Button variant="contained" color="error" onClick={handleCancel} disabled={cancelling}
            sx={{ textTransform: 'none', borderRadius: 1.5 }}>
            {cancelling ? 'Cancelling…' : 'Cancel Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </StudentLayout>
  );
}
