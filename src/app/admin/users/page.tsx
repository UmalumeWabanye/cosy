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

import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  university?: string;
  fundingType?: string;
  isVerified: boolean;
  createdAt: string;
}

function fundingColor(type?: string): 'primary' | 'secondary' | 'default' {
  if (type === 'NSFAS') return 'primary';
  if (type === 'Private') return 'secondary';
  return 'default';
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, isLoading } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ role: 'all', university: '', fundingType: 'all', search: '', page: 1, limit: 15 });
  const [pagination, setPagination] = useState({ total: 0, pages: 0, currentPage: 1 });
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || authUser?.role !== 'admin')) router.push('/');
  }, [isAuthenticated, isLoading, authUser, router]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (filters.role !== 'all') params.append('role', filters.role);
      if (filters.fundingType !== 'all') params.append('fundingType', filters.fundingType);
      if (filters.university) params.append('university', filters.university);
      if (filters.search) params.append('search', filters.search);
      params.append('page', String(filters.page));
      params.append('limit', String(filters.limit));

      const res = await api.get(`/admin/users?${params}`);
      setUsers(Array.isArray(res.data.data) ? res.data.data : []);
      setPagination({ total: res.data.total ?? 0, pages: res.data.pages ?? 0, currentPage: res.data.currentPage ?? 1 });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggle = async (u: User) => {
    try {
      setTogglingId(u._id);
      const res = await api.patch(`/admin/users/${u._id}/toggle`);
      setUsers(prev => prev.map(x => x._id === u._id ? { ...x, isVerified: res.data.data.isVerified } : x));
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update user');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeletingId(confirmDelete._id);
      await api.delete(`/admin/users/${confirmDelete._id}`);
      setUsers(prev => prev.filter(x => x._id !== confirmDelete._id));
      setConfirmDelete(null);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const setFilter = (key: string, value: string | number) =>
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Users</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage registered students and admin accounts
            </Typography>
          </Box>
          <Chip
            icon={<PersonRoundedIcon />}
            label={`${pagination.total} total`}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Stack>

        {/* Filters */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Search"
              placeholder="Name or email…"
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
              sx={{ flexGrow: 1, minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Role</InputLabel>
              <Select label="Role" value={filters.role} onChange={e => setFilter('role', e.target.value)}>
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Funding</InputLabel>
              <Select label="Funding" value={filters.fundingType} onChange={e => setFilter('fundingType', e.target.value)}>
                <MenuItem value="all">All Funding</MenuItem>
                <MenuItem value="NSFAS">NSFAS</MenuItem>
                <MenuItem value="Private">Private</MenuItem>
                <MenuItem value="Self-funded">Self-funded</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : users.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 8, textAlign: 'center' }}>
            <Typography color="text.secondary">No users found matching your filters.</Typography>
          </Paper>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>University</TableCell>
                    <TableCell sx={{ fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>Funding</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>Joined</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u._id} hover>
                      <TableCell>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: u.role === 'admin' ? 'secondary.main' : 'primary.main', fontSize: 13 }}>
                            {(u.name ?? u.email ?? '?')[0].toUpperCase()}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{u.name}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{u.email}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={u.role === 'admin' ? 'Admin' : 'Student'}
                          color={u.role === 'admin' ? 'secondary' : 'default'}
                          variant={u.role === 'admin' ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                          {u.university && <SchoolRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
                          <Typography variant="caption" color="text.secondary">
                            {u.university ?? '—'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {u.fundingType ? (
                          <Chip size="small" label={u.fundingType} color={fundingColor(u.fundingType)} variant="outlined" />
                        ) : (
                          <Typography variant="caption" color="text.disabled">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={u.isVerified ? 'Active' : 'Inactive'}
                          color={u.isVerified ? 'success' : 'default'}
                          variant={u.isVerified ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(u.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 0.5 }}>
                          {u.role !== 'admin' && (
                            <>
                              <Tooltip title={u.isVerified ? 'Deactivate user' : 'Activate user'}>
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
                              <Tooltip title="Delete user">
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
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
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
                  onChange={(_, page) => setFilters(prev => ({ ...prev, page }))}
                  size="small"
                  color="primary"
                />
              </Stack>
            )}
          </>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete User</DialogTitle>
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
    </AdminLayout>
  );
}
