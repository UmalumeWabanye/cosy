'use client';

import { useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { HiOutlineBookmark, HiBookmark } from 'react-icons/hi';

interface SaveButtonProps {
  propertyId: string;
  onSaveChange?: (isSaved: boolean) => void;
}

export default function SaveButton({
  propertyId,
  onSaveChange,
}: SaveButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!isAuthenticated) {
      // Redirect to login or show message
      return;
    }

    try {
      setLoading(true);

      if (isSaved) {
        // Remove from saved
        await api.delete(`/saved/${propertyId}`);
        setIsSaved(false);
        onSaveChange?.(false);
      } else {
        // Add to saved
        await api.post('/saved', { propertyId });
        setIsSaved(true);
        onSaveChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition-colors ${
        isSaved
          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isSaved ? (
        <>
          <HiBookmark className="w-5 h-5" />
          Saved
        </>
      ) : (
        <>
          <HiOutlineBookmark className="w-5 h-5" />
          Save
        </>
      )}
    </button>
  );
}
