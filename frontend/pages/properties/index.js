import Head from 'next/head';
import { useState } from 'react';
import { useProperties } from '../../hooks/useProperties';
import PropertyCard from '../../components/properties/PropertyCard';

export default function PropertiesPage() {
  const [filters, setFilters] = useState({});
  const { data, isLoading, isError } = useProperties(filters);

  return (
    <>
      <Head>
        <title>Browse Accommodation – Cosy</title>
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Find Accommodation
        </h1>

        {/* TODO: Add SearchFilterBar component */}

        {isLoading && (
          <p className="text-gray-500 text-center py-16">Loading listings…</p>
        )}
        {isError && (
          <p className="text-red-500 text-center py-16">
            Failed to load listings. Please try again.
          </p>
        )}

        {data && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {data.total} properties found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
