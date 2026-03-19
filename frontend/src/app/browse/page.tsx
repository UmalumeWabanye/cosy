'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';

interface Property {
  _id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    university: string;
  };
  images: string[];
  minPrice: number;
  maxPrice: number;
  amenities: string[];
  NSFASAccredited: boolean;
  rating: number;
  reviewCount: number;
  availableRooms: number;
}

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    university: searchParams.get('university') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    NSFASAccredited: searchParams.get('NSFASAccredited') || 'false',
    page: 1,
    limit: 12,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
  });

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.city) params.append('city', filters.city);
        if (filters.university) params.append('university', filters.university);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.NSFASAccredited === 'true') params.append('NSFASAccredited', 'true');
        params.append('page', filters.page.toString());
        params.append('limit', filters.limit.toString());

        const response = await api.get(`/properties?${params.toString()}`);

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

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filter changes
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filters already update on change, so just need to handle any additional logic if needed
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container py-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Browse Accommodations</h1>
          <p className="text-gray-600">Find your perfect student home</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Filters</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Property name..."
                  className="input-base w-full"
                />
              </div>

              {/* City */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="e.g., Cape Town"
                  className="input-base w-full"
                />
              </div>

              {/* University */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University
                </label>
                <select
                  value={filters.university}
                  onChange={(e) => handleFilterChange('university', e.target.value)}
                  className="input-base w-full"
                >
                  <option value="">All Universities</option>
                  <option value="University of Cape Town">University of Cape Town</option>
                  <option value="Stellenbosch University">Stellenbosch University</option>
                  <option value="University of the Western Cape">University of the Western Cape</option>
                  <option value="Wits University">Wits University</option>
                  <option value="University of Johannesburg">University of Johannesburg</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (R)
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="0"
                  className="input-base w-full"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (R)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="10000"
                  className="input-base w-full"
                />
              </div>

              {/* NSFAS Accredited */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.NSFASAccredited === 'true'}
                    onChange={(e) => handleFilterChange('NSFASAccredited', e.target.checked ? 'true' : 'false')}
                    className="rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">NSFAS Accredited Only</span>
                </label>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() =>
                  setFilters({
                    search: '',
                    city: '',
                    university: '',
                    minPrice: '',
                    maxPrice: '',
                    NSFASAccredited: 'false',
                    page: 1,
                    limit: 12,
                  })
                }
                className="w-full btn-secondary py-2 text-sm font-medium"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Properties Grid */}
          <main className="lg:col-span-3">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
                <p className="text-gray-600 mt-4">Loading properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No properties found matching your criteria</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {properties.map((property) => (
                    <Link key={property._id} href={`/browse/${property._id}`}>
                      <div className="card hover:shadow-xl transition-all cursor-pointer h-full overflow-hidden">
                        {/* Image */}
                        <div className="relative h-48 bg-gray-200 overflow-hidden">
                          {property.images && property.images.length > 0 ? (
                            <img
                              src={property.images[0]}
                              alt={property.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No image available
                            </div>
                          )}

                          {/* Badge */}
                          {property.NSFASAccredited && (
                            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              NSFAS Accredited
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          {/* Name */}
                          <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">
                            {property.name}
                          </h3>

                          {/* Location */}
                          <p className="text-sm text-gray-600 mb-3">
                            📍 {property.location.city}, {property.location.university}
                          </p>

                          {/* Rating */}
                          <div className="flex items-center mb-3">
                            <div className="flex text-yellow-400">
                              {'★'.repeat(Math.floor(property.rating))}
                              {'☆'.repeat(5 - Math.floor(property.rating))}
                            </div>
                            <span className="text-sm text-gray-600 ml-2">
                              {property.rating.toFixed(1)} ({property.reviewCount})
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <p className="text-xs text-gray-500">From</p>
                              <p className="text-2xl font-bold text-primary">
                                R{property.minPrice.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Available</p>
                              <p className="text-lg font-semibold text-gray-700">
                                {property.availableRooms} room{property.availableRooms !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          {/* Amenities */}
                          {property.amenities && property.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {property.amenities.slice(0, 3).map((amenity) => (
                                <span key={amenity} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {amenity}
                                </span>
                              ))}
                              {property.amenities.length > 3 && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  +{property.amenities.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Button */}
                          <button className="w-full btn-primary py-2 text-sm font-semibold">
                            View Details
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleFilterChange('page', (Math.max(1, pagination.currentPage - 1)).toString())}
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>

                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handleFilterChange('page', page.toString())}
                        className={`px-4 py-2 rounded-lg ${
                          pagination.currentPage === page
                            ? 'bg-primary text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        handleFilterChange('page', (Math.min(pagination.pages, pagination.currentPage + 1)).toString())
                      }
                      disabled={pagination.currentPage === pagination.pages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}