'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Button from '@mui/material/Button';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { trackEvent } from '@/utils/analytics';

interface CampusPageViewTrackerProps {
  universityName: string;
  city?: string;
}

export function CampusPageViewTracker({ universityName, city }: CampusPageViewTrackerProps) {
  useEffect(() => {
    trackEvent('campus-page-view', {
      university: universityName,
      city,
    });
  }, [universityName, city]);

  return null;
}

interface CampusBrowseButtonProps {
  href: string;
  universityName: string;
  acronym: string;
}

export function CampusBrowseButton({ href, universityName, acronym }: CampusBrowseButtonProps) {
  const handleBrowseClick = () => {
    trackEvent('cta-click', {
      button: 'browse-campus-listings',
      university: universityName,
    });
  };

  return (
    <Link href={href}>
      <Button
        variant="contained"
        size="large"
        startIcon={<SchoolRoundedIcon />}
        onClick={handleBrowseClick}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 1.5,
          px: 4,
          fontSize: '1.1rem',
          textTransform: 'none',
        }}
      >
        Browse {acronym} Listings
      </Button>
    </Link>
  );
}
