'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!email) {
        setError('Please enter your email address');
        setLoading(false);
        return;
      }

      // In a real app, this would call a backend endpoint
      const response = await api.post('/auth/forgot-password', { email });

      if (response.data.success) {
        setSuccess('Password reset email sent! Check your inbox.');
        setSubmitted(true);
        setEmail('');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset email';
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
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Reset Password</h2>
          <p className="text-center text-gray-600 text-sm mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          )}

          {!submitted ? (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="input-base"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 mt-6 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                If an account exists with this email, you'll receive a password reset link shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSuccess('');
                }}
                className="text-primary font-semibold hover:opacity-80 transition-opacity"
              >
                Try another email
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Back to Login */}
          <p className="text-center text-gray-600">
            Remember your password?{' '}
            <Link href="/login" className="text-primary font-semibold hover:opacity-80 transition-opacity">
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          <Link href="/" className="hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
