'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LandlordLayout from '@/components/landlord/LandlordLayout';
import api from '@/services/api';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';

interface Property {
  _id: string;
  propertyName: string;
  city: string;
  address: string;
  price: number;
  roomType: string;
  totalRooms?: number;
  availableRooms?: number;
  isAvailable: boolean;
  nsfasAccredited?: boolean;
  transportation?: {
    enabled?: boolean;
    mode?: 'none' | 'private' | 'campus_route' | 'both';
  };
  universityNearby?: string;
  createdAt: string;
}

const transportModeLabel = (mode?: string) => {
  if (mode === 'private') return 'Private Transport';
  if (mode === 'campus_route') return 'Campus Route';
  if (mode === 'both') return 'Private + Campus';
  return 'Transport';
};

function LandlordPropertiesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const searchQuery = searchParams.get('search')?.trim().toLowerCase() ?? '';

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'landlord')) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/properties/mine?limit=200');
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setProperties(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load your properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'landlord') {
      fetchProperties();
    }
  }, [isAuthenticated, user]);

  const visibleProperties = useMemo(() => {
    if (!searchQuery) return properties;
    return properties.filter((property) => {
      const haystack = [
        property.propertyName,
        property.city,
        property.address,
        property.roomType,
        property.universityNearby,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(searchQuery);
    });
  }, [properties, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this property?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/properties/${id}`);
      setProperties((prev) => prev.filter((property) => property._id !== id));
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to delete property');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      setTogglingId(id);
      const current = properties.find((property) => property._id === id);
      if (!current) return;
      const res = await api.put(`/properties/${id}`, { isAvailable: !current.isAvailable });
      setProperties((prev) => prev.map((property) => {
        if (property._id !== id) return property;
        return { ...property, isAvailable: res.data?.isAvailable ?? !current.isAvailable };
      }));
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to update property');
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) return null;

  return (
    <LandlordLayout>
      <Box className="modern-shell" sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3, gap: 1.5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>My Properties</Typography>
          <Typography variant="body2" color="text.secondary">Only properties created by your landlord account are shown here.</Typography>
        </Box>
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => router.push('/landlord/dashboard')} sx={{ textTransform: 'none' }}>Back to Dashboard</Button>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => router.push('/landlord/properties/new')} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Add Property
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : visibleProperties.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {searchQuery
              ? `No properties matched “${searchParams.get('search') ?? ''}”.`
              : 'No properties yet for this landlord account.'}
          </Typography>
          <Button variant="contained" sx={{ mt: 2, textTransform: 'none' }} onClick={() => router.push('/landlord/properties/new')}>Create your first listing</Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto', maxHeight: 620, borderRadius: 3 }}>
          <Table
            stickyHeader
            size="small"
            sx={{
              minWidth: 700,
              '& .MuiTableCell-root': { py: 1.25 },
              '& .MuiTableCell-stickyHeader': {
                bgcolor: 'rgba(255,255,255,0.94)',
                backdropFilter: 'blur(12px)',
                boxShadow: 'inset 0 -1px 0 rgba(5,150,105,0.14), 0 10px 22px rgba(4,120,87,0.06)',
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Room Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleProperties.map((property) => (
                <TableRow key={property._id} hover sx={{ '& td': { transition: 'background-color 0.2s ease' }, '&:hover td': { bgcolor: 'rgba(5,150,105,0.05)' } }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{property.propertyName}</Typography>
                    <Typography variant="caption" color="text.secondary">{property.universityNearby || ''}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{property.city}</Typography>
                    <Typography variant="caption" color="text.secondary">{property.address}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Rooms: {property.availableRooms ?? '—'} / {property.totalRooms ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>R{property.price?.toLocaleString()}</TableCell>
                  <TableCell>{property.roomType}</TableCell>
                  <TableCell>
                    <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                      <Chip size="small" label={property.isAvailable ? 'Available' : 'Unavailable'} color={property.isAvailable ? 'success' : 'default'} sx={{ height: 24, fontWeight: 600 }} />
                      {property.nsfasAccredited && <Chip size="small" label="NSFAS" color="info" sx={{ height: 24, fontWeight: 600 }} />}
                      {property.transportation?.enabled && (
                        <Chip size="small" label={transportModeLabel(property.transportation.mode)} color="secondary" sx={{ height: 24, fontWeight: 600 }} />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title={property.isAvailable ? 'Mark Unavailable' : 'Mark Available'}>
                        <span>
                          <IconButton size="small" disabled={togglingId === property._id} onClick={() => handleToggleAvailability(property._id)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                            {togglingId === property._id ? <CircularProgress size={16} /> : property.isAvailable ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => router.push(`/landlord/properties/${property._id}/edit`)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Allocate Rooms">
                        <IconButton size="small" color="secondary" onClick={() => router.push(`/landlord/properties/${property._id}/allocate`)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                          <MeetingRoomRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Room Inventory">
                        <IconButton size="small" color="info" onClick={() => router.push(`/landlord/properties/${property._id}/rooms`)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                          <ViewModuleRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <span>
                          <IconButton size="small" color="error" disabled={deletingId === property._id} onClick={() => handleDelete(property._id)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                            {deletingId === property._id ? <CircularProgress size={16} /> : <DeleteRoundedIcon fontSize="small" />}
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
      )}
    </Box>
    </LandlordLayout>
  );
}

export default function LandlordPropertiesPage() {
  return (
    <Suspense fallback={null}>
      <LandlordPropertiesPageContent />
    </Suspense>
  );
}
