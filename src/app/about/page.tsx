'use client';

import React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';

const theme = createTheme({
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
  },
  shape: { borderRadius: 8 },
});

const BLUE = '#1565c0';
const DARK = '#0d1b2a';
const LIGHT_BG = '#f5f8ff';

const STATS = [
  { value: '50 000+', label: 'Students helped' },
  { value: '2 500+', label: 'Verified listings' },
  { value: '25+', label: 'Partner universities' },
  { value: '9', label: 'Provinces covered' },
];

const STUDENT_STEPS = [
  { num: '01', title: 'Search near your campus', body: 'Enter your university and filter by price, room type, or NSFAS eligibility to find listings that match your needs.' },
  { num: '02', title: 'View verified listings', body: 'Browse real photos, honest pricing, and landlord ratings. No hidden fees, no fake listings.' },
  { num: '03', title: 'Apply in minutes', body: 'Send a rental request directly to the landlord. Track your application status in your student dashboard.' },
  { num: '04', title: 'Move in with confidence', body: "All landlords on Cosy are identity-verified. You see exactly what you're getting before you sign anything." },
];

const LANDLORD_STEPS = [
  { num: '01', title: 'Create your profile', body: 'Sign up as a landlord, complete our quick identity verification, and set up your account in under 10 minutes.' },
  { num: '02', title: 'List your property', body: 'Add photos, set your price, specify room types and available dates. Your listing goes live immediately.' },
  { num: '03', title: 'Receive applications', body: 'Students apply directly through Cosy. Review applicants, check their funding type, and accept with one click.' },
  { num: '04', title: 'Manage everything in one place', body: 'Your landlord dashboard gives you full visibility — active listings, pending applications, and tenant history.' },
];

const TEAM = [
  { name: 'Lerato Dlamini', role: 'Co-founder & CEO', bio: 'Spent her first year at UCT in an unsafe, overpriced room she found on Facebook. That experience became Cosy.', initials: 'LD' },
  { name: 'Sipho Ndlovu', role: 'Co-founder & CTO', bio: 'Full-stack engineer who built the first version of Cosy in a UCT residence during exam season.', initials: 'SN' },
  { name: 'Ayanda Mokoena', role: 'Head of Growth', bio: 'Previously led partnerships at a Cape Town edtech. Now she connects Cosy to universities across South Africa.', initials: 'AM' },
];

const PRESS = [
  { outlet: 'BusinessTech', quote: '"The Airbnb of student accommodation is here — and it\'s South African."' },
  { outlet: 'Daily Maverick', quote: '"Cosy is tackling the student housing crisis in a way no one else has."' },
  { outlet: 'Disrupt Africa', quote: '"A platform that could reshape how South African students find a home."' },
];

const VALUES = [
  { icon: <VerifiedRoundedIcon sx={{ fontSize: 26, color: BLUE }} />, title: 'Every landlord is verified', body: 'We check ID documents and property ownership before any landlord can list on Cosy. No catfishing. No fake addresses.' },
  { icon: <LockRoundedIcon sx={{ fontSize: 26, color: BLUE }} />, title: 'Your data stays private', body: 'We never sell your personal information. Your contact details are only shared once you choose to apply.' },
  { icon: <SchoolRoundedIcon sx={{ fontSize: 26, color: BLUE }} />, title: 'Built for NSFAS students', body: 'Filter specifically for NSFAS-approved properties. No more being turned away because of your funding type.' },
  { icon: <SearchRoundedIcon sx={{ fontSize: 26, color: BLUE }} />, title: 'Real listings only', body: "Every listing is reviewed. If it's on Cosy, it's real, available, and accurately priced." },
  { icon: <ApartmentRoundedIcon sx={{ fontSize: 26, color: BLUE }} />, title: 'Map-based search', body: 'See exactly how far each property is from your campus. Filter by walking distance or proximity to key facilities.' },
  { icon: <FavoriteRoundedIcon sx={{ fontSize: 26, color: BLUE }} />, title: 'Free for students', body: 'Searching, saving, and applying on Cosy is completely free for students. Always. No hidden charges, ever.' },
];

