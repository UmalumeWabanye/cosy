import Link from 'next/link';
import useAuthStore from '../../context/authStore';

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary-600">
          cosy
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/properties"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Browse
          </Link>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
                  Admin
                </Link>
              )}
              <button
                onClick={clearAuth}
                className="btn-secondary text-sm"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-secondary text-sm">
                Log in
              </Link>
              <Link href="/auth/register" className="btn-primary text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
