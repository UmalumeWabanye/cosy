'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import StudentLayout from '@/components/student/StudentLayout';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';

interface Viewing {
  _id: string;
  requestedDate: string;
  note?: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
  property?: {
    _id: string;
    propertyName?: string;
    city?: string;
    address?: string;
    images?: Array<string | { url?: string }>;
    price?: number;
  } | null;
}

interface PropertyOption {
  _id: string;
  propertyName?: string;
  city?: string;
}

function statusChip(status: Viewing['status']) {
  if (status === 'approved') return { color: 'success' as const, label: 'Approved' };
  if (status === 'declined') return { color: 'error' as const, label: 'Declined' };
  return { color: 'warning' as const, label: 'Pending' };
}

export default function ViewingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ property: '', requestedDate: '', note: '' });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/');
  }, [isLoading, isAuthenticated, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [viewingRes, propertyRes] = await Promise.all([
        api.get('/viewings/my'),
        api.get('/properties?limit=100'),
      ]);
      setViewings(Array.isArray(viewingRes.data?.data) ? viewingRes.data.data : []);
      const props = Array.isArray(propertyRes.data?.properties) ? propertyRes.data.properties : [];
      setProperties(props.map((p: any) => ({ _id: p._id, propertyName: p.propertyName, city: p.city })));

      if (typeof window !== 'undefined') {
        const queryPropertyId = new URLSearchParams(window.location.search).get('propertyId');
        if (queryPropertyId) setForm((prev) => ({ ...prev, property: queryPropertyId }));
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load viewings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestViewing = async () => {
    if (!form.property || !form.requestedDate) {
      setError('Select a property and date/time first.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await api.post('/viewings', form);
      setForm({ property: '', requestedDate: '', note: '' });
      await loadData();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to submit viewing request');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelViewing = async (viewingId: string) => {
    try {
      setCancellingId(viewingId);
      setError('');
      await api.delete(`/viewings/${viewingId}`);
      setViewings((prev) => prev.filter((item) => item._id !== viewingId));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to cancel viewing');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <StudentLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Viewing Bookings</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Schedule and track in-person or virtual property viewings.</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, mb: 2.5 }}>
          <Typography sx={{ fontWeight: 700, mb: 1.25 }}>Book a Viewing</Typography>
          <Stack sx={{ flexDirection: { xs: 'column', md: 'row' }, gap: 1.25 }}>
            <TextField
              size="small"
              select
              label="Property"
              value={form.property}
              onChange={(e) => setForm((p) => ({ ...p, property: e.target.value }))}
              fullWidth
            >
              <MenuItem value="">Select a property</MenuItem>
              {properties.map((p) => (
                <MenuItem key={p._id} value={p._id}>{p.propertyName || 'Property'}{p.city ? ` · ${p.city}` : ''}</MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="datetime-local"
              label="Preferred Time"
              value={form.requestedDate}
              onChange={(e) => setForm((p) => ({ ...p, requestedDate: e.target.value }))}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              label="Notes (optional)"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              fullWidth
            />
            <Button variant="contained" sx={{ textTransform: 'none', minWidth: { md: 130 } }} onClick={requestViewing} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Book'}
            </Button>
          </Stack>
        </Paper>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.25 }}>My Requests</Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : viewings.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 6, borderRadius: 2.5, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>No viewing requests yet</Typography>
            <Typography variant="body2" color="text.secondary">Book your first property viewing above.</Typography>
          </Paper>
        ) : (
          <Stack sx={{ gap: 1.25 }}>
            {viewings.map((v) => {
              const status = statusChip(v.status);
              const firstImage = v.property?.images?.[0];
              const img = typeof firstImage === 'string' ? firstImage : firstImage?.url;
              return (
                <Paper key={v._id} variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                  <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: 1.25 }}>
                    <Box sx={{ width: { xs: '100%', sm: 120 }, height: { xs: 120, sm: 88 }, borderRadius: 1.5, bgcolor: 'grey.100', backgroundImage: img ? `url(${img})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{v.property?.propertyName || 'Property'}</Typography>
                          <Typography variant="caption" color="text.secondary">{v.property?.address || ''}{v.property?.address && v.property?.city ? ', ' : ''}{v.property?.city || ''}</Typography>
                        </Box>
                        <Chip size="small" color={status.color} label={status.label} />
                      </Stack>

                      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mt: 0.75 }}>
                        <Chip size="small" variant="outlined" label={`Requested: ${new Date(v.requestedDate).toLocaleString('en-ZA')}`} />
                        {v.property?.price != null && <Chip size="small" variant="outlined" label={`R${v.property.price.toLocaleString()}/mo`} />}
                      </Stack>

                      {v.note ? <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>{v.note}</Typography> : null}

                      {v.status === 'pending' && (
                        <Box sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ textTransform: 'none' }}
                            onClick={() => cancelViewing(v._id)}
                            disabled={cancellingId === v._id}
                          >
                            {cancellingId === v._id ? 'Cancelling…' : 'Cancel Booking'}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </StudentLayout>
  );
}
