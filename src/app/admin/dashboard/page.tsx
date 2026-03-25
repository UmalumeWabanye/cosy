'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/services/api';
import { MdAccessTime, MdAssignment } from 'react-icons/md';
import { HiCheck, HiX } from 'react-icons/hi';

interface Property {
  _id: string;
  name: string;
  location: {
    city: string;
    address: string;
  };
  pricing: {
    minRent: number;
    maxRent: number;
    deposit: number;
  };
  rooms: {
    total: number;
    available: number;
  };
  isActive: boolean;
  createdAt: string;
}

interface Request {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [propertiesRes, requestsRes] = await Promise.all([
          api.get('/admin/properties'),
          api.get('/requests')
        ]);
        setProperties(propertiesRes.data.data || []);
        setRequests(requestsRes.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoadingData(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchData();
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const approvedRequests = requests.filter(r => r.status === 'approved').length;
  const rejectedRequests = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">Manage properties and student requests</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="btn-secondary px-4 py-2 font-semibold"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <p className="text-gray-600 text-sm">Total Properties</p>
            <p className="text-4xl font-bold text-primary mt-2">{properties.length}</p>
          </div>
          <div className="card p-6">
            <p className="text-gray-600 text-sm">Active Properties</p>
            <p className="text-4xl font-bold text-secondary mt-2">
              {properties.filter((p) => p.isActive).length}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-gray-600 text-sm">Pending Requests</p>
            <p className="text-4xl font-bold text-yellow-600 mt-2">{pendingRequests}</p>
          </div>
          <div className="card p-6">
            <p className="text-gray-600 text-sm">Total Requests</p>
            <p className="text-4xl font-bold text-accent mt-2">{requests.length}</p>
          </div>
        </div>

        {/* Request Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/requests?status=pending" className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingRequests}</p>
              </div>
              <div className="text-4xl"><MdAccessTime className="w-10 h-10" /></div>
            </div>
          </Link>
          <Link href="/admin/requests?status=approved" className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Approved Requests</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{approvedRequests}</p>
              </div>
              <div className="text-4xl"><HiCheck className="w-10 h-10 text-green-600" /></div>
            </div>
          </Link>
          <Link href="/admin/requests?status=rejected" className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rejected Requests</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{rejectedRequests}</p>
              </div>
              <div className="text-4xl"><HiX className="w-10 h-10 text-red-600" /></div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex gap-3">
          <Link href="/admin/requests" className="btn-primary px-6 py-3 font-semibold rounded-lg flex items-center gap-2">
            <MdAssignment className="w-5 h-5" />
            <span>View All Requests</span>
          </Link>
          <Link href="/admin/properties/new" className="btn-secondary px-6 py-3 font-semibold rounded-lg">
            + Add Property
          </Link>
        </div>

        {/* Properties Table */}
        <div className="card mb-8">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-bold">Your Properties</h3>
            <Link href="/admin/properties/new" className="btn-primary px-4 py-2 text-sm font-semibold">
              + Add Property
            </Link>
          </div>

          {loadingData ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-4">No properties yet</p>
              <Link href="/admin/properties/new" className="text-primary hover:underline font-semibold">
                Create your first property
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rooms</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{property.name}</td>
                      <td className="px-6 py-4 text-gray-600">{property.location.city}</td>
                      <td className="px-6 py-4 font-semibold text-primary">
                        R{property.pricing.minRent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{property.rooms.available}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            property.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {property.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/properties/${property._id}`}
                            className="text-primary hover:underline text-sm font-semibold"
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/properties/${property._id}/edit`}
                            className="text-secondary hover:underline text-sm font-semibold"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
