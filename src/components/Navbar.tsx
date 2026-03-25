'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { HiLogout } from 'react-icons/hi';

const ROOM_TYPES = ['Single', 'Shared/Communal', 'Double', 'Studio'];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  const handleRoomTypeSelect = (roomType: string) => {
    setSelectedRoomType(roomType);
    router.push(`/browse?roomTypes=${roomType}`);
    setMobileMenuOpen(false);
  };

  // Don't show navbar on login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
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
              {/* Room Types Dropdown */}
              <div className="relative group">
                <button className="text-gray-600 hover:text-primary font-medium py-2">
                  Room Types ▼
                </button>
                <div className="absolute right-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  {ROOM_TYPES.map((roomType) => (
                    <button
                      key={roomType}
                      onClick={() => handleRoomTypeSelect(roomType)}
                      className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary first:rounded-t-lg last:rounded-b-lg"
                    >
                      {roomType}
                    </button>
                  ))}
                </div>
              </div>

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
                <div className="border-b py-2">
                  <p className="text-gray-600 font-medium mb-2">Room Types</p>
                  {ROOM_TYPES.map((roomType) => (
                    <button
                      key={roomType}
                      onClick={() => handleRoomTypeSelect(roomType)}
                      className="block w-full text-left px-2 py-1 text-gray-600 hover:text-primary"
                    >
                      {roomType}
                    </button>
                  ))}
                </div>
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
