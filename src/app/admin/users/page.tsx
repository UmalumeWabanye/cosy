'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayout';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Snackbar from '@mui/material/Snackbar';

import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';

interface LandlordUser {
  _id: string;
  name: string;
  email: string;
  role: 'landlord';
  city?: string;
  province?: string;
  university?: string;
  isVerified: boolean;
  createdAt: string;
  profileComplete?: boolean;
}

interface OverviewStudent {
  _id: string;
  name?: string;
  email?: string;
  university?: string;
  course?: string;
}

interface OverviewProperty {
  _id: string;
  propertyName: string;
  city?: string;
  universityNearby?: string;
  price?: number;
  roomType?: string;
  isAvailable?: boolean;
}

interface LandlordOverview {
  landlord: LandlordUser;
  summary: {
    totalProperties: number;
    activeProperties: number;
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    totalViewings: number;
    pendingViewings: number;
    activeResidents: number;
  };
  portfolio: Array<{
    property: OverviewProperty;
    metrics: {
      totalApplications: number;
      pendingApplications: number;
      approvedApplications: number;
      rejectedApplications: number;
      totalViewings: number;
      pendingViewings: number;
      activeResidents: number;
    };
    activeResidents: OverviewStudent[];
  }>;
  requests: Array<{ _id: string; status: 'pending' | 'approved' | 'rejected' }>;
  viewings: Array<{ _id: string; status: 'pending' | 'approved' | 'declined' }>;
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
          <Box sx={{ color }}>{icon}</Box>
        </Stack>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, isLoading } = useAuth();

  const [users, setUsers] = useState<LandlordUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ city: 'all', institution: 'all', search: '', page: 1, limit: 15 });
  const [pagination, setPagination] = useState({ total: 0, pages: 0, currentPage: 1 });
  const [filterOptions, setFilterOptions] = useState<{ cities: string[]; institutions: string[] }>({ cities: [], institutions: [] });

  const [selectedLandlordId, setSelectedLandlordId] = useState<string | null>(null);
  const [overview, setOverview] = useState<LandlordOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState('');

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<LandlordUser | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'landlord' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [snackbar, setSnackbar] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || authUser?.role !== 'admin')) router.push('/');
  }, [isAuthenticated, isLoading, authUser, router]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.append('role', 'landlord');
      if (filters.city !== 'all') params.append('city', filters.city);
      if (filters.institution !== 'all') params.append('institution', filters.institution);
      if (filters.search) params.append('search', filters.search);
      params.append('page', String(filters.page));
      params.append('limit', String(filters.limit));

      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(Array.isArray(res.data.data) ? res.data.data : []);
      setPagination({ total: res.data.total ?? 0, pages: res.data.pages ?? 0, currentPage: res.data.currentPage ?? 1 });
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load landlords');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await api.get('/admin/users/landlord-filter-options');
      setFilterOptions({
        cities: Array.isArray(res.data?.data?.cities) ? res.data.data.cities : [],
        institutions: Array.isArray(res.data?.data?.institutions) ? res.data.data.institutions : [],
      });
    } catch {
      // Non-blocking for the table.
    }
  }, []);

  const fetchOverview = useCallback(async (landlordId: string) => {
    try {
      setOverviewLoading(true);
      setOverviewError('');
      setSelectedLandlordId(landlordId);
      const res = await api.get(`/admin/users/${landlordId}/overview`);
      setOverview(res.data?.data ?? null);
    } catch (e: any) {
      setOverview(null);
      setOverviewError(e?.response?.data?.message || 'Failed to load landlord portfolio details');
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  const setFilter = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleToggle = async (u: LandlordUser) => {
    try {
      setTogglingId(u._id);
      const res = await api.patch(`/admin/users/${u._id}/toggle`);
      setUsers((prev) => prev.map((x) => x._id === u._id ? { ...x, isVerified: res.data.data.isVerified } : x));
      if (overview?.landlord._id === u._id) {
        setOverview((prev) => prev ? { ...prev, landlord: { ...prev.landlord, isVerified: res.data.data.isVerified } } : prev);
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to update landlord');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeletingId(confirmDelete._id);
      await api.delete(`/admin/users/${confirmDelete._id}`);
      setUsers((prev) => prev.filter((x) => x._id !== confirmDelete._id));
      if (selectedLandlordId === confirmDelete._id) {
        setSelectedLandlordId(null);
        setOverview(null);
      }
      setConfirmDelete(null);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to delete landlord');
    } finally {
      setDeletingId(null);
    }
  };

  const handleInviteSubmit = async () => {
    setInviteError('');
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      setInviteError('Name and email are required.');
      return;
    }

    try {
      setInviteLoading(true);
      await api.post('/auth/invite', inviteForm);
      setSnackbar(`Invite sent to ${inviteForm.email}`);
      setInviteOpen(false);
      setInviteForm({ name: '', email: '', role: 'landlord' });
      fetchUsers();
    } catch (e: any) {
      setInviteError(e?.response?.data?.message || 'Failed to send invite');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleExportLandlordExcel = async () => {
    if (!overview) return;
    const XLSX = await import('xlsx');

    const summaryRows = [
      { Field: 'Landlord Name', Value: overview.landlord.name || '' },
      { Field: 'Landlord Email', Value: overview.landlord.email || '' },
      { Field: 'City', Value: overview.landlord.city || '' },
      { Field: 'Province', Value: overview.landlord.province || '' },
      { Field: 'Total Properties', Value: overview.summary.totalProperties },
      { Field: 'Active Properties', Value: overview.summary.activeProperties },
      { Field: 'Total Applications', Value: overview.summary.totalApplications },
      { Field: 'Pending Applications', Value: overview.summary.pendingApplications },
      { Field: 'Approved Applications', Value: overview.summary.approvedApplications },
      { Field: 'Rejected Applications', Value: overview.summary.rejectedApplications },
      { Field: 'Total Viewings', Value: overview.summary.totalViewings },
      { Field: 'Pending Viewings', Value: overview.summary.pendingViewings },
      { Field: 'Students Living There', Value: overview.summary.activeResidents },
    ];

    const propertyRows = overview.portfolio.map((item) => ({
      Property: item.property.propertyName,
      City: item.property.city || '',
      Institution: item.property.universityNearby || '',
      Price: Number(item.property.price || 0),
      Applications: item.metrics.totalApplications,
      'Pending Applications': item.metrics.pendingApplications,
      'Approved Applications': item.metrics.approvedApplications,
      Viewings: item.metrics.totalViewings,
      'Pending Viewings': item.metrics.pendingViewings,
      'Students Living': item.metrics.activeResidents,
    }));

    const residentRows = overview.portfolio.flatMap((item) =>
      item.activeResidents.map((resident) => ({
        'Resident Name': resident.name || '',
        'Resident Email': resident.email || '',
        University: resident.university || '',
        Course: resident.course || '',
        Property: item.property.propertyName,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryRows), 'Summary');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(propertyRows), 'Properties');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(residentRows), 'Residents');

    const safeName = (overview.landlord.name || 'landlord').replace(/\s+/g, '-').toLowerCase();
    XLSX.writeFile(workbook, `landlord-portfolio-${safeName}.xlsx`);

    setSnackbar('Landlord portfolio exported as Excel workbook');
  };

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Landlords</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              View and manage landlord accounts, then drill into each landlord portfolio.
            </Typography>
          </Box>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Chip icon={<PersonRoundedIcon />} label={`${pagination.total} landlords`} variant="outlined" sx={{ fontWeight: 600 }} />
            <Button
              variant="contained"
              startIcon={<PersonAddRoundedIcon />}
              onClick={() => { setInviteOpen(true); setInviteError(''); }}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Add Landlord
            </Button>
          </Stack>
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Search"
              placeholder="Landlord name or email"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              sx={{ flexGrow: 1, minWidth: 220 }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>City</InputLabel>
              <Select label="City" value={filters.city} onChange={(e) => setFilter('city', e.target.value)}>
                <MenuItem value="all">All Cities</MenuItem>
                {filterOptions.cities.map((city) => (
                  <MenuItem key={city} value={city}>{city}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>University or College</InputLabel>
              <Select label="University or College" value={filters.institution} onChange={(e) => setFilter('institution', e.target.value)}>
                <MenuItem value="all">All Institutions</MenuItem>
                {filterOptions.institutions.map((institution) => (
                  <MenuItem key={institution} value={institution}>{institution}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {overviewError && <Alert severity="error" sx={{ mb: 2 }}>{overviewError}</Alert>}

        {(overviewLoading || overview) && (
          <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, mb: 3, borderColor: 'primary.main' }}>
            {overviewLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
            ) : overview && (
              <>
                <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2, mb: 2 }}>
                  <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{(overview.landlord.name || overview.landlord.email || 'L')[0].toUpperCase()}</Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{overview.landlord.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{overview.landlord.email}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={overview.landlord.city || 'City not set'} variant="outlined" />
                    <Chip label={overview.landlord.province || 'Province not set'} variant="outlined" />
                    <Chip label={overview.landlord.isVerified ? 'Active' : 'Inactive'} color={overview.landlord.isVerified ? 'success' : 'default'} />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FileDownloadRoundedIcon />}
                      onClick={handleExportLandlordExcel}
                      sx={{ textTransform: 'none' }}
                    >
                      Export Excel
                    </Button>
                  </Stack>
                </Stack>

                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 6, md: 3 }}><StatCard icon={<ApartmentRoundedIcon />} label="Properties" value={overview.summary.totalProperties} color="#1976d2" /></Grid>
                  <Grid size={{ xs: 6, md: 3 }}><StatCard icon={<PendingActionsRoundedIcon />} label="Applications" value={overview.summary.totalApplications} color="#ed6c02" /></Grid>
                  <Grid size={{ xs: 6, md: 3 }}><StatCard icon={<SchoolRoundedIcon />} label="Viewings" value={overview.summary.totalViewings} color="#0288d1" /></Grid>
                  <Grid size={{ xs: 6, md: 3 }}><StatCard icon={<GroupsRoundedIcon />} label="Students Living There" value={overview.summary.activeResidents} color="#2e7d32" /></Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, lg: 8 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Property Portfolio</Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                      <Table size="small" sx={{ minWidth: 760 }}>
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Institution</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Applications</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Viewings</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Students Living</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {overview.portfolio.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <Typography variant="body2" color="text.secondary">No properties found for this landlord.</Typography>
                              </TableCell>
                            </TableRow>
                          ) : overview.portfolio.map((item) => (
                            <TableRow key={item.property._id} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.property.propertyName}</Typography>
                                <Typography variant="caption" color="text.secondary">R{Number(item.property.price || 0).toLocaleString()}</Typography>
                              </TableCell>
                              <TableCell>{item.property.city || '—'}</TableCell>
                              <TableCell>{item.property.universityNearby || '—'}</TableCell>
                              <TableCell>{item.metrics.totalApplications}</TableCell>
                              <TableCell>{item.metrics.totalViewings}</TableCell>
                              <TableCell>{item.metrics.activeResidents}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid size={{ xs: 12, lg: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Current Student Occupancy</Typography>
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                      {overview.portfolio.flatMap((item) => item.activeResidents).length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No currently active student occupancy records.</Typography>
                      ) : (
                        <Stack sx={{ gap: 1 }}>
                          {overview.portfolio.flatMap((item) => item.activeResidents.map((resident) => ({
                            resident,
                            propertyName: item.property.propertyName,
                          }))).slice(0, 12).map(({ resident, propertyName }) => (
                            <Box key={`${resident._id}-${propertyName}`} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{resident.name || 'Student'}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{resident.email || 'No email'}</Typography>
                              <Typography variant="caption" color="text.secondary">{propertyName}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : users.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 8, textAlign: 'center' }}>
            <Typography color="text.secondary">No landlords found matching your filters.</Typography>
          </Paper>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Landlord</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
                    <TableCell sx={{ fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>Province</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>Joined</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => {
                    const selected = u._id === selectedLandlordId;
                    return (
                      <TableRow
                        key={u._id}
                        hover
                        selected={selected}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => fetchOverview(u._id)}
                      >
                        <TableCell>
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>
                              {(u.name ?? u.email ?? '?')[0].toUpperCase()}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{u.name}</Typography>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{u.email}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>{u.city || '—'}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{u.province || '—'}</TableCell>
                        <TableCell>
                          <Chip size="small" label={u.isVerified ? 'Active' : 'Inactive'} color={u.isVerified ? 'success' : 'default'} variant={u.isVerified ? 'filled' : 'outlined'} />
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(u.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                          <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title={u.isVerified ? 'Deactivate landlord' : 'Activate landlord'}>
                              <span>
                                <IconButton
                                  size="small"
                                  color={u.isVerified ? 'warning' : 'success'}
                                  disabled={togglingId === u._id}
                                  onClick={() => handleToggle(u)}
                                >
                                  {togglingId === u._id
                                    ? <CircularProgress size={16} />
                                    : u.isVerified
                                      ? <BlockRoundedIcon fontSize="small" />
                                      : <CheckCircleRoundedIcon fontSize="small" />}
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Delete landlord">
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled={deletingId === u._id}
                                  onClick={() => setConfirmDelete(u)}
                                >
                                  <DeleteRoundedIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {pagination.pages > 1 && (
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {(filters.page - 1) * filters.limit + 1}–{Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total}
                </Typography>
                <Pagination
                  count={pagination.pages}
                  page={filters.page}
                  onChange={(_, page) => setFilters((prev) => ({ ...prev, page }))}
                  size="small"
                  color="primary"
                />
              </Stack>
            )}
          </>
        )}
      </Box>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Landlord</DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete <strong>{confirmDelete?.name}</strong> ({confirmDelete?.email})?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(null)} variant="outlined" sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={!!deletingId}
            sx={{ textTransform: 'none' }}
          >
            {deletingId ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Landlord</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack sx={{ gap: 2, pt: 1 }}>
            {inviteError && <Alert severity="error">{inviteError}</Alert>}
            <TextField
              label="Full Name"
              placeholder="Jane Smith"
              value={inviteForm.name}
              onChange={(e) => setInviteForm((p) => ({ ...p, name: e.target.value }))}
              size="small"
              fullWidth
              required
            />
            <TextField
              label="Email Address"
              type="email"
              placeholder="jane@example.com"
              value={inviteForm.email}
              onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
              size="small"
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setInviteOpen(false)} variant="outlined" sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleInviteSubmit}
            variant="contained"
            disabled={inviteLoading}
            sx={{ textTransform: 'none' }}
          >
            {inviteLoading ? <CircularProgress size={18} color="inherit" /> : 'Send Invite'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar('')}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </AdminLayout>
  );
}
