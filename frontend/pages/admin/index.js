import Head from 'next/head';

export default function AdminDashboard() {
  return (
    <>
      <Head>
        <title>Admin Dashboard – Cosy</title>
      </Head>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Admin Dashboard
        </h1>
        <p className="text-gray-500">
          Property management and request handling — coming soon.
        </p>
      </main>
    </>
  );
}
