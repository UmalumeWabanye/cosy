'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayout';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

interface QueueJob {
  _id: string;
  type: 'email' | 'notification';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  runAfter?: string;
  lastError?: string;
  correlationId?: string;
  lockedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface QueueJobDetail extends QueueJob {
  payload?: Record<string, unknown>;
  history?: Array<{
    at?: string;
    action?: string;
    status?: string;
    workerId?: string;
    detail?: string;
  }>;
}

interface IncidentTimelineItem {
  correlationId: string;
  totalJobs: number;
  failedJobs: number;
  latestUpdateAt?: string;
  latestCreatedAt?: string;
}

interface IncidentFlowJob {
  _id?: string;
  type?: 'email' | 'notification';
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  attempts?: number;
  maxAttempts?: number;
  lastError?: string;
  createdAt?: string;
  updatedAt?: string;
  history?: Array<{
    at?: string;
    action?: string;
    status?: string;
    workerId?: string;
    detail?: string;
  }>;
}

const statusColor = (status: QueueJob['status']) => {
  if (status === 'completed') return 'success';
  if (status === 'failed') return 'error';
  if (status === 'processing') return 'info';
  return 'default';
};

const QUEUE_OPERATOR_PREFS_KEY = 'admin-queue-operator-prefs-v1';

export default function AdminQueuePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [items, setItems] = useState<QueueJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [correlationFilter, setCorrelationFilter] = useState('');
  const [appliedCorrelationFilter, setAppliedCorrelationFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [autoRefreshSeconds, setAutoRefreshSeconds] = useState(30);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1 });
  const [timeline, setTimeline] = useState<IncidentTimelineItem[]>([]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<QueueJobDetail | null>(null);
  const [flowOpen, setFlowOpen] = useState(false);
  const [flowLoading, setFlowLoading] = useState(false);
  const [activeFlowCorrelationId, setActiveFlowCorrelationId] = useState('');
  const [flowItems, setFlowItems] = useState<IncidentFlowJob[]>([]);
  const [flowStatusFilter, setFlowStatusFilter] = useState<'all' | 'failed' | 'processing' | 'completed' | 'pending'>('all');
  const [expandedFlowRows, setExpandedFlowRows] = useState<string[]>([]);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [requeueingFlowJobId, setRequeueingFlowJobId] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      if (appliedCorrelationFilter.trim()) params.set('correlationId', appliedCorrelationFilter.trim());
      params.set('sortBy', sortBy);
      params.set('sortDir', sortDir);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await api.get(`/admin/jobs/side-effects?${params.toString()}`);
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setItems(list);
      setPagination({
        total: Number(res.data?.total || 0),
        pages: Math.max(1, Number(res.data?.pages || 1)),
        currentPage: Number(res.data?.currentPage || page),
      });
      setSelectedIds((prev) => prev.filter((id) => list.some((item: QueueJob) => item._id === id)));

      const timelineRes = await api.get('/admin/jobs/side-effects/timeline?limit=12');
      setTimeline(Array.isArray(timelineRes.data?.data) ? timelineRes.data.data : []);
      setLastRefreshedAt(new Date());
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load queue jobs');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, appliedCorrelationFilter, sortBy, sortDir, page, limit]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchJobs();
    }
  }, [isAuthenticated, user, fetchJobs]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUEUE_OPERATOR_PREFS_KEY);
      if (!raw) return;
      const prefs = JSON.parse(raw);
      if (typeof prefs.autoRefresh === 'boolean') setAutoRefresh(prefs.autoRefresh);
      if ([15, 30, 60, 120].includes(Number(prefs.autoRefreshSeconds))) {
        setAutoRefreshSeconds(Number(prefs.autoRefreshSeconds));
      }
      if ([10, 20, 50, 100].includes(Number(prefs.limit))) setLimit(Number(prefs.limit));
      if (typeof prefs.sortBy === 'string' && prefs.sortBy) setSortBy(prefs.sortBy);
      if (prefs.sortDir === 'asc' || prefs.sortDir === 'desc') setSortDir(prefs.sortDir);
    } catch {
      // Ignore malformed local storage data and keep defaults.
    }
  }, []);

  useEffect(() => {
    const prefs = {
      autoRefresh,
      autoRefreshSeconds,
      limit,
      sortBy,
      sortDir,
    };
    localStorage.setItem(QUEUE_OPERATOR_PREFS_KEY, JSON.stringify(prefs));
  }, [autoRefresh, autoRefreshSeconds, limit, sortBy, sortDir]);

  const failedSelectedIds = useMemo(
    () => items.filter((item) => selectedIds.includes(item._id) && item.status === 'failed').map((item) => item._id),
    [items, selectedIds]
  );

  const flowSummary = useMemo(() => {
    const summary = {
      total: flowItems.length,
      failed: 0,
      completed: 0,
      processing: 0,
      pending: 0,
      oldestCreatedAt: '',
      newestCreatedAt: '',
    };

    for (const item of flowItems) {
      if (item.status === 'failed') summary.failed += 1;
      else if (item.status === 'completed') summary.completed += 1;
      else if (item.status === 'processing') summary.processing += 1;
      else summary.pending += 1;
    }

    const createdAtValues = flowItems
      .map((item) => item.createdAt)
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    summary.oldestCreatedAt = createdAtValues[0] || '';
    summary.newestCreatedAt = createdAtValues[createdAtValues.length - 1] || '';

    return summary;
  }, [flowItems]);

  const filteredFlowItems = useMemo(() => {
    if (flowStatusFilter === 'all') return flowItems;
    return flowItems.filter((item) => (item.status || 'pending') === flowStatusFilter);
  }, [flowItems, flowStatusFilter]);

  const latestFailedCorrelation = useMemo(() => {
    const failedTimeline = timeline.filter((entry) => entry.failedJobs > 0);
    if (failedTimeline.length === 0) return null;

    return failedTimeline.sort((a, b) => {
      const aTs = new Date(a.latestUpdateAt || a.latestCreatedAt || 0).getTime();
      const bTs = new Date(b.latestUpdateAt || b.latestCreatedAt || 0).getTime();
      return bTs - aTs;
    })[0];
  }, [timeline]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = items.map((item) => item._id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const openDetails = async (id: string) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setDetail(null);
      const res = await api.get(`/admin/jobs/side-effects/${id}`);
      setDetail(res.data?.data || null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load queue job details');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const runQueueNow = async () => {
    try {
      setActionBusy(true);
      await api.post('/admin/jobs/side-effects/run', { batchSize: 100 });
      await fetchJobs();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to run queue');
    } finally {
      setActionBusy(false);
    }
  };

  const loadIncidentFlow = useCallback(async (id: string) => {
    const res = await api.get(`/admin/jobs/side-effects/timeline/${encodeURIComponent(id)}?limit=300`);
    setFlowItems(Array.isArray(res.data?.data) ? res.data.data : []);
  }, []);

  const openIncidentFlow = async (id: string) => {
    try {
      setFlowOpen(true);
      setFlowLoading(true);
      setFlowStatusFilter('all');
      setActiveFlowCorrelationId(id);
      setExpandedFlowRows([]);
      await loadIncidentFlow(id);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load incident flow');
      setFlowOpen(false);
    } finally {
      setFlowLoading(false);
    }
  };

  const requeueFlowJob = async (jobId: string) => {
    if (!jobId || !activeFlowCorrelationId) return;
    try {
      setRequeueingFlowJobId(jobId);
      setActionBusy(true);
      setError('');
      await api.post('/admin/jobs/side-effects/requeue-selected', { ids: [jobId] });
      await Promise.all([fetchJobs(), loadIncidentFlow(activeFlowCorrelationId)]);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to requeue flow job');
    } finally {
      setRequeueingFlowJobId('');
      setActionBusy(false);
    }
  };

  const exportCsv = async () => {
    try {
      setActionBusy(true);
      setError('');
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      if (appliedCorrelationFilter.trim()) params.set('correlationId', appliedCorrelationFilter.trim());
      params.set('sortBy', sortBy);
      params.set('sortDir', sortDir);
      params.set('page', String(page));
      params.set('limit', String(limit));
      params.set('format', 'csv');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/jobs/side-effects?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          'x-correlation-id': `web-${Date.now()}-csv`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `queue-jobs-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || 'Failed to export CSV');
    } finally {
      setActionBusy(false);
    }
  };

  const exportTimelineCsv = async () => {
    try {
      setActionBusy(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/jobs/side-effects/timeline?limit=100&format=csv`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          'x-correlation-id': `web-${Date.now()}-timeline-csv`,
        },
      });
      if (!response.ok) throw new Error('Failed to export timeline CSV');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `queue-timeline-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || 'Failed to export timeline CSV');
    } finally {
      setActionBusy(false);
    }
  };

  const exportFlowCsv = async () => {
    if (!activeFlowCorrelationId) return;
    try {
      setActionBusy(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/jobs/side-effects/timeline/${encodeURIComponent(activeFlowCorrelationId)}?limit=500&format=csv`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          'x-correlation-id': `web-${Date.now()}-flow-csv`,
        },
      });
      if (!response.ok) throw new Error('Failed to export incident flow CSV');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `queue-flow-${activeFlowCorrelationId}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || 'Failed to export incident flow CSV');
    } finally {
      setActionBusy(false);
    }
  };

  const requeueSelectedFailed = async () => {
    if (!failedSelectedIds.length) return;
    try {
      setActionBusy(true);
      await api.post('/admin/jobs/side-effects/requeue-selected', { ids: failedSelectedIds });
      await fetchJobs();
      setSelectedIds([]);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to requeue selected jobs');
    } finally {
      setActionBusy(false);
    }
  };

  const toggleFlowRow = (rowKey: string) => {
    setExpandedFlowRows((prev) => (prev.includes(rowKey) ? prev.filter((key) => key !== rowKey) : [...prev, rowKey]));
  };

  useEffect(() => {
    if (!autoRefresh || !isAuthenticated || user?.role !== 'admin') return;
    const interval = Math.max(10, autoRefreshSeconds) * 1000;
    const id = window.setInterval(() => {
      if (!actionBusy) {
        fetchJobs();
      }
    }, interval);
    return () => window.clearInterval(id);
  }, [autoRefresh, autoRefreshSeconds, isAuthenticated, user, actionBusy, fetchJobs]);

  if (isLoading) return null;

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2, gap: 1 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Queue Jobs</Typography>
            <Typography variant="body2" color="text.secondary">
              Inspect side-effect jobs, review failures, and requeue selected items.
            </Typography>
          </Box>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Button size="small" variant="outlined" disabled={actionBusy} onClick={runQueueNow} sx={{ textTransform: 'none' }}>
              Run Queue Now
            </Button>
            <Button size="small" variant="outlined" disabled={actionBusy || loading} onClick={exportCsv} sx={{ textTransform: 'none' }}>
              Export CSV
            </Button>
            <Button size="small" variant="outlined" disabled={actionBusy || loading} onClick={exportTimelineCsv} sx={{ textTransform: 'none' }}>
              Export Timeline CSV
            </Button>
            <Button
              size="small"
              variant="contained"
              color="warning"
              disabled={actionBusy || failedSelectedIds.length === 0}
              onClick={requeueSelectedFailed}
              sx={{ textTransform: 'none' }}
            >
              Requeue Selected Failed ({failedSelectedIds.length})
            </Button>
            <Button size="small" variant="text" disabled={actionBusy || loading} onClick={fetchJobs} sx={{ textTransform: 'none' }}>
              Refresh
            </Button>
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 2, alignItems: { sm: 'center' }, gap: 1.5 }}>
          <FormControlLabel
            control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />}
            label="Auto-refresh"
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Interval</InputLabel>
            <Select
              label="Interval"
              value={String(autoRefreshSeconds)}
              onChange={(e) => setAutoRefreshSeconds(Number(e.target.value))}
              disabled={!autoRefresh}
            >
              {[15, 30, 60, 120].map((sec) => (
                <MenuItem key={sec} value={String(sec)}>{sec}s</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary">
            Auto-refresh polls safely and skips while admin actions are running.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last refreshed: {lastRefreshedAt ? lastRefreshedAt.toLocaleString('en-ZA') : '-'}
          </Typography>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={statusFilter} onChange={(e) => { setStatusFilter(String(e.target.value)); setPage(1); }}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={typeFilter} onChange={(e) => { setTypeFilter(String(e.target.value)); setPage(1); }}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="notification">Notification</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Page Size</InputLabel>
              <Select label="Page Size" value={String(limit)} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
                {[10, 20, 50, 100].map((n) => <MenuItem key={n} value={String(n)}>{n}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select label="Sort By" value={sortBy} onChange={(e) => { setSortBy(String(e.target.value)); setPage(1); }}>
                <MenuItem value="createdAt">Created</MenuItem>
                <MenuItem value="updatedAt">Updated</MenuItem>
                <MenuItem value="status">Status</MenuItem>
                <MenuItem value="type">Type</MenuItem>
                <MenuItem value="attempts">Attempts</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort Dir</InputLabel>
              <Select label="Sort Dir" value={sortDir} onChange={(e) => { setSortDir((String(e.target.value) === 'asc' ? 'asc' : 'desc')); setPage(1); }}>
                <MenuItem value="desc">Desc</MenuItem>
                <MenuItem value="asc">Asc</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              size="small"
              fullWidth
              label="Correlation ID"
              value={correlationFilter}
              onChange={(e) => setCorrelationFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setAppliedCorrelationFilter(correlationFilter.trim());
                  setPage(1);
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 1 }}>
            <Stack direction="row" sx={{ gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setAppliedCorrelationFilter(correlationFilter.trim());
                  setPage(1);
                }}
                sx={{ textTransform: 'none', minWidth: 0 }}
              >
                Apply
              </Button>
              <Button
                size="small"
                variant="text"
                onClick={() => {
                  setCorrelationFilter('');
                  setAppliedCorrelationFilter('');
                  setPage(1);
                }}
                sx={{ textTransform: 'none', minWidth: 0 }}
              >
                Clear
              </Button>
            </Stack>
          </Grid>
        </Grid>

        <Card variant="outlined">
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            ) : (
              <>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={items.length > 0 && items.every((item) => selectedIds.includes(item._id))}
                          indeterminate={items.some((item) => selectedIds.includes(item._id)) && !items.every((item) => selectedIds.includes(item._id))}
                          onChange={toggleSelectAllVisible}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Attempts</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Correlation</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Updated</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                            No queue jobs found for current filters.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : items.map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox size="small" checked={selectedIds.includes(item._id)} onChange={() => toggleSelect(item._id)} />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={item.type} sx={{ textTransform: 'capitalize' }} />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" color={statusColor(item.status)} label={item.status} sx={{ textTransform: 'capitalize' }} />
                        </TableCell>
                        <TableCell>{item.attempts}/{item.maxAttempts}</TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {item.correlationId || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>{new Date(item.updatedAt).toLocaleString('en-ZA')}</TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => openDetails(item._id)} sx={{ textTransform: 'none' }}>
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Total jobs: {pagination.total}
                  </Typography>
                  <Pagination
                    page={pagination.currentPage}
                    count={Math.max(1, pagination.pages)}
                    onChange={(_, value) => setPage(value)}
                    size="small"
                  />
                </Stack>
              </>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 1.5, gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Incident Timeline (By Correlation ID)</Typography>
              <Button
                size="small"
                variant="outlined"
                sx={{ textTransform: 'none' }}
                disabled={!latestFailedCorrelation || actionBusy}
                onClick={() => latestFailedCorrelation && openIncidentFlow(latestFailedCorrelation.correlationId)}
              >
                Open Latest Failed Flow
              </Button>
            </Stack>
            {timeline.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No correlation timeline data available.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Correlation ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Jobs</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Failures</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Latest Update</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeline.map((entry) => (
                    <TableRow key={entry.correlationId} hover>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{entry.correlationId}</Typography>
                      </TableCell>
                      <TableCell>{entry.totalJobs}</TableCell>
                      <TableCell>
                        <Chip size="small" color={entry.failedJobs > 0 ? 'error' : 'default'} label={entry.failedJobs} />
                      </TableCell>
                      <TableCell>{entry.latestUpdateAt ? new Date(entry.latestUpdateAt).toLocaleString('en-ZA') : '-'}</TableCell>
                      <TableCell>
                        <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            sx={{ textTransform: 'none' }}
                            onClick={() => {
                              setCorrelationFilter(entry.correlationId);
                              setAppliedCorrelationFilter(entry.correlationId);
                              setPage(1);
                            }}
                          >
                            Filter
                          </Button>
                          <Button size="small" sx={{ textTransform: 'none' }} onClick={() => openIncidentFlow(entry.correlationId)}>
                            View Flow
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Queue Job Details</DialogTitle>
          <DialogContent dividers>
            {detailLoading ? (
              <Box sx={{ py: 5, display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>
            ) : !detail ? (
              <Typography variant="body2" color="text.secondary">No details available.</Typography>
            ) : (
              <Stack sx={{ gap: 1.25 }}>
                <Typography variant="body2"><strong>ID:</strong> {detail._id}</Typography>
                <Typography variant="body2"><strong>Type:</strong> {detail.type}</Typography>
                <Typography variant="body2"><strong>Status:</strong> {detail.status}</Typography>
                <Typography variant="body2"><strong>Attempts:</strong> {detail.attempts}/{detail.maxAttempts}</Typography>
                <Typography variant="body2"><strong>Correlation:</strong> {detail.correlationId || '-'}</Typography>
                <Typography variant="body2"><strong>Last Error:</strong> {detail.lastError || '-'}</Typography>

                <Typography variant="subtitle2" sx={{ mt: 1 }}>History</Typography>
                <Box sx={{ maxHeight: 220, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                  {Array.isArray(detail.history) && detail.history.length > 0 ? detail.history.slice().reverse().map((entry, index) => (
                    <Box key={`${entry.at || 'na'}-${index}`} sx={{ py: 0.5 }}>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        {entry.at ? new Date(entry.at).toLocaleString('en-ZA') : '-'} · {entry.action || 'event'} · {entry.status || '-'} {entry.workerId ? `· ${entry.workerId}` : ''}
                      </Typography>
                      {entry.detail ? <Typography variant="caption" color="text.secondary">{entry.detail}</Typography> : null}
                    </Box>
                  )) : <Typography variant="caption" color="text.secondary">No history entries.</Typography>}
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 1 }}>Payload Preview</Typography>
                <Box sx={{ maxHeight: 220, overflowY: 'auto', bgcolor: '#0b1020', color: '#e6edf3', borderRadius: 1, p: 1.25, fontFamily: 'monospace', fontSize: 12 }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(detail.payload || {}, null, 2)}</pre>
                </Box>
              </Stack>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={flowOpen} onClose={() => setFlowOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle>Incident Flow: {activeFlowCorrelationId || '-'}</DialogTitle>
          <DialogContent dividers>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Jobs in this correlation flow ordered by created time.
              </Typography>
              <Button size="small" variant="outlined" disabled={actionBusy || !activeFlowCorrelationId} onClick={exportFlowCsv} sx={{ textTransform: 'none' }}>
                Export Flow CSV
              </Button>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
              <Chip size="small" label={`Total ${flowSummary.total}`} />
              <Chip size="small" color="error" label={`Failed ${flowSummary.failed}`} />
              <Chip size="small" color="success" label={`Completed ${flowSummary.completed}`} />
              <Chip size="small" color="info" label={`Processing ${flowSummary.processing}`} />
              <Chip size="small" label={`Pending ${flowSummary.pending}`} />
              <Chip
                size="small"
                label={`Oldest ${flowSummary.oldestCreatedAt ? new Date(flowSummary.oldestCreatedAt).toLocaleString('en-ZA') : '-'}`}
              />
              <Chip
                size="small"
                label={`Newest ${flowSummary.newestCreatedAt ? new Date(flowSummary.newestCreatedAt).toLocaleString('en-ZA') : '-'}`}
              />
            </Stack>
            <Stack direction="row" sx={{ mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label="All"
                color={flowStatusFilter === 'all' ? 'primary' : 'default'}
                onClick={() => setFlowStatusFilter('all')}
                clickable
              />
              <Chip
                size="small"
                label="Failed"
                color={flowStatusFilter === 'failed' ? 'error' : 'default'}
                onClick={() => setFlowStatusFilter('failed')}
                clickable
              />
              <Chip
                size="small"
                label="Processing"
                color={flowStatusFilter === 'processing' ? 'info' : 'default'}
                onClick={() => setFlowStatusFilter('processing')}
                clickable
              />
              <Chip
                size="small"
                label="Completed"
                color={flowStatusFilter === 'completed' ? 'success' : 'default'}
                onClick={() => setFlowStatusFilter('completed')}
                clickable
              />
              <Chip
                size="small"
                label="Pending"
                color={flowStatusFilter === 'pending' ? 'primary' : 'default'}
                onClick={() => setFlowStatusFilter('pending')}
                clickable
              />
            </Stack>
            {flowLoading ? (
              <Box sx={{ py: 5, display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>
            ) : filteredFlowItems.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No flow jobs found.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Attempts</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Last Error</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>History</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFlowItems.map((item, idx) => {
                    const rowKey = `${item._id || 'flow'}-${idx}`;
                    const isExpanded = expandedFlowRows.includes(rowKey);
                    return (
                    <Fragment key={rowKey}>
                      <TableRow hover>
                        <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleString('en-ZA') : '-'}</TableCell>
                        <TableCell><Chip size="small" label={item.type || 'unknown'} sx={{ textTransform: 'capitalize' }} /></TableCell>
                        <TableCell><Chip size="small" color={statusColor((item.status || 'pending') as QueueJob['status'])} label={item.status || 'pending'} sx={{ textTransform: 'capitalize' }} /></TableCell>
                        <TableCell>{item.attempts || 0}/{item.maxAttempts || 0}</TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">{item.lastError || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            sx={{ textTransform: 'none' }}
                            onClick={() => toggleFlowRow(rowKey)}
                          >
                            {isExpanded ? 'Hide' : 'Show'}
                          </Button>
                        </TableCell>
                        <TableCell>
                          {item.status === 'failed' && item._id ? (
                            <Button
                              size="small"
                              color="warning"
                              variant="outlined"
                              disabled={actionBusy && requeueingFlowJobId === item._id}
                              onClick={() => requeueFlowJob(item._id as string)}
                              sx={{ textTransform: 'none' }}
                            >
                              {actionBusy && requeueingFlowJobId === item._id ? 'Requeueing...' : 'Requeue'}
                            </Button>
                          ) : (
                            <Typography variant="caption" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                      {isExpanded ? (
                        <TableRow>
                          <TableCell colSpan={7}>
                            <Box sx={{ maxHeight: 180, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                              {Array.isArray(item.history) && item.history.length > 0 ? item.history.slice().reverse().map((entry, historyIndex) => (
                                <Box key={`${entry.at || 'na'}-${historyIndex}`} sx={{ py: 0.5 }}>
                                  <Typography variant="caption" sx={{ display: 'block' }}>
                                    {entry.at ? new Date(entry.at).toLocaleString('en-ZA') : '-'} · {entry.action || 'event'} · {entry.status || '-'} {entry.workerId ? `· ${entry.workerId}` : ''}
                                  </Typography>
                                  {entry.detail ? <Typography variant="caption" color="text.secondary">{entry.detail}</Typography> : null}
                                </Box>
                              )) : <Typography variant="caption" color="text.secondary">No history entries.</Typography>}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  );})}
                </TableBody>
              </Table>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
