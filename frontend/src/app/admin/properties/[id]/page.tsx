'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/services/api';

interface RoomType {
  type: string;
  quantity: number;
  availableQuantity: number;
  pricePerMonth: number;
  description: string;
}

interface Property {
  _id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    postalCode: string;
    university: string;
  };
  pricing: {
    minRent: number;
    maxRent: number;
    deposit: number;
  };
  roomTypes: RoomType[];
  rooms: {
    total: number;
    available: number;
  };
  amenities: string[];
  images: string[];
  nsfasAccreditation: boolean;
  isActive: boolean;
  createdAt: string;
  owner: string;
}

export default function ViewPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const propertyId = params.id as string;

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/admin/properties/${propertyId}`);
        setProperty(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin' && propertyId) {
      fetchProperty();
    }
  }, [isAuthenticated, user, propertyId]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading property...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">Cosy Admin</h1>
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
        </nav>
        <div className="container py-8">
          <Link href="/admin/dashboard" className="text-primary hover:underline font-semibold mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="card p-6">
            <p className="text-red-700">{error || 'Property not found'}</p>
          </div>
        </div>
      </div>
    );
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
        <Link href="/admin/dashboard" className="text-primary hover:underline font-semibold mb-6 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="max-w-4xl">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">{property.name}</h2>
              <p className="text-gray-600">{property.location.address}, {property.location.city}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/properties/${property._id}/edit`}
                className="btn-primary px-4 py-2 text-sm font-semibold"
              >
                Edit Property
              </Link>
            </div>
          </div>

          {/* Images */}
          {property.images && property.images.length > 0 && (
            <div className="card mb-8 overflow-hidden">
              <div className="bg-gray-200 aspect-video flex items-center justify-center relative">
                {property.images[selectedImageIndex] ? (
                  <img
                    src={property.images[selectedImageIndex]}
                    alt="Property"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-gray-500">No image</p>
                )}
              </div>
              {property.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto bg-gray-50">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                        selectedImageIndex === index ? 'border-primary' : 'border-gray-300'
                      }`}
                    >
                      <img src={image} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                property.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {property.isActive ? 'Active' : 'Inactive'}
            </span>
            {property.nsfasAccreditation && (
              <span className="ml-2 px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                NSFAS Accredited
              </span>
            )}
          </div>

          {/* Description */}
          <div className="card p-6 mb-6">
            <h3 className="text-xl font-bold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Location */}
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4">Location</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Address</p>
                  <p className="font-medium">{property.location.address}</p>
                </div>
                <div>
                  <p className="text-gray-600">City</p>
                  <p className="font-medium">{property.location.city}</p>
                </div>
                {property.location.postalCode && (
                  <div>
                    <p className="text-gray-600">Postal Code</p>
                    <p className="font-medium">{property.location.postalCode}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">University</p>
                  <p className="font-medium">{property.location.university}</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4">Pricing</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Minimum Rent</p>
                  <p className="font-medium text-primary text-lg">R{property.pricing.minRent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Maximum Rent</p>
                  <p className="font-medium text-primary text-lg">R{property.pricing.maxRent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Deposit</p>
                  <p className="font-medium">R{property.pricing.deposit.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rooms */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">Rooms</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-600 text-sm">Total Rooms</p>
                <p className="text-3xl font-bold text-primary">{property.rooms.total}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Available Rooms</p>
                <p className="text-3xl font-bold text-secondary">{property.rooms.available}</p>
              </div>
            </div>

            {property.roomTypes && property.roomTypes.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-4">Room Types</h4>
                <div className="space-y-3">
                  {property.roomTypes.map((room, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{room.type}</span>
                        <span className="text-primary font-bold">R{room.pricePerMonth.toLocaleString()}/month</span>
                      </div>
                      <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                        <p>Quantity: {room.quantity}</p>
                        <p>Available: {room.availableQuantity}</p>
                      </div>
                      {room.description && (
                        <p className="text-sm text-gray-700 mt-2">{room.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <span className="text-primary text-lg">✓</span>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}