export default function AboutPage() {
  return (
    <ThemeProvider theme={theme}>
      <Box className="cinema-public-page cinema-reveal" sx={{ bgcolor: '#fff', overflowX: 'hidden' }}>

        {/* HERO */}
        <Box sx={{
          backgroundImage: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 70%, #42a5f5 100%)',
          color: '#fff',
          py: { xs: 12, md: 18 },
          px: 2,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />
          <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 3, fontSize: 12, mb: 2, display: 'block' }}>
              About Cosy
            </Typography>
            <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '2.4rem', sm: '3.2rem', md: '4rem' }, lineHeight: 1.1, mb: 3 }}>
              {"We're on a mission to end"}<br />
              <Box component="span" sx={{ color: '#90caf9' }}>the student housing crisis</Box>
            </Typography>
            <Typography sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, color: 'rgba(255,255,255,0.82)', maxWidth: 600, mx: 'auto', lineHeight: 1.8 }}>
              {"Cosy is South Africa's dedicated student accommodation platform — a single trusted space where students find verified housing, and landlords fill their properties with quality tenants."}
            </Typography>
          </Container>
        </Box>

        {/* STATS */}
        <Box sx={{ bgcolor: '#0d47a1' }}>
          <Container maxWidth="lg" disableGutters>
            <Grid container>
              {STATS.map((s, i) => (
                <Grid key={s.label} size={{ xs: 6, md: 3 }}>
                  <Box sx={{
                    py: { xs: 4, md: 5.5 }, textAlign: 'center',
                    borderRight: { md: i < 3 ? '1px solid rgba(255,255,255,0.12)' : 'none' },
                    borderBottom: { xs: i < 2 ? '1px solid rgba(255,255,255,0.12)' : 'none', md: 'none' },
                  }}>
                    <Typography sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '3rem' }, color: '#fff', lineHeight: 1 }}>{s.value}</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.5, fontWeight: 500 }}>{s.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ORIGIN STORY */}
        <Box sx={{ py: { xs: 8, md: 14 }, bgcolor: '#fff' }}>
          <Container maxWidth="md">
            <Chip label="Our story" sx={{ bgcolor: '#e3f2fd', color: BLUE, fontWeight: 700, mb: 3, fontSize: 13 }} />
            <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.8rem' }, color: DARK, lineHeight: 1.25, mb: 4 }}>
              It started with a bad lease and a Facebook group
            </Typography>
            <Stack spacing={3}>
              {[
                "In 2022, our co-founder Lerato arrived at the University of Cape Town ready to start her degree. She'd spent months in Facebook groups, on Gumtree, and calling numbers from handwritten flyers on campus — trying to find a safe, affordable place to live. She eventually signed a lease for a room she'd only seen in blurry WhatsApp photos. It was nothing like what was described.",
                "She wasn't alone. Every year, tens of thousands of South African students face the same scramble — navigating a completely unstructured, unsafe, and expensive process to find accommodation near their campuses. There was no trusted platform. No verification. No way to know if what you were renting actually existed.",
                "So Lerato and her co-founder Sipho built one. Cosy launched in 2022 as a simple listing site in Cape Town. Within a year, it had expanded to Johannesburg, Pretoria, and Durban. Today, Cosy operates in all 9 provinces — connecting over 50 000 students with 2 500+ verified landlords across South Africa.",
              ].map((para, i) => (
                <Typography key={i} sx={{ fontSize: '1.05rem', lineHeight: 1.9, color: '#445' }}>
                  {para}
                </Typography>
              ))}
              <Typography sx={{ fontSize: '1.05rem', lineHeight: 1.9, color: '#445' }}>
                Our promise is simple: <strong>every listing on Cosy is real, every landlord is verified, and every student deserves to know exactly what they&apos;re moving into.</strong>
              </Typography>
            </Stack>
          </Container>
        </Box>

        {/* FOR STUDENTS */}
        <Box sx={{ py: { xs: 8, md: 14 }, bgcolor: LIGHT_BG }}>
          <Container maxWidth="lg">
            <Grid container spacing={{ xs: 6, md: 10 }} sx={{ alignItems: 'flex-start' }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{ position: { md: 'sticky' }, top: { md: 100 } }}>
                  <Chip label="For students" sx={{ bgcolor: '#e3f2fd', color: BLUE, fontWeight: 700, mb: 2.5, fontSize: 13 }} />
                  <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.6rem' }, color: DARK, lineHeight: 1.2, mb: 3 }}>
                    Find a home near your campus — safely
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#556', lineHeight: 1.8, mb: 4 }}>
                    Whether you&apos;re funded by NSFAS, a bursary, or paying privately — Cosy has the tools to match you with the right accommodation, right now.
                  </Typography>
                  <Button component={Link} href="/browse" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: BLUE, '&:hover': { bgcolor: '#0d47a1' }, px: 3.5 }}>
                    Browse listings
                  </Button>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={2.5}>
                  {STUDENT_STEPS.map(s => (
                    <Card key={s.num} variant="outlined" sx={{ borderColor: '#e0e9f8', borderRadius: 3, '&:hover': { borderColor: '#90caf9', boxShadow: '0 4px 20px rgba(21,101,192,0.08)' }, transition: '0.2s' }}>
                      <CardContent sx={{ display: 'flex', gap: 2.5, p: 3, '&:last-child': { pb: 3 } }}>
                        <Typography sx={{ fontWeight: 900, fontSize: 28, color: '#c8daf5', lineHeight: 1, flexShrink: 0, width: 40 }}>{s.num}</Typography>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: DARK, mb: 0.5, fontSize: '1rem' }}>{s.title}</Typography>
                          <Typography variant="body2" sx={{ color: '#667', lineHeight: 1.75 }}>{s.body}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* FOR LANDLORDS */}
        <Box sx={{ py: { xs: 8, md: 14 }, bgcolor: '#fff' }}>
          <Container maxWidth="lg">
            <Grid container spacing={{ xs: 6, md: 10 }} sx={{ alignItems: 'flex-start', flexDirection: { md: 'row-reverse' } }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{ position: { md: 'sticky' }, top: { md: 100 } }}>
                  <Chip label="For landlords" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700, mb: 2.5, fontSize: 13 }} />
                  <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.6rem' }, color: DARK, lineHeight: 1.2, mb: 3 }}>
                    Fill your property with quality student tenants
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#556', lineHeight: 1.8, mb: 4 }}>
                    Cosy gives landlords a purpose-built dashboard to list, manage, and fill properties — with a direct line to thousands of verified students.
                  </Typography>
                  <Button component={Link} href="/register?role=landlord" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' }, px: 3.5 }}>
                    List your property
                  </Button>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={2.5}>
                  {LANDLORD_STEPS.map(s => (
                    <Card key={s.num} variant="outlined" sx={{ borderColor: '#e0f0e2', borderRadius: 3, '&:hover': { borderColor: '#a5d6a7', boxShadow: '0 4px 20px rgba(46,125,50,0.08)' }, transition: '0.2s' }}>
                      <CardContent sx={{ display: 'flex', gap: 2.5, p: 3, '&:last-child': { pb: 3 } }}>
                        <Typography sx={{ fontWeight: 900, fontSize: 28, color: '#c8e6c9', lineHeight: 1, flexShrink: 0, width: 40 }}>{s.num}</Typography>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: DARK, mb: 0.5, fontSize: '1rem' }}>{s.title}</Typography>
                          <Typography variant="body2" sx={{ color: '#667', lineHeight: 1.75 }}>{s.body}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* WHY COSY */}
        <Box sx={{ py: { xs: 8, md: 14 }, bgcolor: LIGHT_BG }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
              <Chip label="Why Cosy?" sx={{ bgcolor: '#e3f2fd', color: BLUE, fontWeight: 700, mb: 2, fontSize: 13 }} />
              <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.8rem' }, color: DARK }}>
                What makes us different
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {VALUES.map(item => (
                <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Box sx={{ p: 3.5, borderRadius: 3, border: '1.5px solid #dde8f8', bgcolor: '#fff', height: '100%', transition: '0.2s', '&:hover': { borderColor: '#90caf9', boxShadow: '0 6px 24px rgba(21,101,192,0.09)' } }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: DARK, mb: 1, fontSize: '0.95rem' }}>{item.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#667', lineHeight: 1.75 }}>{item.body}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* TEAM */}
        <Box sx={{ py: { xs: 8, md: 14 }, bgcolor: '#fff' }}>
          <Container maxWidth="lg">
            <Box sx={{ mb: { xs: 6, md: 8 } }}>
              <Chip label="The team" sx={{ bgcolor: '#e3f2fd', color: BLUE, fontWeight: 700, mb: 2, fontSize: 13 }} />
              <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.8rem' }, color: DARK, mb: 2 }}>
                {"We've lived this problem"}
              </Typography>
              <Typography variant="body1" sx={{ color: '#556', lineHeight: 1.8, maxWidth: 560 }}>
                Every member of the Cosy team came through the South African university system. We did not invent a problem to solve — we lived it.
              </Typography>
            </Box>
            <Grid container spacing={4}>
              {TEAM.map(member => (
                <Grid key={member.name} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: BLUE, fontSize: 22, fontWeight: 800, flexShrink: 0, boxShadow: `0 8px 24px ${BLUE}40` }}>
                      {member.initials}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: DARK, fontSize: '1rem', mb: 0.25 }}>{member.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600, display: 'block', mb: 1 }}>{member.role}</Typography>
                      <Typography variant="body2" sx={{ color: '#667', lineHeight: 1.75 }}>{member.bio}</Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* PRESS */}
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: LIGHT_BG }}>
          <Container maxWidth="lg">
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#778', textAlign: 'center', mb: 5, textTransform: 'uppercase', letterSpacing: 2, fontSize: 11 }}>
              As seen in
            </Typography>
            <Grid container spacing={3}>
              {PRESS.map(p => (
                <Grid key={p.outlet} size={{ xs: 12, md: 4 }}>
                  <Box sx={{ p: 3.5, borderRadius: 3, bgcolor: '#fff', border: '1.5px solid #dde8f8', height: '100%' }}>
                    <FormatQuoteRoundedIcon sx={{ color: '#c5d8f5', fontSize: 36, mb: 1.5, display: 'block' }} />
                    <Typography variant="body1" sx={{ color: DARK, fontStyle: 'italic', lineHeight: 1.75, mb: 2, fontWeight: 500 }}>
                      {p.quote}
                    </Typography>
                    <Typography variant="caption" sx={{ color: BLUE, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                      — {p.outlet}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* UNIVERSITIES */}
        <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#fff', borderTop: '1px solid #edf2fb' }}>
          <Container maxWidth="lg">
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#889', textAlign: 'center', mb: 4, textTransform: 'uppercase', letterSpacing: 2, fontSize: 11 }}>
              Serving students at
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5 }}>
              {['UCT', 'Wits', 'Stellenbosch', 'UJ', 'UP', 'UKZN', 'UFS', 'NMU', 'CPUT', 'TUT', 'UWC', 'NWU', 'UNISA', 'Rhodes', 'UFH', 'DUT', 'VUT', 'CUT'].map(uni => (
                <Chip key={uni} label={uni} variant="outlined" sx={{ borderColor: '#c5d8f5', color: BLUE, fontWeight: 700, fontSize: 13, bgcolor: '#f5f8ff', '&:hover': { bgcolor: '#e3f2fd' } }} />
              ))}
            </Box>
          </Container>
        </Box>

        {/* CTA */}
        <Box sx={{
          py: { xs: 12, md: 16 },
          backgroundImage: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)',
          color: '#fff',
          textAlign: 'center',
          px: 2,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
          <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
          <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.15, mb: 2.5 }}>
              Your next home is on Cosy
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: 1.8, mb: 5 }}>
              Join 50 000+ South African students who found safe, verified accommodation through Cosy. Free to sign up, free to search, free to apply.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
              <Button component={Link} href="/browse" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}
                sx={{ bgcolor: '#fff', color: '#0d47a1', fontWeight: 700, px: 4, py: 1.6, textTransform: 'none', borderRadius: 2.5, '&:hover': { bgcolor: '#e3f2fd' } }}>
                Find accommodation
              </Button>
              <Button component={Link} href="/register?role=landlord" variant="outlined" size="large"
                sx={{ borderColor: 'rgba(255,255,255,0.55)', color: '#fff', fontWeight: 700, px: 4, py: 1.6, textTransform: 'none', borderRadius: 2.5, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
                List your property
              </Button>
            </Stack>
          </Container>
        </Box>

      </Box>
    </ThemeProvider>
  );
}
