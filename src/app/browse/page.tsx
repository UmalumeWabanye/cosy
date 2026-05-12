'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import api from '@/services/api';

const theme = createTheme({
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
  },
  shape: { borderRadius: 8 },
});

interface PropertyData {
  _id: string;
  name: string;
  location: { city: string; address: string; university: string };
  pricing: { minRent: number; maxRent: number };
  images: string[];
  nsfasAccreditation: boolean;
  rating: number;
  reviewCount: number;
  rooms: { available: number; total: number };
  roomTypes: Array<{ type: string; pricePerMonth: number }>;
}

export default function BrowsePage() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    nsfasAccredited: '',
    city: '',
    search: '',
    sortBy: 'newest',
    roomType: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilters((prev) => ({
      ...prev,
      city: params.get('city') || '',
      roomType: params.get('roomType') || '',
      nsfasAccredited: params.get('fundingType') === 'nsfas' ? 'true' : '',
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
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.nsfasAccredited) params.set('nsfasAccredited', filters.nsfasAccredited);
      if (filters.city) params.set('city', filters.city);
      if (filters.search) params.set('search', filters.search);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.roomType) params.set('roomType', filters.roomType);

      const response = await api.get(`/properties?${params.toString()}`);
      const data = response.data;
      setProperties(data.properties || data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
        {/* Page Header */}
        <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', py: 3, px: 2 }}>
          <Container maxWidth="lg">
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Browse Properties</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {loading ? 'Loading...' : `${properties.length} properties found`}
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Filters */}
          <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Search"
                  size="small"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Property name..."
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  label="City"
                  size="small"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <TextField
                  fullWidth
                  label="Min Price"
                  size="small"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <TextField
                  fullWidth
                  label="Max Price"
                  size="small"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="NSFAS"
                  size="small"
                  value={filters.nsfasAccredited}
                  onChange={(e) => handleFilterChange('nsfasAccredited', e.target.value)}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="true">Accredited</MenuItem>
                  <MenuItem value="false">Not Accredited</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="small"
                  onClick={() => setFilters({ minPrice: '', maxPrice: '', nsfasAccredited: '', city: '', search: '', sortBy: 'newest', roomType: '' })}
                  sx={{ textTransform: 'none', height: 40 }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Card>

          {/* Error */}
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          )}

          {/* Loading */}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading properties...</Typography>
            </Box>
          ) : properties.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>No properties found</Typography>
              <Button variant="contained" component={Link} href="/" sx={{ textTransform: 'none' }}>
                Go Back Home
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {properties.map((property) => (
                <Grid key={property._id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px',
                      transition: 'box-shadow 0.2s',
                      '&:hover': { boxShadow: 'hsla(220, 30%, 5%, 0.12) 0px 10px 25px 0px' },
                    }}
                  >
                    {property.images && property.images[0] ? (
                      <CardMedia
                        component="img"
                        height={200}
                        image={property.images[0]}
                        alt={property.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ height: 200, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.disabled">No image</Typography>
                      </Box>
                    )}
                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                          {property.name}
                        </Typography>
                        {property.nsfasAccreditation && (
                          <Chip
                            icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                            label="NSFAS"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontSize: 11 }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {property.location.city}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                        <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {(property.rating || 0).toFixed(1)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          ({property.reviewCount || 0})
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        R{property.pricing.minRent.toLocaleString()} – R{property.pricing.maxRent.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>per month</Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        component={Link}
                        href={`/browse/${property._id}`}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
