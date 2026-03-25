'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';

interface PropertyData {
  _id: string;
  name: string;
  address: string;
  city: string;
  minPrice?: number;
  maxPrice?: number;
  amenities: string[];
  nsfasAccredited: boolean;
  averageRating: number;
  images: string[];
  roomTypes: Array<{
    type: string;
    pricePerMonth: number;
  }>;
}

export default function BrowsePage() {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    nsfasAccredited: false,
    city: '',
    search: '',
    sortBy: 'newest'
  });

  const getMinPrice = (property: PropertyData): number => {
    if (property.minPrice !== undefined) {
      return property.minPrice;
    }
    if (property.roomTypes && property.roomTypes.length > 0) {
      return Math.min(...property.roomTypes.map(rt => rt.pricePerMonth));
    }
    return 0;
  };

  const getMaxPrice = (property: PropertyData): number => {
    if (property.maxPrice !== undefined) {
      return property.maxPrice;
    }
    if (property.roomTypes && property.roomTypes.length > 0) {
      return Math.max(...property.roomTypes.map(rt => rt.pricePerMonth));
    }
    return 0;
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.nsfasAccredited) params.append('nsfasAccredited', 'true');
      if (filters.city) params.append('city', filters.city);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const response = await api.get(`/properties?${params.toString()}`);
      setProperties(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Filter Section */}
      <div className="sticky top-16 bg-white border-b border-neutral-200 shadow-sm z-40">
        <div className="container py-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-2">City</label>
              <input
                type="text"
                placeholder="Enter city"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="input-base text-sm w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-2">Min Price (R)</label>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="input-base text-sm w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-2">Max Price (R)</label>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="input-base text-sm w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-2">Sort</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="input-base text-sm w-full"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.nsfasAccredited}
                  onChange={(e) => setFilters({ ...filters, nsfasAccredited: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium text-neutral-900">NSFAS Only</span>
              </label>
            </div>

            <div>
              <button
                onClick={() => setFilters({
                  minPrice: '',
                  maxPrice: '',
                  nsfasAccredited: false,
                  city: '',
                  search: '',
                  sortBy: 'newest'
                })}
                className="btn-secondary w-full h-10 text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Student Accommodations</h1>
          <p className="text-neutral-600">
            {loading ? 'Loading...' : `${properties.length} properties found`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin">
              <div className="w-12 h-12 border-4 border-neutral-300 border-t-primary rounded-full"></div>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-lg text-neutral-600 mb-4">No properties found matching your criteria</p>
            <button
              onClick={() => setFilters({
                minPrice: '',
                maxPrice: '',
                nsfasAccredited: false,
                city: '',
                search: '',
                sortBy: 'newest'
              })}
              className="btn-primary"
            >
              Clear Filters and Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const minPrice = getMinPrice(property);
              const maxPrice = getMaxPrice(property);

              return (
                <Link
                  key={property._id}
                  href={`/property/${property._id}`}
                  className="card-interactive overflow-hidden group"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-neutral-200 to-neutral-300 overflow-hidden">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-3xl">🏢</span>
                      </div>
                    )}
                    
                    {property.nsfasAccredited && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        NSFAS ✓
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      className="absolute top-3 left-3 bg-white rounded-full p-2 hover:bg-neutral-100 transition text-xl"
                    >
                      🤍
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-neutral-900 mb-1 truncate">{property.name}</h3>
                    <p className="text-sm text-neutral-600 mb-3">📍 {property.city}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex text-yellow-400 text-sm">
                        {'⭐'.repeat(Math.round(property.averageRating) || 0)}
                      </div>
                      <span className="text-xs text-neutral-600">
                        {property.averageRating > 0 ? `${property.averageRating.toFixed(1)}` : 'No ratings'}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4 pb-4 border-b border-neutral-200">
                      <p className="text-2xl font-bold text-neutral-900">
                        R{minPrice.toLocaleString()}
                        <span className="text-sm text-neutral-600 font-normal">/month</span>
                      </p>
                      {maxPrice > minPrice && (
                        <p className="text-xs text-neutral-500">
                          up to R{maxPrice.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Room Types */}
                    {property.roomTypes && property.roomTypes.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-neutral-600 mb-2">Room Types:</p>
                        <div className="flex flex-wrap gap-2">
                          {property.roomTypes.map((rt, idx) => (
                            <span key={idx} className="badge badge-primary text-xs">
                              {rt.type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <button className="btn-primary w-full py-2 text-sm font-bold">
                      View Details
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
