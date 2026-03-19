'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
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
  const [loading, setLoading] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [error, setError] = useState('');
  const [property, setProperty] = useState<Property | null>(null);

  const propertyId = params.id as string;

  const [formData, setFormData] = useState({
    moveInDate: '',
    leaseDuration: 'monthly',
    fundingType: 'self-funded',
    message: '',
  });

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.moveInDate || !formData.leaseDuration || !formData.fundingType) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const moveInDate = new Date(formData.moveInDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (moveInDate < today) {
        setError('Move-in date cannot be in the past');
        setLoading(false);
        return;
      }

      const response = await api.post('/requests', {
        propertyId,
        moveInDate: formData.moveInDate,
        leaseDuration: formData.leaseDuration,
        fundingType: formData.fundingType,
        message: formData.message,
      });

      if (response.data.success) {
        router.push('/requests');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

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
            </div>
          </div>

          {/* Request Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Request</h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student Info Display */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Requested by</p>
                  <p className="text-lg font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>

                {/* Move-in Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Move-in Date *
                  </label>
                  <input
                    type="date"
                    name="moveInDate"
                    value={formData.moveInDate}
                    onChange={handleChange}
                    className="input-base w-full"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be today or later</p>
                </div>

                {/* Lease Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lease Duration *
                  </label>
                  <select
                    name="leaseDuration"
                    value={formData.leaseDuration}
                    onChange={handleChange}
                    className="input-base w-full"
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="semester">Semester (6 months)</option>
                    <option value="yearly">Yearly (12 months)</option>
                  </select>
                </div>

                {/* Funding Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Type *
                  </label>
                  <select
                    name="fundingType"
                    value={formData.fundingType}
                    onChange={handleChange}
                    className="input-base w-full"
                    required
                  >
                    <option value="self-funded">Self-funded</option>
                    <option value="private">Private Funding</option>
                    {property.nsfasAccreditation && (
                      <option value="NSFAS">NSFAS Funded</option>
                    )}
                  </select>
                  {property.nsfasAccreditation && formData.fundingType === 'NSFAS' && (
                    <p className="text-sm text-green-600 mt-2">✓ This property accepts NSFAS funding</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell the property owner about yourself, your needs, or ask any questions..."
                    rows={5}
                    className="input-base w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">This helps the owner make a decision</p>
                </div>

                {/* Submit */}
                <div className="border-t pt-6 flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary py-3 font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Sending Request...' : 'Send Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/browse/${propertyId}`)}
                    className="flex-1 btn-secondary py-3 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {/* Info Box */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Your request will be sent to the property owner</li>
                  <li>✓ They'll review your details and message</li>
                  <li>✓ You'll receive a notification when they respond</li>
                  <li>✓ If approved, you can proceed with booking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}