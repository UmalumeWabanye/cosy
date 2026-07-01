'use client';

import React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';

const theme = createTheme({
  typography: { fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(',') },
  shape: { borderRadius: 12 },
  palette: { primary: { main: '#1976d2', dark: '#1565c0', light: '#42a5f5' } },
});

const BENEFITS = [
  { icon: <TrendingUpRoundedIcon sx={{ fontSize: 28, color: '#1976d2' }} />, title: 'Fill Rooms Faster', desc: 'Target verified student demand near campuses. Reach thousands of active renters.' },
  { icon: <DescriptionRoundedIcon sx={{ fontSize: 28, color: '#1976d2' }} />, title: 'Simplified Listings', desc: 'Add photos, set pricing, and go live instantly. Manage multiple properties from one dashboard.' },
  { icon: <ChatBubbleRoundedIcon sx={{ fontSize: 28, color: '#1976d2' }} />, title: 'Direct Communication', desc: 'Message students directly through Cosy. No phone numbers or emails shared until you approve.' },
  { icon: <GroupRoundedIcon sx={{ fontSize: 28, color: '#1976d2' }} />, title: 'Quality Tenants', desc: 'Every student is identity-verified. See their university, funding type, and review history.' },
];

const PROCESS_STEPS = [
  { num: '1', title: 'Create Your Profile', desc: 'Sign up, complete identity verification, and set up your account in under 10 minutes.' },
  { num: '2', title: 'List Your Property', desc: 'Add photos, set room types, pricing, and availability. Your listing goes live immediately to students.' },
  { num: '3', title: 'Receive Applications', desc: 'Students apply directly through Cosy. Review their profiles, funding type, and approve with one click.' },
  { num: '4', title: 'Manage Everything', desc: 'Track applications, send offers, receive deposits, and onboard tenants all from your landlord dashboard.' },
];

const FEATURES = [
  { icon: <VerifiedUserRoundedIcon sx={{ fontSize: 28, color: '#1976d2' }} />, title: 'Verified Students', desc: 'Every applicant is identity-verified. You know exactly who\'s moving in.' },
  { icon: <AccessTimeRoundedIcon sx={{ fontSize: 28, color: '#1976d2' }} />, title: 'Real-Time Updates', desc: 'Get instant notifications when students apply, pay deposits, and confirm move-ins.' },
  { icon: <SecurityRoundedIcon sx={{ fontSize: 28, color: '#1976d2' }} />, title: 'Secure Platform', desc: 'Messages, payments, and personal information stay private until both parties approve.' },
];

const HERO_STATS = [
  { value: '12,000+', label: 'Student Demand' },
  { value: '850+', label: 'Active Listings' },
  { value: '95%', label: 'Avg Occupancy' },
  { value: '25+', label: 'Universities' },
];

