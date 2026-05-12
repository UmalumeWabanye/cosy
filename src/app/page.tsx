'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';

const theme = createTheme({
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
  },
  shape: { borderRadius: 8 },
});

const UNIVERSITIES = [
  'University of Cape Town',
  'Stellenbosch University',
  'University of the Witwatersrand',
  'University of Pretoria',
  'University of KwaZulu-Natal',
  'Rhodes University',
  'University of the Free State',
  'Nelson Mandela University',
  'Cape Peninsula University of Technology',
  'Tshwane University of Technology',
];

const CITIES = ['Cape Town', 'Johannesburg', 'Pretoria', 'Durban', 'Port Elizabeth', 'Bloemfontein', 'Grahamstown'];

const features = [
  {
    icon: <SchoolOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Student-Focused',
    desc: 'Properties verified and tailored specifically for university students near campus.',
  },
  {
    icon: <VerifiedOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'NSFAS Accredited',
    desc: 'Easily find properties that accept NSFAS funding to make accommodation accessible.',
  },
  {
    icon: <SecurityOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Secure & Verified',
    desc: 'All listings are verified to ensure you find safe, quality accommodation.',
  },
  {
    icon: <SupportAgentOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: '24/7 Support',
    desc: 'Our team is always available to help you find your perfect student home.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [university, setUniversity] = useState('');
  const [city, setCity] = useState('');
  const [fundingType, setFundingType] = useState('');
  const [roomType, setRoomType] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (university) params.set('university', university);
    if (city) params.set('city', city);
    if (fundingType) params.set('fundingType', fundingType);
    if (roomType) params.set('roomType', roomType);
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        {/* Hero */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)',
            py: { xs: 8, md: 14 },
            px: 2,
          }}
        >
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{ fontWeight: 800, color: 'white', mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}
            >
              Find Your Perfect Student Home
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mb: 6, fontWeight: 400 }}>
              Browse verified student accommodation near your university
            </Typography>

            {/* Search Form */}
            <Paper
              component="form"
              onSubmit={handleSearch}
              elevation={4}
              sx={{ p: 3, borderRadius: 3 }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="University"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="">Any University</MenuItem>
                    {UNIVERSITIES.map((u) => (
                      <MenuItem key={u} value={u}>{u}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="">Any City</MenuItem>
                    {CITIES.map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Funding Type"
                    value={fundingType}
                    onChange={(e) => setFundingType(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="">Any Funding</MenuItem>
                    <MenuItem value="nsfas">NSFAS</MenuItem>
                    <MenuItem value="private">Private Funding</MenuItem>
                    <MenuItem value="self-funded">Self-Funded</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Room Type"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="">Any Room</MenuItem>
                    <MenuItem value="single">Single</MenuItem>
                    <MenuItem value="double">Double</MenuItem>
                    <MenuItem value="sharing">Sharing</MenuItem>
                    <MenuItem value="studio">Studio</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<SearchIcon />}
                    sx={{ fontWeight: 600, textTransform: 'none', py: 1.5, borderRadius: 2 }}
                  >
                    Search Properties
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Container>
        </Box>

        {/* Features */}
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
            Why Choose Cosy?
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', mb: 6 }}>
            We make finding student accommodation simple, safe, and stress-free.
          </Typography>
          <Grid container spacing={3}>
            {features.map((f) => (
              <Grid key={f.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 1,
                    boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 'hsla(220, 30%, 5%, 0.1) 0px 10px 25px 0px' },
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2 }}>{f.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{f.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{f.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Divider />

        {/* CTA */}
        <Box sx={{ bgcolor: 'primary.main', py: 8, px: 2, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 2 }}>
            Ready to Find Your Home?
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', mb: 4 }}>
            Join thousands of students who found their perfect accommodation with Cosy.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/browse"
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 700,
                textTransform: 'none',
                px: 4,
                '&:hover': { bgcolor: 'grey.100' },
              }}
            >
              Browse Properties
            </Button>
            <Button
              component={Link}
              href="/register"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                fontWeight: 700,
                textTransform: 'none',
                px: 4,
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Create Account
            </Button>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ bgcolor: 'grey.900', color: 'grey.400', py: 6, px: 2 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 14 }}>C</Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: 'white', fontSize: 18 }}>Cosy</Typography>
                </Box>
                <Typography variant="body2">
                  Student accommodation made simple. Find your perfect home near campus.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography sx={{ fontWeight: 600, color: 'white', mb: 2 }}>Quick Links</Typography>
                {['Browse Properties', 'How It Works', 'About Us'].map((l) => (
                  <Typography key={l} variant="body2" sx={{ mb: 1 }}>{l}</Typography>
                ))}
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography sx={{ fontWeight: 600, color: 'white', mb: 2 }}>For Students</Typography>
                {['Register', 'Login', 'Dashboard', 'Saved Listings'].map((l) => (
                  <Typography key={l} variant="body2" sx={{ mb: 1 }}>{l}</Typography>
                ))}
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography sx={{ fontWeight: 600, color: 'white', mb: 2 }}>Contact</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>support@cosy.co.za</Typography>
                <Typography variant="body2">+27 21 000 0000</Typography>
              </Grid>
            </Grid>
            <Divider sx={{ borderColor: 'grey.700', my: 4 }} />
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              © {new Date().getFullYear()} Cosy. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
