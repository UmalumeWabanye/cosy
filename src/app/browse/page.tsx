'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import Link from 'next/link';
import nextDynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import StudentLayout from '@/components/student/StudentLayout';
import SaveButton from '@/components/SaveButton';
import { useAuth } from '@/hooks/useAuth';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import api from '@/services/api';
import { trackEvent } from '@/utils/analytics';


const PropertyMap = nextDynamic(() => import('@/components/PropertyMap'), { ssr: false });

const UNIVERSITIES = [
  'University of Cape Town', 'Stellenbosch University', 'University of Pretoria',
  'University of the Witwatersrand', 'University of KwaZulu-Natal', 'University of Johannesburg',
  'Rhodes University', 'Nelson Mandela University', 'North-West University',
  'University of the Free State', 'CPUT', 'Tshwane University of Technology',
  'Durban University of Technology', 'Walter Sisulu University',
];

const CITIES = ['Cape Town', 'Johannesburg', 'Pretoria', 'Durban', 'Stellenbosch', 'Grahamstown', 'Port Elizabeth', 'Bloemfontein'];
const ROOM_TYPES = ['Single', 'Sharing', 'Ensuite', 'Bachelor'];

const UNSPLASH_FALLBACKS = [
  '1522708323590-d24dbb6b0267', '1560448204-e02f11c3d0e2', '1484154218962-a197022b5858',
  '1512918728675-ed5a585ecca5', '1493809842364-78817add7ffb', '1555854877-bab0e564b8d5',
];

interface Property {
  _id: string; propertyName?: string; title?: string; name?: string; city?: string;
  location?: { city?: string; address?: string; university?: string; lat?: number; lng?: number };
  price?: number; pricing?: { minRent?: number; maxRent?: number };
  images?: Array<string | { url?: string }>; fundingType?: string; nsfasAccredited?: boolean; nsfasAccreditation?: boolean;
  roomType?: string; university?: string; universityNearby?: string; status?: string; lat?: number; lng?: number;
  transportation?: {
    enabled?: boolean;
    mode?: 'none' | 'private' | 'campus_route' | 'both';
  };
}

interface StudentRequest {
  status?: string;
  moveInDate?: string;
  property?: { _id?: string };
}

interface PropertyMapProps {
  properties: Property[];
  hoveredId?: string | null;
}

const TypedPropertyMap = PropertyMap as React.ComponentType<PropertyMapProps>;

const FILTERBAR_H = 60;

type FilterState = {
  search: string;
  city: string;
  university: string;
  minPrice: string;
  maxPrice: string;
  roomType: string;
  nsfas: boolean;
  sortBy: string;
};

