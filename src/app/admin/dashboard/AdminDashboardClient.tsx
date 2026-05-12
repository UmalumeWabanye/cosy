"use client";

import React from 'react';
import AdminErrorBoundary from '@/components/AdminErrorBoundary';
import AdminDashboardClientInner from './AdminDashboardClientInner';

export default function AdminDashboardClient(props: any) {
  return (
    <AdminErrorBoundary>
      <AdminDashboardClientInner {...props} />
    </AdminErrorBoundary>
  );
}
