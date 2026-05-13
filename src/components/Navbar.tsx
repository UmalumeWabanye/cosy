'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

const theme = createTheme({
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
  },
  shape: { borderRadius: 8 },
});

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { logout } = useAuthStore();

  const isHomepage = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isHomepage) return;
    const onScroll = () => setScrolled(window.scrollY > 480);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHomepage]);

  const hiddenPaths = ['/login', '/register', '/signup'];
  const shouldHide = hiddenPaths.includes(pathname) || pathname.startsWith('/admin');
  if (shouldHide) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    router.push(`/browse?${params.toString()}`);
    setSearchQuery('');
  };

  const showSearch = isHomepage && scrolled;

  return (
    <ThemeProvider theme={theme}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: 'box-shadow 0.3s ease',
          boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <Toolbar sx={{ maxWidth: 1280, width: '100%', mx: 'auto', px: { xs: 2, sm: 3 }, gap: 1 }}>

          {/* Brand */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <Box
              sx={{
                width: 32, height: 32, borderRadius: 1.5,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ApartmentRoundedIcon sx={{ color: 'white', fontSize: 18 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontFamily: 'inherit', letterSpacing: '-0.01em' }}>
              Cosy
            </Typography>
          </Link>

          {/* Animated center slot */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mx: { xs: 1, sm: 2 }, overflow: 'hidden' }}>
            <Paper
              component="form"
              onSubmit={handleSearchSubmit}
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: showSearch ? { xs: '100%', sm: 360, md: 440 } : 0,
                opacity: showSearch ? 1 : 0,
                overflow: 'hidden',
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                border: showSearch ? '1.5px solid' : 'none',
                borderColor: 'primary.main',
                borderRadius: 6,
                px: showSearch ? 1.5 : 0,
                height: 38,
                bgcolor: 'background.paper',
                pointerEvents: showSearch ? 'auto' : 'none',
              }}
            >
              <InputBase
                placeholder="Search properties, cities…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, fontSize: '0.875rem', fontFamily: 'inherit' }}
                inputProps={{ 'aria-label': 'search properties' }}
              />
              <Tooltip title="Search">
                <IconButton type="submit" size="small" sx={{ color: 'primary.main', p: 0.5 }}>
                  <SearchRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Paper>
            {!showSearch && <Box sx={{ flexGrow: 1 }} />}
          </Box>

          {/* Right nav */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>

            {pathname === '/landlord' ? (
              /* ── Landlord page nav items ── */
              <>
                <Button
                  component={Link}
                  href="/"
                  size="small"
                  sx={{
                    textTransform: 'none', fontFamily: 'inherit', fontWeight: 600,
                    color: '#1565c0', bgcolor: 'transparent',
                    display: { xs: 'none', sm: 'inline-flex' }, px: 1,
                    '&:hover': { bgcolor: 'transparent', color: '#0d47a1' },
                  }}
                >
                  For Tenants
                </Button>
                <Button
                  component={Link}
                  href="/register?role=landlord"
                  size="small"
                  sx={{
                    textTransform: 'none', fontFamily: 'inherit', fontWeight: 600,
                    color: '#1565c0', bgcolor: 'transparent',
                    display: { xs: 'none', sm: 'inline-flex' }, px: 1,
                    '&:hover': { bgcolor: 'transparent', color: '#0d47a1' },
                  }}
                >
                  Create a Listing
                </Button>
              </>
            ) : (
              /* ── Default nav item: Become a Landlord ── */
              <Button
                component={Link}
                href="/landlord"
                size="small"
                sx={{
                  textTransform: 'none', fontFamily: 'inherit', fontWeight: 600,
                  color: '#1565c0', bgcolor: 'transparent',
                  display: { xs: 'none', sm: 'inline-flex' }, px: 1,
                  '&:hover': { bgcolor: 'transparent', color: '#0d47a1' },
                }}
              >
                Become a Landlord
              </Button>
            )}

            {isAuthenticated && user ? (
              <>
                <Button
                  component={Link} href="/saved-listings"
                  startIcon={<BookmarkBorderIcon />} size="small"
                  sx={{ color: 'text.secondary', textTransform: 'none', fontFamily: 'inherit', display: { xs: 'none', md: 'inline-flex' } }}
                >
                  Saved
                </Button>
                <Button
                  component={Link} href="/requests"
                  startIcon={<AssignmentOutlinedIcon />} size="small"
                  sx={{ color: 'text.secondary', textTransform: 'none', fontFamily: 'inherit', display: { xs: 'none', md: 'inline-flex' } }}
                >
                  Requests
                </Button>
                <Button
                  component={Link} href="/dashboard"
                  startIcon={<DashboardOutlinedIcon />} size="small"
                  sx={{ color: 'text.secondary', textTransform: 'none', fontFamily: 'inherit', display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Dashboard
                </Button>
                <Typography variant="body2" sx={{ color: 'text.secondary', mx: 0.5, fontFamily: 'inherit', display: { xs: 'none', md: 'block' } }}>
                  {user.name}
                </Typography>
                <Button
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  variant="outlined" size="small"
                  sx={{ textTransform: 'none', fontFamily: 'inherit', borderRadius: 2 }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link} href="/login"
                  variant="outlined" size="small"
                  sx={{ textTransform: 'none', fontFamily: 'inherit', borderRadius: 2 }}
                >
                  Login
                </Button>
                <Button
                  component={Link} href="/register"
                  variant="contained" size="small"
                  sx={{ textTransform: 'none', fontFamily: 'inherit', borderRadius: 2 }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}