export default function BrowsePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [transportVisiblePropertyIds, setTransportVisiblePropertyIds] = useState<Set<string>>(new Set());
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<Array<{ _id: string; name: string; filters: any }>>([]);
  const [savedSearchName, setSavedSearchName] = useState('');
  const [savedSearchMessage, setSavedSearchMessage] = useState('');
  const [savedSearchError, setSavedSearchError] = useState('');
  const [sourceTag, setSourceTag] = useState('direct');
  const [filters, setFilters] = useState<FilterState>({
    search: '', city: '', university: '', minPrice: '', maxPrice: '',
    roomType: '', nsfas: false, sortBy: 'newest',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('source') || 'direct';
    setSourceTag(source);
    setFilters((prev) => ({
      ...prev,
      search: params.get('search') || '',
      city: params.get('city') || '',
      university: params.get('university') || '',
      roomType: params.get('roomType') || '',
      nsfas: params.get('fundingType') === 'nsfas',
    }));
    trackEvent('browse-visit', {
      source,
      university: params.get('university') || 'any',
      city: params.get('city') || 'any',
      fundingType: params.get('fundingType') || 'any',
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadTransportEligibility = async () => {
      if (authLoading || !isAuthenticated) {
        if (!cancelled) setTransportVisiblePropertyIds(new Set());
        return;
      }

      try {
        const res = await api.get('/requests/my');
        const requests: StudentRequest[] = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        const now = new Date();
        const eligible = new Set<string>();

        requests.forEach((request) => {
          if (request.status !== 'approved') return;
          if (!request.moveInDate) return;
          const moveIn = new Date(request.moveInDate);
          if (Number.isNaN(moveIn.getTime()) || moveIn > now) return;
          const propertyId = request.property?._id;
          if (propertyId) eligible.add(propertyId);
        });

        if (!cancelled) setTransportVisiblePropertyIds(eligible);
      } catch {
        if (!cancelled) setTransportVisiblePropertyIds(new Set());
      }
    };

    loadTransportEligibility();
    return () => { cancelled = true; };
  }, [isAuthenticated, authLoading]);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.city) params.set('city', filters.city);
      if (filters.university) params.set('university', filters.university);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.roomType) params.set('roomType', filters.roomType);
      if (filters.nsfas) params.set('fundingType', 'nsfas');
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      const res = await api.get(`/properties?${params.toString()}`);
      const data = res.data;
      setProperties(Array.isArray(data) ? data : data.properties ?? data.data ?? []);
    } catch (err: unknown) {
      const message = typeof err === 'object' && err && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(message || 'Failed to load properties');
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    api.get('/student/saved-searches')
      .then((res) => setSavedSearches(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => null);
  }, [isAuthenticated, authLoading]);

  const set = (key: keyof FilterState, value: string | boolean) => setFilters((p) => ({ ...p, [key]: value }));
  const clearFilters = () => setFilters({ search: '', city: '', university: '', minPrice: '', maxPrice: '', roomType: '', nsfas: false, sortBy: 'newest' });
  const hasActiveFilters = !!(filters.city || filters.university || filters.minPrice || filters.maxPrice || filters.roomType || filters.nsfas);

  const onboarding = (user as any)?.studentOnboarding || {};
  const budgetMin = Number(onboarding.budgetMin || 0);
  const budgetMax = Number(onboarding.budgetMax || 0);

  const getImage = (p: Property, i: number) => {
    const image = p.images?.[0];
    if (typeof image === 'string') return image;
    if (image && typeof image === 'object' && image.url) return image.url;
    return `https://images.unsplash.com/photo-${UNSPLASH_FALLBACKS[i % UNSPLASH_FALLBACKS.length]}?w=480&h=320&fit=crop&auto=format`;
  };
  const getTitle = (p: Property) => p.propertyName || p.title || p.name || 'Student Accommodation';
  const getCity = (p: Property) => p.city || p.location?.city || '—';
  const getUniversity = (p: Property) => p.universityNearby || p.university || p.location?.university || '';
  const getPrice = (p: Property) => {
    if (p.price) return `R ${p.price.toLocaleString()}/mo`;
    if (p.pricing?.minRent) return `R ${p.pricing.minRent.toLocaleString()}+/mo`;
    return 'Price on request';
  };
  const isNsfas = (p: Property) => p.fundingType === 'nsfas' || p.nsfasAccreditation || p.nsfasAccredited;
  const getTransportLabel = (p: Property) => {
    if (!p.transportation?.enabled) return '';
    if (!transportVisiblePropertyIds.has(p._id)) return '';
    if (p.transportation.mode === 'private') return 'Private Transport';
    if (p.transportation.mode === 'campus_route') return 'Campus Route';
    if (p.transportation.mode === 'both') return 'Private + Campus';
    return 'Transport Available';
  };

  const toggleCompare = (propertyId: string) => {
    const willAdd = !compareIds.includes(propertyId);
    trackEvent('compare-click', {
      propertyId,
      action: willAdd ? 'add' : 'remove',
    });
    setCompareIds((prev) => {
      if (prev.includes(propertyId)) return prev.filter((id) => id !== propertyId);
      if (prev.length >= 3) return prev;
      return [...prev, propertyId];
    });
  };

  const compareProperties = properties.filter((p) => compareIds.includes(p._id));

  const estimateTotalMonthly = (p: Property) => {
    const base = Number(p.price || 0);
    const utilities = Math.round(base * 0.08);
    const transport = p.transportation?.enabled ? 600 : 850;
    return base + utilities + transport;
  };

  const affordabilityLabel = (p: Property) => {
    const total = estimateTotalMonthly(p);
    if (!budgetMax) return 'No budget set';
    if (total <= budgetMax && (!budgetMin || total >= budgetMin)) return 'Great fit';
    if (total <= budgetMax * 1.15) return 'Stretch';
    return 'Over budget';
  };

  const saveCurrentSearch = async () => {
    setSavedSearchMessage('');
    setSavedSearchError('');
    try {
      const name = savedSearchName.trim() || `Search ${new Date().toLocaleDateString('en-ZA')}`;
      const payload = {
        name,
        filters: {
          search: filters.search,
          city: filters.city,
          university: filters.university,
          minPrice: filters.minPrice ? Number(filters.minPrice) : null,
          maxPrice: filters.maxPrice ? Number(filters.maxPrice) : null,
          roomType: filters.roomType,
          nsfas: filters.nsfas,
        },
      };
      const res = await api.post('/student/saved-searches', payload);
      if (res.data?.data) {
        setSavedSearches((prev) => [res.data.data, ...prev]);
      }
      setSavedSearchName('');
      setSavedSearchMessage('Search saved. You will receive digest alerts when matches increase.');
      trackEvent('save-search', {
        source: sourceTag,
        hasCity: Boolean(filters.city),
        hasUniversity: Boolean(filters.university),
        hasBudget: Boolean(filters.minPrice || filters.maxPrice),
        nsfas: filters.nsfas,
      });
    } catch (e: any) {
      setSavedSearchError(e?.response?.data?.message || 'Failed to save this search.');
    }
  };

  const applySavedSearch = (filtersFromSaved: any) => {
    setFilters((prev) => ({
      ...prev,
      search: filtersFromSaved?.search || '',
      city: filtersFromSaved?.city || '',
      university: filtersFromSaved?.university || '',
      minPrice: filtersFromSaved?.minPrice ? String(filtersFromSaved.minPrice) : '',
      maxPrice: filtersFromSaved?.maxPrice ? String(filtersFromSaved.maxPrice) : '',
      roomType: filtersFromSaved?.roomType || '',
      nsfas: Boolean(filtersFromSaved?.nsfas),
    }));
  };

  const FilterPanel = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 2, sm: 3 } }}>
      <Paper variant="outlined" sx={{ px: 2, py: 1.5, borderRadius: 2 }}>
        <FormControlLabel
          control={<Switch checked={filters.nsfas} onChange={(e) => set('nsfas', e.target.checked)} color="primary" size="small" />}
          label={
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>NSFAS Accredited</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>NSFAS-approved only</Typography>
            </Box>
          }
          sx={{ m: 0, width: '100%', justifyContent: 'space-between', flexDirection: 'row-reverse' }}
        />
      </Paper>
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>City</Typography>
        <TextField select fullWidth size="small" value={filters.city} onChange={(e) => set('city', e.target.value)} slotProps={{ select: { displayEmpty: true } }}>
          <MenuItem value="">All Cities</MenuItem>
          {CITIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>University</Typography>
        <TextField select fullWidth size="small" value={filters.university} onChange={(e) => set('university', e.target.value)} slotProps={{ select: { displayEmpty: true } }}>
          <MenuItem value="">All Universities</MenuItem>
          {UNIVERSITIES.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
        </TextField>
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>Room Type</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {ROOM_TYPES.map((rt) => (
            <Chip key={rt} label={rt} size="small" clickable
              onClick={() => set('roomType', filters.roomType === rt ? '' : rt)}
              sx={{ fontWeight: 600, bgcolor: filters.roomType === rt ? 'primary.main' : 'transparent', color: filters.roomType === rt ? 'white' : 'text.secondary', border: '1px solid', borderColor: filters.roomType === rt ? 'primary.main' : 'divider' }}
            />
          ))}
        </Box>
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>Price Range (R/month)</Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField fullWidth size="small" label="Min" type="number" value={filters.minPrice} onChange={(e) => set('minPrice', e.target.value)} slotProps={{ input: { inputProps: { min: 0 } } }} />
          <TextField fullWidth size="small" label="Max" type="number" value={filters.maxPrice} onChange={(e) => set('maxPrice', e.target.value)} slotProps={{ input: { inputProps: { min: 0 } } }} />
        </Box>
      </Box>
    </Box>
  );

  return (
    <StudentLayout>
    <Box sx={{ bgcolor: '#f8f9fa', display: 'flex', flexDirection: 'column', height: { xs: 'auto', md: 'calc(100vh - 48px)' }, minHeight: { xs: '100vh', md: 'unset' } }}>

        {/* ── FILTER BAR ──────────────────────────────────────── */}
        <Box sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', flexShrink: 0, zIndex: 10 }}>
          <Box sx={{ maxWidth: 1600, mx: 'auto', px: { xs: 2, sm: 3 }, height: FILTERBAR_H, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small" placeholder="Search city, university, property…"
              value={filters.search} onChange={(e) => set('search', e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> } }}
              sx={{ width: { xs: '100%', sm: 260, md: 300 }, flexShrink: 0, '& .MuiOutlinedInput-root': { borderRadius: '9999px' } }}
            />
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, flex: 1, overflow: 'hidden' }}>
              <TextField select size="small" value={filters.city} onChange={(e) => set('city', e.target.value)} slotProps={{ select: { displayEmpty: true } }} sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: '9999px' } }}>
                <MenuItem value="">All Cities</MenuItem>
                {CITIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
              <TextField select size="small" value={filters.university} onChange={(e) => set('university', e.target.value)} slotProps={{ select: { displayEmpty: true } }} sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '9999px' } }}>
                <MenuItem value="">All Universities</MenuItem>
                {UNIVERSITIES.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
              <TextField select size="small" value={filters.roomType} onChange={(e) => set('roomType', e.target.value)} slotProps={{ select: { displayEmpty: true } }} sx={{ minWidth: 130, '& .MuiOutlinedInput-root': { borderRadius: '9999px' } }}>
                <MenuItem value="">Room Type</MenuItem>
                {ROOM_TYPES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
              <Chip label="NSFAS" clickable onClick={() => set('nsfas', !filters.nsfas)}
                sx={{ fontWeight: 600, fontSize: '0.8rem', borderRadius: '9999px', bgcolor: filters.nsfas ? 'primary.main' : 'transparent', color: filters.nsfas ? 'white' : 'text.secondary', border: '1px solid', borderColor: filters.nsfas ? 'primary.main' : 'divider' }}
              />
              {hasActiveFilters && <Chip label="Clear all" size="small" clickable onClick={clearFilters} onDelete={clearFilters} sx={{ fontWeight: 600, color: 'error.main', borderRadius: '9999px', border: '1px solid', borderColor: 'error.light' }} />}
            </Box>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <TextField
                size="small"
                placeholder="Saved search name"
                value={savedSearchName}
                onChange={(e) => setSavedSearchName(e.target.value)}
                sx={{ display: { xs: 'none', md: 'block' }, width: 170 }}
              />
              <Button size="small" variant="outlined" onClick={saveCurrentSearch} sx={{ borderRadius: '9999px', display: { xs: 'none', md: 'inline-flex' } }}>Save Search</Button>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' }, whiteSpace: 'nowrap' }}>
                {loading ? '…' : `${properties.length} found`}
              </Typography>
              <Button size="small" variant="outlined" startIcon={showMap ? <ViewListRoundedIcon /> : <MapRoundedIcon />}
                onClick={() => setShowMap(!showMap)}
                sx={{ borderRadius: '9999px', display: { xs: 'none', md: 'inline-flex' }, whiteSpace: 'nowrap' }}>
                {showMap ? 'List only' : 'Show map'}
              </Button>
              <Button variant="outlined" size="small" startIcon={<TuneRoundedIcon />} onClick={() => setMobileDrawerOpen(true)}
                sx={{ borderRadius: '9999px', display: { xs: 'flex', md: 'none' }, flexShrink: 0 }}>
                Filters{hasActiveFilters ? ` (${[filters.city, filters.university, filters.roomType, filters.nsfas ? 'N' : '', filters.minPrice || filters.maxPrice ? 'P' : ''].filter(Boolean).length})` : ''}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* ── MOBILE DRAWER ───────────────────────────────────── */}
        <Drawer anchor="left" open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} slotProps={{ paper: { sx: { borderRadius: '0 16px 16px 0', width: 300 } } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, pt: 2.5, pb: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>Filters</Typography>
            <IconButton size="small" onClick={() => setMobileDrawerOpen(false)}><CloseRoundedIcon /></IconButton>
          </Box>
          <FilterPanel />
          <Box sx={{ px: 2.5, pb: 3, pt: 1 }}>
            <Button variant="contained" fullWidth onClick={() => setMobileDrawerOpen(false)} sx={{ borderRadius: '9999px' }}>Show {properties.length} Results</Button>
          </Box>
        </Drawer>

        {/* ── SPLIT VIEW ──────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* LEFT: Scrollable list */}
          <Box sx={{ width: showMap ? { xs: '100%', md: '44%', lg: '40%' } : '100%', overflowY: 'auto', flexShrink: 0, borderRight: showMap ? '1px solid' : 'none', borderColor: 'divider' }}>
            <Box sx={{ p: { xs: 2, sm: 2.5 }, maxWidth: showMap ? 'none' : 900, mx: showMap ? 0 : 'auto' }}>

              {hasActiveFilters && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {filters.nsfas && <Chip label="NSFAS" size="small" onDelete={() => set('nsfas', false)} sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600, borderRadius: '9999px' }} />}
                  {filters.city && <Chip label={filters.city} size="small" onDelete={() => set('city', '')} />}
                  {filters.university && <Chip label={filters.university} size="small" onDelete={() => set('university', '')} />}
                  {filters.roomType && <Chip label={filters.roomType} size="small" onDelete={() => set('roomType', '')} sx={{ textTransform: 'capitalize' }} />}
                  {(filters.minPrice || filters.maxPrice) && <Chip label={`R${filters.minPrice || '0'} – R${filters.maxPrice || '∞'}`} size="small" onDelete={() => { set('minPrice', ''); set('maxPrice', ''); }} />}
                </Box>
              )}

              {savedSearchMessage ? <Alert severity="success" sx={{ mb: 1.5 }}>{savedSearchMessage}</Alert> : null}
              {savedSearchError ? <Alert severity="error" sx={{ mb: 1.5 }}>{savedSearchError}</Alert> : null}

              {savedSearches.length > 0 ? (
                <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {savedSearches.slice(0, 4).map((search) => (
                    <Chip
                      key={search._id}
                      label={`Use: ${search.name}`}
                      size="small"
                      clickable
                      onClick={() => applySavedSearch(search.filters)}
                    />
                  ))}
                </Box>
              ) : null}

              {compareProperties.length > 0 ? (
                  <Paper variant="outlined" sx={{ p: 1.25, mb: 2, borderRadius: '16px' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', mb: 1 }}>Affordability Compare ({compareProperties.length}/3)</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: `repeat(${compareProperties.length}, 1fr)` }, gap: 1 }}>
                    {compareProperties.map((item) => (
                      <Paper key={item._id} variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>{getTitle(item)}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{item.city || 'Unknown city'}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>Rent: R{Number(item.price || 0).toLocaleString()}</Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>Est. total monthly: R{estimateTotalMonthly(item).toLocaleString()}</Typography>
                        <Chip
                          size="small"
                          label={affordabilityLabel(item)}
                          color={affordabilityLabel(item) === 'Great fit' ? 'success' : affordabilityLabel(item) === 'Stretch' ? 'warning' : 'default'}
                          sx={{ mt: 0.5 }}
                        />
                      </Paper>
                    ))}
                  </Box>
                </Paper>
              ) : null}

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: 'text.primary' }}>
                  {loading ? 'Searching…' : `${properties.length} propert${properties.length === 1 ? 'y' : 'ies'} found`}
                </Typography>
                <TextField select size="small" value={filters.sortBy} onChange={(e) => set('sortBy', e.target.value)} sx={{ minWidth: 160, '& .MuiInputBase-root': { fontSize: '0.82rem', borderRadius: '9999px' } }}>
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="price_asc">Price: Low → High</MenuItem>
                  <MenuItem value="price_desc">Price: High → Low</MenuItem>
                </TextField>
              </Box>

              {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Paper key={i} variant="outlined" sx={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', height: 140 }}>
                      <Skeleton variant="rectangular" width={160} height={140} sx={{ flexShrink: 0 }} />
                      <Box sx={{ p: 2, flex: 1 }}>
                        <Skeleton variant="text" width="60%" height={22} />
                        <Skeleton variant="text" width="40%" />
                        <Skeleton variant="text" width="35%" />
                        <Skeleton variant="text" width="25%" sx={{ mt: 1 }} />
                      </Box>
                    </Paper>
                  ))
                ) : properties.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 10 }}>
                    <ApartmentRoundedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No properties found</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Try adjusting your filters.</Typography>
                    <Button variant="outlined" onClick={clearFilters} sx={{ borderRadius: '9999px', mr: 1 }}>Clear Filters</Button>
                    <Button variant="contained" component={Link} href="/" sx={{ borderRadius: '9999px' }}>Back to Home</Button>
                  </Box>
                ) : properties.map((prop, idx) => (
                  <Paper
                    key={prop._id}
                    component={Link}
                    href={`/browse/${prop._id}?source=${encodeURIComponent(sourceTag)}`}
                    onClick={() => trackEvent('listing-view', {
                      propertyId: prop._id,
                      source: sourceTag,
                      city: getCity(prop),
                      university: getUniversity(prop) || 'unknown',
                      nsfas: isNsfas(prop),
                    })}
                    variant="outlined"
                    onMouseEnter={() => setHoveredId(prop._id)}
                    onMouseLeave={() => setHoveredId(null)}
                    sx={{
                      borderRadius: '16px', overflow: 'hidden', textDecoration: 'none',
                      display: 'flex', flexDirection: 'row', minHeight: 138, transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'pointer',
                      '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 18px rgba(25,118,210,0.12)' },
                    }}
                  >
                    <Box sx={{ position: 'relative', flexShrink: 0, width: { xs: 110, sm: 160 }, minHeight: 138 }}>
                      <Box component="img" src={getImage(prop, idx)} alt={getTitle(prop)}
                        sx={{ width: '100%', height: '100%', minHeight: 138, objectFit: 'cover', display: 'block' }} />
                      {isNsfas(prop) && (
                          <Chip icon={<VerifiedRoundedIcon sx={{ fontSize: 12, color: '#1565c0 !important' }} />} label="NSFAS" size="small"
                          sx={{ position: 'absolute', bottom: 7, left: 7, borderRadius: '9999px', bgcolor: 'white', color: '#1565c0', fontWeight: 700, fontSize: '0.66rem', height: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.18)' }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.4 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.93rem', color: 'text.primary', lineHeight: 1.3 }} noWrap>
                            {getTitle(prop)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
                            {prop.roomType && (
                              <Chip label={prop.roomType} size="small" sx={{ fontSize: '0.66rem', fontWeight: 600, textTransform: 'capitalize', bgcolor: '#f0f4f8', color: 'text.secondary', height: 20 }} />
                            )}
                            <Chip
                              label={compareIds.includes(prop._id) ? 'Comparing' : 'Compare'}
                              size="small"
                              clickable
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleCompare(prop._id);
                              }}
                              sx={{ fontSize: '0.66rem', height: 20 }}
                            />
                            <SaveButton propertyId={prop._id} size="small" />
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}>
                          <LocationOnRoundedIcon sx={{ fontSize: 13, color: 'text.disabled', flexShrink: 0 }} />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>{getCity(prop)}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', minHeight: 18 }} noWrap>
                          {getUniversity(prop) ? `Near ${getUniversity(prop)}` : ' '}
                        </Typography>
                        {getTransportLabel(prop) && (
                          <Chip
                            label={getTransportLabel(prop)}
                            size="small"
                            sx={{ mt: 0.5, height: 20, fontSize: '0.66rem', fontWeight: 700, bgcolor: '#ede7f6', color: '#5e35b1' }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                        <Typography sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.97rem' }}>{getPrice(prop)}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'primary.main' }}>View</Typography>
                          <ArrowForwardRoundedIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          </Box>

          {/* RIGHT: Map */}
          {showMap && (
            <Box sx={{ display: { xs: 'none', md: 'block' }, flex: 1, overflow: 'hidden' }}>
              <TypedPropertyMap properties={properties} hoveredId={hoveredId} />
            </Box>
          )}
        </Box>
      </Box>
    </StudentLayout>
  );
}
