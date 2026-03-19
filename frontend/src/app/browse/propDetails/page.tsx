'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';

interface Property {
  _id: string;
  name: string;
  description: string;
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  location: {
    address: string;
    city: string;
    university: string;
  };
  images: string[];
  minPrice: number;
  maxPrice: number;
  propertyType: string;
  totalRooms: number;
  availableRooms: number;
  amenities: string[];
  NSFASAccredited: boolean;
  rating: number;
  reviewCount: number;
  leaseTerms: {
    minLeasePeriod: string;
    depositRequired: boolean;
    depositAmount?: number;
  };
}

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/properties/${propertyId}`);
        setProperty(response.data.data);
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Property not found'}</p>
          <Link href="/browse" className="text-primary hover:underline font-semibold">
            ← Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container py-4">
          <Link href="/browse" className="text-primary hover:underline font-semibold flex items-center gap-2">
            ← Back to Browse
          </Link>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <div className="card mb-8 overflow-hidden">
              {/* Main Image */}
              <div className="relative h-96 bg-gray-200">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[selectedImage]}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}

                {/* Badge */}
                {property.NSFASAccredited && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-semibold">
                    NSFAS Accredited
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {property.images && property.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-primary' : 'border-gray-300'
                      }`}
                    >
                      <img src={image} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="card p-6 mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{property.name}</h1>

              {/* Location & Rating */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b">
                <div>
                  <p className="text-gray-600 mb-2">
                    📍 {property.location.address}
                    <br />
                    {property.location.city} • {property.location.university}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex text-yellow-400 justify-end mb-2">
                    {'★'.repeat(Math.floor(property.rating))}
                    {'☆'.repeat(5 - Math.floor(property.rating))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {property.rating.toFixed(1)} • {property.reviewCount} reviews
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">About</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
                <div>
                  <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Property Type</p>
                  <p className="text-lg font-semibold text-gray-800 capitalize">{property.propertyType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Total Rooms</p>
                  <p className="text-lg font-semibold text-gray-800">{property.totalRooms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Available Rooms</p>
                  <p className="text-lg font-semibold text-primary">{property.availableRooms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Min Lease</p>
                  <p className="text-lg font-semibold text-gray-800 capitalize">{property.leaseTerms.minLeasePeriod}</p>
                </div>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <span className="text-primary text-xl">✓</span>
                        <span className="text-gray-700 capitalize">{amenity.replace('-', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Pricing Card */}
            <div className="card p-6 mb-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Pricing</h2>

              <div className="mb-6 pb-6 border-b">
                <p className="text-sm text-gray-500 mb-1">Monthly Rent</p>
                <p className="text-3xl font-bold text-primary">
                  R{property.minPrice.toLocaleString()}
                </p>
                {property.maxPrice > property.minPrice && (
                  <p className="text-sm text-gray-600 mt-1">
                    up to R{property.maxPrice.toLocaleString()}
                  </p>
                )}
              </div>

              {property.leaseTerms.depositRequired && (
                <div className="mb-6 pb-6 border-b">
                  <p className="text-sm text-gray-500 mb-1">Deposit</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {property.leaseTerms.depositAmount
                      ? `R${property.leaseTerms.depositAmount.toLocaleString()}`
                      : 'Required'}
                  </p>
                </div>
              )}

              <button className="w-full btn-primary py-3 font-semibold mb-3">
                Inquire Now
              </button>

              <button className="w-full btn-secondary py-3 font-semibold">
                Shortlist Property
              </button>
            </div>

            {/* Owner Card */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Property Manager</h2>

              <div className="mb-6 pb-6 border-b">
                <p className="text-lg font-semibold text-gray-800">{property.owner.name}</p>
              </div>

              <div className="space-y-3 mb-6">
                {property.owner.email && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <a
                      href={`mailto:${property.owner.email}`}
                      className="text-primary hover:underline font-semibold"
                    >
                      {property.owner.email}
                    </a>
                  </div>
                )}

                {property.owner.phone && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <a
                      href={`tel:${property.owner.phone}`}
                      className="text-primary hover:underline font-semibold"
                    >
                      {property.owner.phone}
                    </a>
                  </div>
                )}
              </div>

              <button className="w-full btn-primary py-2 font-semibold text-sm">
                Contact Manager
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}