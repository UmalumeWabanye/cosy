'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

interface SavedListing {
  _id: string;
  propertyId: {
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
    };
    images: string[];
    rating: number;
    reviewCount: number;
    rooms: {
      available: number;
      total: number;
    };
    nsfasAccreditation: boolean;
  };
  notes: string;
  createdAt: string;
}

export default function SavedListingsPage() {
  const router = useRouter();
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    fetchSavedListings();
  }, []);

  const fetchSavedListings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/saved');
      
      if (response.data.success) {
        setSavedListings(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load saved listings');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this saved listing?')) return;

    try {
      const response = await api.delete(`/saved/${id}`);
      
      if (response.data.success) {
        setSavedListings(savedListings.filter((listing) => listing._id !== id));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove listing');
    }
  };

  const handleEditNotes = async (id: string) => {
    try {
      const response = await api.patch(`/saved/${id}`, { notes: editNotes });
      
      if (response.data.success) {
        setSavedListings(
          savedListings.map((listing) =>
            listing._id === id ? { ...listing, notes: editNotes } : listing
          )
        );
        setEditingId(null);
        setEditNotes('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update notes');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Listings</h1>
          <p className="text-gray-600">
            {savedListings.length} {savedListings.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your saved listings...</p>
          </div>
        ) : savedListings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved listings yet</h3>
            <p className="text-gray-600 mb-6">
              Browse properties and save your favorites to keep track of them.
            </p>
            <Link
              href="/browse"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {savedListings.map((listing) => (
              <div key={listing._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
                  <div className="md:col-span-1">
                    {listing.propertyId.images && listing.propertyId.images[0] ? (
                      <img
                        src={listing.propertyId.images[0]}
                        alt={listing.propertyId.name}
                        className="w-full h-48 object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Link
                      href={`/browse/${listing.propertyId._id}`}
                      className="text-lg font-bold text-blue-600 hover:text-blue-800 mb-2 block"
                    >
                      {listing.propertyId.name}
                    </Link>

                    <p className="text-sm text-gray-600 mb-3">
                      {listing.propertyId.location.address}, {listing.propertyId.location.city}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm mb-4">
                      <div>
                        <span className="font-semibold">Rent:</span>
                        <span className="ml-2">
                          R{listing.propertyId.pricing.minRent?.toLocaleString()} - R
                          {listing.propertyId.pricing.maxRent?.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Available:</span>
                        <span className="ml-2">{listing.propertyId.rooms.available} / {listing.propertyId.rooms.total}</span>
                      </div>
                      {listing.propertyId.nsfasAccreditation && (
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                          NSFAS Accredited
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold">{listing.propertyId.rating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">
                        ({listing.propertyId.reviewCount} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-1 border-l pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Notes</h4>
                    
                    {editingId === listing._id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add personal notes..."
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditNotes(listing._id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditNotes('');
                            }}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs font-semibold py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {listing.notes ? (
                          <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-2 rounded">
                            {listing.notes}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 mb-3 italic">No notes added</p>
                        )}
                        <button
                          onClick={() => {
                            setEditingId(listing._id);
                            setEditNotes(listing.notes || '');
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold mb-2 block"
                        >
                          Edit Notes
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => handleRemove(listing._id)}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-3 rounded text-sm transition-colors"
                    >
                      Remove
                    </button>

                    <Link
                      href={`/browse/${listing.propertyId._id}`}
                      className="block w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded text-sm text-center transition-colors"
                    >
                      View Property
                    </Link>
                  </div>
                </div>

                <div className="px-6 py-2 bg-gray-50 border-t text-xs text-gray-500">
                  Saved on {new Date(listing.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
