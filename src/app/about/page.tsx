'use client';

import React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import EmojiObjectsRoundedIcon from '@mui/icons-material/EmojiObjectsRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

const theme = createTheme({
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
  },
  shape: { borderRadius: 8 },
});

// ─── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '50 000+', label: 'Student users' },
  { value: '2 500+', label: 'Verified listings' },
  { value: '25+', label: 'Partner universities' },
  { value: '9', label: 'Provinces covered' },
];

const VALUES = [
  {
    icon: <SearchRoundedIcon sx={{ fontSize: 28 }} />,
    title: 'Transparency',
    body: 'Every listing shows real photos, honest pricing, and verified landlord details — no surprises when you arrive.',
  },
  {
    icon: <VerifiedRoundedIcon sx={{ fontSize: 28 }} />,
    title: 'Trust & Safety',
    body: 'Landlords are identity-verified and student tenants are screened, so both sides of the deal are protected.',
  },
  {
    icon: <SchoolRoundedIcon sx={{ fontSize: 28 }} />,
    title: 'Student-first',
    body: 'Built specifically for South African students — NSFAS-friendly listings, university proximity filters, and more.',
  },
  {
    icon: <HandshakeRoundedIcon sx={{ fontSize: 28 }} />,
    title: 'Community',
    body: 'We connect students, landlords, and universities into one supportive ecosystem around affordable housing.',
  },
  {
    icon: <EmojiObjectsRoundedIcon sx={{ fontSize: 28 }} />,
    title: 'Innovation',
    body: 'From smart search to an interactive map view, we keep building tools that make finding a home easier.',
  },
  {
    icon: <SupportAgentRoundedIcon sx={{ fontSize: 28 }} />,
    title: 'Support',
    body: 'Our team is on hand to help students, landlords, and university partners navigate every step of the process.',
  },
];

const TEAM = [
  {
    name: 'Lerato Dlamini',
    role: 'Co-founder & CEO',
    bio: 'Former UCT student who couldn\'t find safe, affordable accommodation and decided to build the solution.',
    initials: 'LD',
    color: '#1565c0',
  },
  {
    name: 'Sipho Ndlovu',
    role: 'Co-founder & CTO',
    bio: 'Full-stack engineer passionate about using technology to close the gap in student housing access across SA.',
    initials: 'SN',
    color: '#0d47a1',
  },
  {
    name: 'Ayanda Mokoena',
    role: 'Head of Growth',
    bio: 'Grew up navigating the student accommodation crisis first-hand. Now she helps thousands avoid the same struggle.',
    initials: 'AM',
    color: '#1976d2',
  },
  {
    name: 'Thandiwe Khumalo',
    role: 'Head of Operations',
    bio: 'Ensures every landlord is verified and every listing meets Cosy\'s quality and safety standards.',
    initials: 'TK',
    color: '#1565c0',
  },
];

