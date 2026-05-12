'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
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

  const hiddenPaths = ['/login', '/register', '/signup'];
  const shouldHide =
    hiddenPaths.includes(pathname) ||
    pathname.startsWith('/admin');

  if (shouldHide) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

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
        }}
      >
        <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
          {/* Brand */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 16 }}>C</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', fontFamily: 'inherit' }}>
              Cosy
            </Typography>
          </Link>

          <Box sx={{ flexGrow: 1 }} />

          {isAuthenticated && user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                component={Link}
                href="/saved-listings"
                startIcon={<BookmarkBorderIcon />}
                size="small"
                sx={{ color: 'text.secondary', textTransform: 'none', fontFamily: 'inherit' }}
              >
                Saved
              </Button>
              <Button
                component={Link}
                href="/requests"
                startIcon={<AssignmentOutlinedIcon />}
                size="small"
                sx={{ color: 'text.secondary', textTransform: 'none', fontFamily: 'inherit' }}
              >
                Requests
              </Button>
              <Button
                component={Link}
                href="/dashboard"
                startIcon={<DashboardOutlinedIcon />}
                size="small"
                sx={{ color: 'text.secondary', textTransform: 'none', fontFamily: 'inherit' }}
              >
                Dashboard
              </Button>
              <Typography variant="body2" sx={{ color: 'text.secondary', mx: 1, fontFamily: 'inherit' }}>
                {user.name}
              </Typography>
              <Button
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                variant="outlined"
                size="small"
                sx={{ textTransform: 'none', fontFamily: 'inherit', borderRadius: 2 }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                size="small"
                sx={{ textTransform: 'none', fontFamily: 'inherit', borderRadius: 2 }}
              >
                Login
              </Button>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                size="small"
                sx={{ textTransform: 'none', fontFamily: 'inherit', borderRadius: 2 }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}
