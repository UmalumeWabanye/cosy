'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import SearchIcon from '@mui/icons-material/Search';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import XIcon from '@mui/icons-material/X';
import SingleBedRoundedIcon from '@mui/icons-material/SingleBedRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import BathtubRoundedIcon from '@mui/icons-material/BathtubRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import api from '@/services/api';
import SaveButton from '@/components/SaveButton';
import { trackEvent } from '@/utils/analytics';

const theme = createTheme({
  typography: { fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(',') },
  shape: { borderRadius: 12 },
  palette: { primary: { main: '#1976d2', dark: '#1565c0', light: '#42a5f5' } },
});

const CATEGORIES = [
  { label: 'Single Room',   icon: <SingleBedRoundedIcon sx={{ fontSize: 22 }} />,        value: 'Single' },
  { label: 'Sharing',       icon: <PeopleAltRoundedIcon sx={{ fontSize: 22 }} />,         value: 'Sharing' },
  { label: 'Ensuite',       icon: <BathtubRoundedIcon sx={{ fontSize: 22 }} />,           value: 'Ensuite' },
  { label: 'Bachelor Flat', icon: <HomeRoundedIcon sx={{ fontSize: 22 }} />,              value: 'Bachelor' },
  { label: 'NSFAS',         icon: <AccountBalanceRoundedIcon sx={{ fontSize: 22 }} />,   value: 'nsfas' },
  { label: 'Near Campus',   icon: <SchoolRoundedIcon sx={{ fontSize: 22 }} />,            value: '' },
  { label: 'Verified',      icon: <VerifiedOutlinedIcon sx={{ fontSize: 22 }} />,         value: '' },
];

const UNIVERSITIES = [
  'University of Cape Town','Stellenbosch University','University of the Witwatersrand',
  'University of Pretoria','University of KwaZulu-Natal','Rhodes University',
  'University of the Free State','Nelson Mandela University',
  'Cape Peninsula University of Technology','Tshwane University of Technology',
];

const CITIES = ['Cape Town','Johannesburg','Pretoria','Durban','Port Elizabeth','Bloemfontein','Grahamstown'];

const STATS = [
  { value: '12,000+', label: 'Students Placed' },
  { value: '850+',    label: 'Listed Properties' },
  { value: '25+',     label: 'Partner Universities' },
  { value: '10',      label: 'Cities Covered' },
];

const STEPS = [
  { num: '1', title: 'Search',  desc: 'Filter by university, city, room type, and funding to find your perfect match.' },
  { num: '2', title: 'Apply',   desc: 'Submit your application in minutes. We handle landlord communication for you.' },
  { num: '3', title: 'Move In', desc: 'Get approved, confirm your booking, and settle into your new home stress-free.' },
];

const FEATURES = [
  { icon: <SchoolOutlinedIcon sx={{ fontSize: 28, color: '#1976d2' }} />,       title: 'Student-Focused',   desc: 'Verified properties tailored for university students, near campus.' },
  { icon: <VerifiedOutlinedIcon sx={{ fontSize: 28, color: '#1976d2' }} />,      title: 'NSFAS Accredited',  desc: 'Find properties that accept NSFAS funding easily with one filter.' },
  { icon: <SecurityOutlinedIcon sx={{ fontSize: 28, color: '#1976d2' }} />,      title: 'Secure & Verified', desc: 'Every listing is vetted to ensure safe, quality accommodation.' },
  { icon: <SupportAgentOutlinedIcon sx={{ fontSize: 28, color: '#1976d2' }} />,  title: '24/7 Support',      desc: 'Our team is always ready to help you find your perfect home.' },
];

