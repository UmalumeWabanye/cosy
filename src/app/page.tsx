'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
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
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import SearchIcon from '@mui/icons-material/Search';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import XIcon from '@mui/icons-material/X';
import api from '@/services/api';
import SaveButton from '@/components/SaveButton';
import { trackEvent } from '@/utils/analytics';

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
    icon: <SchoolOutlinedIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
    title: 'Student-Focused',
    desc: 'Properties verified and tailored specifically for university students near campus.',
  },
  {
    icon: <VerifiedOutlinedIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
    title: 'NSFAS Accredited',
    desc: 'Easily find properties that accept NSFAS funding to make accommodation accessible.',
  },
  {
    icon: <SecurityOutlinedIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
    title: 'Secure & Verified',
    desc: 'All listings are verified to ensure you find safe, quality accommodation.',
  },
  {
    icon: <SupportAgentOutlinedIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
    title: '24/7 Support',
    desc: 'Our team is always available to help you find your perfect student home.',
  },
];

const TRUST_PILLS = [
  'Verified Listings',
  'NSFAS-Friendly Options',
  'Secure Student-Landlord Chat',
  'Fast Application Reviews',
];

const JOURNEY_LINKS = [
  {
    title: 'For Students',
    href: '/for-students',
    description: 'Find accommodation faster with personalized search, filters, and support.',
    cta: 'Start Student Journey',
  },
  {
    title: 'For Landlords',
    href: '/for-landlords',
    description: 'List rooms, manage allocations, and communicate with tenants in one platform.',
    cta: 'Start Listing Rooms',
  },
  {
    title: 'For NSFAS Students',
    href: '/nsfas',
    description: 'Browse accredited options and focus on affordable, funding-aligned properties.',
    cta: 'Explore NSFAS Options',
  },
];

const TESTIMONIALS = [
  {
    name: 'Amahle Dlamini',
    university: 'University of KwaZulu-Natal',
    quote: 'Cosy made finding my first student apartment so easy. I was approved within a week and the NSFAS process was seamless.',
    initials: 'AD',
    color: '#1976d2',
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format',
  },
  {
    name: 'Ruan van der Berg',
    university: 'Stellenbosch University',
    quote: 'I love that I could filter by NSFAS and find accredited places near campus. Saved me so much stress during registration.',
    initials: 'RB',
    color: '#0288d1',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&auto=format',
  },
  {
    name: 'Nokuthula Sibiya',
    university: 'University of Pretoria',
    quote: 'The application process is straightforward and the support team responded within hours. Highly recommend Cosy!',
    initials: 'NS',
    color: '#0097a7',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format',
  },
];

