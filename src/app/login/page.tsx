"use client";

import React, { useState } from "react";
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      // Support two common response shapes used in this repo:
      // 1) { token, user: { id, email, role, ... } }
      // 2) { token, _id, email, name, role, ... }
      let token = data.token || data?.token;
      let user = null;

      if (data.user) {
        user = data.user;
      } else if (data._id) {
        user = {
          id: data._id,
          email: data.email,
          name: data.name,
          role: data.role,
          university: data.university,
          fundingType: data.fundingType,
        };
      }

      if (!token || !user) {
        // unexpected response
        console.error('Unexpected login response', data);
        alert('Login failed: unexpected response from server');
        return;
      }

      // Persist token and update global auth store
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);

      // Redirect based on role
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const message = err?.response?.data?.message || err.message || 'Login failed';
      alert(message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Cosy</h1>
          <p className="text-gray-600">Find Your Perfect Student Home</p>
        </div>

        <div className="card p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign in to your account</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-base"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-base"
              />
            </div>

            <button type="submit" className="w-full btn-primary py-3 mt-2 font-semibold">Sign In</button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Don't have an account? <a href="/register" className="text-primary font-semibold">Create one</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
