'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LandlordLayout from '@/components/landlord/LandlordLayout';
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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import PauseCircleRoundedIcon from '@mui/icons-material/PauseCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import RoomRoundedIcon from '@mui/icons-material/RoomRounded';

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  low:    { label: 'Low',    color: '#2e7d32', bg: '#e8f5e9' },
  medium: { label: 'Medium', color: '#1565c0', bg: '#e3f2fd' },
  high:   { label: 'High',   color: '#e65100', bg: '#fff3e0' },
  urgent: { label: 'Urgent', color: '#c62828', bg: '#ffebee' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: React.ComponentType<{ sx?: object }> }> = {
  open:        { label: 'Open',        color: '#1565c0', bg: '#e3f2fd', Icon: PauseCircleRoundedIcon },
  in_progress: { label: 'In Progress', color: '#e65100', bg: '#fff3e0', Icon: AutorenewRoundedIcon },
  resolved:    { label: 'Resolved',    color: '#2e7d32', bg: '#e8f5e9', Icon: CheckCircleRoundedIcon },
  closed:      { label: 'Closed',      color: '#616161', bg: '#f5f5f5', Icon: CancelRoundedIcon },
};

const PRIORITY_FILTERS = ['all', 'low', 'medium', 'high', 'urgent'] as const;

type StatusFilter = 'all' | 'open' | 'in_progress' | 'resolved' | 'closed';

interface Ticket {
  _id: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  roomNumber?: string;
  expectedDate?: string;
  landlordNote?: string;
  createdAt: string;
  updatedAt: string;
  student?: { name?: string; email?: string };
  property?: { _id: string; propertyName?: string; city?: string };
}

