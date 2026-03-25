'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { HiLogout, HiTrash } from 'react-icons/hi';

interface PropertyData {
  _id: string;
  name: string;
  address?: string;
  city: string;
  minPrice: number;
  maxPrice: number;
  amenities: string[];
  NSFASAccredited: boolean;
  images?: string[];
  roomTypes: Array<{
    type: string;
    pricePerMonth: number;
  }>;
}

interface SavedListing {
  _id: string;
  propertyId: PropertyData;
  notes: string;
  createdAt: string;
}

interface Request {
  _id: string;
  propertyId: PropertyData;
  moveInDate: string;
  leaseDuration: string;
  fundingType: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  firstName: string;
  lastName: string;
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
      setError('');
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
      setError('');
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

  const getMinPrice = (property: PropertyData) => {
    if (!property.roomTypes || property.roomTypes.length === 0) return 0;
    return Math.min(...property.roomTypes.map(rt => rt.pricePerMonth));
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

      {/* Main Content */}
      <div className="container py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {(['overview', 'saved', 'requests', 'profile'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold capitalize border-b-2 transition ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600 text-sm font-semibold mb-2">SAVED LISTINGS</p>
                <p className="text-3xl font-bold text-primary">{savedListings.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600 text-sm font-semibold mb-2">PENDING REQUESTS</p>
                <p className="text-3xl font-bold text-primary">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600 text-sm font-semibold mb-2">APPROVED REQUESTS</p>
                <p className="text-3xl font-bold text-primary">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Saved Listings</h2>
            {loadingData ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin mb-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : savedListings.length === 0 ? (
              <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-8 rounded text-center">
                <p className="mb-4">You haven't saved any listings yet.</p>
                <Link href="/browse" className="btn-primary px-6 py-2 inline-block">
                  Browse Properties
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedListings.map((listing) => (
                  <div key={listing._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                    {listing.propertyId.images && listing.propertyId.images[0] && (
                      <img
                        src={listing.propertyId.images[0]}
                        alt={listing.propertyId.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{listing.propertyId.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{listing.propertyId.city}</p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Price</p>
                          <p className="font-semibold text-primary">
                            R{getMinPrice(listing.propertyId).toLocaleString()}
                          </p>
                        </div>
                      </div>

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

        {activeTab === 'requests' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">My Requests</h2>
            {loadingData ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin mb-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-8 rounded text-center">
                <p className="mb-4">You haven't made any requests yet.</p>
                <Link href="/browse" className="btn-primary px-6 py-2 inline-block">
                  Browse Properties
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{request.propertyId.name}</h3>
                        <p className="text-sm text-gray-600">{request.propertyId.city}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Move-in Date</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(request.moveInDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Lease Duration</p>
                        <p className="font-semibold text-gray-800 capitalize">{request.leaseDuration}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Funding</p>
                        <p className="font-semibold text-gray-800">{request.fundingType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Price</p>
                        <p className="font-semibold text-primary">
                          R{getMinPrice(request.propertyId).toLocaleString()}
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

        {activeTab === 'profile' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <p className="text-gray-800">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <p className="text-gray-800">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <p className="text-gray-800 capitalize">{user.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">University</label>
                  <p className="text-gray-800">{user.university}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
