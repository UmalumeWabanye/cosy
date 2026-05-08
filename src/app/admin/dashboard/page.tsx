export const dynamic = 'force-dynamic';

import nextDynamic from 'next/dynamic';
import React from 'react';

const LoadingSkeleton = () => (
	<div className="min-h-screen flex items-start justify-center p-8">
		<div className="w-full max-w-6xl">
			<div className="animate-pulse grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<div className="h-24 bg-gray-200 rounded" />
				<div className="h-24 bg-gray-200 rounded" />
				<div className="h-24 bg-gray-200 rounded" />
				<div className="h-24 bg-gray-200 rounded" />
			</div>
			<div className="animate-pulse space-y-3">
				<div className="h-8 bg-gray-200 rounded w-1/3" />
				<div className="h-48 bg-gray-200 rounded" />
			</div>
		</div>
	</div>
);

const AdminDashboardClient = nextDynamic(
	() => import('./AdminDashboardClient.proxy.jsx').then((mod) => mod.default),
	{ ssr: false, loading: () => <LoadingSkeleton /> }
);

export default function AdminDashboardPage() {
	return <AdminDashboardClient />;
}
