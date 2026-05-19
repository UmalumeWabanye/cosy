"use client";
// Dev helper - force dynamic rendering because it reads search params client-side
export const dynamic = 'force-dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export default function DevLogin() {
  // read search params from browser location to avoid server prerender issues
  const params = {
    get: (k: string) => {
      if (typeof window === 'undefined') return null;
      return new URLSearchParams(window.location.search).get(k);
    }
  } as any;
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      if (process.env.NODE_ENV !== 'development') {
        router.push('/');
        return;
      }

      const token = params.get('token');
      const redirect = params.get('redirect') || '/dashboard';
      if (!token) {
        alert('No token provided in query string. Use ?token=...');
        return;
      }

      try {
        // Persist token
        localStorage.setItem('token', token);
        useAuthStore.setState({ token, isAuthenticated: true });

        // Try to fetch user
        try {
          const res = await api.get('/auth/me');
          const data = res.data;
          const user = data.user || data;
          useAuthStore.setState({ user });
          // redirect to requested page or admin gateway if admin
          if (user?.role === 'admin') {
            router.push('/admin-access');
          } else {
            router.push(redirect);
          }
        } catch (err) {
          // still redirect to dashboard; user can refresh
          router.push(redirect);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to set token');
      }
    };

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded shadow">
        <p className="text-gray-700">Signing you in (dev)... If you are not redirected, check console.</p>
      </div>
    </div>
  );
}
