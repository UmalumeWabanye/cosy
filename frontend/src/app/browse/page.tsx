'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';

const AMENITIES = [
  'WiFi',
  'Parking',
  'Gym',
  'Laundry',
  'Kitchen',
  'TV Lounge',
  'Garden',
  'Security',
  'DSTV',
  'Water Heater',
];

const ROOM_TYPES = ['Single', 'Shared/Communal', 'Double', 'Studio'];

const UNIVERSITIES = [
  'University of Cape Town',
  'Stellenbosch University',
  'University of the Western Cape',
  'University of Johannesburg',
  'University of Pretoria',
  'Wits University',
  'University of KwaZulu-Natal',
  'North West University',
  'University of Free State',
  'Rhodes University',
];

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
  pricing: {
    minRent: number;
    maxRent: number;
  };
  amenities: string[];
  nsfasAccreditation: boolean;
  rating: number;
  reviewCount: number;
  rooms: {
    available: number;
  };
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
    amenities: (searchParams.get('amenities') || '').split(',').filter(Boolean),
    roomTypes: (searchParams.get('roomTypes') || '').split(',').filter(Boolean),
    nsfasAccredited: searchParams.get('nsfasAccredited') === 'true',
    sortBy: searchParams.get('sortBy') || 'newest',
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
        if (filters.amenities.length > 0) params.append('amenities', filters.amenities.join(','));
        if (filters.roomTypes.length > 0) params.append('roomTypes', filters.roomTypes.join(','));
        if (filters.nsfasAccredited) params.append('nsfasAccredited', 'true');
        params.append('sortBy', filters.sortBy);
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

  const handleFilterChange = (key: string, value: string | boolean | string[]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
      page: 1,
    }));
  };

  const handleRoomTypeToggle = (roomType: string) => {
    setFilters((prev) => ({
      ...prev,
      roomTypes: prev.roomTypes.includes(roomType)
        ? prev.roomTypes.filter((rt) => rt !== roomType)
        : [...prev.roomTypes, roomType],
      page: 1,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      city: '',
      university: '',
      minPrice: '',
      maxPrice: '',
      amenities: [],
      roomTypes: [],
      nsfasAccredited: false,
      sortBy: 'newest',
      page: 1,
      limit: 12,
    });
  };

  const activeFilterCount = [
    filters.search,
    filters.city,
    filters.university,
    filters.minPrice,
    filters.maxPrice,
    filters.nsfasAccredited,
    ...filters.amenities,
    ...filters.roomTypes,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container py-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Browse Accommodations</h1>
          <p className="text-gray-600">Find your perfect student home</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>

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
                  {UNIVERSITIES.map((uni) => (
                    <option key={uni} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (R)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="Min"
                    className="input-base w-1/2"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="input-base w-1/2"
                  />
                </div>
              </div>

              {/* Room Types */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Room Types
                </label>
                <div className="space-y-2">
                  {ROOM_TYPES.map((roomType) => (
                    <label key={roomType} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.roomTypes.includes(roomType)}
                        onChange={() => handleRoomTypeToggle(roomType)}
                        className="rounded w-4 h-4 text-primary"
                      />
                      <span className="ml-3 text-sm text-gray-700">{roomType}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Amenities
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {AMENITIES.map((amenity) => (
                    <label key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="rounded w-4 h-4 text-primary"
                      />
                      <span className="ml-3 text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* NSFAS Accredited */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.nsfasAccredited}
                    onChange={(e) => handleFilterChange('nsfasAccredited', e.target.checked)}
                    className="rounded w-4 h-4 text-primary"
                  />
                  <span className="ml-3 text-sm text-gray-700 font-medium">NSFAS Accredited Only</span>
                </label>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="input-base w-full"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="available">Most Available</option>
                </select>
              </div>

              {/* Reset Filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="w-full btn-secondary py-2 text-sm font-medium"
                >
                  Reset Filters
                </button>
              )}
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
                <p className="text-gray-600 text-lg mb-4">No properties found matching your criteria</p>
                <button
                  onClick={resetFilters}
                  className="btn-primary px-4 py-2 text-sm font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {(filters.page - 1) * filters.limit + 1}-{Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total} properties
                </div>

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

                          {/* Badges */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2">
                            {property.nsfasAccreditation && (
                              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                NSFAS
                              </div>
                            )}
                            {property.rooms.available === 0 && (
                              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                Full
                              </div>
                            )}
                          </div>
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
                                R{property.pricing.minRent.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Available</p>
                              <p className="text-lg font-semibold text-gray-700">
                                {property.rooms.available} room{property.rooms.available !== 1 ? 's' : ''}
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
                          <button className="w-full btn-primary py-2 text-sm font-semibold hover:opacity-90">
                            View Details
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleFilterChange('page', Math.max(1, pagination.currentPage - 1).toString())}
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium"
                    >
                      ← Previous
                    </button>

                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const startPage = Math.max(1, pagination.currentPage - 2);
                      return startPage + i;
                    }).map((page) => (
                      <button
                        key={page}
                        onClick={() => handleFilterChange('page', page.toString())}
                        className={`px-4 py-2 rounded-lg font-medium ${
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
                        handleFilterChange('page', Math.min(pagination.pages, pagination.currentPage + 1).toString())
                      }
                      disabled={pagination.currentPage === pagination.pages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium"
                    >
                      Next →
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