'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';

interface SaveButtonProps {
  propertyId: string;
  onSaveChange?: (isSaved: boolean) => void;
  size?: 'small' | 'medium' | 'large';
}

export default function SaveButton({
  propertyId,
  onSaveChange,
  size = 'small',
}: SaveButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadInitialState = async () => {
      if (!isAuthenticated || !propertyId) {
        if (!cancelled) {
          setIsSaved(false);
          setInitialized(true);
        }
        return;
      }

      try {
        const res = await api.get('/saved');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        const exists = data.some((entry: any) => {
          const id = typeof entry?.propertyId === 'string' ? entry.propertyId : entry?.propertyId?._id;
          return String(id) === String(propertyId);
        });

        if (!cancelled) setIsSaved(exists);
      } catch {
        if (!cancelled) setIsSaved(false);
      } finally {
        if (!cancelled) setInitialized(true);
      }
    };

    loadInitialState();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, propertyId]);

  const handleSave = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      router.push('/login');
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
    <Tooltip title={isSaved ? 'Remove from saved listings' : 'Save listing'}>
      <span>
        <IconButton
          onClick={handleSave}
          disabled={loading || !initialized}
          size={size}
          color={isSaved ? 'primary' : 'default'}
          aria-label={isSaved ? 'unsave listing' : 'save listing'}
        >
          {loading ? <CircularProgress size={16} /> : isSaved ? <BookmarkRoundedIcon /> : <BookmarkBorderRoundedIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
