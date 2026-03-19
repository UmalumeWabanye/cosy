'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { AlertCircle, Plus, Edit2, Trash2, Eye, EyeOff, Loader } from 'lucide-react';

interface Property {
  _id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    university: string;
  };
  pricing: {
    minRent: number;
    maxRent: number;
  };
  rooms: {
    total: number;
    available: number;
  };
  published: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams();
        if (filters.status !== 'all') params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        params.append('page', filters.page.toString());
        params.append('limit', filters.limit.toString());

        const response = await api.get(`/properties/admin/list?${params.toString()}`);

        setProperties(response.data.data);
        setPagination({
          total: response.data.total,
          pages: response.data.pages,
          currentPage: response.data.currentPage,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters]);

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      setDeletingId(id);
      await api.delete(`/properties/${id}`);
      setProperties(properties.filter((p) => p._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete property');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle publish/unpublish
  const handleTogglePublish = async (id: string) => {
    try {
      setTogglingId(id);
      const response = await api.patch(`/properties/${id}/publish`);
      
      setProperties(
        properties.map((p) =>
          p._id === id ? { ...p, published: response.data.data.published } : p
        )
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update property');
    } finally {
      setTogglingId(null);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Properties</h1>
            <p className="text-gray-600 mt-2">Manage and publish your accommodation listings</p>
          </div>
          <button
            onClick={() => router.push('/admin/properties/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <Plus size={20} />
            Add Property
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Properties</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name, city, or address..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin text-blue-600" size={40} />
          </div>
        )}

        {/* Properties Table */}
        {!loading && properties.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Property</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price Range</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rooms</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{property.name}</p>
                          <p className="text-sm text-gray-600 line-clamp-1">{property.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{property.location.city}</p>
                          <p className="text-gray-600">{property.location.university}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-gray-900">
                          R{property.pricing.minRent} - R{property.pricing.maxRent}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="text-gray-900">
                          {property.rooms.available} / {property.rooms.total}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {property.published ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                              <Eye size={14} />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                              <EyeOff size={14} />
                              Draft
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          {/* Publish/Unpublish Button */}
                          <button
                            onClick={() => handleTogglePublish(property._id)}
                            disabled={togglingId === property._id}
                            className={`p-2 rounded-lg transition ${
                              property.published
                                ? 'text-gray-600 hover:bg-gray-100'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={property.published ? 'Unpublish' : 'Publish'}
                          >
                            {togglingId === property._id ? (
                              <Loader size={18} className="animate-spin" />
                            ) : property.published ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => router.push(`/admin/properties/${property._id}/edit`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(property._id)}
                            disabled={deletingId === property._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === property._id ? (
                              <Loader size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {(filters.page - 1) * filters.limit + 1} to{' '}
                  {Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total} properties
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFilterChange('page', String(filters.page - 1))}
                    disabled={filters.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleFilterChange('page', String(filters.page + 1))}
                    disabled={filters.page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first property listing'}
            </p>
            {!filters.search && filters.status === 'all' && (
              <button
                onClick={() => router.push('/admin/properties/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition"
              >
                <Plus size={20} />
                Create Property
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}