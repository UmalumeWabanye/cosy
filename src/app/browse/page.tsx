'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import api from '@/services/api';

const UNIVERSITIES = [
  'University of Cape Town',
  'Stellenbosch University',
  'University of Pretoria',
  'University of the Witwatersrand',
  'University of KwaZulu-Natal',
  'University of Johannesburg',
  'Rhodes University',
  'Nelson Mandela University',
  'North-West University',
  'University of the Free State',
  'CPUT',
  'Tshwane University of Technology',
  'Durban University of Technology',
  'Walter Sisulu University',
];

const CITIES = ['Cape Town', 'Johannesburg', 'Pretoria', 'Durban', 'Stellenbosch', 'Grahamstown', 'Port Elizabeth', 'Bloemfontein'];

const ROOM_TYPES = ['Single', 'Double', 'Sharing', 'Studio', 'Ensuite'];

const UNSPLASH_FALLBACKS = [
  '1522708323590-d24dbb6b0267',
  '1560448204-e02f11c3d0e2',
  '1484154218962-a197022b5858',
  '1512918728675-ed5a585ecca5',
  '1493809842364-78817add7ffb',
  '1555854877-bab0e564b8d5',
];

const theme = createTheme({
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
  },
  palette: { primary: { main: '#1976d2', dark: '#1565c0' } },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } },
    },
  },
});

interface Property {
  _id: string;
  title?: string;
  name?: string;
  city?: string;
  location?: { city?: string; address?: string; university?: string };
  price?: number;
  pricing?: { minRent?: number; maxRent?: number };
  images?: string[];
  fundingType?: string;
  nsfasAccreditation?: boolean;
  roomType?: string;
  university?: string;
  status?: string;
}

const SIDEBAR_WIDTH = 272;

