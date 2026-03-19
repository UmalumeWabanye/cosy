import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/store/authStore';
import api from '@/services/api';

export function useAuth() {
  const { user, token, isAuthenticated, setUser, setToken } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          try {
            const response = await api.get('/auth/me');
            if (response.data.success) {
              setUser(response.data.user);
              
              // Auto-redirect admins to admin dashboard
              if (response.data.user.role === 'admin' && window.location.pathname === '/dashboard') {
                router.push('/admin/dashboard');
              }
            } else {
              useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
              router.push('/login');
            }
          } catch (error) {
            useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
            router.push('/login');
          }
        } else if (isAuthenticated) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [token, isAuthenticated, router, setUser]);

  return {
    user: (user as User) || null,
    token,
    isAuthenticated,
    isLoading,
    setUser,
    setToken,
  };
}