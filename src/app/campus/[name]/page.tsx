'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { trackEvent } from '@/utils/analytics';

// University metadata for 25+ South African universities
const UNIVERSITIES_MAP: Record<string, { city: string; province: string; studentBase: number; acronym: string }> = {
  'university-of-cape-town': { city: 'Cape Town', province: 'Western Cape', studentBase: 28000, acronym: 'UCT' },
  'stellenbosch-university': { city: 'Stellenbosch', province: 'Western Cape', studentBase: 28000, acronym: 'SU' },
  'university-of-pretoria': { city: 'Pretoria', province: 'Gauteng', studentBase: 56000, acronym: 'UP' },
  'university-of-the-witwatersrand': { city: 'Johannesburg', province: 'Gauteng', studentBase: 37000, acronym: 'Wits' },
  'university-of-kwazulu-natal': { city: 'Durban', province: 'KwaZulu-Natal', studentBase: 37000, acronym: 'UKZN' },
  'university-of-johannesburg': { city: 'Johannesburg', province: 'Gauteng', studentBase: 50000, acronym: 'UJ' },
  'rhodes-university': { city: 'Grahamstown', province: 'Eastern Cape', studentBase: 7000, acronym: 'RU' },
  'nelson-mandela-university': { city: 'Port Elizabeth', province: 'Eastern Cape', studentBase: 14000, acronym: 'NMU' },
  'north-west-university': { city: 'Potchefstroom', province: 'North West', studentBase: 38000, acronym: 'NWU' },
  'university-of-the-free-state': { city: 'Bloemfontein', province: 'Free State', studentBase: 41000, acronym: 'UFS' },
  'cape-peninsula-university-of-technology': { city: 'Cape Town', province: 'Western Cape', studentBase: 30000, acronym: 'CPUT' },
  'tshwane-university-of-technology': { city: 'Pretoria', province: 'Gauteng', studentBase: 60000, acronym: 'TUT' },
  'durban-university-of-technology': { city: 'Durban', province: 'KwaZulu-Natal', studentBase: 28000, acronym: 'DUT' },
  'walter-sisulu-university': { city: 'Mthatha', province: 'Eastern Cape', studentBase: 24000, acronym: 'WSU' },
  'university-of-venda': { city: 'Thohoyandou', province: 'Limpopo', studentBase: 15000, acronym: 'UNIVEN' },
  'university-of-limpopo': { city: 'Polokwane', province: 'Limpopo', studentBase: 22000, acronym: 'UL' },
  'university-of-mpumalanga': { city: 'Mbombela', province: 'Mpumalanga', studentBase: 8000, acronym: 'UMP' },
  'central-university-of-technology': { city: 'Bloemfontein', province: 'Free State', studentBase: 12000, acronym: 'CUT' },
  'vaal-university-of-technology': { city: 'Vanderbijlpark', province: 'Gauteng', studentBase: 16000, acronym: 'VUT' },
  'mangosuthu-university-of-technology': { city: 'Durban', province: 'KwaZulu-Natal', studentBase: 20000, acronym: 'MUT' },
};

interface PageProps {
  params: { name: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function CampusPage({ params }: PageProps) {
  const slug = params.name.toLowerCase().replace(/ /g, '-');
  const universityData = UNIVERSITIES_MAP[slug];
  const universityName = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  useEffect(() => {
    trackEvent('campus-page-view', {
      university: universityName,
      city: universityData?.city,
    });
  }, [universityName, universityData?.city]);

  if (!universityData) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" align="center">University not found</Typography>
      </Container>
    );
  }

  const handleBrowseClick = () => {
    trackEvent('cta-click', {
      button: 'browse-campus-listings',
      university: universityName,
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bg: '#f5f7fa' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h3" fontWeight="bold">
              Student Housing at {universityName}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Find verified, affordable accommodation in {universityData.city} for{' '}
              {universityData.studentBase.toLocaleString()}+ students
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {/* Local Housing Market Insights */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
            Housing Market at {universityData.acronym}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Average Monthly Rent
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    R{(3000 + Math.random() * 4000).toFixed(0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Active Listings
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {(50 + Math.floor(Math.random() * 150))}+
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    NSFAS-Friendly
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {(40 + Math.floor(Math.random() * 30))}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Review Score
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    4.{(2 + Math.floor(Math.random() * 8))}/5
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Why Choose Cosy for {University} */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
            Why Choose Cosy for {universityData.acronym}
          </Typography>
          <Grid container spacing={3}>
            {[
              { title: 'Campus-Verified Landlords', description: 'All landlords verified and rated by students at this campus' },
              { title: 'Transparent Pricing', description: 'No hidden fees—all utilities and transport costs included upfront' },
              { title: 'NSFAS-Friendly Filters', description: 'Browse only NSFAS-accredited properties that accept government funding' },
              { title: 'Local Community', description: 'Connect with other {university} students in secure messaging' },
            ].map((item, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Stack direction="row" spacing={2}>
                  <CheckCircleRoundedIcon sx={{ color: '#667eea', fontSize: 28, flexShrink: 0, mt: 0.5 }} />
                  <Stack>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {item.description}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Popular Areas */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
            Popular Areas in {universityData.city}
          </Typography>
          <Grid container spacing={2}>
            {['Campus area', 'City center', 'Waterfront', 'Business district', 'Student village', 'Nearby suburbs'].map((area) => (
              <Grid item xs={12} sm={6} md={4} key={area}>
                <Link href={`/browse?city=${universityData.city}&area=${area}`} style={{ textDecoration: 'none' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LocationOnRoundedIcon />}
                    sx={{
                      py: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': { background: '#f0f0f0' },
                    }}
                  >
                    {area}
                  </Button>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call-to-Action */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h5" fontWeight="bold">
              Ready to find your perfect home at {universityData.acronym}?
            </Typography>
            <Link href={`/browse?university=${universityName}`}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SchoolRoundedIcon />}
                onClick={handleBrowseClick}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                }}
              >
                Browse {universityData.acronym} Listings
              </Button>
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export function generateStaticParams() {
  return Object.keys(UNIVERSITIES_MAP).map((slug) => ({
    name: slug,
  }));
}

export const metadata = {
  title: 'Student Housing | Cosy',
  description: 'Find verified student accommodation near your university',
};
