'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/services/api';
import { MdLocationOn } from 'react-icons/md';
import { HiCheck } from 'react-icons/hi';

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
    deposit: number;
  };
  images: string[];
  amenities: string[];
  nsfasAccreditation: boolean;
  rooms: {
    total: number;
    available: number;
  };
}

export default function RequestPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [error, setError] = useState('');
  const [property, setProperty] = useState<Property | null>(null);

  const propertyId = params.id as string;

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'student')) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoadingProperty(true);
        const response = await api.get(`/properties/${propertyId}`);
        setProperty(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load property');
      } finally {
        setLoadingProperty(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  if (isLoading || loadingProperty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'student') {
    return null;
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container text-center">
          <p className="text-gray-600 text-lg mb-4">Property not found</p>
          <Link href="/browse" className="btn-primary px-4 py-2">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container py-4">
          <Link href={`/browse/${propertyId}`} className="text-primary hover:underline font-semibold mb-4 inline-block">
            ← Back to Property
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Request Accommodation</h1>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Property Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              {property.images && property.images.length > 0 && (
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}

              <h2 className="text-2xl font-bold text-gray-800 mb-2">{property.name}</h2>

              <p className="text-gray-600 mb-4 flex items-center gap-2">
                <MdLocationOn className="w-4 h-4 text-primary inline-block" />
                <span>{property.location.address}, {property.location.city}</span>
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
                    <p className="text-2xl font-bold text-primary">
                      R{property.pricing.minRent.toLocaleString()} - R{property.pricing.maxRent.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Deposit</p>
                    <p className="text-xl font-bold text-gray-800">
                      R{property.pricing.deposit.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Available Rooms</p>
                    <p className="text-lg font-bold text-gray-800">{property.rooms.available}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Rooms</p>
                    <p className="text-lg font-bold text-gray-800">{property.rooms.total}</p>
                  </div>
                </div>
              </div>

              {property.nsfasAccreditation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-700 font-semibold"><HiCheck className="inline-block mr-1 w-4 h-4" />NSFAS Accredited</p>
                </div>
              )}

              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Placeholder */}
          <div className="lg:col-span-3">
            <div className="card p-8">
              <p className="text-gray-600">Accommodation request form coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
