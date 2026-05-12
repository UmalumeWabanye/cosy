'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { HiLogout } from 'react-icons/hi';

// Room types were removed from the navbar and moved to the search filters

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // no room type state here any more

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  // room type selection handled in search UI

  // Don't show navbar on login/signup pages or any admin pages
  if (pathname === '/login' || pathname === '/signup' || pathname.startsWith('/admin')) {
    return null;
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container py-4 px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          Cosy
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated && user && (
            <>
              <Link href="/saved-listings" className="text-gray-600 hover:text-primary font-medium">
                Saved
              </Link>
              <Link href="/requests" className="text-gray-600 hover:text-primary font-medium">
                Requests
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-primary font-medium">
                Dashboard
              </Link>
              <span className="text-gray-600 font-medium">{user.name}</span>
              <button
                onClick={handleLogout}
                className="btn-primary text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <HiLogout className="w-4 h-4" />
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && !isLoading && (
            <>
              <Link href="/login" className="text-gray-600 hover:text-primary font-medium">
                Login
              </Link>
              <Link href="/register" className="btn-primary text-white px-4 py-2 rounded">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-600"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-50 border-t">
          <div className="container py-4 px-4 flex flex-col gap-3">
            {isAuthenticated && user && (
              <>
                <Link href="/saved-listings" className="text-gray-600 hover:text-primary py-2 font-medium">
                  Saved
                </Link>
                <Link href="/requests" className="text-gray-600 hover:text-primary py-2 font-medium">
                  Requests
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-primary py-2 font-medium">
                  Dashboard
                </Link>
                <span className="text-gray-600 py-2 font-medium">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="btn-primary text-white px-4 py-2 rounded flex items-center gap-2 justify-center"
                >
                  <HiLogout className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && !isLoading && (
              <>
                <Link href="/login" className="text-gray-600 hover:text-primary py-2 font-medium">
                  Login
                </Link>
                <Link href="/register" className="btn-primary text-white px-4 py-2 rounded text-center font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
