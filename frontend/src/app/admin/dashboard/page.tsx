'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/services/api';

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

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoadingData(true);
        const response = await api.get('/admin/properties');
        setProperties(response.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load properties');
      } finally {
        setLoadingData(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchProperties();
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Cosy Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.name}</span>
            <button
              onClick={() => {
                localStorage.clear();
                router.push('/');
              }}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        <h2 className="text-3xl font-bold mb-8">Admin Dashboard</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <p className="text-gray-600 text-sm">Total Available Rooms</p>
            <p className="text-4xl font-bold text-accent mt-2">
              {properties.reduce((sum, p) => sum + p.rooms.available, 0)}
            </p>
          </div>
        </div>

        {/* Properties Table */}
        <div className="card">
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
