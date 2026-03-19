'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

const UNIVERSITIES = [
  'University of Cape Town',
  'Stellenbosch University',
  'University of the Western Cape',
  'University of Johannesburg',
  'University of Pretoria',
  'Wits University',
  'University of KwaZulu-Natal',
  'North West University',
  'University of Free State',
  'Rhodes University',
];

const FUNDING_TYPES = [
  { value: 'NSFAS', label: 'NSFAS' },
  { value: 'private', label: 'Private' },
  { value: 'self-funded', label: 'Self-funded' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    fundingType: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validation
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.university ||
        !formData.fundingType
      ) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        university: formData.university,
        fundingType: formData.fundingType,
      });

      if (response.data.success) {
        setSuccess('Registration successful! Redirecting...');

        // Store token and user
        setToken(response.data.token);
        setUser(response.data.user);

        // Redirect to dashboard after 1 second
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Cosy</h1>
          <p className="text-gray-600">Find Your Perfect Student Home</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="input-base"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="input-base"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                className="input-base"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••"
                className="input-base"
                required
              />
            </div>

            {/* University */}
            <div>
              <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
                University
              </label>
              <select
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="input-base"
                required
              >
                <option value="">Select your university</option>
                {UNIVERSITIES.map((uni) => (
                  <option key={uni} value={uni}>
                    {uni}
                  </option>
                ))}
              </select>
            </div>

            {/* Funding Type */}
            <div>
              <label htmlFor="fundingType" className="block text-sm font-medium text-gray-700 mb-2">
                Funding Type
              </label>
              <select
                id="fundingType"
                name="fundingType"
                value={formData.fundingType}
                onChange={handleChange}
                className="input-base"
                required
              >
                <option value="">Select funding type</option>
                {FUNDING_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          <Link href="/" className="hover:text-primary">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}