export default function BrowsePage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    university: '',
    minPrice: '',
    maxPrice: '',
    roomType: '',
    nsfas: false,
    sortBy: 'newest',
  });

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilters((prev) => ({
      ...prev,
      city: params.get('city') || '',
      university: params.get('university') || '',
      roomType: params.get('roomType') || '',
      nsfas: params.get('fundingType') === 'nsfas',
    }));
  }, []);

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.city) params.set('city', filters.city);
      if (filters.university) params.set('university', filters.university);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.roomType) params.set('roomType', filters.roomType);
      if (filters.nsfas) params.set('fundingType', 'nsfas');
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      const response = await api.get(`/properties?${params.toString()}`);
      const data = response.data;
      setProperties(Array.isArray(data) ? data : data.properties ?? data.data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string, value: any) => setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () =>
    setFilters({ search: '', city: '', university: '', minPrice: '', maxPrice: '', roomType: '', nsfas: false, sortBy: 'newest' });

  const hasActiveFilters =
    filters.city || filters.university || filters.minPrice || filters.maxPrice || filters.roomType || filters.nsfas;

  const getImage = (prop: Property, idx: number) => {
    if (prop.images?.[0]) return prop.images[0];
    return `https://images.unsplash.com/photo-${UNSPLASH_FALLBACKS[idx % UNSPLASH_FALLBACKS.length]}?w=600&h=360&fit=crop&auto=format`;
  };

  const getTitle = (prop: Property) => prop.title || prop.name || 'Student Accommodation';
  const getCity = (prop: Property) => prop.city || prop.location?.city || '—';
  const getUniversity = (prop: Property) => prop.university || prop.location?.university || '';
  const getPrice = (prop: Property) => {
    if (prop.price) return `R ${prop.price.toLocaleString()}/mo`;
    if (prop.pricing?.minRent) return `R ${prop.pricing.minRent.toLocaleString()}+/mo`;
    return 'Price on request';
  };
  const isNsfas = (prop: Property) => prop.fundingType === 'nsfas' || prop.nsfasAccreditation;

  // ─── Filter Sidebar ────────────────────────────────────────────────────
  const sidebarContent = (
    <Box sx={{ p: 3, width: SIDEBAR_WIDTH }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Filters</Typography>
        {hasActiveFilters && (
          <Typography
            onClick={clearFilters}
            sx={{ fontSize: '0.8rem', color: 'primary.main', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
          >
            Clear all
          </Typography>
        )}
      </Box>

      {/* NSFAS toggle */}
      <Paper variant="outlined" sx={{ px: 2, py: 1.5, borderRadius: 2, mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={filters.nsfas}
              onChange={(e) => set('nsfas', e.target.checked)}
              color="primary"
              size="small"
            />
          }
          label={
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>NSFAS Accredited</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Show only NSFAS-approved</Typography>
            </Box>
          }
          sx={{ m: 0, width: '100%', justifyContent: 'space-between', flexDirection: 'row-reverse' }}
        />
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {/* City */}
      <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>City</Typography>
      <TextField
        select fullWidth size="small" value={filters.city}
        onChange={(e) => set('city', e.target.value)} sx={{ mb: 3 }}
        slotProps={{ select: { displayEmpty: true } }}
      >
        <MenuItem value="">All Cities</MenuItem>
        {CITIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
      </TextField>

      {/* University */}
      <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>University</Typography>
      <TextField
        select fullWidth size="small" value={filters.university}
        onChange={(e) => set('university', e.target.value)} sx={{ mb: 3 }}
        slotProps={{ select: { displayEmpty: true } }}
      >
        <MenuItem value="">All Universities</MenuItem>
        {UNIVERSITIES.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
      </TextField>

      {/* Room type */}
      <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>Room Type</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {ROOM_TYPES.map((rt) => (
          <Chip
            key={rt} label={rt} size="small" clickable
            onClick={() => set('roomType', filters.roomType === rt.toLowerCase() ? '' : rt.toLowerCase())}
            sx={{
              fontWeight: 600,
              bgcolor: filters.roomType === rt.toLowerCase() ? '#1976d2' : 'transparent',
              color: filters.roomType === rt.toLowerCase() ? 'white' : 'text.secondary',
              border: '1px solid',
              borderColor: filters.roomType === rt.toLowerCase() ? '#1976d2' : 'divider',
            }}
          />
        ))}
      </Box>

      {/* Price range */}
      <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>Price Range (R/month)</Typography>
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
        <TextField
          fullWidth size="small" label="Min" type="number"
          value={filters.minPrice} onChange={(e) => set('minPrice', e.target.value)}
          slotProps={{ input: { inputProps: { min: 0 } } }}
        />
        <TextField
          fullWidth size="small" label="Max" type="number"
          value={filters.maxPrice} onChange={(e) => set('maxPrice', e.target.value)}
          slotProps={{ input: { inputProps: { min: 0 } } }}
        />
      </Box>

      {/* Sort */}
      <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>Sort By</Typography>
      <TextField
        select fullWidth size="small" value={filters.sortBy}
        onChange={(e) => set('sortBy', e.target.value)}
      >
        <MenuItem value="newest">Newest First</MenuItem>
        <MenuItem value="price_asc">Price: Low to High</MenuItem>
        <MenuItem value="price_desc">Price: High to Low</MenuItem>
      </TextField>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>

        {/* ─── STICKY SEARCH HEADER ────────────────────────────── */}
        <Box
          sx={{
            position: 'sticky', top: 0, zIndex: 100,
            bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ py: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, city, or university…"
                value={filters.search}
                onChange={(e) => set('search', e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ maxWidth: 520 }}
              />
              {/* Mobile filter toggle */}
              <Button
                variant="outlined"
                startIcon={<TuneRoundedIcon />}
                onClick={() => setMobileOpen(true)}
                sx={{ display: { xs: 'flex', md: 'none' }, flexShrink: 0, borderRadius: 2 }}
              >
                Filters {hasActiveFilters ? `(${[filters.city, filters.university, filters.roomType, filters.nsfas ? 'NSFAS' : '', filters.minPrice || filters.maxPrice ? 'Price' : ''].filter(Boolean).length})` : ''}
              </Button>
              <Box sx={{ ml: 'auto', display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {loading ? 'Searching…' : `${properties.length} propert${properties.length === 1 ? 'y' : 'ies'} found`}
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>

            {/* ─── DESKTOP SIDEBAR ─────────────────────────────── */}
            <Box
              component="aside"
              sx={{
                width: SIDEBAR_WIDTH, flexShrink: 0,
                display: { xs: 'none', md: 'block' },
                position: 'sticky', top: 80,
              }}
            >
              <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {sidebarContent}
              </Paper>
            </Box>

            {/* ─── MOBILE DRAWER ───────────────────────────────── */}
            <Drawer
              anchor="left"
              open={mobileOpen}
              onClose={() => setMobileOpen(false)}
              slotProps={{ paper: { sx: { borderRadius: '0 16px 16px 0' } } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2.5, pb: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>Filters</Typography>
                <IconButton onClick={() => setMobileOpen(false)} size="small"><CloseRoundedIcon /></IconButton>
              </Box>
              {sidebarContent}
              <Box sx={{ px: 3, pb: 3 }}>
                <Button variant="contained" fullWidth onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2 }}>
                  Show {properties.length} Results
                </Button>
              </Box>
            </Drawer>

            {/* ─── MAIN CONTENT ────────────────────────────────── */}
            <Box sx={{ flex: 1, minWidth: 0 }}>

              {/* Results bar */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                  {loading ? 'Searching…' : `${properties.length} propert${properties.length === 1 ? 'y' : 'ies'} found`}
                </Typography>
                {hasActiveFilters && (
                  <Button
                    size="small" variant="outlined" startIcon={<CloseRoundedIcon sx={{ fontSize: 14 }} />}
                    onClick={clearFilters}
                    sx={{ borderRadius: 2, fontSize: '0.8rem' }}
                  >
                    Clear filters
                  </Button>
                )}
              </Box>

              {/* Active filter chips */}
              {hasActiveFilters && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                  {filters.nsfas && <Chip label="NSFAS" size="small" onDelete={() => set('nsfas', false)} sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }} />}
                  {filters.city && <Chip label={filters.city} size="small" onDelete={() => set('city', '')} />}
                  {filters.university && <Chip label={filters.university} size="small" onDelete={() => set('university', '')} />}
                  {filters.roomType && <Chip label={filters.roomType} size="small" onDelete={() => set('roomType', '')} sx={{ textTransform: 'capitalize' }} />}
                  {(filters.minPrice || filters.maxPrice) && (
                    <Chip
                      label={`R${filters.minPrice || '0'} – R${filters.maxPrice || '∞'}`}
                      size="small"
                      onDelete={() => { set('minPrice', ''); set('maxPrice', ''); }}
                    />
                  )}
                </Box>
              )}

              {/* Error */}
              {error && <Typography color="error" sx={{ mb: 3 }}>{error}</Typography>}

              {/* Grid */}
              {loading ? (
                <Grid container spacing={3}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
                      <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Skeleton variant="rectangular" height={200} />
                        <CardContent>
                          <Skeleton variant="text" width="70%" height={24} />
                          <Skeleton variant="text" width="50%" />
                          <Skeleton variant="text" width="40%" />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : properties.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 12 }}>
                  <ApartmentRoundedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No properties found</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    Try adjusting your filters or search term.
                  </Typography>
                  <Button variant="outlined" onClick={clearFilters} sx={{ borderRadius: 2, mr: 1 }}>Clear Filters</Button>
                  <Button variant="contained" component={Link} href="/" sx={{ borderRadius: 2 }}>Back to Home</Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {properties.map((prop, idx) => (
                    <Grid key={prop._id} size={{ xs: 12, sm: 6, lg: 4 }}>
                      <Card
                        component={Link}
                        href={`/browse/${prop._id}`}
                        variant="outlined"
                        sx={{
                          borderRadius: 3, overflow: 'hidden', textDecoration: 'none', display: 'flex', flexDirection: 'column',
                          height: '100%', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                          '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(25,118,210,0.12)', borderColor: 'primary.main' },
                        }}
                      >
                        {/* Image */}
                        <Box sx={{ position: 'relative' }}>
                          <Box
                            component="img"
                            src={getImage(prop, idx)}
                            alt={getTitle(prop)}
                            sx={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                          />
                          {isNsfas(prop) && (
                            <Chip
                              icon={<VerifiedRoundedIcon sx={{ fontSize: 13, color: '#1565c0 !important' }} />}
                              label="NSFAS"
                              size="small"
                              sx={{
                                position: 'absolute', top: 10, left: 10,
                                bgcolor: 'white', color: '#1565c0', fontWeight: 700,
                                fontSize: '0.7rem', height: 24,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              }}
                            />
                          )}
                          {prop.roomType && (
                            <Chip
                              label={prop.roomType}
                              size="small"
                              sx={{
                                position: 'absolute', top: 10, right: 10,
                                bgcolor: 'rgba(0,0,0,0.55)', color: 'white', fontWeight: 600,
                                fontSize: '0.7rem', height: 24, textTransform: 'capitalize',
                                backdropFilter: 'blur(4px)',
                              }}
                            />
                          )}
                        </Box>

                        <CardContent sx={{ flex: 1, pb: '16px !important' }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.97rem', mb: 0.5, color: 'text.primary' }} noWrap>
                            {getTitle(prop)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <LocationOnRoundedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{getCity(prop)}</Typography>
                          </Box>
                          {getUniversity(prop) && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }} noWrap>
                              Near {getUniversity(prop)}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
                            <Typography sx={{ fontWeight: 800, color: '#1976d2', fontSize: '1.05rem' }}>
                              {getPrice(prop)}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex', alignItems: 'center', gap: 0.5,
                                color: '#1976d2', fontSize: '0.8rem', fontWeight: 600,
                              }}
                            >
                              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'primary.main' }}>View</Typography>
                              <ArrowForwardRoundedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
