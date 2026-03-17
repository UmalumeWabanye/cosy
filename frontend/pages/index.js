import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Cosy – Student Accommodation Marketplace</title>
        <meta
          name="description"
          content="Find quality, affordable student accommodation near your university."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
        {/* Nav */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-600">cosy</span>
          <div className="flex gap-3">
            <Link href="/auth/login" className="btn-secondary text-sm">
              Log in
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm">
              Sign up
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Find your perfect
            <span className="text-primary-600"> student home</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Browse NSFAS-accredited and private accommodation near South African
            universities — all in one place.
          </p>
          <Link
            href="/properties"
            className="btn-primary text-base px-8 py-3 rounded-xl"
          >
            Browse Accommodation
          </Link>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: '🏠',
              title: 'Quality Listings',
              desc: 'Verified accommodation with photos, amenities, and pricing.',
            },
            {
              icon: '✅',
              title: 'NSFAS Accredited',
              desc: 'Easily filter for NSFAS-approved properties.',
            },
            {
              icon: '📍',
              title: 'Near Your Campus',
              desc: 'Filter by distance from your university.',
            },
          ].map((f) => (
            <div key={f.title} className="card p-6 text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
