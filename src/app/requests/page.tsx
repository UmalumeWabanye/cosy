'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/services/api';
import { MdLocationOn, MdAccessTime } from 'react-icons/md';
import { HiCheck, HiX } from 'react-icons/hi';

interface Request {
  _id: string;
  propertyId: {
    _id: string;
    name: string;
    images: string[];
    location: {
      city: string;
      address: string;
    };
    pricing: {
      minRent: number;
    };
  };
  moveInDate: string;
  leaseDuration: string;
  fundingType: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function RequestsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'student')) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/requests/my');
        setRequests(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRequests();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'student') {
    return null;
  }

  const filteredRequests =
    filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <MdAccessTime className="w-4 h-4" /> },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: <HiCheck className="w-4 h-4" /> },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: <HiX className="w-4 h-4" /> },
    };
    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Requests</h1>
              <p className="text-gray-600 mt-1">Track your accommodation requests</p>
            </div>
            <Link href="/browse" className="btn-primary px-6 py-3 font-semibold">
              + New Request
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
              }`}
            >
              {status === 'all'
                ? 'All Requests'
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-600 text-lg mb-6">
              {filter === 'all'
                ? 'No requests yet. Start by browsing properties!'
                : `No ${filter} requests.`}
            </p>
            <Link href="/browse" className="btn-primary px-6 py-3 inline-block font-semibold">
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRequests.map((request) => (
              <div key={request._id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
                  {/* Property Image */}
                  <div className="md:col-span-1">
                    {request.propertyId.images && request.propertyId.images.length > 0 ? (
                      <img
                        src={request.propertyId.images[0]}
                        alt={request.propertyId.name}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="md:col-span-2">
                    <Link href={`/browse/${request.propertyId._id}`}>
                      <h3 className="text-xl font-bold text-gray-800 hover:text-primary mb-2">
                        {request.propertyId.name}
                      </h3>
                    </Link>

                    <p className="text-gray-600 mb-4 flex items-center gap-2">
                      <MdLocationOn className="w-4 h-4 text-primary" />
                      <span>{request.propertyId.location.address}, {request.propertyId.location.city}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Monthly Rent</p>
                        <p className="text-lg font-bold text-primary">
                          R{request.propertyId.pricing.minRent.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Move-in Date</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {new Date(request.moveInDate).toLocaleDateString('en-ZA')}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 flex-wrap">
                      <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                        {request.leaseDuration === 'monthly'
                          ? 'Monthly'
                          : request.leaseDuration === 'semester'
                          ? 'Semester (6 months)'
                          : 'Yearly (12 months)'}
                      </span>
                      <span className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                        {request.fundingType === 'self-funded'
                          ? 'Self-funded'
                          : request.fundingType === 'private'
                          ? 'Private Funding'
                          : 'NSFAS'}
                      </span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="md:col-span-1 flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Status</p>
                      {getStatusBadge(request.status)}
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-2">
                        Requested on {new Date(request.createdAt).toLocaleDateString('en-ZA')}
                      </p>
                      {request.message && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-primary font-semibold hover:underline">
                            View Message
                          </summary>
                          <p className="mt-2 text-gray-700 bg-gray-50 p-2 rounded">{request.message}</p>
                        </details>
                      )}
                    </div>

                    <button
                      onClick={() => router.push(`/browse/${request.propertyId._id}`)}
                      className="btn-secondary py-2 text-sm font-semibold mt-4"
                    >
                      View Property
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}