"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

interface Property {
  _id: string;
  name: string;
  location: {
    city: string;
    university: string;
  };
  minPrice: number;
}

export default function RequestPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;
  const { user, isAuthenticated } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    moveInDate: '',
    leaseDuration: 'monthly',
    fundingType: 'private',
    message: '',
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/requests', {
        propertyId,
        moveInDate: formData.moveInDate,
        leaseDuration: formData.leaseDuration,
        fundingType: formData.fundingType,
        message: formData.message,
      });

      router.push('/dashboard?tab=requests');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to make a request</p>
          <Link href="/login" className="btn-primary px-6 py-2 inline-block font-semibold">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
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
      <div className="container py-8">
        <Link href={`/browse/${propertyId}`} className="text-primary hover:underline font-semibold mb-8 inline-block">
          ← Back to Property
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="card p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Make a Request</h1>
            <p className="text-gray-600 mb-6">
              Request to book at {property.name} • R{property.minPrice.toLocaleString()}/month
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Move In Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Move In Date
                </label>
                <input
                  type="date"
                  value={formData.moveInDate}
                  onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                  className="input-base w-full"
                  required
                />
              </div>

              {/* Lease Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lease Duration
                </label>
                <select
                  value={formData.leaseDuration}
                  onChange={(e) => setFormData({ ...formData, leaseDuration: e.target.value })}
                  className="input-base w-full"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="semester">Semester</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Funding Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Type
                </label>
                <select
                  value={formData.fundingType}
                  onChange={(e) => setFormData({ ...formData, fundingType: e.target.value })}
                  className="input-base w-full"
                  required
                >
                  <option value="NSFAS">NSFAS</option>
                  <option value="private">Private</option>
                  <option value="self-funded">Self-funded</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message to Manager (Optional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell the property manager about yourself..."
                  rows={4}
                  className="input-base w-full resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
