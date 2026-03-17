import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { register } from '../../services/authService';
import useAuthStore from '../../context/authStore';
import { useRouter } from 'next/router';

const UNIVERSITIES = [
  'University of Cape Town (UCT)',
  'University of the Witwatersrand (Wits)',
  'University of Pretoria (UP)',
  'Stellenbosch University (SU)',
  'University of KwaZulu-Natal (UKZN)',
  'University of Johannesburg (UJ)',
  'Rhodes University',
  'Nelson Mandela University (NMU)',
  'University of the Western Cape (UWC)',
  'Other',
];

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    fundingType: '',
  });

  const mutation = useMutation({
    mutationFn: register,
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
        <title>Sign up – Cosy</title>
      </Head>

      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create your account
          </h1>

          {mutation.isError && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">
              {mutation.error?.response?.data?.message || 'Registration failed'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input
                type="text"
                required
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

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
                minLength={6}
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                University
              </label>
              <select
                className="input"
                value={form.university}
                onChange={(e) =>
                  setForm({ ...form, university: e.target.value })
                }
              >
                <option value="">Select your university</option>
                {UNIVERSITIES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Funding type
              </label>
              <select
                className="input"
                value={form.fundingType}
                onChange={(e) =>
                  setForm({ ...form, fundingType: e.target.value })
                }
              >
                <option value="">Select funding type</option>
                <option value="NSFAS">NSFAS</option>
                <option value="Private">Private Bursary</option>
                <option value="Self-funded">Self-funded</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full py-3"
            >
              {mutation.isPending ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary-600 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
