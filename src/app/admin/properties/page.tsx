'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayout';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
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

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

interface Property {
  _id: string;
  name: string;
  description: string;
  location: { address: string; city: string; university: string };
  pricing: { minRent: number; maxRent: number };
  rooms: { total: number; available: number };
  published: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: 'all', search: '', page: 1, limit: 10 });
  const [pagination, setPagination] = useState({ total: 0, pages: 0, currentPage: 1 });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams();
        if (filters.status !== 'all') params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        params.append('page', String(filters.page));
        params.append('limit', String(filters.limit));
        const res = await api.get(`/properties/admin/list?${params}`);
        const raw = res.data.data;
        setProperties(Array.isArray(raw) ? raw : []);
        setPagination({ total: res.data.total ?? 0, pages: res.data.pages ?? 0, currentPage: res.data.currentPage ?? 1 });
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };
    fetchProps();
  }, [filters]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this property?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/properties/${id}`);
      setProperties(prev => prev.filter(p => p._id !== id));
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      setTogglingId(id);
      const res = await api.patch(`/properties/${id}/publish`);
      setProperties(prev => prev.map(p => p._id === id ? { ...p, published: res.data.data.published } : p));
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{  justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 4, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Properties</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage and publish your accommodation listings</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => router.push('/admin/properties/new')}>
            Add Property
          </Button>
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
              </Select>
            </FormControl>
            <TextField size="small" label="Search" placeholder="Name, city, address…" value={filters.search} onChange={e => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))} sx={{ flexGrow: 1 }} />
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : properties.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 8, textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>No properties found</Typography>
            {!filters.search && filters.status === 'all' && (
              <Button variant="contained" startIcon={<AddRoundedIcon />} sx={{ mt: 2 }} onClick={() => router.push('/admin/properties/new')}>Create Property</Button>
            )}
          </Paper>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Price Range</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rooms</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {properties.map(p => (
                    <TableRow key={p._id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} >{p.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }} >{p.location.city}</Typography>
                        <Typography variant="caption" color="text.secondary">{p.location.university}</Typography>
                      </TableCell>
                      <TableCell><Typography variant="body2">R{p.pricing.minRent} – R{p.pricing.maxRent}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{p.rooms.available} / {p.rooms.total}</Typography></TableCell>
                      <TableCell>
                        <Chip size="small" label={p.published ? 'Published' : 'Draft'} color={p.published ? 'success' : 'default'} variant={p.published ? 'filled' : 'outlined'} />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" sx={{  justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title={p.published ? 'Unpublish' : 'Publish'}>
                            <span>
                              <IconButton size="small" disabled={togglingId === p._id} onClick={() => handleTogglePublish(p._id)} color={p.published ? 'default' : 'success'}>
                                {togglingId === p._id ? <CircularProgress size={16} /> : p.published ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => router.push(`/admin/properties/${p._id}/edit`)}>
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <span>
                              <IconButton size="small" color="error" disabled={deletingId === p._id} onClick={() => handleDelete(p._id)}>
                                {deletingId === p._id ? <CircularProgress size={16} /> : <DeleteRoundedIcon fontSize="small" />}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {pagination.pages > 1 && (
              <Stack direction="row" sx={{  justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {(filters.page - 1) * filters.limit + 1}–{Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total}
                </Typography>
                <Pagination count={pagination.pages} page={filters.page} onChange={(_, page) => setFilters(prev => ({ ...prev, page }))} size="small" color="primary" />
              </Stack>
            )}
          </>
        )}
      </Box>
    </AdminLayout>
  );
}
