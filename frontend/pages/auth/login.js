import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { login } from '../../services/authService';
import useAuthStore from '../../context/authStore';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data, data.token);
      router.push('/');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <>
      <Head>
        <title>Log in – Cosy</title>
      </Head>

      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Welcome back 👋
          </h1>

          {mutation.isError && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">
              {mutation.error?.response?.data?.message || 'Login failed'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full py-3"
            >
              {mutation.isPending ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary-600 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
