'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import StudentLayout from '@/components/student/StudentLayout';
import api from '@/services/api';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Rating from '@mui/material/Rating';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Alert from '@mui/material/Alert';

import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

interface Req {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  moveInDate: string;
  leaseDuration: string;
  fundingType: string;
  message: string;
  createdAt: string;
  property?: {
    _id: string;
    propertyName?: string;
    name?: string;
    city?: string;
    address?: string;
    images?: Array<string | { url?: string }>;
    price?: number;
    roomType?: string;
  } | null;
}

const STATUS_CONFIG = {
  pending:  { label: 'Pending Review', color: '#ed6c02', bg: '#fff3e0', Icon: HourglassTopRoundedIcon },
  approved: { label: 'Approved',       color: '#2e7d32', bg: '#e8f5e9', Icon: CheckCircleRoundedIcon },
  rejected: { label: 'Rejected',       color: '#c62828', bg: '#ffebee', Icon: CancelRoundedIcon },
};

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [reqs, setReqs] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [isSmUp, setIsSmUp] = useState(true);
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState('');
  // Review state
  const [eligibleIds, setEligibleIds] = useState<Set<string>>(new Set());
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [reviewTarget, setReviewTarget] = useState<{ propertyId: string; propertyName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/'); }, [isAuthenticated, isLoading, router]);

  const fetchReqs = useCallback(async () => {
    try {
      const res = await api.get('/requests/my');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setReqs(data);
    } catch { setError('Failed to load applications.'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReqs(); }, [fetchReqs]);

  // Fetch review eligibility after applications load
  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/reviews/eligible').then(res => {
      setEligibleIds(new Set(res.data.eligible ?? []));
      setReviewedIds(new Set(res.data.reviewed ?? []));
    }).catch(() => { /* silent */ });
  }, [isAuthenticated]);

  const handleSubmitReview = async () => {
    if (!reviewTarget || !reviewRating) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      await api.post('/reviews', {
        propertyId: reviewTarget.propertyId,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviewedIds(prev => new Set([...prev, reviewTarget.propertyId]));
      setReviewTarget(null);
      setReviewRating(null);
      setReviewComment('');
    } catch (e: any) {
      setReviewError(e?.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    const mq = window.matchMedia('(min-width:600px)');
    const onChange = (e: MediaQueryListEvent) => setIsSmUp(e.matches);
    setIsSmUp(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawId) return;
    setWithdrawing(true);
    try {
      await api.delete(`/requests/${withdrawId}`);
      setReqs(r => r.filter(x => x._id !== withdrawId));
      setWithdrawId(null);
    } catch { setError('Failed to withdraw application.'); } finally { setWithdrawing(false); }
  };

  const filtered = filter === 'all' ? reqs : reqs.filter(r => r.status === filter);
  const counts = { all: reqs.length, pending: reqs.filter(r => r.status === 'pending').length, approved: reqs.filter(r => r.status === 'approved').length, rejected: reqs.filter(r => r.status === 'rejected').length };

  if (isLoading) return null;

  return (
    <StudentLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Stack sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>My Applications</Typography>
          <Button variant="contained" size="small" onClick={() => router.push('/browse')}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}>
            Browse Properties
          </Button>
        </Stack>

        <Paper elevation={0} sx={{ p: 1.5, mb: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Avatar src={user?.avatar || undefined} sx={{ width: 36, height: 36, fontSize: 13 }}>
              {(user?.name || 'S')[0].toUpperCase()}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.name || 'Student'}</Typography>
            <Typography variant="caption" color="text.secondary">School: {user?.university || 'Not provided'}</Typography>
            <Typography variant="caption" color="text.secondary">Course: {user?.course || user?.yearOfStudy || 'Not provided'}</Typography>
            <Typography variant="caption" color="text.secondary">ID: {user?.idNumber || 'Not provided'}</Typography>
          </Stack>
        </Paper>

        {/* Filters */}
        <Box sx={{ overflowX: 'auto', pb: 0.5, mb: 2.5 }}>
        <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small" sx={{ flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
          {((isSmUp ? ['all', 'pending', 'approved', 'rejected'] : ['pending', 'approved', 'rejected']) as Filter[]).map(f => (
            <ToggleButton key={f} value={f} sx={{ textTransform: 'none', fontWeight: 600, px: 2 }}>
              {f === 'all' ? 'All' : STATUS_CONFIG[f].label}
              <Chip label={counts[f]} size="small" sx={{ ml: 0.75, height: 18, fontSize: 10, fontWeight: 700,
                bgcolor: filter === f ? 'white' : 'transparent',
                color: filter === f ? 'primary.main' : 'text.secondary',
              }} />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <HomeRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary" sx={{ mb: 2 }}>No applications found</Typography>
            <Button variant="outlined" onClick={() => router.push('/browse')} sx={{ textTransform: 'none', borderRadius: 1.5 }}>
              Browse Properties
            </Button>
          </Paper>
        ) : (
          <Stack sx={{ gap: 2 }}>
            {filtered.map(req => {
              const cfg = STATUS_CONFIG[req.status];
              const prop = req.property;
              const firstImage = prop?.images?.[0];
              const img = typeof firstImage === 'string' ? firstImage : firstImage?.url;
              return (
                <Paper key={req._id} elevation={0} sx={{
                  borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden',
                  transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
                }}>
                  <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    {/* Image */}
                    <Box sx={{
                      width: { xs: '100%', sm: 140 }, height: { xs: 140, sm: 'auto' }, flexShrink: 0,
                      bgcolor: 'grey.100', backgroundImage: img ? `url(${img})` : undefined,
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {!img && <HomeRoundedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />}
                    </Box>

                      {/* Content */}
                    <Box sx={{ flex: 1, p: { xs: 1.5, sm: 2 } }}>
                      <Stack sx={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, wordBreak: 'break-word' }}>
                            {prop?.propertyName || prop?.name || 'Property Unavailable'}
                          </Typography>
                          {(prop?.address || prop?.city) && (
                            <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 0.5, mt: 0.25, flexWrap: 'wrap' }}>
                              <LocationOnRoundedIcon sx={{ fontSize: 13, color: 'text.disabled', flexShrink: 0 }} />
                              <Typography variant="caption" color="text.secondary">
                                {prop?.address}{prop?.address && prop?.city ? ', ' : ''}{prop?.city}
                              </Typography>
                            </Stack>
                          )}
                        </Box>
                        <Chip
                          icon={<cfg.Icon sx={{ fontSize: '14px !important' }} />}
                          label={cfg.label} size="small"
                          sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: 11, flexShrink: 0, '& .MuiChip-icon': { color: cfg.color } }}
                        />
                      </Stack>

                      {/* Meta row */}
                      <Stack sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: { xs: 1, sm: 2 }, mb: 1.5 }}>
                        {prop?.price != null && (
                          <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
                            <PaidRoundedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.secondary">R{prop.price.toLocaleString()}/mo</Typography>
                          </Stack>
                        )}
                        <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
                          <CalendarMonthRoundedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            Move in: {new Date(req.moveInDate).toLocaleDateString('en-ZA')}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {req.leaseDuration} • {req.fundingType}
                        </Typography>
                      </Stack>

                      {req.message && (
                        <Typography variant="caption" color="text.secondary" sx={{
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1.5,
                        }}>
                          "{req.message}"
                        </Typography>
                      )}

                      {/* Status timeline */}
                      <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        {(['pending', 'approved'] as const).map((s, i) => {
                          const active = req.status === 'rejected' ? false : (s === 'pending' || req.status === 'approved');
                          const current = req.status === s || (s === 'approved' && req.status === 'rejected');
                          return (
                            <React.Fragment key={s}>
                              {i > 0 && <Box sx={{ flex: 1, height: 2, bgcolor: active ? 'primary.main' : 'grey.200', borderRadius: 1, maxWidth: 40 }} />}
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: active ? 'primary.main' : 'grey.300' }} />
                            </React.Fragment>
                          );
                        })}
                        <Typography variant="caption" sx={{ ml: 1, color: cfg.color, fontWeight: 600 }}>
                          {req.status === 'rejected' ? 'Rejected' : req.status === 'approved' ? 'Approved' : 'Under Review'}
                        </Typography>
                      </Stack>

                      {/* Actions */}
                      <Stack sx={{ flexDirection: 'row', gap: 1, flexWrap: 'wrap' }}>
                        {prop && (
                          <Button size="small" variant="outlined" startIcon={<OpenInNewRoundedIcon sx={{ fontSize: '14px !important' }} />}
                            onClick={() => router.push(`/browse/${prop._id}`)}
                            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, fontSize: 12 }}>
                            View Property
                          </Button>
                        )}
                        {req.status === 'pending' && (
                          <Button size="small" variant="text" color="error"
                            startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: '14px !important' }} />}
                            onClick={() => setWithdrawId(req._id)}
                            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, fontSize: 12 }}>
                            Withdraw
                          </Button>
                        )}
                        {req.status === 'approved' && prop && eligibleIds.has(prop._id) && (
                          reviewedIds.has(prop._id) ? (
                            <Chip
                              icon={<StarRoundedIcon sx={{ fontSize: '14px !important', color: '#92400e !important' }} />}
                              label="Review submitted"
                              size="small"
                              sx={{ height: 28, fontSize: 11, fontWeight: 700, bgcolor: '#fef3c7', color: '#92400e' }}
                            />
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              startIcon={<RateReviewRoundedIcon sx={{ fontSize: '14px !important' }} />}
                              onClick={() => {
                                setReviewTarget({ propertyId: prop._id, propertyName: prop.propertyName || prop.name || 'this property' });
                                setReviewRating(null);
                                setReviewComment('');
                                setReviewError('');
                              }}
                              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, fontSize: 12 }}
                            >
                              Leave Review
                            </Button>
                          )
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Withdraw confirm dialog */}
      <Dialog open={!!withdrawId} onClose={() => setWithdrawId(null)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Withdraw Application?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This will permanently remove your application. You can re-apply later if the property is still available.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setWithdrawId(null)} sx={{ textTransform: 'none', borderRadius: 1.5 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleWithdraw} disabled={withdrawing}
            sx={{ textTransform: 'none', borderRadius: 1.5 }}>
            {withdrawing ? 'Withdrawing…' : 'Withdraw'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave Review dialog */}
      <Dialog open={!!reviewTarget} onClose={() => !reviewSubmitting && setReviewTarget(null)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Leave a Review</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          {reviewTarget && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Share your experience staying at <strong>{reviewTarget.propertyName}</strong>.
            </Typography>
          )}
          <Stack sx={{ alignItems: 'flex-start', gap: 0.5, mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Your rating <span style={{ color: '#d32f2f' }}>*</span></Typography>
            <Rating
              value={reviewRating}
              onChange={(_, v) => setReviewRating(v)}
              size="large"
              sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' } }}
            />
          </Stack>
          <TextField
            label="Comment (optional)"
            multiline
            rows={4}
            fullWidth
            value={reviewComment}
            onChange={e => setReviewComment(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 500 } }}
            helperText={`${reviewComment.length}/500`}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
          {reviewError && <Alert severity="error" sx={{ mt: 1.5, borderRadius: 1.5 }}>{reviewError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setReviewTarget(null)} disabled={reviewSubmitting} sx={{ textTransform: 'none', borderRadius: 1.5 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleSubmitReview}
            disabled={reviewSubmitting || !reviewRating}
            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700 }}
          >
            {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </StudentLayout>
  );
}
