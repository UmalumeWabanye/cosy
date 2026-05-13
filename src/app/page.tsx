'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import SearchIcon from '@mui/icons-material/Search';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import api from '@/services/api';

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

const STATS = [
  { icon: <PeopleRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />, value: '12,000+', label: 'Students Placed' },
  { icon: <ApartmentRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />, value: '850+', label: 'Listed Properties' },
  { icon: <SchoolRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />, value: '25+', label: 'Universities' },
  { icon: <LocationOnRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />, value: '10', label: 'Cities Covered' },
];

const STEPS = [
  {
    num: '01',
    title: 'Search',
    desc: 'Enter your university, city, and funding type to discover tailored accommodation options.',
    icon: <SearchIcon sx={{ fontSize: 28, color: 'white' }} />,
  },
  {
    num: '02',
    title: 'Apply',
    desc: 'Submit your application directly through Cosy. We handle communication with the landlord.',
    icon: <HomeWorkRoundedIcon sx={{ fontSize: 28, color: 'white' }} />,
  },
  {
    num: '03',
    title: 'Move In',
    desc: 'Get approved, confirm your booking, and move into your new home stress-free.',
    icon: <CheckCircleRoundedIcon sx={{ fontSize: 28, color: 'white' }} />,
  },
];

const FEATURES = [
  {
    icon: <SchoolOutlinedIcon sx={{ fontSize: 36, color: '#1976d2' }} />,
    title: 'Student-Focused',
    desc: 'Properties verified and tailored specifically for university students near campus.',
  },
  {
    icon: <VerifiedOutlinedIcon sx={{ fontSize: 36, color: '#1976d2' }} />,
    title: 'NSFAS Accredited',
    desc: 'Easily find properties that accept NSFAS funding to make accommodation accessible.',
  },
  {
    icon: <SecurityOutlinedIcon sx={{ fontSize: 36, color: '#1976d2' }} />,
    title: 'Secure & Verified',
    desc: 'All listings are verified to ensure you find safe, quality accommodation.',
  },
  {
    icon: <SupportAgentOutlinedIcon sx={{ fontSize: 36, color: '#1976d2' }} />,
    title: '24/7 Support',
    desc: 'Our team is always available to help you find your perfect student home.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Amahle Dlamini',
    university: 'University of KwaZulu-Natal',
    quote: 'Cosy made finding my first student apartment so easy. I was approved within a week and the NSFAS process was seamless.',
    initials: 'AD',
    color: '#1976d2',
  },
  {
    name: 'Ruan van der Berg',
    university: 'Stellenbosch University',
    quote: 'I love that I could filter by NSFAS and find accredited places near campus. Saved me so much stress during registration.',
    initials: 'RB',
    color: '#0288d1',
  },
  {
    name: 'Nokuthula Sibiya',
    university: 'University of Pretoria',
    quote: 'The application process is straightforward and the support team responded within hours. Highly recommend Cosy!',
    initials: 'NS',
    color: '#0097a7',
  },
];

interface Property {
  _id: string;
  title: string;
  city: string;
  price: number;
  roomType: string;
  fundingType: string;
  images: string[];
  university: string;
}

