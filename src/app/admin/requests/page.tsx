'use client';

import { useEffect } from 'react';

export default function AdminRequestsPage() {
  useEffect(() => {
    window.location.replace('/landlord/requests');
  }, []);

  return null;
}
