'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import api from '@/services/api';
import { MdLocationOn, MdWifi, MdLocalParking, MdFitnessCenter, MdLocalLaundryService, MdKitchen, MdTv, MdNature, MdLock, MdShower, MdSatellite } from 'react-icons/md';
import { HiCheck } from 'react-icons/hi';

interface Property {
  _id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    university: string;
    postalCode: string;
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
  rating: number;
  reviewCount: number;
  reviews: any[];
  owner: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function PropertyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const propertyId = params.id as string;

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/properties/${propertyId}`);
        setProperty(response.data.data);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container text-center">
          <p className="text-gray-600 text-lg mb-4">{error || 'Property not found'}</p>
          <Link href="/browse" className="btn-primary px-4 py-2 inline-block">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/browse/${propertyId}/request`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/browse" className="text-primary hover:underline font-semibold">
            ← Back to Browse
          </Link>
          <button
            onClick={handleApplyClick}
            className="btn-primary px-6 py-2 font-semibold"
          >
            Apply Now
          </button>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="card overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <div>
                  <div className="relative bg-gray-200 h-96 overflow-hidden">
                    <img
                      src={property.images[activeImageIndex]}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {property.images.length > 1 && (
                    <div className="flex gap-2 p-4 overflow-x-auto">
                      {property.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            index === activeImageIndex
                              ? 'border-primary'
                              : 'border-gray-300 opacity-50 hover:opacity-75'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${property.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-96 flex items-center justify-center text-gray-400">
                  No images available
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About this property</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="card p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-2xl">
                        {amenity === 'WiFi' && <MdWifi className="w-6 h-6" />}
                        {amenity === 'Parking' && <MdLocalParking className="w-6 h-6" />}
                        {amenity === 'Gym' && <MdFitnessCenter className="w-6 h-6" />}
                        {amenity === 'Laundry' && <MdLocalLaundryService className="w-6 h-6" />}
                        {amenity === 'Kitchen' && <MdKitchen className="w-6 h-6" />}
                        {amenity === 'TV Lounge' && <MdTv className="w-6 h-6" />}
                        {amenity === 'Garden' && <MdNature className="w-6 h-6" />}
                        {amenity === 'Security' && <MdLock className="w-6 h-6" />}
                        {amenity === 'Water Heater' && <MdShower className="w-6 h-6" />}
                        {amenity === 'DSTV' && <MdSatellite className="w-6 h-6" />}
                      </span>
                      <span className="font-medium text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reviews</h2>
              {property.reviewCount > 0 ? (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div>
                      <p className="text-4xl font-bold text-gray-800">
                        {property.rating.toFixed(1)}
                      </p>
                      <div className="flex text-yellow-400 mt-1">
                        {'★'.repeat(Math.round(property.rating))}
                        {'☆'.repeat(5 - Math.round(property.rating))}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Based on {property.reviewCount} {property.reviewCount === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {property.reviews.map((review) => (
                      <div
                        key={review._id}
                        className="border-b border-gray-200 pb-4 last:border-0"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {review.student?.name || 'Anonymous'}
                            </p>
                            <div className="flex text-yellow-400 text-sm">
                              {'★'.repeat(review.rating)}
                              {'☆'.repeat(5 - review.rating)}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 text-sm">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No reviews yet</p>
                  <p className="text-sm text-gray-500">
                    Be the first to review this property after staying here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Quick Info Card */}
            <div className="card p-6 sticky top-24">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{property.name}</h1>

                <p className="text-gray-600 mb-4 flex items-start gap-2">
                  <MdLocationOn className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p>{property.location.address}</p>
                    <p className="text-sm">{property.location.city}</p>
                  </div>
                </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                <div className="flex text-yellow-400">
                  {'★'.repeat(Math.round(property.rating))}
                  {'☆'.repeat(5 - Math.round(property.rating))}
                </div>
                <span className="text-sm text-gray-600">
                  {property.rating.toFixed(1)} ({property.reviewCount})
                </span>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-lg mb-4">
                <p className="text-xs text-gray-600 mb-1">Monthly Rent Range</p>
                <p className="text-3xl font-bold text-primary mb-3">
                  R{property.pricing.minRent.toLocaleString()} - R{property.pricing.maxRent.toLocaleString()}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deposit:</span>
                    <span className="font-semibold text-gray-800">
                      R{property.pricing.deposit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Room Info */}
              <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600 mb-1">Available Rooms</p>
                  <p className="text-2xl font-bold text-primary">{property.rooms.available}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600 mb-1">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-800">{property.rooms.total}</p>
                </div>
              </div>

              {/* NSFAS Badge */}
              {property.nsfasAccreditation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm font-semibold text-green-700"><HiCheck className="inline-block mr-1 w-4 h-4" />NSFAS Accredited</p>
                  <p className="text-xs text-green-600 mt-1">Accepts NSFAS funding</p>
                </div>
              )}

              {/* Property Owner */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-xs text-gray-600 mb-2">Property Owner</p>
                <p className="font-semibold text-gray-800">{property.owner.name}</p>
                <p className="text-sm text-gray-600">{property.owner.email}</p>
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApplyClick}
                className="w-full btn-primary py-3 font-semibold rounded-lg mb-3"
              >
                Apply Now
              </button>

              <button
                onClick={() => router.push('/browse')}
                className="w-full btn-secondary py-2 font-medium rounded-lg"
              >
                Back to Browse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