export default function ForLandlordsPage() {
  return (
    <ThemeProvider theme={theme}>
      {/* ─── HERO ────────────────────────────────────────── */}
      <Box sx={{ position: 'relative', height: { xs: 460, sm: 520, md: 580 }, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1800&h=1000&fit=crop&auto=format)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(112deg, rgba(2,18,39,0.9) 0%, rgba(9,46,89,0.75) 45%, rgba(25,118,210,0.56) 100%)',
        }} />
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 420, height: 420, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
        <Box sx={{ position: 'absolute', bottom: -90, left: -90, width: 340, height: 340, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)' }} />
        
        <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', px: 2, width: '100%', maxWidth: 780, mx: 'auto' }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', fontSize: 12, mb: 2 }}>Landlord Growth Platform</Typography>
          <Typography component="h1" sx={{ fontWeight: 700, fontSize: { xs: '2rem', sm: '2.8rem', md: '3.4rem' }, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff', mb: 1.5 }}>
            Fill rooms faster with verified students
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: { xs: 15, md: 17 }, fontWeight: 400, mb: 4, lineHeight: 1.65, maxWidth: 600, mx: 'auto' }}>
            Cosy connects you with thousands of verified student renters. List your property, manage allocations, and communicate with tenants from one platform.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button component={Link} href="/register?role=landlord&source=for-landlords" variant="contained"
              sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 700, textTransform: 'none', px: 3.5, borderRadius: '9999px', fontSize: 15, '&:hover': { bgcolor: '#1565c0' } }}>
              Create Landlord Account
            </Button>
            <Button component={Link} href="/landlord" variant="outlined"
              sx={{ borderColor: 'rgba(255,255,255,0.65)', color: '#fff', fontWeight: 700, textTransform: 'none', px: 3.5, borderRadius: '9999px', fontSize: 15, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
              View Landlord Dashboard
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ─── HERO STATS ───────────────────────────────────── */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #eeeeee' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {HERO_STATS.map((s, i) => (
              <Box key={s.label} sx={{ px: { xs: 3, md: 6 }, py: { xs: 3, md: 4 }, textAlign: 'center', borderRight: { xs: i % 2 === 0 ? '1px solid #eeeeee' : 'none', md: i < 3 ? '1px solid #eeeeee' : 'none' }, width: { xs: '50%', md: 'auto' }, flex: { md: '1 1 0' } }}>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.4rem', md: '1.8rem' }, color: '#1976d2', lineHeight: 1 }}>{s.value}</Typography>
                <Typography sx={{ color: '#717171', fontSize: 13, mt: 0.5 }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ─── KEY BENEFITS ─────────────────────────────────── */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 700, color: '#222222', letterSpacing: '-0.02em' }}>Why landlords choose Cosy</Typography>
            <Typography sx={{ color: '#717171', mt: 1, fontSize: 15 }}>Everything you need to manage student properties and tenants.</Typography>
          </Box>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {BENEFITS.map(benefit => (
              <Grid key={benefit.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ p: 3, borderRadius: '16px', border: '1px solid #eeeeee', bgcolor: '#fff', height: '100%', transition: 'box-shadow 0.2s, transform 0.2s', '&:hover': { boxShadow: '0 6px 24px rgba(25,118,210,0.1)', transform: 'translateY(-2px)' } }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>{benefit.icon}</Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#222', mb: 0.75 }}>{benefit.title}</Typography>
                  <Typography sx={{ color: '#717171', fontSize: 13, lineHeight: 1.65 }}>{benefit.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── PROCESS STEPS ────────────────────────────────── */}
      <Box sx={{ bgcolor: '#f8f9fa', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 700, color: '#222222', letterSpacing: '-0.02em' }}>How it works</Typography>
            <Typography sx={{ color: '#717171', mt: 1, fontSize: 15 }}>Get started in 4 simple steps.</Typography>
          </Box>
          <Grid container spacing={4}>
            {PROCESS_STEPS.map(step => (
              <Grid key={step.num} size={{ xs: 12, md: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
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

      {/* ─── FEATURES ─────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 8 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography sx={{ color: '#1976d2', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', fontSize: 12, mb: 2 }}>Smart Management</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.6rem' }, color: '#222222', lineHeight: 1.2, mb: 3 }}>
                  Manage all your listings in one place
                </Typography>
                <Typography sx={{ color: '#717171', fontSize: 15, lineHeight: 1.8, mb: 4 }}>
                  Track applications, send offers, receive payments, and communicate with tenants from a single dashboard. No more spreadsheets or scattered emails.
                </Typography>
                <Button component={Link} href="/register?role=landlord&source=for-landlords-features" variant="contained"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '9999px', px: 3, bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}>
                  Start listing now
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Grid container spacing={2}>
                {FEATURES.map(f => (
                  <Grid key={f.title} size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #eeeeee', bgcolor: '#f8f9fa', height: '100%' }}>
                      <Box sx={{ mb: 1.5 }}>{f.icon}</Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#222', mb: 0.5 }}>{f.title}</Typography>
                      <Typography sx={{ color: '#717171', fontSize: 12, lineHeight: 1.6 }}>{f.desc}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <Box sx={{ background: 'linear-gradient(135deg, #021a38 0%, #0c3f73 50%, #1565c0 100%)', py: { xs: 8, md: 12 }, px: 2, textAlign: 'center', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% -10%, rgba(147,214,255,0.22), transparent 50%)' } }}>
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontWeight: 700, color: '#fff', mb: 1.5, fontSize: { xs: '1.7rem', md: '2.1rem' }, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Ready to fill your rooms?</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 5, fontSize: 15, lineHeight: 1.65 }}>
            Join hundreds of landlords who are using Cosy to manage their student properties. List for free.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button component={Link} href="/register?role=landlord&source=for-landlords-cta" variant="contained"
              sx={{ bgcolor: '#fff', color: '#1565c0', fontWeight: 700, textTransform: 'none', px: 3.5, borderRadius: '9999px', fontSize: 15, boxShadow: '0 4px 14px rgba(0,0,0,0.2)', '&:hover': { bgcolor: '#f5f5f5' } }}>
              Create Free Account
            </Button>
            <Button component={Link} href="/landlord"
              sx={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff', border: '1.5px solid', fontWeight: 700, textTransform: 'none', px: 3.5, borderRadius: '9999px', fontSize: 15, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
              View Dashboard
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ─── FOOTER ────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#0a1929', color: '#fff', py: { xs: 6, md: 8 }, px: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography sx={{ fontWeight: 700, color: '#fff', mb: 2, fontSize: 14 }}>Company</Typography>
              <Stack spacing={1}>
                {['About', 'For Students', 'Contact'].map(link => (
                  <Link key={link} href={link === 'For Students' ? '/for-students' : '#'} style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s', cursor: 'pointer' }}>
                    <Typography sx={{ color: 'inherit', '&:hover': { color: '#fff' }, textDecoration: 'none' }}>{link}</Typography>
                  </Link>
                ))}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography sx={{ fontWeight: 700, color: '#fff', mb: 2, fontSize: 14 }}>Resources</Typography>
              <Stack spacing={1}>
                {['Guide', 'FAQ', 'Support'].map(link => (
                  <Link key={link} href="#" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: 13 }}>
                    <Typography sx={{ color: 'inherit', '&:hover': { color: '#fff' }, textDecoration: 'none' }}>{link}</Typography>
                  </Link>
                ))}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography sx={{ fontWeight: 700, color: '#fff', mb: 2, fontSize: 14 }}>Legal</Typography>
              <Stack spacing={1}>
                {['Privacy', 'Terms', 'Cookies'].map(link => (
                  <Link key={link} href="#" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: 13 }}>
                    <Typography sx={{ color: 'inherit', '&:hover': { color: '#fff' }, textDecoration: 'none' }}>{link}</Typography>
                  </Link>
                ))}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography sx={{ fontWeight: 700, color: '#fff', mb: 2, fontSize: 14 }}>Connect</Typography>
              <Stack spacing={1}>
                {['Twitter', 'LinkedIn', 'Instagram'].map(link => (
                  <Link key={link} href="#" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: 13 }}>
                    <Typography sx={{ color: 'inherit', '&:hover': { color: '#fff' }, textDecoration: 'none' }}>{link}</Typography>
                  </Link>
                ))}
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', pt: 4, mt: 4 }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center' }}>
              © 2024 Cosy. All rights reserved. · Made for South African students and landlords.
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
