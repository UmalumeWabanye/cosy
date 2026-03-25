'use client';

import Link from 'next/link';
import { useState } from 'react';
import api from '@/services/api';

interface SavedListingCardProps {
  listing: {
    _id: string;
    propertyId: {
      _id: string;
      name: string;
      location: {
        address: string;
        city: string;
      };
      pricing: {
        minRent: number;
        maxRent: number;
      };
      images: string[];
      rating: number;
      reviewCount: number;
      nsfasAccreditation: boolean;
    };
    notes: string;
    createdAt: string;
  };
  onRemove: (id: string) => void;
  onUpdate: (id: string, notes: string) => void;
}

export default function SavedListingsCard({
  listing,
  onRemove,
  onUpdate,
}: SavedListingCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(listing.notes || '');

  const handleSaveNotes = async () => {
    try {
      await api.patch(`/saved/${listing._id}`, { notes: editNotes });
      onUpdate(listing._id, editNotes);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update notes:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        {/* Image */}
        <div className="md:col-span-1">
          <img
            src={listing.propertyId.images?.[0] || '/placeholder.jpg'}
            alt={listing.propertyId.name}
            className="w-full h-48 object-cover rounded"
          />
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-3">
          <Link
            href={`/browse/${listing.propertyId._id}`}
            className="text-lg font-bold text-blue-600 hover:text-blue-800"
          >
            {listing.propertyId.name}
          </Link>

          <p className="text-sm text-gray-600">
            {listing.propertyId.location.address}, {listing.propertyId.location.city}
          </p>

          <div className="flex gap-4 text-sm">
            <div>
              <span className="font-semibold">Rent:</span>
              <span className="ml-2">
                R{listing.propertyId.pricing.minRent?.toLocaleString()} - R
                {listing.propertyId.pricing.maxRent?.toLocaleString()}
              </span>
            </div>
            {listing.propertyId.nsfasAccreditation && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                NSFAS
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-yellow-500">★</span>
            <span className="font-semibold">
              {listing.propertyId.rating?.toFixed(1) || '0.0'}
            </span>
            <span className="text-gray-500 text-sm">
              ({listing.propertyId.reviewCount || 0} reviews)
            </span>
          </div>
        </div>

        {/* Notes & Actions */}
        <div className="md:col-span-1 border-l pl-4">
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Notes</h4>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes..."
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                rows={3}
              />
              <div className="flex gap-1">
                <button
                  onClick={handleSaveNotes}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-300 text-gray-800 text-xs py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {listing.notes ? (
                <p className="text-sm text-gray-700 mb-2 bg-gray-50 p-2 rounded">
                  {listing.notes}
                </p>
              ) : (
                <p className="text-xs text-gray-400 mb-2 italic">No notes</p>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold block mb-2"
              >
                Edit
              </button>
            </>
          )}

          <button
            onClick={() => onRemove(listing._id)}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-3 rounded text-sm mb-2"
          >
            Remove
          </button>

          <Link
            href={`/browse/${listing.propertyId._id}`}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded text-sm text-center"
          >
            View
          </Link>
        </div>
      </div>

      <div className="px-6 py-2 bg-gray-50 border-t text-xs text-gray-500">
        Saved on {new Date(listing.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
