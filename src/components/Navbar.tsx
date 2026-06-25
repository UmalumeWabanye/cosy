'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchIcon from '@mui/icons-material/Search';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

// Airbnb-flavoured MUI theme for public nav
const airTheme = createTheme({
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
  },
  shape: { borderRadius: 8 },
  palette: {
    primary: { main: '#ff385c', dark: '#e00b41' },
  },
});

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { logout } = useAuthStore();

  const isHomepage = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isHomepage) return;
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHomepage]);

  const marketingPaths = ['/', '/about', '/for-landlords', '/for-students', '/landlord', '/nsfas'];
  if (!marketingPaths.includes(pathname) && !pathname.startsWith('/campus')) return null;

  const handleLogout = () => { logout(); router.replace('/'); };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    router.push(`/browse?${params.toString()}`);
    setSearchQuery('');
  };

  const showSearch = isHomepage && scrolled;

  return (
    <ThemeProvider theme={airTheme}>
      {/* ── Main bar ── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,0.96)',
          color: '#222222',
          borderBottom: '1px solid #dddddd',
          backdropFilter: 'blur(12px)',
          transition: 'box-shadow 0.25s ease',
          boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.1)' : 'none',
          zIndex: 1200,
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1280,
            width: '100%',
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            gap: 1,
            minHeight: { xs: 64, sm: 72 },
          }}
        >
          {/* Brand wordmark */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Box
              sx={{
                width: 30, height: 30,
                borderRadius: '50%',
                background: '#ff385c',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ApartmentRoundedIcon sx={{ color: 'white', fontSize: 17 }} />
            </Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 20,
                color: '#ff385c',
                fontFamily: 'inherit',
                letterSpacing: '-0.02em',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              cosy
            </Typography>
          </Link>

          {/* Centre pill search (visible after scroll on homepage) */}
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'center',
              mx: { xs: 1, sm: 2 },
              overflow: 'hidden',
            }}
          >
            <Box
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: showSearch ? { xs: '100%', sm: 380, md: 460 } : { xs: 0, sm: 0 },
                opacity: showSearch ? 1 : 0,
                overflow: 'hidden',
                transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease',
                border: showSearch ? '1px solid #dddddd' : 'none',
                borderRadius: '9999px',
                bgcolor: '#fff',
                boxShadow: showSearch ? '0 2px 12px rgba(0,0,0,0.12)' : 'none',
                px: showSearch ? 1.5 : 0,
                height: 44,
              }}
            >
              <SearchIcon sx={{ fontSize: 18, color: '#6a6a6a', mr: 0.75, flexShrink: 0 }} />
              <InputBase
                placeholder="Search cities, universities…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, fontSize: 14, fontFamily: 'inherit', color: '#222' }}
                inputProps={{ 'aria-label': 'search properties' }}
              />
              {searchQuery && (
                <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ p: 0.25, mr: 0.25 }}>
                  <CloseRoundedIcon sx={{ fontSize: 16, color: '#6a6a6a' }} />
                </IconButton>
              )}
              <Box
                component="button"
                type="submit"
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#ff385c', border: 'none', cursor: 'pointer', flexShrink: 0,
                  transition: 'background 0.15s',
                  '&:hover': { background: '#e00b41' },
                }}
              >
                <SearchIcon sx={{ fontSize: 16, color: '#fff' }} />
              </Box>
            </Box>
            {!showSearch && <Box sx={{ flexGrow: 1 }} />}
          </Box>

          {/* Right nav links */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            {pathname === '/landlord' || pathname === '/for-landlords' ? (
              <>
                <Button
                  component={Link} href="/"
                  sx={{ textTransform: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#3f3f3f', '&:hover': { bgcolor: '#f7f7f7' }, borderRadius: 6, px: 1.5 }}
                >
                  For Students
                </Button>
                <Button
                  component={Link} href="/register?role=landlord"
                  sx={{ textTransform: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#3f3f3f', '&:hover': { bgcolor: '#f7f7f7' }, borderRadius: 6, px: 1.5 }}
                >
                  List a Property
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link} href="/browse"
                  sx={{ textTransform: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#3f3f3f', '&:hover': { bgcolor: '#f7f7f7' }, borderRadius: 6, px: 1.5 }}
                >
                  Browse
                </Button>
                <Button
                  component={Link} href="/for-landlords"
                  sx={{ textTransform: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#3f3f3f', '&:hover': { bgcolor: '#f7f7f7' }, borderRadius: 6, px: 1.5, display: { xs: 'none', md: 'inline-flex' } }}
                >
                  Landlords
                </Button>
                <Button
                  component={Link} href="/about"
                  sx={{ textTransform: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#3f3f3f', '&:hover': { bgcolor: '#f7f7f7' }, borderRadius: 6, px: 1.5, display: { xs: 'none', lg: 'inline-flex' } }}
                >
                  About
                </Button>
              </>
            )}

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1.5, borderColor: '#dddddd' }} />

            {isAuthenticated && user ? (
              <>
                <Button
                  component={Link} href="/dashboard"
                  startIcon={<DashboardOutlinedIcon sx={{ fontSize: 16 }} />}
                  sx={{ textTransform: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#3f3f3f', '&:hover': { bgcolor: '#f7f7f7' }, borderRadius: 6, px: 1.5 }}
                >
                  Dashboard
                </Button>
                <Button
                  onClick={handleLogout}
                  startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    textTransform: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: 14,
                    color: '#fff', bgcolor: '#222222',
                    '&:hover': { bgcolor: '#3f3f3f' },
                    borderRadius: '9999px', px: 2, py: 0.75,
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link} href="/login"
                  sx={{ textTransform: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, color: '#3f3f3f', '&:hover': { bgcolor: '#f7f7f7' }, borderRadius: 6, px: 1.5 }}
                >
                  Log in
                </Button>
                <Button
                  component={Link} href="/register"
                  sx={{
                    textTransform: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: 14,
                    color: '#fff', bgcolor: '#ff385c',
                    '&:hover': { bgcolor: '#e00b41' },
                    borderRadius: '9999px', px: 2, py: 0.75,
                    boxShadow: 'none',
                  }}
                >
                  Sign up
                </Button>
              </>
            )}
          </Box>

          {/* Mobile hamburger */}
          <IconButton
            size="small"
            onClick={() => setMobileNavOpen(true)}
            sx={{ display: { xs: 'flex', sm: 'none' }, ml: 0.5, color: '#222222' }}
            aria-label="Open menu"
          >
            <MenuRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* ── Mobile drawer ── */}
      <Drawer
        anchor="right"
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        slotProps={{ paper: { sx: { width: 280, bgcolor: '#fff' } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#ff385c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ApartmentRoundedIcon sx={{ color: '#fff', fontSize: 15 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#ff385c', letterSpacing: '-0.02em' }}>cosy</Typography>
          </Box>
          <IconButton size="small" onClick={() => setMobileNavOpen(false)}>
            <CloseRoundedIcon sx={{ fontSize: 20, color: '#6a6a6a' }} />
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: '#ebebeb' }} />
        <List dense disablePadding sx={{ px: 1, py: 1 }}>
          {[
            { label: 'Browse Properties', href: '/browse' },
            { label: 'For Landlords', href: '/for-landlords' },
            { label: 'About', href: '/about' },
          ].map(item => (
            <ListItemButton
              key={item.href}
              component={Link} href={item.href}
              onClick={() => setMobileNavOpen(false)}
              sx={{ borderRadius: 2, mb: 0.25 }}
            >
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { style: { fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 15, color: '#222222' } } }}
              />
            </ListItemButton>
          ))}
          <Divider sx={{ my: 1, borderColor: '#ebebeb' }} />
          {isAuthenticated && user ? (
            <>
              <ListItemButton component={Link} href="/dashboard" onClick={() => setMobileNavOpen(false)} sx={{ borderRadius: 2, mb: 0.25 }}>
                <ListItemText primary="Dashboard" slotProps={{ primary: { style: { fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 15, color: '#222222' } } }} />
              </ListItemButton>
              <ListItemButton component={Link} href="/saved-listings" onClick={() => setMobileNavOpen(false)} sx={{ borderRadius: 2, mb: 0.25 }}>
                <ListItemText primary="Saved Listings" slotProps={{ primary: { style: { fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 15, color: '#222222' } } }} />
              </ListItemButton>
              <ListItemButton onClick={() => { setMobileNavOpen(false); handleLogout(); }} sx={{ borderRadius: 2 }}>
                <ListItemText primary="Log out" slotProps={{ primary: { style: { fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 15, color: '#ff385c' } } }} />
              </ListItemButton>
            </>
          ) : (
            <>
              <ListItemButton component={Link} href="/login" onClick={() => setMobileNavOpen(false)} sx={{ borderRadius: 2, mb: 0.25 }}>
                <ListItemText primary="Log in" slotProps={{ primary: { style: { fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 15, color: '#222222' } } }} />
              </ListItemButton>
              <Box sx={{ px: 1, pt: 0.5 }}>
                <Button
                  component={Link} href="/register"
                  fullWidth
                  onClick={() => setMobileNavOpen(false)}
                  sx={{
                    textTransform: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 600,
                    bgcolor: '#ff385c', color: '#fff', borderRadius: '9999px',
                    '&:hover': { bgcolor: '#e00b41' },
                  }}
                >
                  Sign up
                </Button>
              </Box>
            </>
          )}
        </List>
      </Drawer>
    </ThemeProvider>
  );
}