interface Property {
  _id: string;
  propertyName?: string;
  title?: string;
  name?: string;
  city: string;
  price: number;
  roomType: string;
  fundingType?: string;
  nsfasAccredited?: boolean;
  images?: Array<string | { url?: string }>;
  universityNearby?: string;
  university?: string;
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
    trackEvent('landing-page-load', { page: 'homepage' });
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
    params.set('source', 'homepage-search');
    trackEvent('cta-click', {
      button: 'search-properties',
      location: 'hero-search',
      university: university || 'any',
      city: city || 'any',
      fundingType: fundingType || 'any',
      roomType: roomType || 'any',
    });
    router.push(`/browse?${params.toString()}`);
  };

  const getPropertyTitle = (property: Property) => property.propertyName || property.title || property.name || 'Student Accommodation';
  const getPropertyCity = (property: Property) => property.city || '—';
  const getPropertyImage = (property: Property, index: number) => {
    const image = property.images?.[0];
    if (typeof image === 'string') return image;
    if (image && typeof image === 'object' && image.url) return image.url;
    return `https://images.unsplash.com/photo-${['1522708323590-d24dbb6b0267','1560448204-e02f11c3d0e2','1484154218962-a197022b5858','1512918728675-ed5a585ecca5','1493809842364-78817add7ffb','1555854877-bab0e564b8d5'][index % 6]}?w=600&h=360&fit=crop&auto=format`;
  };
  const isNsfasProperty = (property: Property) => property.fundingType === 'nsfas' || property.nsfasAccredited;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I find NSFAS accredited accommodation on Cosy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Cosy allows you to filter and discover NSFAS-friendly student accommodation options near campus.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can landlords list multiple properties?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Landlords can list and manage multiple properties, room allocations, and student communications.',
        },
      },
    ],
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className="cinema-reveal" sx={{ bgcolor: 'transparent', minHeight: '100vh' }}>
        <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

        {/* ─── HERO ─────────────────────────────────────────────── */}
        <Box
          sx={{
            background: 'linear-gradient(130deg, #021a38 0%, #0c3f73 36%, #0f62a6 70%, #1971c2 100%)',
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
                'radial-gradient(circle at 18% 42%, rgba(173, 224, 255, 0.24) 0%, transparent 40%), radial-gradient(circle at 82% 18%, rgba(255, 255, 255, 0.14) 0%, transparent 38%)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: '-35% -10% 25% -10%',
              background: 'conic-gradient(from 180deg at 50% 50%, rgba(255,255,255,0.07), transparent 40%, rgba(255,255,255,0.08), transparent 75%)',
              animation: 'skyPulse 14s ease-in-out infinite',
            },
          }}
        >
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={6} sx={{ alignItems: 'center' }}>
              {/* Left: headline + search */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Chip
                  label="South Africa's Student Accommodation Platform"
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
                    fontWeight: 700,
                    color: 'white',
                    mb: 2,
                    fontSize: { xs: '2.2rem', sm: '3rem', md: '3.8rem' },
                    lineHeight: 1.1,
                    letterSpacing: '0.01em',
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

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3.5 }}>
                  {TRUST_PILLS.map((pill) => (
                    <Chip
                      key={pill}
                      size="small"
                      label={pill}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.14)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.25)',
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
                  <Button
                    component={Link}
                    href="/browse?source=homepage-hero"
                    variant="contained"
                    onClick={() => trackEvent('cta-click', { button: 'find-accommodation', location: 'hero' })}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: 'white', color: '#11508b', '&:hover': { bgcolor: '#f5f9ff' } }}
                  >
                    Find Accommodation
                  </Button>
                  <Button
                    component={Link}
                    href="/for-landlords"
                    onClick={() => trackEvent('cta-click', { button: 'list-property', location: 'hero' })}
                    variant="outlined"
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, color: 'white', borderColor: 'rgba(255,255,255,0.6)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' } }}
                  >
                    List My Property
                  </Button>
                </Box>

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
                        <MenuItem value="Single">Single</MenuItem>
                        <MenuItem value="Sharing">Sharing</MenuItem>
                        <MenuItem value="Ensuite">Ensuite</MenuItem>
                        <MenuItem value="Bachelor">Bachelor</MenuItem>
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
                    <Box
                      component="img"
                      src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=120&fit=crop&auto=format"
                      alt="Student accommodation"
                      sx={{ width: '100%', height: 120, objectFit: 'cover', display: 'block', borderRadius: 2, opacity: 0.6, mb: 2 }}
                    />
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
                      component="img"
                      src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=580&h=300&fit=crop&auto=format"
                      alt="Modern student apartment"
                      sx={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }}
                    />
                    <Box sx={{ p: 2.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>Modern Student Flat</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>Cape Town · Near UCT</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.1rem' }}>R 4,200/mo</Typography>
                        <Chip label="NSFAS" size="small" sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600, fontSize: '0.7rem' }} />
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

        {/* ─── JOURNEY SPLIT ───────────────────────────────────── */}
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
              Choose Your Path
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, fontSize: { xs: '1.7rem', md: '2.1rem' } }}>
              Built For Every Housing Journey
            </Typography>
          </Box>
          <Grid container spacing={2.5}>
            {JOURNEY_LINKS.map((item) => (
              <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', mb: 1 }}>{item.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.75, mb: 2.5 }}>{item.description}</Typography>
                  <Button
                    component={Link}
                    href={item.href}
                    variant="text"
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{ mt: 'auto', alignSelf: 'flex-start', textTransform: 'none', fontWeight: 700 }}
                  >
                    {item.cta}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>

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

          {/* Desktop: single row with circles + connectors, then text below */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {/* Circle + connector row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, px: 6 }}>
              {STEPS.map((step, i) => (
                <Box key={step.num} sx={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                  <Box
                    sx={{
                      width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 8px 28px rgba(25,118,210,0.35)',
                      position: 'relative', zIndex: 1,
                    }}
                  >
                    {step.icon}
                  </Box>
                  {i < 2 && (
                    <Box sx={{
                      flexGrow: 1, height: 2, mx: 2,
                      background: 'repeating-linear-gradient(90deg, #1976d2 0, #1976d2 8px, transparent 8px, transparent 16px)',
                    }} />
                  )}
                </Box>
              ))}
            </Box>
            {/* Text row — aligned under each circle */}
            <Grid container>
              {STEPS.map((step) => (
                <Grid key={step.num} size={{ md: 4 }}>
                  <Box sx={{ textAlign: 'center', px: 3 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#1976d2', letterSpacing: 3, mb: 1, textTransform: 'uppercase' }}>
                      Step {step.num}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{step.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.75 }}>{step.desc}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Mobile: vertical stack */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 5 }}>
            {STEPS.map((step, i) => (
              <Box key={step.num} sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                <Box>
                  <Box
                    sx={{
                      width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(25,118,210,0.3)',
                    }}
                  >
                    {step.icon}
                  </Box>
                  {i < 2 && (
                    <Box sx={{ width: 2, height: 32, background: 'linear-gradient(#1976d2, transparent)', mx: 'auto', mt: 1 }} />
                  )}
                </Box>
                <Box sx={{ pt: 0.5 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#1976d2', letterSpacing: 3, mb: 0.5, textTransform: 'uppercase' }}>
                    Step {step.num}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>{step.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.75 }}>{step.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
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
                component={Link} href="/browse?source=homepage-featured"
                variant="outlined" endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => trackEvent('cta-click', { button: 'view-all-featured', location: 'featured-section' })}
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
                      <Grid key={prop._id} size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex' }}>
                        <Card
                          component={Link}
                          href={`/browse/${prop._id}?source=homepage-featured-card`}
                          onClick={() => trackEvent('listing-view', { propertyId: prop._id, source: 'homepage-featured-card' })}
                          variant="outlined"
                          sx={{
                            borderRadius: 3, overflow: 'hidden', textDecoration: 'none', display: 'flex', flexDirection: 'column', width: '100%',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', borderColor: 'primary.main' },
                          }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            {prop.images?.[0] ? (
                              <CardMedia component="img" height={180} image={getPropertyImage(prop, featured.indexOf(prop))} alt={getPropertyTitle(prop)} sx={{ objectFit: 'cover' }} />
                            ) : (
                              <Box
                                component="img"
                                src={getPropertyImage(prop, featured.indexOf(prop))}
                                alt={getPropertyTitle(prop)}
                                sx={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                              />
                            )}
                            <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.92)', borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.18)' }}>
                              <SaveButton propertyId={prop._id} size="small" />
                            </Box>
                          </Box>
                          <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }} noWrap>
                              {getPropertyTitle(prop)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 1, minHeight: 20 }}>
                              <LocationOnRoundedIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption">{getPropertyCity(prop)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mt: 'auto' }}>
                              <Typography sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1rem' }}>
                                R {prop.price?.toLocaleString()}/mo
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {isNsfasProperty(prop) && (
                                  <Chip label="NSFAS" size="small" sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
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
                        <Typography>No featured listings yet. <Link href="/browse" style={{ color: 'var(--mui-palette-primary-main)' }}>Browse all properties</Link></Typography>
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
                      &ldquo;{t.quote}&rdquo;
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={t.photo} alt={t.name} sx={{ bgcolor: t.color, width: 40, height: 40, fontWeight: 700, fontSize: '0.85rem' }}>
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
            background: 'linear-gradient(135deg, #09192b 0%, #10395f 45%, #16517f 100%)',
            py: { xs: 8, md: 10 },
            px: 2,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 80% -10%, rgba(147, 214, 255, 0.24), transparent 50%)',
            },
          }}
        >
          <Container maxWidth="sm">
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 2, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
              Ready to Find Your Home?
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 5, lineHeight: 1.7 }}>
              Join thousands of students who found their perfect accommodation with Cosy. It&apos;s free to register.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link} href="/browse?source=homepage-bottom-cta" variant="contained" size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => trackEvent('cta-click', { button: 'browse-properties', location: 'bottom-cta' })}
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
                component={Link} href="/register?source=homepage-bottom-cta" variant="outlined" size="large"
                onClick={() => trackEvent('cta-click', { button: 'create-free-account', location: 'bottom-cta' })}
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
        <Box sx={{ bgcolor: '#0a1929', color: '#8b9ab0', pt: { xs: 8, md: 10 }, pb: 0, px: 2 }}>
          <Container maxWidth="lg">

            {/* Brand + 3 sections in one row */}
            <Grid container spacing={6} sx={{ mb: 0 }}>

              {/* Brand column */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 36, height: 36, borderRadius: 1.5,
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <ApartmentRoundedIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 900, color: 'white', fontSize: 22, letterSpacing: '-0.02em' }}>Cosy</Typography>
                </Box>
                <Typography variant="body2" sx={{ maxWidth: 280, lineHeight: 1.85, mb: 3 }}>
                  South Africa&apos;s leading student accommodation platform — connecting students with verified, affordable housing near their universities.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[
                    { icon: <FacebookRoundedIcon fontSize="small" />, label: 'Facebook', href: 'https://facebook.com' },
                    { icon: <InstagramIcon fontSize="small" />, label: 'Instagram', href: 'https://instagram.com' },
                    { icon: <XIcon fontSize="small" />, label: 'X / Twitter', href: 'https://x.com' },
                    { icon: <LinkedInIcon fontSize="small" />, label: 'LinkedIn', href: 'https://linkedin.com' },
                  ].map((s) => (
                    <Box
                      key={s.label} component="a" href={s.href}
                      target="_blank" rel="noopener noreferrer" aria-label={s.label}
                      sx={{
                        width: 36, height: 36, borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#8b9ab0', textDecoration: 'none',
                        transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                        '&:hover': { color: 'white', borderColor: '#1976d2', bgcolor: 'rgba(25,118,210,0.15)' },
                      }}
                    >
                      {s.icon}
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* ── 3 link sections ──────────────────────────────── */}
              <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={4} sx={{ mb: 0 }}>

              {/* Column 1: Get Cosy (link) + sub-links */}
              <Grid size={{ xs: 12, sm: 4 }}>
                {[
                  { label: 'Get Cosy', href: '/browse', primary: true },
                  { label: 'About Us', href: '/about' },
                  { label: 'Landlord Resources', href: '/for-landlords' },
                  { label: 'Student Hub', href: '/for-students' },
                  { label: 'NSFAS Hub', href: '/nsfas' },
                  { label: 'Safety on Cosy', href: '/' },
                ].map((l) => (
                  <Typography key={l.label} component={Link} href={l.href} variant="body2"
                    sx={{
                      display: 'block', mb: 1.75, textDecoration: 'none', transition: 'color 0.15s',
                      color: l.primary ? 'white' : '#8b9ab0',
                      fontWeight: l.primary ? 700 : 400,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    {l.label}
                  </Typography>
                ))}
              </Grid>

              {/* Column 2: Create a Listing (link) + sub-links */}
              <Grid size={{ xs: 12, sm: 4 }}>
                {[
                  { label: 'Create a Listing', href: '/register?role=landlord', primary: true },
                  { label: 'Pricing', href: '/' },
                  { label: 'FAQs', href: '/' },
                ].map((l) => (
                  <Typography key={l.label} component={Link} href={l.href} variant="body2"
                    sx={{
                      display: 'block', mb: 1.75, textDecoration: 'none', transition: 'color 0.15s',
                      color: l.primary ? 'white' : '#8b9ab0',
                      fontWeight: l.primary ? 700 : 400,
                      '&:hover': { color: 'white' },
                    }}
                  >
                    {l.label}
                  </Typography>
                ))}
              </Grid>

              {/* Column 3: Contact details (no heading) */}
              <Grid size={{ xs: 12, sm: 4 }}>
                {[
                  { icon: <EmailRoundedIcon sx={{ fontSize: 16, flexShrink: 0 }} />, text: 'support@cosy.co.za' },
                  { icon: <PhoneRoundedIcon sx={{ fontSize: 16, flexShrink: 0 }} />, text: '+27 21 000 0000' },
                  { icon: <LocationOnRoundedIcon sx={{ fontSize: 16, flexShrink: 0 }} />, text: 'Cape Town, South Africa' },
                ].map((c) => (
                  <Box key={c.text} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.75 }}>
                    <Box sx={{ color: '#1976d2' }}>{c.icon}</Box>
                    <Typography variant="body2">{c.text}</Typography>
                  </Box>
                ))}
              </Grid>

            </Grid>
              </Grid>
            </Grid>

            {/* Bottom bar */}
            <Box
              sx={{
                borderTop: '1px solid rgba(255,255,255,0.07)',
                mt: 6, py: 3,
                display: 'flex', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 2, alignItems: 'center',
              }}
            >
              <Typography variant="caption" sx={{ color: '#4a5568' }}>
                © {new Date().getFullYear()} Cosy (Pty) Ltd. All rights reserved. Built for South African students 
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {['Privacy Policy', 'Terms of Use', 'Cookie Policy', 'Sitemap'].map((l) => (
                  <Typography key={l} component={Link} href="/" variant="caption"
                    sx={{ color: '#4a5568', textDecoration: 'none', '&:hover': { color: '#8b9ab0' }, transition: 'color 0.15s' }}
                  >
                    {l}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
