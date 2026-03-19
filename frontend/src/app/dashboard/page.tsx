'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface SavedListing {
  _id: string;
  propertyId: {
    _id: string;
    name: string;
    location: {
      city: string;
      university: string;
    };
    images: string[];
    minPrice: number;
    maxPrice: number;
    amenities: string[];
    NSFASAccredited: boolean;
  };
  notes: string;
  createdAt: string;
}

interface Request {
  _id: string;
  propertyId: {
    _id?: string;
    name: string;
    location: {
      address: string;
      city: string;
    };
    minPrice: number;
  };
  moveInDate: string;
  leaseDuration: string;
  fundingType: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

type Tab = 'overview' | 'saved' | 'requests' | 'profile';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  // Fetch saved listings
  const fetchSavedListings = async () => {
    try {
      setLoadingData(true);
      const response = await api.get('/saved');
      setSavedListings(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load saved listings');
    } finally {
      setLoadingData(false);
    }
  };

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setLoadingData(true);
      const response = await api.get('/requests/my');
      setRequests(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedListings();
    } else if (activeTab === 'requests') {
      fetchRequests();
    }
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleRemoveSaved = async (id: string) => {
    try {
      await api.delete(`/saved/${id}`);
      setSavedListings(savedListings.filter((item) => item._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove saved listing');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            Cosy
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">{user.name}</span>
            <button onClick={handleLogout} className="btn-secondary px-4 py-2 text-sm font-medium">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {user.name}! 👋</h1>
          <p className="text-gray-600">
            Studying at {user.university} • Funding: {user.fundingType}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border-b border-gray-200 mb-8">
          <div className="container flex gap-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'saved', label: 'Saved Listings' },
              { id: 'requests', label: 'My Requests' },
              { id: 'profile', label: 'Profile' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`py-4 px-2 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Your Profile</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-800">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">University</p>
                  <p className="font-semibold text-gray-800">{user.university}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Funding Type</p>
                  <p className="font-semibold text-gray-800">{user.fundingType}</p>
                </div>
              </div>
              <button className="btn-primary w-full py-2 mt-4 text-sm font-semibold">
                Edit Profile
              </button>
            </div>

            {/* Stats */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Statistics</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <p className="text-sm text-gray-600">Saved Listings</p>
                  <p className="text-3xl font-bold text-primary">{savedListings.length}</p>
                </div>
                <div className="border-l-4 border-secondary pl-4">
                  <p className="text-sm text-gray-600">Active Requests</p>
                  <p className="text-3xl font-bold text-secondary">
                    {requests.filter((r) => r.status === 'pending').length}
                  </p>
                </div>
                <div className="border-l-4 border-accent pl-4">
                  <p className="text-sm text-gray-600">Verified Status</p>
                  <p className="text-3xl font-bold text-accent">{user.verifiedStudent ? '✓' : '✗'}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/browse"
                  className="block btn-primary text-center py-2 rounded font-semibold text-sm"
                >
                  Browse Accommodation
                </Link>
                <button
                  onClick={() => setActiveTab('saved')}
                  className="block w-full btn-secondary text-center py-2 rounded font-semibold text-sm"
                >
                  View Saved ({savedListings.length})
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="block w-full btn-secondary text-center py-2 rounded font-semibold text-sm"
                >
                  My Requests ({requests.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Listings Tab */}
        {activeTab === 'saved' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Saved Listings</h2>
            {loadingData ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin mb-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
                <p className="text-gray-600">Loading saved listings...</p>
              </div>
            ) : savedListings.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-gray-600 text-lg mb-4">No saved listings yet</p>
                <Link href="/browse" className="btn-primary px-6 py-2 inline-block font-semibold">
                  Start Browsing
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedListings.map((listing) => (
                  <div key={listing._id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Image */}
                    <div className="relative h-40 bg-gray-200">
                      {listing.propertyId.images && listing.propertyId.images.length > 0 ? (
                        <img
                          src={listing.propertyId.images[0]}
                          alt={listing.propertyId.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                      {listing.propertyId.NSFASAccredited && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          NSFAS
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2 truncate">
                        {listing.propertyId.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        📍 {listing.propertyId.location.city}
                      </p>
                      <p className="text-xl font-bold text-primary mb-3">
                        R{listing.propertyId.minPrice.toLocaleString()}
                      </p>
                      {listing.notes && (
                        <p className="text-xs text-gray-600 mb-3 italic">"{listing.notes}"</p>
                      )}
                      <div className="flex gap-2">
                        <Link
                          href={`/browse/${listing.propertyId._id}`}
                          className="flex-1 btn-primary text-center py-2 rounded text-sm font-semibold"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleRemoveSaved(listing._id)}
                          className="flex-1 btn-secondary py-2 rounded text-sm font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">My Requests</h2>
            {loadingData ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin mb-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
                <p className="text-gray-600">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-gray-600 text-lg mb-4">No requests yet</p>
                <Link href="/browse" className="btn-primary px-6 py-2 inline-block font-semibold">
                  Find Accommodation
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request._id} className="card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {request.propertyId.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          📍 {request.propertyId.location.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            request.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : request.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Move In</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(request.moveInDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Duration</p>
                        <p className="font-semibold text-gray-800 capitalize">{request.leaseDuration}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Funding</p>
                        <p className="font-semibold text-gray-800">{request.fundingType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Price</p>
                        <p className="font-semibold text-primary">
                          R{request.propertyId.minPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/browse/${request.propertyId._id}`}
                        className="btn-primary px-4 py-2 rounded text-sm font-semibold"
                      >
                        View Property
                      </Link>
                      {request.status === 'approved' && (
                        <button className="btn-secondary px-4 py-2 rounded text-sm font-semibold">
                          Contact Manager
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h2>
            <div className="card p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="input-base w-full"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="input-base w-full"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                  <input
                    type="text"
                    defaultValue={user.university}
                    className="input-base w-full"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Funding Type</label>
                  <input
                    type="text"
                    defaultValue={user.fundingType}
                    className="input-base w-full"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500">Profile editing coming soon...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}