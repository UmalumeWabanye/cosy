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
import IconButton from '@mui/material/IconButton';

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
import StarRoundedIcon from '@mui/icons-material/StarRounded';

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
  roomNumber?: string;
}

interface Attachment {
  url: string;
  filename?: string;
}

interface ConversationItem {
  sender: 'student' | 'landlord';
  message: string;
  attachments?: Attachment[];
  createdAt: string;
}

interface Ticket {
  _id: string;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  expectedDate?: string;
  landlordNote?: string;
  roomNumber?: string;
  attachments?: Attachment[];
  conversation?: ConversationItem[];
  rating?: number;
  ratingComment?: string;
  ratedAt?: string;
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
  const [requestFiles, setRequestFiles] = useState<File[]>([]);

  // Reply / conversation state
  const [replyTicket, setReplyTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [replyError, setReplyError] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Rating dialog state
  const [ratingTicket, setRatingTicket] = useState<Ticket | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

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
    setRequestFiles([]);
    setFormError('');
    setDialogOpen(true);
  };

  const uploadImages = async (files: File[]) => {
    const uploads = await Promise.all(files.map(async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/maintenance/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { url: response.data.imageUrl, filename: file.name };
    }));
    return uploads;
  };

  const handleRequestFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setRequestFiles((current) => {
      const next = [...current, ...files].slice(0, 4);
      return next;
    });
  };

  const handleRemoveRequestFile = (index: number) => {
    setRequestFiles((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.propertyId) { setFormError('Please select a property'); return; }
    if (!form.category) { setFormError('Please select a category'); return; }
    if (form.description.trim().length < 10) { setFormError('Description must be at least 10 characters'); return; }
    setSubmitting(true);
    setFormError('');
    try {
      const attachments = requestFiles.length > 0 ? await uploadImages(requestFiles) : [];
      await api.post('/maintenance', {
        propertyId: form.propertyId,
        category: form.category,
        description: form.description.trim(),
        priority: form.priority,
        attachments,
      });
      setDialogOpen(false);
      await load();
    } catch (e: any) {
      setFormError(e?.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyOpen = (ticket: Ticket) => {
    setReplyTicket(ticket);
    setReplyMessage('');
    setReplyFiles([]);
    setReplyError('');
  };

  const handleReplyFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setReplyFiles((current) => {
      const next = [...current, ...files].slice(0, 4);
      return next;
    });
  };

  const handleRemoveReplyFile = (index: number) => {
    setReplyFiles((current) => current.filter((_, i) => i !== index));
  };

  const handleReplySubmit = async () => {
    if (!replyTicket) return;
    if (replyMessage.trim().length < 2) {
      setReplyError('Please add a message before sending');
      return;
    }
    setReplySubmitting(true);
    setReplyError('');
    try {
      const attachments = replyFiles.length > 0 ? await uploadImages(replyFiles) : [];
      await api.post(`/maintenance/${replyTicket._id}/comment`, {
        message: replyMessage.trim(),
        attachments,
      });
      setReplyTicket(null);
      await load();
    } catch (e: any) {
      setReplyError(e?.response?.data?.message || 'Failed to send update');
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleRatingOpen = (ticket: Ticket) => {
    setRatingTicket(ticket);
    setRatingValue(5);
    setRatingComment('');
    setRatingError('');
  };

  const handleRatingSubmit = async () => {
    if (!ratingTicket) return;
    setRatingSubmitting(true);
    setRatingError('');
    try {
      await api.post(`/maintenance/${ratingTicket._id}/rating`, {
        rating: ratingValue,
        comment: ratingComment.trim() || undefined,
      });
      setRatingTicket(null);
      await load();
    } catch (e: any) {
      setRatingError(e?.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingSubmitting(false);
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
              Maintenance requests are only available once your application is approved, your move-in date has passed, and your room has been assigned.
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
                    {ap.roomNumber && (
                      <>
                        <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5 }}>·</Typography>
                        <Typography variant="caption" sx={{ color: 'success.dark', fontWeight: 700 }}>Room {ap.roomNumber}</Typography>
                      </>
                    )}
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
                                {ticket.roomNumber ? ` · Room ${ticket.roomNumber}` : ''}
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

                        {ticket.attachments?.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Attachments</Typography>
                            <Stack direction="row" sx={{ flexWrap: 'wrap' }} spacing={1}>
                              {ticket.attachments.map((attachment, index) => (
                                <Box key={`${attachment.url}-${index}`} sx={{ width: 96, height: 96, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                                  <a href={attachment.url} target="_blank" rel="noreferrer noopener">
                                    <img src={attachment.url} alt={attachment.filename || 'Attachment'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </a>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {ticket.conversation?.length > 0 && (
                          <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>Conversation</Typography>
                            <Stack sx={{ gap: 1 }}>
                              {ticket.conversation.map((item, index) => (
                                <Box key={`${item.sender}-${index}`} sx={{ p: 1.5, borderRadius: 2, bgcolor: item.sender === 'student' ? 'rgba(13,110,253,0.06)' : 'rgba(25,118,210,0.08)' }}>
                                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                                    {item.sender === 'student' ? 'You' : 'Landlord'} · {new Date(item.createdAt).toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{item.message}</Typography>
                                  {item.attachments?.length > 0 && (
                                    <Stack direction="row" sx={{ flexWrap: 'wrap', mt: 1 }} spacing={1}>
                                      {item.attachments.map((attachment, childIndex) => (
                                        <Box key={`${attachment.url}-${childIndex}`} sx={{ width: 84, height: 84, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                                          <a href={attachment.url} target="_blank" rel="noreferrer noopener">
                                            <img src={attachment.url} alt={attachment.filename || 'Attachment'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                          </a>
                                        </Box>
                                      ))}
                                    </Stack>
                                  )}
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {ticket.rating && (
                          <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(255,243,224,0.6)', border: '1px solid', borderColor: 'warning.light' }}>
                            <Stack direction="row" sx={{ alignItems: 'center', mb: 1 }} spacing={0.5}>
                              {Array.from({ length: ticket.rating }).map((_, idx) => (
                                <StarRoundedIcon key={idx} sx={{ fontSize: 16, color: '#fbc02d' }} />
                              ))}
                              <Typography variant="caption" color="text.secondary">Rated this service</Typography>
                            </Stack>
                            {ticket.ratingComment && (
                              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{ticket.ratingComment}</Typography>
                            )}
                          </Box>
                        )}

                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Submitted {new Date(ticket.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {ticket.updatedAt !== ticket.createdAt && ` · Updated ${new Date(ticket.updatedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}`}
                          </Typography>
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            {ticket.status !== 'closed' && (
                              <Button
                                size="small" variant="outlined"
                                onClick={() => handleReplyOpen(ticket)}
                                sx={{ textTransform: 'none', fontSize: 12, borderRadius: 1.5 }}
                              >
                                Send update
                              </Button>
                            )}

                            {['resolved', 'closed'].includes(ticket.status) && !ticket.rating && (
                              <Button
                                size="small" variant="contained"
                                onClick={() => handleRatingOpen(ticket)}
                                sx={{ textTransform: 'none', fontSize: 12, borderRadius: 1.5 }}
                              >
                                Rate work
                              </Button>
                            )}

                            {ticket.rating && (
                              <Stack direction="row" sx={{ alignItems: 'center' }} spacing={0.5}>
                                {Array.from({ length: ticket.rating }).map((_, idx) => (
                                  <StarRoundedIcon key={idx} sx={{ fontSize: 16, color: '#fbc02d' }} />
                                ))}
                                <Typography variant="caption" color="text.secondary">Rated</Typography>
                              </Stack>
                            )}

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
              slotProps={{ htmlInput: { maxLength: 1000 } }}
              helperText={`${form.description.length}/1000 — Be specific: location in the property, how long it's been happening, etc.`}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />

            <Box>
              <input
                id="maintenance-request-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleRequestFilesChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="maintenance-request-images">
                <Button variant="outlined" component="span" sx={{ textTransform: 'none', borderRadius: 1.5 }}>
                  Add photos (optional)
                </Button>
              </label>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Upload up to 4 images to help your landlord understand the issue.
              </Typography>
            </Box>

            {requestFiles.length > 0 && (
              <Stack direction="row" sx={{ flexWrap: 'wrap', mt: 1 }} spacing={1}>
                {requestFiles.map((file, index) => (
                  <Box key={file.name + index} sx={{ position: 'relative', width: 92, height: 92, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                    <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveRequestFile(index)}
                      sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' } }}
                    >
                      <CancelRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}

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

      {/* Reply dialog */}
      <Dialog open={!!replyTicket} onClose={() => !replySubmitting && setReplyTicket(null)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Update your landlord</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Stack sx={{ gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Send a quick follow-up or add extra details for the maintenance request.
            </Typography>
            <TextField
              label="Message"
              multiline rows={4} fullWidth
              value={replyMessage}
              onChange={e => setReplyMessage(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
              helperText={`${replyMessage.length}/1000`}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />

            <Box>
              <input
                id="maintenance-reply-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleReplyFilesChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="maintenance-reply-images">
                <Button variant="outlined" component="span" sx={{ textTransform: 'none', borderRadius: 1.5 }}>
                  Add images
                </Button>
              </label>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Attach up to 4 images with your message.
              </Typography>
            </Box>

            {replyFiles.length > 0 && (
              <Stack direction="row" sx={{ flexWrap: 'wrap', mt: 1 }} spacing={1}>
                {replyFiles.map((file, index) => (
                  <Box key={file.name + index} sx={{ position: 'relative', width: 92, height: 92, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                    <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveReplyFile(index)}
                      sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' } }}
                    >
                      <CancelRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}

            {replyError && <Alert severity="error" sx={{ borderRadius: 1.5 }}>{replyError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setReplyTicket(null)} disabled={replySubmitting} sx={{ textTransform: 'none', borderRadius: 1.5 }}>Cancel</Button>
          <Button variant="contained" onClick={handleReplySubmit} disabled={replySubmitting}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}>
            {replySubmitting ? 'Sending…' : 'Send update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rating dialog */}
      <Dialog open={!!ratingTicket} onClose={() => !ratingSubmitting && setRatingTicket(null)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Rate maintenance help</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Stack sx={{ gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Tell us how well the issue was handled so we can improve maintenance support.
            </Typography>
            <Stack direction="row" spacing={1}>
              {Array.from({ length: 5 }).map((_, index) => (
                <IconButton
                  key={index}
                  size="small"
                  onClick={() => setRatingValue(index + 1)}
                  sx={{ color: index < ratingValue ? '#fbc02d' : 'action.disabled', p: 0.5 }}
                >
                  <StarRoundedIcon fontSize="small" />
                </IconButton>
              ))}
            </Stack>
            <TextField
              label="Comments (optional)"
              multiline rows={3} fullWidth
              value={ratingComment}
              onChange={e => setRatingComment(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
              helperText={`${ratingComment.length}/1000`}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
            {ratingError && <Alert severity="error" sx={{ borderRadius: 1.5 }}>{ratingError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setRatingTicket(null)} disabled={ratingSubmitting} sx={{ textTransform: 'none', borderRadius: 1.5 }}>Cancel</Button>
          <Button variant="contained" onClick={handleRatingSubmit} disabled={ratingSubmitting}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}>
            {ratingSubmitting ? 'Submitting…' : 'Submit rating'}
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
