'use client';

import { useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AddHomeWorkRoundedIcon from '@mui/icons-material/AddHomeWorkRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

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

const FEATURES = [
  {
    icon: <GroupsRoundedIcon sx={{ fontSize: 32, color: '#1976d2' }} />,
    title: 'Reach 12,000+ Students',
    desc: 'Tap into South Africa\'s largest student accommodation network and fill vacancies faster.',
  },
  {
    icon: <VerifiedRoundedIcon sx={{ fontSize: 32, color: '#1976d2' }} />,
    title: 'NSFAS Accreditation Support',
    desc: 'We guide you through the NSFAS accreditation process so you can access government-funded tenants.',
  },
  {
    icon: <BarChartRoundedIcon sx={{ fontSize: 32, color: '#1976d2' }} />,
    title: 'Real-Time Dashboard',
    desc: 'Manage all your listings, track applications, and monitor occupancy from one place.',
  },
  {
    icon: <SecurityRoundedIcon sx={{ fontSize: 32, color: '#1976d2' }} />,
    title: 'Verified Student Tenants',
    desc: 'Students on Cosy are linked to their universities, so you know exactly who\'s applying.',
  },
  {
    icon: <PaymentsRoundedIcon sx={{ fontSize: 32, color: '#1976d2' }} />,
    title: 'Simplified Applications',
    desc: 'Receive, review and approve student applications entirely online — no paperwork.',
  },
  {
    icon: <SupportAgentRoundedIcon sx={{ fontSize: 32, color: '#1976d2' }} />,
    title: 'Dedicated Support',
    desc: 'Our landlord support team is available to help you list, optimise and grow your portfolio.',
  },
];

const STEPS = [
  {
    num: '01',
    icon: <AddHomeWorkRoundedIcon sx={{ fontSize: 28, color: 'white' }} />,
    title: 'Create your account',
    desc: 'Sign up as a landlord in under 2 minutes. No setup fees, no contracts.',
  },
  {
    num: '02',
    icon: <ApartmentRoundedIcon sx={{ fontSize: 28, color: 'white' }} />,
    title: 'List your property',
    desc: 'Add photos, set your price, select your room types and specify NSFAS accreditation.',
  },
  {
    num: '03',
    icon: <CampaignRoundedIcon sx={{ fontSize: 28, color: 'white' }} />,
    title: 'Get discovered',
    desc: 'Your listing goes live and reaches thousands of students searching near your university.',
  },
  {
    num: '04',
    icon: <MonetizationOnRoundedIcon sx={{ fontSize: 28, color: 'white' }} />,
    title: 'Approve & earn',
    desc: 'Review student applications, approve tenants, and secure consistent rental income.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sipho Mkhize',
    title: 'Property owner · Durban',
    quote: 'Within a week of listing on Cosy my 8-room property near UKZN was fully booked for the year. The NSFAS process was seamless.',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format',
    initials: 'SM',
  },
  {
    name: 'Fatima Adams',
    title: 'Student accommodation investor · Cape Town',
    quote: 'The dashboard makes it so easy to manage multiple properties. I can see applications, approve tenants and track occupancy all in one place.',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&auto=format',
    initials: 'FA',
  },
  {
    name: 'Johan Steyn',
    title: 'Landlord · Stellenbosch',
    quote: 'Cosy connects me with serious, university-verified students. I\'ve had zero problematic tenants since joining the platform.',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&auto=format',
    initials: 'JS',
  },
];

const STATS = [
  { value: '12,000+', label: 'Active Students' },
  { value: '25+', label: 'Universities' },
  { value: '850+', label: 'Listed Properties' },
  { value: '95%', label: 'Occupancy Rate' },
];

const FAQS = [
  {
    q: 'Is it free to list my property?',
    a: 'Listing your property on Cosy is completely free. We only charge a small success fee once a tenant is successfully placed.',
  },
  {
    q: 'Does my property need to be NSFAS accredited?',
    a: 'No. You can list any student accommodation. NSFAS accreditation is optional but unlocks a much larger pool of government-funded students.',
  },
  {
    q: 'How do I receive applications?',
    a: 'All applications arrive in your landlord dashboard. You\'ll get an email notification and can review, approve or decline with one click.',
  },
  {
    q: 'Can I manage multiple properties?',
    a: 'Yes. Your landlord account supports unlimited property listings, each with its own analytics, applications and occupancy tracking.',
  },
  {
    q: 'What happens after I sign up?',
    a: 'After registering you\'ll land in your landlord dashboard where you can immediately add your first property listing.',
  },
];

export default function LandlordPage() {
  const [rooms, setRooms] = useState(8);
  const [pricePerRoom, setPricePerRoom] = useState(4200);
  const [occupancy, setOccupancy] = useState(90);
  const [leasePackage, setLeasePackage] = useState<'monthly' | 'semester' | 'annual'>('annual');

  const leaseMultiplier = leasePackage === 'annual' ? 1.12 : leasePackage === 'semester' ? 1.05 : 1.0;
  const monthlyIncome = Math.round(rooms * pricePerRoom * (occupancy / 100) * leaseMultiplier);
  const annualIncome = monthlyIncome * 12;
  const nsfasEstimate = Math.round(rooms * 4500 * (occupancy / 100));

  return (
    <ThemeProvider theme={theme}>
      <Box className="cinema-reveal cinema-public-page" sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>

        {/* ─── LANDLORD NAVBAR ───────────────────────────────────── */}
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            borderBottom: '1px solid',
            borderColor: 'rgba(25,118,210,0.2)',
            bgcolor: 'rgba(247, 252, 255, 0.85)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.4, px: 2 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ApartmentRoundedIcon sx={{ color: '#fff', fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, color: '#16324a', letterSpacing: '-0.01em' }}>Cosy Landlords</Typography>
              </Box>
            </Link>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button component={Link} href="/" sx={{ textTransform: 'none', fontWeight: 600, color: '#1565c0', display: { xs: 'none', sm: 'inline-flex' } }}>
                For Tenants
              </Button>
              <Button component={Link} href="/about" sx={{ textTransform: 'none', fontWeight: 600, color: '#1565c0', display: { xs: 'none', md: 'inline-flex' } }}>
                About
              </Button>
              <Button component={Link} href="/login" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}>
                Login
              </Button>
              <Button component={Link} href="/register?role=landlord" variant="contained" sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
                List Property
              </Button>
            </Box>
          </Container>
        </Box>

        {/* ─── HERO ─────────────────────────────────────────────── */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 40%, #1976d2 70%, #42a5f5 100%)',
            pt: { xs: 10, md: 16 },
            pb: { xs: 8, md: 12 },
            px: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute', inset: 0,
              backgroundImage:
                'radial-gradient(circle at 15% 50%, rgba(255,255,255,0.07) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(255,255,255,0.09) 0%, transparent 45%)',
            },
          }}
        >
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <Chip
              label="🏠 For Property Owners & Landlords"
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 600,
                mb: 3, fontSize: '0.75rem', backdropFilter: 'blur(8px)',
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900, color: 'white', mb: 3,
                fontSize: { xs: '2.4rem', sm: '3.2rem', md: '4rem' },
                lineHeight: 1.1, letterSpacing: '-0.02em',
              }}
            >
              List Your Property.
              <Box component="span" sx={{ display: 'block', color: '#bbdefb' }}>
                Fill Every Room.
              </Box>
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: 'rgba(255,255,255,0.82)', mb: 6, fontWeight: 400, maxWidth: 580, mx: 'auto', lineHeight: 1.7 }}
            >
              Join South Africa's leading student accommodation platform and connect with thousands of verified students searching near your property.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href="/register?role=landlord"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  bgcolor: 'white', color: '#1565c0', fontWeight: 700,
                  px: 4, py: 1.6, borderRadius: 2, fontSize: '1rem',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
                  '&:hover': { bgcolor: '#f0f7ff' },
                }}
              >
                Get Started — It's Free
              </Button>
              <Button
                component={Link}
                href="#how-it-works"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(255,255,255,0.6)', color: 'white',
                  fontWeight: 600, px: 4, py: 1.6, borderRadius: 2, fontSize: '1rem',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                See How It Works
              </Button>
            </Box>
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
                      py: { xs: 3, md: 4 }, px: 2, textAlign: 'center',
                      borderRight: i < 3 ? '1px solid' : 'none', borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.6rem', md: '2rem' }, color: '#1976d2', lineHeight: 1 }}>
                      {s.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{s.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ─── FEATURES ─────────────────────────────────────────── */}
        <Box sx={{ py: { xs: 8, md: 12 }, px: 2 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
                Why Cosy for Landlords
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, mb: 2, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                Everything you need to manage student lets
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
                From listing to lease — Cosy gives landlords the tools to find great tenants and keep rooms full.
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {FEATURES.map((f) => (
                <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3.5, borderRadius: 3, height: '100%', bgcolor: 'white',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                      '&:hover': { boxShadow: '0 8px 28px rgba(25,118,210,0.12)', transform: 'translateY(-2px)' },
                    }}
                  >
                    <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
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

        {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
        <Box id="how-it-works" sx={{ bgcolor: 'white', py: { xs: 8, md: 12 }, px: 2 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
                Simple Process
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, mb: 2, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                Start earning in 4 easy steps
              </Typography>
            </Box>
            <Grid container spacing={4}>
              {STEPS.map((step, i) => (
                <Grid key={step.num} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{ textAlign: 'center', position: 'relative' }}>
                    {/* connector line */}
                    {i < 3 && (
                      <Box
                        sx={{
                          display: { xs: 'none', md: 'block' },
                          position: 'absolute', top: 28, left: '60%', width: '80%', height: 2,
                          background: 'repeating-linear-gradient(90deg, #1976d2 0, #1976d2 8px, transparent 8px, transparent 16px)',
                          zIndex: 0,
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        width: 60, height: 60, borderRadius: '50%', mx: 'auto', mb: 3,
                        background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(25,118,210,0.3)',
                        position: 'relative', zIndex: 1,
                      }}
                    >
                      {step.icon}
                    </Box>
                    <Typography
                      sx={{ fontWeight: 900, fontSize: '0.68rem', color: '#1976d2', letterSpacing: 3, mb: 1, textTransform: 'uppercase' }}
                    >
                      Step {step.num}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{step.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.75 }}>{step.desc}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ─── RENTAL INCOME CALCULATOR ─────────────────────────── */}
        <Box sx={{ bgcolor: '#f0f4f8', py: { xs: 6, md: 8 }, px: 2 }}>
          <Container maxWidth="md">
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
              <Chip
                icon={<CalculateRoundedIcon sx={{ fontSize: 16 }} />}
                label="Income Calculator"
                size="small"
                sx={{ bgcolor: 'rgba(25,118,210,0.1)', color: 'primary.main', fontWeight: 600, mb: 2 }}
              />
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                How much can you earn?
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 480, mx: 'auto', lineHeight: 1.7 }}>
                Adjust the sliders to estimate your monthly and annual rental income across our lease packages.
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 3, md: 4 }} sx={{ alignItems: 'stretch' }}>
              {/* Controls */}
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
                <Paper elevation={0} sx={{ width: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3, p: { xs: 2.5, md: 3 } }}>

                  {/* Rooms */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        Rooms
                      </Typography>
                      <Typography sx={{ color: 'primary.main', fontWeight: 800, fontSize: '1.1rem' }}>{rooms}</Typography>
                    </Box>
                    <Slider
                      min={1} max={30} step={1} value={rooms}
                      onChange={(_, v) => setRooms(v as number)}
                      size="small"
                      sx={{ color: 'primary.main' }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>1</Typography>
                      <Typography sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>30</Typography>
                    </Box>
                  </Box>

                  {/* Price per room */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        Price / Room / Month
                      </Typography>
                      <Typography sx={{ color: 'primary.main', fontWeight: 800, fontSize: '1.1rem' }}>
                        R{pricePerRoom.toLocaleString()}
                      </Typography>
                    </Box>
                    <Slider
                      min={2000} max={15000} step={100} value={pricePerRoom}
                      onChange={(_, v) => setPricePerRoom(v as number)}
                      size="small"
                      sx={{ color: 'primary.main' }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>R2,000</Typography>
                      <Typography sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>R15,000</Typography>
                    </Box>
                  </Box>

                  {/* Occupancy */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        Occupancy Rate
                      </Typography>
                      <Typography sx={{ color: 'primary.main', fontWeight: 800, fontSize: '1.1rem' }}>{occupancy}%</Typography>
                    </Box>
                    <Slider
                      min={50} max={100} step={5} value={occupancy}
                      onChange={(_, v) => setOccupancy(v as number)}
                      size="small"
                      sx={{ color: 'primary.main' }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>50%</Typography>
                      <Typography sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>100%</Typography>
                    </Box>
                  </Box>

                  {/* Lease package */}
                  <Box>
                    <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem', letterSpacing: 0.5, textTransform: 'uppercase', mb: 1 }}>
                      Lease Package
                    </Typography>
                    <ToggleButtonGroup
                      exclusive value={leasePackage}
                      onChange={(_, v) => v && setLeasePackage(v)}
                      fullWidth size="small"
                      sx={{
                        gap: 0.75,
                        '& .MuiToggleButton-root': {
                          border: '1px solid', borderColor: 'divider',
                          borderRadius: '8px !important', fontWeight: 600, fontSize: '0.8rem',
                          textTransform: 'none', color: 'text.secondary',
                          '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', borderColor: 'primary.main' },
                        },
                      }}
                    >
                      <ToggleButton value="monthly">Monthly</ToggleButton>
                      <ToggleButton value="semester">Semester +5%</ToggleButton>
                      <ToggleButton value="annual">Annual +12%</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Paper>
              </Grid>

              {/* Results */}
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>

                  {/* Monthly income */}
                  <Paper elevation={0} sx={{ flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 3, p: { xs: 2.5, md: 3 } }}>
                    <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase', mb: 0.5 }}>
                      Monthly Income
                    </Typography>
                    <Typography sx={{ color: 'text.primary', fontWeight: 900, fontSize: { xs: '2rem', md: '2.4rem' }, lineHeight: 1, letterSpacing: -1 }}>
                      R{monthlyIncome.toLocaleString()}
                    </Typography>
                    <Typography sx={{ color: 'text.disabled', fontSize: '0.78rem', mt: 0.5 }}>
                      {rooms} rooms · {occupancy}% occupancy
                    </Typography>
                  </Paper>

                  {/* Annual income */}
                  <Paper elevation={0} sx={{ flex: 1, border: '2px solid', borderColor: 'primary.main', borderRadius: 3, p: { xs: 2.5, md: 3 }, bgcolor: 'rgba(25,118,210,0.04)', position: 'relative' }}>
                    <Chip label="Best value" size="small" sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.68rem', height: 20 }} />
                    <Typography sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase', mb: 0.5 }}>
                      Annual Income
                    </Typography>
                    <Typography sx={{ color: 'text.primary', fontWeight: 900, fontSize: { xs: '2.2rem', md: '2.8rem' }, lineHeight: 1, letterSpacing: -1 }}>
                      R{annualIncome.toLocaleString()}
                    </Typography>
                    <Typography sx={{ color: 'text.disabled', fontSize: '0.78rem', mt: 0.5 }}>
                      {leasePackage === 'annual' ? '+12%' : leasePackage === 'semester' ? '+5%' : 'No'} lease premium applied
                    </Typography>
                  </Paper>

                  {/* NSFAS estimate */}
                  <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: { xs: 2, md: 2.5 }, bgcolor: 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <SchoolRoundedIcon sx={{ color: 'primary.main', fontSize: 16 }} />
                      <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        NSFAS-Accredited Potential
                      </Typography>
                    </Box>
                    <Typography sx={{ color: 'text.primary', fontWeight: 800, fontSize: '1.4rem', lineHeight: 1 }}>
                      ~R{nsfasEstimate.toLocaleString()}<Typography component="span" sx={{ color: 'text.disabled', fontSize: '0.9rem', fontWeight: 400 }}>/mo</Typography>
                    </Typography>
                    <Typography sx={{ color: 'text.disabled', fontSize: '0.75rem', mt: 0.4 }}>
                      At avg R4,500 NSFAS rate. Actual allowances vary.
                    </Typography>
                  </Paper>

                  <Button
                    component={Link} href="/register?role=landlord"
                    variant="contained" size="large" fullWidth
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{
                      py: 1.5, fontWeight: 700, fontSize: '0.95rem', borderRadius: 2,
                      background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                      '&:hover': { background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)' },
                    }}
                  >
                    Start Earning — List for Free
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* ─── HERO IMAGE BAND ──────────────────────────────────── */}
        <Box
          sx={{
            height: { xs: 240, md: 360 },
            backgroundImage: 'url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&h=720&fit=crop&auto=format)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            position: 'relative',
            '&::after': {
              content: '""', position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, rgba(13,71,161,0.75) 0%, rgba(25,118,210,0.45) 100%)',
            },
          }}
        >
          <Container maxWidth="lg" sx={{ height: '100%', display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1, px: 4 }}>
            <Box sx={{ maxWidth: 520 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 2, fontSize: { xs: '1.6rem', md: '2rem' } }}>
                "Finally a platform that understands the student rental market."
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>— Cosy Landlord, Cape Town</Typography>
            </Box>
          </Container>
        </Box>

        {/* ─── TESTIMONIALS ─────────────────────────────────────── */}
        <Box sx={{ bgcolor: '#f0f4f8', py: { xs: 8, md: 12 }, px: 2 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
                Landlord Stories
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                Landlords who list on Cosy
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {TESTIMONIALS.map((t) => (
                <Grid key={t.name} size={{ xs: 12, md: 4 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3.5, borderRadius: 3, height: '100%', bgcolor: 'white',
                      transition: 'box-shadow 0.2s',
                      '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
                    }}
                  >
                    <FormatQuoteRoundedIcon sx={{ fontSize: 36, color: '#bbdefb', mb: 1 }} />
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.75, mb: 3, fontStyle: 'italic' }}>
                      "{t.quote}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        component="img"
                        src={t.photo}
                        alt={t.name}
                        sx={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t.title}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ─── FAQ ──────────────────────────────────────────────── */}
        <Box sx={{ bgcolor: 'white', py: { xs: 8, md: 12 }, px: 2 }}>
          <Container maxWidth="md">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
                FAQ
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                Common questions
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {FAQS.map((faq, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <CheckCircleRoundedIcon sx={{ color: '#1976d2', fontSize: 22, mt: 0.2, flexShrink: 0 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, mb: 0.75 }}>{faq.q}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.75 }}>{faq.a}</Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Container>
        </Box>

        {/* ─── CTA ──────────────────────────────────────────────── */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
            py: { xs: 8, md: 10 }, px: 2, textAlign: 'center',
          }}
        >
          <Container maxWidth="sm">
            <SchoolRoundedIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.4)', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 2, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
              Ready to list your property?
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 5, lineHeight: 1.7 }}>
              Join hundreds of South African landlords already earning consistent income through Cosy. Registration is free.
            </Typography>
            <Button
              component={Link}
              href="/register?role=landlord"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                bgcolor: 'white', color: '#1565c0', fontWeight: 700,
                textTransform: 'none', px: 5, py: 1.7, borderRadius: 2, fontSize: '1rem',
                boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
                '&:hover': { bgcolor: '#f0f7ff' },
              }}
            >
              Create Your Free Landlord Account
            </Button>
            <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'rgba(255,255,255,0.5)' }}>
              No credit card required · Free to list · Cancel anytime
            </Typography>
          </Container>
        </Box>

        {/* ─── LANDLORD FOOTER ───────────────────────────────────── */}
        <Box component="footer" sx={{ bgcolor: '#0f2740', color: '#bfd2e8', py: { xs: 6, md: 7 }, px: 2 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography sx={{ fontWeight: 800, color: '#ffffff', mb: 1 }}>Cosy Landlords</Typography>
                <Typography variant="body2" sx={{ color: '#bfd2e8', maxWidth: 420, lineHeight: 1.75 }}>
                  Built for South African property owners who want quality student tenants, reliable occupancy, and easy portfolio management.
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2.5 }}>
                <Typography sx={{ fontWeight: 700, color: '#ffffff', mb: 1.2 }}>Landlord</Typography>
                <Stack spacing={0.8}>
                  <Link href="/register?role=landlord" style={{ color: '#bfd2e8', textDecoration: 'none' }}>Create Account</Link>
                  <Link href="/login" style={{ color: '#bfd2e8', textDecoration: 'none' }}>Sign In</Link>
                  <Link href="/landlord/dashboard" style={{ color: '#bfd2e8', textDecoration: 'none' }}>Dashboard</Link>
                </Stack>
              </Grid>
              <Grid size={{ xs: 6, md: 2.5 }}>
                <Typography sx={{ fontWeight: 700, color: '#ffffff', mb: 1.2 }}>Company</Typography>
                <Stack spacing={0.8}>
                  <Link href="/about" style={{ color: '#bfd2e8', textDecoration: 'none' }}>About</Link>
                  <Link href="/browse" style={{ color: '#bfd2e8', textDecoration: 'none' }}>Browse Listings</Link>
                  <Link href="/" style={{ color: '#bfd2e8', textDecoration: 'none' }}>Home</Link>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Typography sx={{ fontWeight: 700, color: '#ffffff', mb: 1.2 }}>Contact</Typography>
                <Typography variant="body2" sx={{ color: '#bfd2e8', lineHeight: 1.7 }}>support@cosy.com</Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 3, borderColor: 'rgba(191,210,232,0.24)' }} />
            <Typography variant="caption" sx={{ color: '#9fb8d2' }}>
              © {new Date().getFullYear()} Cosy. All rights reserved.
            </Typography>
          </Container>
        </Box>

      </Box>
    </ThemeProvider>
  );
}
