'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandlordMessagesPage() {
  const router = useRouter();

  useEffect(() => {
  router.replace('/landlord/dashboard');
  }, [router]);

  return null;
}