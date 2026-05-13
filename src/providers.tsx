'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const theme = createTheme({
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
  },
  shape: { borderRadius: 8 },
  palette: {
    primary: {
      main: '#1976d2',
      dark: '#1565c0',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          fontFamily: 'inherit',
        },
        contained: {
          background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: 'inherit',
        },
      },
    },
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}