const MILESTONES = [
  { year: '2022', event: 'Cosy founded after the founding team experienced the student housing crisis first-hand.' },
  { year: '2023', event: 'Launched in Cape Town and Johannesburg with 200 verified listings and 3 000 students.' },
  { year: '2024', event: 'Expanded to all 9 provinces and partnered with 15 universities nationwide.' },
  { year: '2025', event: 'Crossed 50 000 registered students and 2 500 verified landlord listings.' },
  { year: '2026', event: 'Introduced the landlord dashboard, NSFAS filters, and the interactive map search.' },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: '#fff', overflowX: 'hidden' }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <Box sx={{
          bgcolor: '#0d47a1',
          backgroundImage: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 60%, #42a5f5 100%)',
          color: '#fff',
          py: { xs: 10, md: 16 },
          textAlign: 'center',
          px: 2,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* decorative circles */}
          <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
          <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />

          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
            <Chip label="Our story" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, mb: 3, fontSize: 13 }} />
            <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '2.2rem', md: '3.5rem' }, lineHeight: 1.15, mb: 3 }}>
              Making student housing<br />
              <Box component="span" sx={{ color: '#90caf9' }}>simple, safe & affordable</Box>
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, color: 'rgba(255,255,255,0.85)', maxWidth: 580, mx: 'auto', lineHeight: 1.7, fontSize: { xs: '1rem', md: '1.15rem' } }}>
              Cosy is South Africa's dedicated student accommodation platform — connecting verified landlords with students at universities across all 9 provinces.
            </Typography>
          </Container>
        </Box>

        {/* ── Stats bar ────────────────────────────────────────────────────── */}
        <Box sx={{ bgcolor: '#1565c0', color: '#fff' }}>
          <Container maxWidth="lg">
            <Grid container>
              {STATS.map((s, i) => (
                <Grid key={s.label} size={{ xs: 6, md: 3 }}>
                  <Box sx={{
                    py: { xs: 3.5, md: 5 },
                    textAlign: 'center',
                    borderRight: i < 3 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                  }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.8rem' }, lineHeight: 1 }}>
                      {s.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.5, fontWeight: 500 }}>
                      {s.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ── Mission ──────────────────────────────────────────────────────── */}
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fafafa' }}>
          <Container maxWidth="lg">
            <Grid container spacing={{ xs: 6, md: 10 }} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Chip label="Our mission" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600, mb: 2.5, fontSize: 13 }} />
                <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.6rem' }, lineHeight: 1.25, mb: 3, color: '#0d1b2a' }}>
                  Every student deserves a safe place to call home
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.85, mb: 2.5, fontSize: '1.05rem' }}>
                  The South African student accommodation crisis is real. Every year, thousands of students arrive at university without a place to stay — relying on word-of-mouth, Facebook groups, and costly agents.
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.85, fontSize: '1.05rem' }}>
                  Cosy was built to fix that. We provide a single, trusted platform where students can search and apply for accommodation, and where landlords can list, manage, and fill their properties — with full NSFAS and private funding support.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  height: { xs: 260, md: 400 },
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}>
                  <Box sx={{
                    width: 120, height: 120, borderRadius: '50%',
                    bgcolor: '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 20px 60px rgba(21,101,192,0.35)',
                  }}>
                    <HomeWorkRoundedIcon sx={{ fontSize: 60, color: '#fff' }} />
                  </Box>
                  {/* floating accent cards */}
                  <Box sx={{ position: 'absolute', top: 32, left: 32, bgcolor: '#fff', borderRadius: 2.5, px: 2, py: 1.5, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VerifiedRoundedIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0d1b2a' }}>Verified landlords</Typography>
                  </Box>
                  <Box sx={{ position: 'absolute', bottom: 32, right: 32, bgcolor: '#fff', borderRadius: 2.5, px: 2, py: 1.5, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolRoundedIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0d1b2a' }}>NSFAS-friendly</Typography>
                  </Box>
                  <Box sx={{ position: 'absolute', bottom: 32, left: 32, bgcolor: '#fff', borderRadius: 2.5, px: 2, py: 1.5, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleRoundedIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0d1b2a' }}>50 000+ students</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* ── Our values ───────────────────────────────────────────────────── */}
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fff' }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
              <Chip label="What we stand for" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600, mb: 2, fontSize: 13 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.6rem' }, color: '#0d1b2a' }}>
                Our values
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {VALUES.map(v => (
                <Grid key={v.title} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Box sx={{
                    p: 3.5, borderRadius: 3, border: '1.5px solid #e8edf4',
                    height: '100%',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                    '&:hover': { boxShadow: '0 8px 30px rgba(21,101,192,0.10)', borderColor: '#90caf9' },
                  }}>
                    <Box sx={{
                      width: 52, height: 52, borderRadius: 2.5,
                      bgcolor: '#e3f2fd', color: '#1565c0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
                    }}>
                      {v.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0d1b2a' }}>{v.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.75 }}>{v.body}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ── Timeline ─────────────────────────────────────────────────────── */}
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fafafa' }}>
          <Container maxWidth="md">
            <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
              <Chip label="How we got here" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600, mb: 2, fontSize: 13 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.6rem' }, color: '#0d1b2a' }}>
                Our journey
              </Typography>
            </Box>
            <Stack spacing={0}>
              {MILESTONES.map((m, i) => (
                <Box key={m.year} sx={{ display: 'flex', gap: 3, pb: i < MILESTONES.length - 1 ? 4 : 0 }}>
                  {/* line + dot */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 44, flexShrink: 0 }}>
                    <Box sx={{
                      width: 44, height: 44, borderRadius: '50%',
                      bgcolor: '#1565c0', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 12, flexShrink: 0,
                    }}>
                      {m.year}
                    </Box>
                    {i < MILESTONES.length - 1 && (
                      <Box sx={{ width: 2, flex: 1, bgcolor: '#e0e7f0', mt: 1, mb: 0 }} />
                    )}
                  </Box>
                  {/* content */}
                  <Box sx={{ pt: 0.8, pb: i < MILESTONES.length - 1 ? 3 : 0 }}>
                    <Typography variant="body1" sx={{ color: '#0d1b2a', lineHeight: 1.75, fontWeight: 500 }}>
                      {m.event}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Container>
        </Box>

        {/* ── Team ─────────────────────────────────────────────────────────── */}
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fff' }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
              <Chip label="The people behind Cosy" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600, mb: 2, fontSize: 13 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.6rem' }, color: '#0d1b2a' }}>
                Meet the team
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mt: 2, maxWidth: 520, mx: 'auto' }}>
                We're a small, passionate team of South Africans who've lived the student accommodation problem — and are committed to solving it.
              </Typography>
            </Box>
            <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
              {TEAM.map(member => (
                <Grid key={member.name} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box sx={{
                    p: 3, borderRadius: 3, border: '1.5px solid #e8edf4',
                    textAlign: 'center', height: '100%',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': { boxShadow: '0 8px 30px rgba(21,101,192,0.1)', transform: 'translateY(-4px)' },
                  }}>
                    <Avatar sx={{
                      width: 80, height: 80, mx: 'auto', mb: 2,
                      bgcolor: member.color, fontSize: 28, fontWeight: 700,
                      boxShadow: `0 8px 24px ${member.color}55`,
                    }}>
                      {member.initials}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0d1b2a', mb: 0.5, fontSize: '1rem' }}>
                      {member.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600, display: 'block', mb: 1.5 }}>
                      {member.role}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7, fontSize: 13 }}>
                      {member.bio}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ── Partners / Universities ───────────────────────────────────────── */}
        <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: '#f5f8ff', borderTop: '1px solid #e8edf4' }}>
          <Container maxWidth="lg">
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', fontWeight: 600, mb: 4, letterSpacing: 1, textTransform: 'uppercase', fontSize: 12 }}>
              Serving students at universities including
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5 }}>
              {['UCT', 'Wits', 'Stellenbosch', 'UJ', 'UP', 'UKZN', 'UFS', 'NMU', 'CPUT', 'TUT', 'UWC', 'NWU', 'UNISA', 'Rhodes', 'UFH'].map(uni => (
                <Chip key={uni} label={uni} variant="outlined" sx={{
                  borderColor: '#c5d8f5', color: '#1565c0', fontWeight: 600,
                  fontSize: 13, bgcolor: '#fff',
                  '&:hover': { bgcolor: '#e3f2fd' },
                }} />
              ))}
            </Box>
          </Container>
        </Box>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <Box sx={{
          py: { xs: 10, md: 14 },
          textAlign: 'center',
          bgcolor: '#0d47a1',
          backgroundImage: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)',
          color: '#fff',
          px: 2,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Box sx={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
          <Box sx={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
          <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.6rem' }, mb: 2.5, lineHeight: 1.2 }}>
              Ready to find your next home?
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', mb: 5, lineHeight: 1.75 }}>
              Browse thousands of student-friendly listings near your university — with NSFAS support, verified landlords, and an interactive map.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
              <Button
                component={Link}
                href="/browse"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  bgcolor: '#fff', color: '#0d47a1',
                  fontWeight: 700, px: 4, py: 1.5, textTransform: 'none', borderRadius: 2,
                  '&:hover': { bgcolor: '#e3f2fd' },
                }}
              >
                Browse listings
              </Button>
              <Button
                component={Link}
                href="/register?role=landlord"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(255,255,255,0.6)', color: '#fff',
                  fontWeight: 700, px: 4, py: 1.5, textTransform: 'none', borderRadius: 2,
                  '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                List your property
              </Button>
            </Stack>
          </Container>
        </Box>

      </Box>
    </ThemeProvider>
  );
}
