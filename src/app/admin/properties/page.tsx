'use client';

import { useEffect } from 'react';

export default function AdminPropertiesPage() {
  useEffect(() => {
    window.location.replace('/landlord/properties');
  }, []);

  return null;
}