const TESTIMONIALS = [
  { name: 'Amahle Dlamini',    university: 'University of KwaZulu-Natal', quote: 'Cosy made finding my first student apartment so easy. I was approved within a week and the NSFAS process was seamless.', photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format' },
  { name: 'Ruan van der Berg',  university: 'Stellenbosch University',     quote: 'I love that I could filter by NSFAS and find accredited places near campus. Saved me so much stress during registration.', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&auto=format' },
  { name: 'Nokuthula Sibiya',   university: 'University of Pretoria',      quote: 'The application process is straightforward and the support team responded within hours. Highly recommend Cosy!', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format' },
];

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1400&h=700&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1400&h=700&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&h=700&fit=crop&auto=format',
];

interface Property {
  _id: string; propertyName?: string; title?: string; name?: string;
  city: string; price: number; roomType: string;
  fundingType?: string; nsfasAccredited?: boolean;
  images?: Array<string | { url?: string }>;
  universityNearby?: string; university?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [university, setUniversity] = useState('');
  const [roomType, setRoomType] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [featured, setFeatured] = useState<Property[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [heroImg, setHeroImg] = useState(0);

  useEffect(() => {
    trackEvent('landing-page-load', { page: 'homepage' });
    api.get('/properties?limit=8&status=published')
      .then(res => { const d = res.data; setFeatured((Array.isArray(d) ? d : d.properties ?? []).slice(0, 8)); })
      .catch(() => setFeatured([]))
      .finally(() => setLoadingFeatured(false));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setHeroImg(i => (i + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(id);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (university) p.set('university', university);
    if (city) p.set('city', city);
    if (roomType) p.set('roomType', roomType);
    if (activeCategory === 'nsfas') p.set('fundingType', 'nsfas');
    trackEvent('cta-click', { button: 'hero-search', city, university, roomType });
    router.push('/browse?' + p.toString());
  };

  const handleCategoryClick = (cat: typeof CATEGORIES[0]) => {
    const next = activeCategory === cat.value ? '' : cat.value;
    setActiveCategory(next);
    const p = new URLSearchParams();
    if (cat.value === 'nsfas') p.set('fundingType', 'nsfas');
    else if (cat.value) p.set('roomType', cat.value);
    router.push('/browse?' + p.toString());
  };

  const getTitle = (p: Property) => p.propertyName || p.title || p.name || 'Student Accommodation';
  const getCity  = (p: Property) => p.city || '—';
  const getImage = (p: Property, i: number) => {
    const img = p.images?.[0];
    if (typeof img === 'string') return img;
    if (img && typeof img === 'object' && img.url) return img.url;
    const f = ['1522708323590-d24dbb6b0267','1560448204-e02f11c3d0e2','1484154218962-a197022b5858','1512918728675-ed5a585ecca5','1493809842364-78817add7ffb','1555854877-bab0e564b8d5','1502672260266-1c1ef2d93688','1545324418-cc1a3fa10c00'];
    return `https://images.unsplash.com/photo-${f[i % f.length]}?w=600&h=400&fit=crop&auto=format`;
  };
  const isNsfas = (p: Property) => p.fundingType === 'nsfas' || p.nsfasAccredited;

  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
    { '@type': 'Question', name: 'Can I find NSFAS accredited accommodation on Cosy?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Cosy allows you to filter NSFAS-friendly properties near campus.' } },
    { '@type': 'Question', name: 'Can landlords list multiple properties?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Landlords can manage multiple listings, allocations, and communications.' } },
  ]};

  return (
    <ThemeProvider theme={theme}>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ─── HERO ─────────────────────────────────────────── */}
      <Box sx={{ position: 'relative', height: { xs: 480, sm: 540, md: 600 }, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {HERO_IMAGES.map((src, i) => (
          <Box key={src} component="img" src={src} alt="" aria-hidden
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 1.4s ease', opacity: heroImg === i ? 1 : 0, zIndex: 0 }} />
        ))}
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(2,26,56,0.5) 0%, rgba(2,26,56,0.65) 55%, rgba(2,26,56,0.8) 100%)' }} />
        <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', px: 2, width: '100%', maxWidth: 780, mx: 'auto' }}>
          <Typography component="h1" sx={{ fontWeight: 700, fontSize: { xs: '1.9rem', sm: '2.6rem', md: '3.2rem' }, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff', mb: 1.5 }}>
            Find Your Perfect Student Home
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: { xs: 14, md: 16 }, fontWeight: 400, mb: 4, lineHeight: 1.55 }}>
            Verified, NSFAS-accredited accommodation near your university — apply online in minutes.
          </Typography>

          {/* Pill search bar */}
          <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', alignItems: 'stretch', bgcolor: '#fff', borderRadius: '9999px', overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,0.28)', maxWidth: 680, mx: 'auto', height: { xs: 52, md: 58 } }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', px: 2, borderRight: '1px solid #e0e0e0', minWidth: 0 }}>
              <LocationOnRoundedIcon sx={{ fontSize: 17, color: '#1976d2', mr: 0.75, flexShrink: 0 }} />
              <Select value={city} onChange={e => setCity(e.target.value)} displayEmpty variant="standard" disableUnderline
                sx={{ flex: 1, fontSize: 13, fontFamily: 'Inter, sans-serif', color: city ? '#111' : '#9e9e9e', '& .MuiSelect-select': { py: 0, pr: '22px !important' }, minWidth: 0 }}>
                <MenuItem value=""><em style={{ fontStyle: 'normal', color: '#9e9e9e' }}>City</em></MenuItem>
                {CITIES.map(c => <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>{c}</MenuItem>)}
              </Select>
            </Box>
            <Box sx={{ flex: 1.4, display: { xs: 'none', sm: 'flex' }, alignItems: 'center', px: 2, borderRight: '1px solid #e0e0e0', minWidth: 0 }}>
              <SchoolRoundedIcon sx={{ fontSize: 17, color: '#1976d2', mr: 0.75, flexShrink: 0 }} />
              <Select value={university} onChange={e => setUniversity(e.target.value)} displayEmpty variant="standard" disableUnderline
                sx={{ flex: 1, fontSize: 13, fontFamily: 'Inter, sans-serif', color: university ? '#111' : '#9e9e9e', '& .MuiSelect-select': { py: 0, pr: '22px !important' }, minWidth: 0 }}>
                <MenuItem value=""><em style={{ fontStyle: 'normal', color: '#9e9e9e' }}>University</em></MenuItem>
                {UNIVERSITIES.map(u => <MenuItem key={u} value={u} sx={{ fontSize: 13 }}>{u}</MenuItem>)}
              </Select>
            </Box>
            <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center', px: 2, minWidth: 0 }}>
              <MeetingRoomRoundedIcon sx={{ fontSize: 17, color: '#1976d2', mr: 0.75, flexShrink: 0 }} />
              <Select value={roomType} onChange={e => setRoomType(e.target.value)} displayEmpty variant="standard" disableUnderline
                sx={{ flex: 1, fontSize: 13, fontFamily: 'Inter, sans-serif', color: roomType ? '#111' : '#9e9e9e', '& .MuiSelect-select': { py: 0, pr: '22px !important' }, minWidth: 0 }}>
                <MenuItem value=""><em style={{ fontStyle: 'normal', color: '#9e9e9e' }}>Room type</em></MenuItem>
                {['Single','Sharing','Ensuite','Bachelor'].map(r => <MenuItem key={r} value={r} sx={{ fontSize: 13 }}>{r}</MenuItem>)}
              </Select>
            </Box>
            <Box component="button" type="submit"
              onClick={() => trackEvent('cta-click', { button: 'hero-search' })}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer', px: { xs: 2.5, md: 3 }, m: 0, borderRadius: '0 9999px 9999px 0', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, flexShrink: 0, whiteSpace: 'nowrap', transition: 'background 0.15s', '&:hover': { bgcolor: '#1565c0' } }}>
              <SearchIcon sx={{ fontSize: 17 }} />
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Search</Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: 3 }}>
            {['Verified Listings','NSFAS-Friendly','Free to Apply','25+ Universities'].map(l => (
              <Chip key={l} size="small" label={l} sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#fff', border: '1px solid rgba(255,255,255,0.26)', fontSize: 12, fontWeight: 500 }} />
            ))}
          </Box>
        </Box>
      </Box>

      {/* ─── CATEGORY BAR ─────────────────────────────────── */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #eeeeee', position: 'sticky', top: 64, zIndex: 90 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', gap: { xs: 2.5, md: 4 }, overflowX: 'auto', py: 2, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            {CATEGORIES.map(cat => {
              const active = activeCategory === cat.value && cat.value !== '';
              return (
                <Box key={cat.label} onClick={() => handleCategoryClick(cat)}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, cursor: 'pointer', flexShrink: 0, pb: 1, borderBottom: active ? '2px solid #1976d2' : '2px solid transparent', color: active ? '#1976d2' : '#717171', transition: 'color 0.15s, border-color 0.15s', '&:hover': { color: '#222', borderBottomColor: '#bdbdbd' }, minWidth: 58 }}>
                  {cat.icon}
                  <Typography sx={{ fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', lineHeight: 1 }}>{cat.label}</Typography>
                </Box>
              );
            })}
          </Box>
        </Container>
      </Box>

      {/* ─── STATS BAR ────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #eeeeee' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {STATS.map((s, i) => (
              <Box key={s.label} sx={{ px: { xs: 3, md: 6 }, py: { xs: 3, md: 4 }, textAlign: 'center', borderRight: { xs: i % 2 === 0 ? '1px solid #eeeeee' : 'none', md: i < 3 ? '1px solid #eeeeee' : 'none' }, width: { xs: '50%', md: 'auto' }, flex: { md: '1 1 0' } }}>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.4rem', md: '1.8rem' }, color: '#1976d2', lineHeight: 1 }}>{s.value}</Typography>
                <Typography sx={{ color: '#717171', fontSize: 13, mt: 0.5 }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── FEATURED LISTINGS ────────────────────────────── */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 6, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 700, color: '#222222', letterSpacing: '-0.02em' }}>Places to stay</Typography>
              <Typography sx={{ color: '#717171', fontSize: 14, mt: 0.5 }}>Verified student accommodation across South Africa</Typography>
            </Box>
            <Button component={Link} href="/browse?source=homepage-featured" endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => trackEvent('cta-click', { button: 'show-all' })}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: 14, color: '#1976d2', border: '1.5px solid #1976d2', borderRadius: '9999px', px: 2.5, py: 0.75, '&:hover': { bgcolor: '#e3f2fd' } }}>
              Show all
            </Button>
          </Box>

          <Grid container spacing={{ xs: 2, md: 3 }}>
            {loadingFeatured
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Box>
                      <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '14px', mb: 1.5 }} />
                      <Skeleton width="60%" height={16} /><Skeleton width="80%" height={14} /><Skeleton width="40%" height={14} />
                    </Box>
                  </Grid>
                ))
              : featured.length > 0
                ? featured.map((prop, idx) => (
                    <Grid key={prop._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Box component={Link} href={`/browse/${prop._id}?source=homepage-card`}
                        onClick={() => trackEvent('listing-view', { propertyId: prop._id, source: 'homepage-card' })}
                        sx={{ textDecoration: 'none', display: 'block' }}>
                        <Box sx={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', aspectRatio: '20/13', mb: 1.5, bgcolor: '#f5f5f5', '&:hover .card-photo': { transform: 'scale(1.04)' } }}>
                          <Box className="card-photo" component="img" src={getImage(prop, idx)} alt={getTitle(prop)}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} />
                          <Box sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: '50%', boxShadow: '0 1px 6px rgba(0,0,0,0.18)' }}>
                            <SaveButton propertyId={prop._id} size="small" />
                          </Box>
                          {isNsfas(prop) && (
                            <Box sx={{ position: 'absolute', bottom: 10, left: 10, bgcolor: '#1976d2', color: '#fff', fontSize: 11, fontWeight: 700, px: 1.25, py: 0.4, borderRadius: '9999px', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
                              NSFAS
                            </Box>
                          )}
                        </Box>
                        <Box sx={{ px: 0.25 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.25 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#222222', lineHeight: 1.3 }} noWrap>{getTitle(prop)}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0, ml: 1 }}>
                              <StarRoundedIcon sx={{ fontSize: 13, color: '#222' }} />
                              <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#222' }}>New</Typography>
                            </Box>
                          </Box>
                          <Typography sx={{ fontSize: 13, color: '#717171', mb: 0.25 }}>{getCity(prop)} · {prop.roomType || 'Room'}</Typography>
                          <Typography sx={{ fontSize: 14, color: '#222222', fontWeight: 500 }}>
                            <Box component="span" sx={{ fontWeight: 700 }}>R {prop.price?.toLocaleString()}</Box>{' '}/ month
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))
                : (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <ApartmentRoundedIcon sx={{ fontSize: 56, color: '#e0e0e0', mb: 2 }} />
                      <Typography sx={{ color: '#9e9e9e', mb: 2 }}>No listings yet.</Typography>
                      <Button component={Link} href="/browse" variant="contained" sx={{ borderRadius: '9999px', textTransform: 'none', fontWeight: 600 }}>Browse all properties</Button>
                    </Box>
                  </Grid>
                )
            }
          </Grid>
        </Container>
      </Box>

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <Box sx={{ bgcolor: '#f8f9fa', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 700, color: '#222222', letterSpacing: '-0.02em' }}>How Cosy works</Typography>
            <Typography sx={{ color: '#717171', mt: 1, fontSize: 15 }}>From search to move-in — simple, fast, stress-free.</Typography>
          </Box>
          <Grid container spacing={4}>
            {STEPS.map(step => (
              <Grid key={step.num} size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'row', md: 'column' }, alignItems: { xs: 'flex-start', md: 'center' }, textAlign: { xs: 'left', md: 'center' } }}>
                  <Box sx={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 18px rgba(25,118,210,0.3)' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 20, color: '#fff', lineHeight: 1 }}>{step.num}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#222', mb: 0.75 }}>{step.title}</Typography>
                    <Typography sx={{ color: '#717171', fontSize: 14, lineHeight: 1.65 }}>{step.desc}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── JOURNEY CARDS ────────────────────────────────── */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 700, color: '#222222', letterSpacing: '-0.02em', mb: 6, textAlign: 'center' }}>Built for every housing journey</Typography>
          <Grid container spacing={3}>
            {[
              { title: 'For Students',   href: '/for-students',  bg: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=340&fit=crop&auto=format', desc: 'Find accommodation faster with personalised search, NSFAS filters, and direct applications.', cta: 'Start student journey' },
              { title: 'For Landlords',  href: '/for-landlords', bg: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=340&fit=crop&auto=format', desc: 'List rooms, manage allocations, and communicate with verified tenants in one platform.',   cta: 'List your property' },
              { title: 'NSFAS Students', href: '/nsfas',         bg: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=340&fit=crop&auto=format', desc: 'Browse accredited options, apply with your NSFAS reference, and secure your spot.',         cta: 'Explore NSFAS options' },
            ].map(card => (
              <Grid key={card.title} size={{ xs: 12, md: 4 }}>
                <Box component={Link} href={card.href} sx={{ textDecoration: 'none', display: 'block', borderRadius: '16px', overflow: 'hidden', position: 'relative', aspectRatio: '4/3', '&:hover .jimg': { transform: 'scale(1.04)' } }}>
                  <Box className="jimg" component="img" src={card.bg} alt={card.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} />
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(2,26,56,0.88) 0%, rgba(2,26,56,0.25) 60%, transparent 100%)' }} />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, p: 2.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 17, color: '#fff', mb: 0.5 }}>{card.title}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, lineHeight: 1.5, mb: 1.5 }}>{card.desc}</Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#fff', fontSize: 13, fontWeight: 600 }}>
                      {card.cta} <ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── WHY COSY ─────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#f8f9fa', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 700, color: '#222222', letterSpacing: '-0.02em', mb: 1 }}>Why students love Cosy</Typography>
            <Typography sx={{ color: '#717171', fontSize: 15 }}>Safe, simple, and built specifically for South African students.</Typography>
          </Box>
          <Grid container spacing={3}>
            {FEATURES.map(f => (
              <Grid key={f.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ p: 3, borderRadius: '16px', border: '1px solid #eeeeee', bgcolor: '#fff', height: '100%', transition: 'box-shadow 0.2s, transform 0.2s', '&:hover': { boxShadow: '0 6px 24px rgba(25,118,210,0.1)', transform: 'translateY(-2px)' } }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>{f.icon}</Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#222', mb: 0.75 }}>{f.title}</Typography>
                  <Typography sx={{ color: '#717171', fontSize: 13, lineHeight: 1.65 }}>{f.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── TESTIMONIALS ─────────────────────────────────── */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 700, color: '#222222', letterSpacing: '-0.02em', mb: 6, textAlign: 'center' }}>What students say</Typography>
          <Grid container spacing={3}>
            {TESTIMONIALS.map(t => (
              <Grid key={t.name} size={{ xs: 12, md: 4 }}>
                <Box sx={{ p: 3, borderRadius: '16px', border: '1px solid #eeeeee', height: '100%', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.07)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Avatar src={t.photo} alt={t.name} sx={{ width: 44, height: 44 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#222' }}>{t.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: '#9e9e9e' }}>{t.university}</Typography>
                    </Box>
                    <Box sx={{ ml: 'auto', display: 'flex' }}>
                      {[1,2,3,4,5].map(s => <StarRoundedIcon key={s} sx={{ fontSize: 13, color: '#1976d2' }} />)}
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 14, color: '#717171', lineHeight: 1.7, fontStyle: 'italic' }}>&ldquo;{t.quote}&rdquo;</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <Box sx={{ background: 'linear-gradient(135deg, #021a38 0%, #0c3f73 50%, #1565c0 100%)', py: { xs: 8, md: 12 }, px: 2, textAlign: 'center', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% -10%, rgba(147,214,255,0.22), transparent 50%)' } }}>
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontWeight: 700, color: '#fff', mb: 1.5, fontSize: { xs: '1.7rem', md: '2.1rem' }, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Ready to find your home?</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 5, fontSize: 15, lineHeight: 1.65 }}>
            Join thousands of students who found their perfect accommodation with Cosy. Free to register.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button component={Link} href="/browse?source=homepage-cta" variant="contained"
              onClick={() => trackEvent('cta-click', { button: 'browse', location: 'cta' })}
              sx={{ bgcolor: '#fff', color: '#1565c0', fontWeight: 700, textTransform: 'none', px: 3.5, borderRadius: '9999px', fontSize: 15, boxShadow: '0 4px 14px rgba(0,0,0,0.2)', '&:hover': { bgcolor: '#f5f5f5' } }}>
              Browse properties
            </Button>
            <Button component={Link} href="/register?source=homepage-cta"
              onClick={() => trackEvent('cta-click', { button: 'register', location: 'cta' })}
              sx={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff', border: '1.5px solid', fontWeight: 700, textTransform: 'none', px: 3.5, borderRadius: '9999px', fontSize: 15, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
              Create free account
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ─── FOOTER ───────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#0a1929', color: '#8b9ab0', pt: { xs: 8, md: 10 }, pb: 0, px: 2 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ApartmentRoundedIcon sx={{ color: '#fff', fontSize: 17 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: 20, letterSpacing: '-0.02em' }}>Cosy</Typography>
              </Box>
              <Typography variant="body2" sx={{ maxWidth: 280, lineHeight: 1.85, mb: 3, fontSize: 13 }}>
                South Africa&apos;s leading student accommodation platform — connecting students with verified, affordable housing near their universities.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[
                  { icon: <FacebookRoundedIcon fontSize="small" />, label: 'Facebook', href: 'https://facebook.com' },
                  { icon: <InstagramIcon fontSize="small" />, label: 'Instagram', href: 'https://instagram.com' },
                  { icon: <XIcon fontSize="small" />, label: 'X', href: 'https://x.com' },
                  { icon: <LinkedInIcon fontSize="small" />, label: 'LinkedIn', href: 'https://linkedin.com' },
                ].map(s => (
                  <Box key={s.label} component="a" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    sx={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b9ab0', textDecoration: 'none', transition: 'border-color 0.2s, color 0.2s, background 0.2s', '&:hover': { color: '#fff', borderColor: '#1976d2', bgcolor: 'rgba(25,118,210,0.15)' } }}>
                    {s.icon}
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={4}>
                {[
                  { heading: 'Cosy', links: [{ label: 'Browse Properties', href: '/browse' }, { label: 'About Us', href: '/about' }, { label: 'For Landlords', href: '/for-landlords' }, { label: 'For Students', href: '/for-students' }, { label: 'NSFAS Hub', href: '/nsfas' }] },
                  { heading: 'Support', links: [{ label: 'Help Center', href: '/' }, { label: 'Safety', href: '/' }, { label: 'Privacy', href: '/' }, { label: 'Terms', href: '/' }, { label: 'Contact Us', href: '/about' }] },
                  { heading: 'Students', links: [{ label: 'Login', href: '/login' }, { label: 'Register', href: '/register' }, { label: 'My Applications', href: '/applications' }, { label: 'Saved Listings', href: '/saved-listings' }] },
                ].map(col => (
                  <Grid key={col.heading} size={{ xs: 6, sm: 4 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 13, mb: 2 }}>{col.heading}</Typography>
                    {col.links.map(l => (
                      <Typography key={l.label} component={Link} href={l.href} variant="body2" sx={{ display: 'block', mb: 1.5, color: '#8b9ab0', textDecoration: 'none', fontSize: 13, '&:hover': { color: '#fff' } }}>{l.label}</Typography>
                    ))}
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', py: 3, mt: 6, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ fontSize: 13 }}>© {new Date().getFullYear()} Cosy. All rights reserved.</Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {['Privacy','Terms','Sitemap'].map(l => (
                <Typography key={l} component={Link} href="/" variant="body2" sx={{ fontSize: 13, color: '#8b9ab0', textDecoration: 'none', '&:hover': { color: '#fff' } }}>{l}</Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
