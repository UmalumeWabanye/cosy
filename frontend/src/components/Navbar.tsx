'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  // Don't show navbar on login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary">
            🏠 Cosy
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated ? (
              <>
                {/* Student Links */}
                {user?.role === 'student' && (
                  <>
                    <Link
                      href="/browse"
                      className={`font-semibold transition-colors ${
                        pathname === '/browse'
                          ? 'text-primary'
                          : 'text-gray-700 hover:text-primary'
                      }`}
                    >
                      Browse
                    </Link>
                    <Link
                      href="/requests"
                      className={`font-semibold transition-colors ${
                        pathname === '/requests'
                          ? 'text-primary'
                          : 'text-gray-700 hover:text-primary'
                      }`}
                    >
                      My Requests
                    </Link>
                  </>
                )}

                {/* Owner Links */}
                {user?.role === 'owner' && (
                  <>
                    <Link
                      href="/owner/properties"
                      className={`font-semibold transition-colors ${
                        pathname.includes('/owner')
                          ? 'text-primary'
                          : 'text-gray-700 hover:text-primary'
                      }`}
                    >
                      My Properties
                    </Link>
                    <Link
                      href="/owner/requests"
                      className={`font-semibold transition-colors ${
                        pathname === '/owner/requests'
                          ? 'text-primary'
                          : 'text-gray-700 hover:text-primary'
                      }`}
                    >
                      Requests
                    </Link>
                  </>
                )}

                {/* Common Links */}
                <Link
                  href="/dashboard"
                  className={`font-semibold transition-colors ${
                    pathname === '/dashboard'
                      ? 'text-primary'
                      : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  Dashboard
                </Link>

                {/* User Menu */}
                <div className="flex items-center gap-4 pl-4 border-l border-gray-300">
                  <span className="text-gray-700 font-medium">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary px-4 py-2 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/browse" className="text-gray-700 hover:text-primary font-semibold">
                  Browse
                </Link>
                <Link href="/login" className="btn-secondary px-4 py-2 font-semibold">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary px-4 py-2 font-semibold">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-primary"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'student' && (
                  <>
                    <Link
                      href="/browse"
                      className="block text-gray-700 hover:text-primary font-semibold p-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Browse
                    </Link>
                    <Link
                      href="/requests"
                      className="block text-gray-700 hover:text-primary font-semibold p-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Requests
                    </Link>
                  </>
                )}

                {user?.role === 'owner' && (
                  <>
                    <Link
                      href="/owner/properties"
                      className="block text-gray-700 hover:text-primary font-semibold p-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Properties
                    </Link>
                    <Link
                      href="/owner/requests"
                      className="block text-gray-700 hover:text-primary font-semibold p-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Requests
                    </Link>
                  </>
                )}

                <Link
                  href="/dashboard"
                  className="block text-gray-700 hover:text-primary font-semibold p-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full btn-secondary py-2 font-semibold text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/browse"
                  className="block text-gray-700 hover:text-primary font-semibold p-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse
                </Link>
                <Link
                  href="/login"
                  className="block btn-secondary py-2 font-semibold text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block btn-primary py-2 font-semibold text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