export default function LandlordMaintenancePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('');
  const [openCount, setOpenCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);

  // Update dialog
  const [editTarget, setEditTarget] = useState<Ticket | null>(null);
  const [editForm, setEditForm] = useState({ status: '', expectedDate: '', landlordNote: '' });
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'landlord')) router.push('/');
  }, [isLoading, isAuthenticated, user, router]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      if (propertyFilter !== 'all') params.set('propertyId', propertyFilter);
      if (roomFilter.trim()) params.set('roomNumber', roomFilter.trim());

      const res = await api.get(`/maintenance/landlord?${params.toString()}`);
      setTickets(res.data?.data ?? []);
      setOpenCount(res.data?.openCount ?? 0);
      setInProgressCount(res.data?.inProgressCount ?? 0);
    } catch {
      setError('Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, propertyFilter, roomFilter]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'landlord') load();
  }, [isAuthenticated, user, load]);

  const propertyOptions = useMemo(() => {
    const map = new Map<string, NonNullable<Ticket['property']>>();
    tickets.forEach((ticket) => {
      if (ticket.property?._id) map.set(ticket.property._id, ticket.property);
    });
    return Array.from(map.values()).sort((a, b) => (a.propertyName || '').localeCompare(b.propertyName || ''));
  }, [tickets]);

  const roomCoverage = useMemo(() => {
    if (tickets.length === 0) return 0;
    return Math.round((tickets.filter((ticket) => Boolean(ticket.roomNumber)).length / tickets.length) * 100);
  }, [tickets]);

  const openEdit = (ticket: Ticket) => {
    setEditTarget(ticket);
    setEditForm({
      status: ticket.status,
      expectedDate: ticket.expectedDate ? ticket.expectedDate.split('T')[0] : '',
      landlordNote: ticket.landlordNote ?? '',
    });
    setEditError('');
  };

  const handleSave = async () => {
    if (!editTarget) return;
    setSaving(true);
    setEditError('');
    try {
      const payload: Record<string, string> = { status: editForm.status };
      if (editForm.expectedDate) payload.expectedDate = editForm.expectedDate;
      if (editForm.landlordNote.trim()) payload.landlordNote = editForm.landlordNote.trim();
      await api.patch(`/maintenance/${editTarget._id}`, payload);
      setEditTarget(null);
      await load();
    } catch (e: any) {
      setEditError(e?.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const filtered = tickets.filter((ticket) => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;
    if (propertyFilter !== 'all' && ticket.property?._id !== propertyFilter) return false;
    if (roomFilter.trim() && !(ticket.roomNumber || '').toLowerCase().includes(roomFilter.trim().toLowerCase())) return false;
    return true;
  });

  const counts: Record<StatusFilter, number> = {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };

  if (isLoading) return null;

  return (
    <LandlordLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Stack sx={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Maintenance Requests</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage repair and maintenance requests submitted by your tenants.
            </Typography>
          </Box>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            {(openCount + inProgressCount) > 0 && (
              <Chip
                icon={<HandymanRoundedIcon sx={{ fontSize: '16px !important' }} />}
                label={`${openCount} open · ${inProgressCount} in progress`}
                color="warning"
                sx={{ fontWeight: 700 }}
              />
            )}
            <Chip
              icon={<RoomRoundedIcon sx={{ fontSize: '16px !important' }} />}
              label={`${roomCoverage}% room-linked`}
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          </Stack>
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 1.5, alignItems: { md: 'center' } }}>
            <TextField
              select
              size="small"
              label="Property"
              value={propertyFilter}
              onChange={(event) => setPropertyFilter(event.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">All properties</MenuItem>
              {propertyOptions.map((property) => (
                <MenuItem key={property._id} value={property._id}>{property.propertyName || 'Property'}</MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              label="Room"
              placeholder="e.g. B12"
              value={roomFilter}
              onChange={(event) => setRoomFilter(event.target.value)}
              sx={{ minWidth: 150 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Priority</InputLabel>
              <Select label="Priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as typeof priorityFilter)}>
                {PRIORITY_FILTERS.map((priority) => (
                  <MenuItem key={priority} value={priority}>{priority === 'all' ? 'All priorities' : priority}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setPropertyFilter('all');
                setRoomFilter('');
              }}
              sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              Clear filters
            </Button>
          </Stack>

          <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
            {[
              { label: 'Total', value: tickets.length, icon: <HomeRoundedIcon sx={{ fontSize: 18 }} />, color: '#1976d2' },
              { label: 'Open', value: counts.open, icon: <PauseCircleRoundedIcon sx={{ fontSize: 18 }} />, color: '#1565c0' },
              { label: 'In progress', value: counts.in_progress, icon: <AutorenewRoundedIcon sx={{ fontSize: 18 }} />, color: '#e65100' },
              { label: 'Room-linked', value: tickets.filter((ticket) => Boolean(ticket.roomNumber)).length, icon: <RoomRoundedIcon sx={{ fontSize: 18 }} />, color: '#2e7d32' },
            ].map((item) => (
              <Grid key={item.label} size={{ xs: 6, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                    <Box sx={{ color: item.color }}>{item.icon}</Box>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{item.value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Summary cards */}
        {!loading && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)' }, gap: 1.5, mb: 3 }}>
            {(['open', 'in_progress', 'resolved', 'closed'] as const).map(s => {
              const cfg = STATUS_CONFIG[s];
              const Icon = cfg.Icon;
              return (
                <Paper key={s} elevation={0} onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)} sx={{
                  p: 2, borderRadius: 2, border: '1px solid', borderColor: statusFilter === s ? cfg.color : 'divider',
                  cursor: 'pointer', bgcolor: statusFilter === s ? cfg.bg : 'background.paper',
                  transition: 'all 0.15s',
                }}>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Icon sx={{ fontSize: 18, color: cfg.color }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: cfg.color }}>{cfg.label}</Typography>
                  </Stack>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: cfg.color }}>{counts[s]}</Typography>
                </Paper>
              );
            })}
          </Box>
        )}

        {/* Filter tabs */}
        <Box sx={{ overflowX: 'auto', pb: 0.5, mb: 2.5 }}>
          <ToggleButtonGroup
            value={statusFilter} exclusive
            onChange={(_, v) => v && setStatusFilter(v)}
            size="small" sx={{ flexWrap: 'nowrap' }}
          >
            {(['all', 'open', 'in_progress', 'resolved', 'closed'] as StatusFilter[]).map(f => (
              <ToggleButton key={f} value={f} sx={{ textTransform: 'none', fontWeight: 600, px: 2 }}>
                {f === 'all' ? 'All' : STATUS_CONFIG[f].label}
                <Chip label={counts[f]} size="small" sx={{ ml: 0.75, height: 18, fontSize: 10, fontWeight: 700 }} />
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <HandymanRoundedIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              {statusFilter === 'all' ? 'No maintenance requests yet' : `No ${STATUS_CONFIG[statusFilter]?.label.toLowerCase()} requests`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Requests submitted by your tenants will appear here.
            </Typography>
          </Paper>
        ) : (
          <Stack sx={{ gap: 2 }}>
            {filtered.map(ticket => {
              const sCfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
              const pCfg = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.medium;
              const StatusIcon = sCfg.Icon;
              return (
                <Paper key={ticket._id} elevation={0} sx={{
                  borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden',
                  transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
                }}>
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
                      <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip
                          icon={<StatusIcon sx={{ fontSize: '14px !important' }} />}
                          label={sCfg.label} size="small"
                          sx={{ bgcolor: sCfg.bg, color: sCfg.color, fontWeight: 700, fontSize: 11, '& .MuiChip-icon': { color: sCfg.color } }}
                        />
                        <Chip
                          label={pCfg.label} size="small"
                          sx={{ bgcolor: pCfg.bg, color: pCfg.color, fontWeight: 700, fontSize: 11 }}
                        />
                        <Button
                          size="small" variant="outlined"
                          startIcon={<EditRoundedIcon sx={{ fontSize: '14px !important' }} />}
                          onClick={() => openEdit(ticket)}
                          sx={{ textTransform: 'none', fontSize: 12, borderRadius: 1.5 }}
                        >
                          Update
                        </Button>
                      </Stack>
                    </Stack>

                    {/* Student info */}
                    {ticket.student && (
                      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.light', color: 'primary.dark' }}>
                          {(ticket.student.name || 'S')[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{ticket.student.name || 'Student'}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{ticket.student.email}</Typography>
                        </Box>
                      </Stack>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {ticket.description}
                    </Typography>

                    {/* Your response preview */}
                    {(ticket.landlordNote || ticket.expectedDate) && (
                      <Box sx={{
                        p: 1.5, mb: 2, borderRadius: 1.5,
                        bgcolor: 'rgba(16,185,129,0.05)', border: '1px solid', borderColor: 'success.light',
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.dark', display: 'block', mb: 0.5 }}>
                          Your response
                        </Typography>
                        {ticket.expectedDate && (
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                            <CalendarMonthRoundedIcon sx={{ fontSize: 13, color: 'success.main' }} />
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

                    <Divider sx={{ my: 1.5 }} />
                    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5, flexWrap: 'wrap' }}>
                      <Box sx={{ minWidth: 120 }}>
                        <Typography variant="caption" color="text.secondary">Room</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {ticket.roomNumber ? `Room ${ticket.roomNumber}` : 'Not assigned'}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 120 }}>
                        <Typography variant="caption" color="text.secondary">Priority</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{ticket.priority}</Typography>
                      </Box>
                      <Box sx={{ minWidth: 120 }}>
                        <Typography variant="caption" color="text.secondary">Status</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{ticket.status.replace('_', ' ')}</Typography>
                      </Box>
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      Submitted {new Date(ticket.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Update dialog */}
      <Dialog open={!!editTarget} onClose={() => !saving && setEditTarget(null)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Maintenance Request</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          {editTarget && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>{editTarget.category}</strong> · {editTarget.property?.propertyName}
            </Typography>
          )}
          <Stack sx={{ gap: 2 }}>
            {editTarget && (
              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'grey.50' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>Room context</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {editTarget.property?.propertyName || 'Property'}
                  {editTarget.roomNumber ? ` · Room ${editTarget.roomNumber}` : ' · No room assigned'}
                </Typography>
              </Paper>
            )}
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.status}
                label="Status"
                onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                sx={{ borderRadius: 1.5 }}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_progress">In Progress — you&apos;re working on it</MenuItem>
                <MenuItem value="resolved">Resolved — issue fixed</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Expected resolution date"
              type="date"
              size="small"
              fullWidth
              value={editForm.expectedDate}
              onChange={e => setEditForm(f => ({ ...f, expectedDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="Let the tenant know when to expect the fix"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />

            <TextField
              label="Note to tenant (optional)"
              multiline rows={3} fullWidth
              value={editForm.landlordNote}
              onChange={e => setEditForm(f => ({ ...f, landlordNote: e.target.value }))}
              slotProps={{ htmlInput: { maxLength: 500 } }}
              helperText={`${editForm.landlordNote.length}/500 — e.g. "Plumber booked for Thursday morning"`}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />

            {editError && <Alert severity="error" sx={{ borderRadius: 1.5 }}>{editError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setEditTarget(null)} disabled={saving} sx={{ textTransform: 'none', borderRadius: 1.5 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </LandlordLayout>
  );
}
