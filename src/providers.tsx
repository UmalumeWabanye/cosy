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
      main: '#0071c2',
      dark: '#005b98',
      light: '#d9edff',
    },
    secondary: {
      main: '#f4f9ff',
    },
    background: {
      default: '#f4f9ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f2036',
      secondary: '#4c6d8e',
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
          background: 'linear-gradient(135deg, #0071c2 0%, #005b98 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #005b98 0%, #00467d 100%)',
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