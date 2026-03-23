'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/services/api';
import AccommodationRequestForm from '@/components/AccommodationRequestForm';

interface AccommodationRequestFormProps {
  propertyId: string;
  onSuccess: () => void;
}
const AccommodationRequestFormTyped = AccommodationRequestForm as React.ComponentType<AccommodationRequestFormProps>;

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
  const [propertyError, setPropertyError] = useState('');
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
        setPropertyError(err.response?.data?.message || 'Failed to load property');
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
          <p className="text-gray-600 text-lg mb-4">{propertyError || 'Property not found'}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Summary */}
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

              <p className="text-gray-600 mb-4">
                📍 {property.location.address}, {property.location.city}
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
                  <p className="text-sm text-green-700 font-semibold">✓ NSFAS Accredited</p>
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

              {/* Info Box */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Your request will be sent to the property owner</li>
                  <li>✓ They&apos;ll review your details and message</li>
                  <li>✓ You&apos;ll receive a notification when they respond</li>
                  <li>✓ If approved, you can proceed with booking</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Comprehensive Application Form */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Accommodation Application</h2>
              <AccommodationRequestFormTyped
                propertyId={propertyId}
                onSuccess={() => router.push('/requests')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}