export default function HomePage() {
  const router = useRouter();
  const [university, setUniversity] = useState('');
  const [city, setCity] = useState('');
  const [fundingType, setFundingType] = useState('');
  const [roomType, setRoomType] = useState('');
  const [featured, setFeatured] = useState<Property[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    api.get('/properties?limit=6&status=published')
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data) ? data : data.properties ?? [];
        setFeatured(list.slice(0, 6));
      })
      .catch(() => setFeatured([]))
      .finally(() => setLoadingFeatured(false));
  }, []);

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
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>

        {/* ─── HERO ─────────────────────────────────────────────── */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 40%, #1976d2 70%, #42a5f5 100%)',
            pt: { xs: 8, md: 14 },
            pb: { xs: 6, md: 10 },
            px: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 45%)',
            },
          }}
        >
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={6} sx={{ alignItems: 'center' }}>
              {/* Left: headline + search */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Chip
                  label="🎓 South Africa's Student Accommodation Platform"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    fontWeight: 600,
                    mb: 3,
                    fontSize: '0.75rem',
                    backdropFilter: 'blur(8px)',
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    color: 'white',
                    mb: 2,
                    fontSize: { xs: '2.2rem', sm: '3rem', md: '3.8rem' },
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Find Your Perfect
                  <Box component="span" sx={{ display: 'block', color: '#bbdefb' }}>
                    Student Home
                  </Box>
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: 'rgba(255,255,255,0.8)', mb: 5, fontWeight: 400, maxWidth: 520, lineHeight: 1.6 }}
                >
                  Browse verified, NSFAS-accredited student accommodation near your university. Apply online in minutes.
                </Typography>

                {/* Search Form */}
                <Paper
                  component="form"
                  onSubmit={handleSearch}
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select fullWidth label="University"
                        value={university} onChange={(e) => setUniversity(e.target.value)} size="small"
                      >
                        <MenuItem value="">Any University</MenuItem>
                        {UNIVERSITIES.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select fullWidth label="City"
                        value={city} onChange={(e) => setCity(e.target.value)} size="small"
                      >
                        <MenuItem value="">Any City</MenuItem>
                        {CITIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select fullWidth label="Funding Type"
                        value={fundingType} onChange={(e) => setFundingType(e.target.value)} size="small"
                      >
                        <MenuItem value="">Any Funding</MenuItem>
                        <MenuItem value="nsfas">NSFAS</MenuItem>
                        <MenuItem value="private">Private Funding</MenuItem>
                        <MenuItem value="self-funded">Self-Funded</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select fullWidth label="Room Type"
                        value={roomType} onChange={(e) => setRoomType(e.target.value)} size="small"
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
                        type="submit" variant="contained" fullWidth size="large"
                        startIcon={<SearchIcon />}
                        sx={{
                          fontWeight: 700, textTransform: 'none', py: 1.5, borderRadius: 2,
                          background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                          fontSize: '1rem',
                          boxShadow: '0 4px 14px rgba(25,118,210,0.4)',
                        }}
                      >
                        Search Properties
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Right: decorative card stack */}
              <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                <Box sx={{ position: 'relative', width: 340, height: 380 }}>
                  {/* Back card */}
                  <Paper
                    elevation={0}
                    sx={{
                      position: 'absolute', top: 30, right: 0, width: 280, borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.2)', p: 2.5,
                    }}
                  >
                    <Box sx={{ height: 120, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                    <Box sx={{ height: 10, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.3)', mb: 1, width: '70%' }} />
                    <Box sx={{ height: 8, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)', width: '50%' }} />
                  </Paper>
                  {/* Front card */}
                  <Paper
                    elevation={12}
                    sx={{
                      position: 'absolute', top: 0, left: 0, width: 290, borderRadius: 3, overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: 150,
                        background: 'linear-gradient(135deg, #42a5f5 0%, #1565c0 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <ApartmentRoundedIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.6)' }} />
                    </Box>
                    <Box sx={{ p: 2.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>Modern Student Flat</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>Cape Town · Near UCT</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontWeight: 800, color: '#1976d2', fontSize: '1.1rem' }}>R 4,200/mo</Typography>
                        <Chip label="NSFAS" size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600, fontSize: '0.7rem' }} />
                      </Box>
                    </Box>
                  </Paper>
                  {/* Stat bubble */}
                  <Paper
                    elevation={8}
                    sx={{
                      position: 'absolute', bottom: 20, right: 10, borderRadius: 2,
                      px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1,
                    }}
                  >
                    <CheckCircleRoundedIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1 }}>Verified</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>850+ listings</Typography>
                    </Box>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* ─── STATS BAR ────────────────────────────────────────── */}
        <Box sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Container maxWidth="lg">
            <Grid container>
              {STATS.map((s, i) => (
                <Grid key={s.label} size={{ xs: 6, sm: 3 }}>
                  <Box
                    sx={{
                      py: { xs: 3, md: 4 },
                      px: 2,
                      textAlign: 'center',
                      borderRight: i < 3 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ mb: 1 }}>{s.icon}</Box>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.8rem' }, color: 'text.primary', lineHeight: 1 }}>
                      {s.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{s.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
              Simple Process
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, mb: 2, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
              How Cosy Works
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
              From search to move-in — we guide you every step of the way.
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
            {STEPS.map((step, i) => (
              <Grid key={step.num} size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%' }}>
                  {/* Number + connector */}
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 4 }}>
                    <Box
                      sx={{
                        width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(25,118,210,0.35)',
                        mx: 'auto',
                      }}
                    >
                      {step.icon}
                    </Box>
                    {i < 2 && (
                      <Box
                        sx={{
                          display: { xs: 'none', md: 'block' },
                          flexGrow: 1,
                          height: 2,
                          background: 'repeating-linear-gradient(90deg, #1976d2 0, #1976d2 6px, transparent 6px, transparent 12px)',
                          ml: 3,
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 900, fontSize: '0.75rem', color: '#1976d2',
                      letterSpacing: 3, mb: 1, textTransform: 'uppercase',
                    }}
                  >
                    Step {step.num}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>{step.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>{step.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* ─── FEATURED LISTINGS ────────────────────────────────── */}
        <Box sx={{ bgcolor: 'white', py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 6, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
                  Browse Listings
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                  Featured Properties
                </Typography>
              </Box>
              <Button
                component={Link} href="/browse"
                variant="outlined" endIcon={<ArrowForwardRoundedIcon />}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                View All
              </Button>
            </Box>

            <Grid container spacing={3}>
              {loadingFeatured
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Skeleton variant="rectangular" height={180} />
                        <CardContent>
                          <Skeleton variant="text" width="70%" height={24} />
                          <Skeleton variant="text" width="50%" height={18} sx={{ mb: 1 }} />
                          <Skeleton variant="text" width="40%" height={18} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                : featured.length > 0
                  ? featured.map((prop) => (
                      <Grid key={prop._id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Card
                          component={Link}
                          href={`/browse/${prop._id}`}
                          variant="outlined"
                          sx={{
                            borderRadius: 3, overflow: 'hidden', textDecoration: 'none', display: 'block',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', borderColor: 'primary.main' },
                          }}
                        >
                          {prop.images?.[0] ? (
                            <CardMedia component="img" height={180} image={prop.images[0]} alt={prop.title} sx={{ objectFit: 'cover' }} />
                          ) : (
                            <Box
                              sx={{
                                height: 180,
                                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              <ApartmentRoundedIcon sx={{ fontSize: 56, color: '#90caf9' }} />
                            </Box>
                          )}
                          <CardContent>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }} noWrap>
                              {prop.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 1.5 }}>
                              <LocationOnRoundedIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption">{prop.city}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                              <Typography sx={{ fontWeight: 800, color: '#1976d2', fontSize: '1rem' }}>
                                R {prop.price?.toLocaleString()}/mo
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {prop.fundingType === 'nsfas' && (
                                  <Chip label="NSFAS" size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
                                )}
                                {prop.roomType && (
                                  <Chip label={prop.roomType} size="small" sx={{ bgcolor: '#f5f5f5', fontWeight: 600, fontSize: '0.65rem', height: 20, textTransform: 'capitalize' }} />
                                )}
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  : (
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                        <ApartmentRoundedIcon sx={{ fontSize: 56, mb: 2, opacity: 0.3 }} />
                        <Typography>No featured listings yet. <Link href="/browse" style={{ color: '#1976d2' }}>Browse all properties</Link></Typography>
                      </Box>
                    </Grid>
                  )
              }
            </Grid>
          </Container>
        </Box>

        {/* ─── WHY COSY ─────────────────────────────────────────── */}
        <Box sx={{ bgcolor: '#f0f4f8', py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
                Our Advantages
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, mb: 2, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                Why Choose Cosy?
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 480, mx: 'auto' }}>
                We make finding student accommodation simple, safe, and stress-free.
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {FEATURES.map((f) => (
                <Grid key={f.title} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3.5, borderRadius: 3, height: '100%', bgcolor: 'white',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                      '&:hover': { boxShadow: '0 8px 24px rgba(25,118,210,0.12)', transform: 'translateY(-2px)' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 56, height: 56, borderRadius: 2, bgcolor: '#e3f2fd',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5,
                      }}
                    >
                      {f.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '1rem' }}>{f.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>{f.desc}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ─── TESTIMONIALS ─────────────────────────────────────── */}
        <Box sx={{ bgcolor: 'white', py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
                Student Stories
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                What Our Students Say
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {TESTIMONIALS.map((t) => (
                <Grid key={t.name} size={{ xs: 12, md: 4 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3.5, borderRadius: 3, height: '100%',
                      transition: 'box-shadow 0.2s',
                      '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
                    }}
                  >
                    <FormatQuoteRoundedIcon sx={{ fontSize: 36, color: '#bbdefb', mb: 1 }} />
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.75, mb: 3, fontStyle: 'italic' }}>
                      "{t.quote}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: t.color, width: 40, height: 40, fontWeight: 700, fontSize: '0.85rem' }}>
                        {t.initials}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t.university}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ─── CTA ──────────────────────────────────────────────── */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
            py: { xs: 8, md: 10 },
            px: 2,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="sm">
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 2, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
              Ready to Find Your Home?
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 5, lineHeight: 1.7 }}>
              Join thousands of students who found their perfect accommodation with Cosy. It's free to register.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link} href="/browse" variant="contained" size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  bgcolor: 'white', color: '#1565c0', fontWeight: 700,
                  textTransform: 'none', px: 4, borderRadius: 2,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                Browse Properties
              </Button>
              <Button
                component={Link} href="/register" variant="outlined" size="large"
                sx={{
                  borderColor: 'rgba(255,255,255,0.6)', color: 'white',
                  fontWeight: 700, textTransform: 'none', px: 4, borderRadius: 2,
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Create Free Account
              </Button>
            </Box>
          </Container>
        </Box>

        {/* ─── FOOTER ───────────────────────────────────────────── */}
        <Box sx={{ bgcolor: '#0a1929', color: 'grey.400', py: 7, px: 2 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box
                    sx={{
                      width: 32, height: 32, borderRadius: 1.5,
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <ApartmentRoundedIcon sx={{ color: 'white', fontSize: 18 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 800, color: 'white', fontSize: 20 }}>Cosy</Typography>
                </Box>
                <Typography variant="body2" sx={{ lineHeight: 1.8, maxWidth: 260 }}>
                  South Africa's leading student accommodation platform. Find verified, affordable housing near your university.
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <Typography sx={{ fontWeight: 700, color: 'white', mb: 2.5, fontSize: '0.9rem' }}>Platform</Typography>
                {[
                  { label: 'Browse Properties', href: '/browse' },
                  { label: 'How It Works', href: '/#how-it-works' },
                  { label: 'About Cosy', href: '/' },
                ].map((l) => (
                  <Typography key={l.label} component={Link} href={l.href} variant="body2"
                    sx={{ display: 'block', mb: 1.5, color: 'grey.400', textDecoration: 'none', '&:hover': { color: 'white' } }}
                  >
                    {l.label}
                  </Typography>
                ))}
              </Grid>
              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <Typography sx={{ fontWeight: 700, color: 'white', mb: 2.5, fontSize: '0.9rem' }}>For Students</Typography>
                {[
                  { label: 'Register', href: '/register' },
                  { label: 'Login', href: '/login' },
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Saved Listings', href: '/saved-listings' },
                ].map((l) => (
                  <Typography key={l.label} component={Link} href={l.href} variant="body2"
                    sx={{ display: 'block', mb: 1.5, color: 'grey.400', textDecoration: 'none', '&:hover': { color: 'white' } }}
                  >
                    {l.label}
                  </Typography>
                ))}
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography sx={{ fontWeight: 700, color: 'white', mb: 2.5, fontSize: '0.9rem' }}>Contact Us</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>📧 support@cosy.co.za</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>📞 +27 21 000 0000</Typography>
                <Typography variant="body2">🕐 Mon – Fri, 8am – 5pm SAST</Typography>
              </Grid>
            </Grid>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="body2">
                © {new Date().getFullYear()} Cosy. All rights reserved.
              </Typography>
              <Typography variant="body2">
                Built for South African students 🇿🇦
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
