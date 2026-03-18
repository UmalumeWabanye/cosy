'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="container py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Cosy</h1>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-black">
              Login
            </Link>
            <Link href="/register" className="btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-5xl font-bold mb-6">Find Your Perfect Student Home</h2>
        <p className="text-xl text-gray-600 mb-8">
          Discover affordable accommodation near your university
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-gray-50 p-6 rounded-lg shadow-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="University"
                className="input-base"
              />
              <input
                type="text"
                placeholder="City"
                className="input-base"
              />
              <select className="input-base">
                <option>Funding Type</option>
                <option>NSFAS</option>
                <option>Private</option>
                <option>Self-funded</option>
              </select>
            </div>
            <button className="btn-primary w-full py-3">Search Accommodation</button>
          </div>
        </div>

        {/* Featured Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold mb-8">Featured Listings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="card overflow-hidden">
                <div className="bg-gray-200 h-48 flex items-center justify-center">
                  <span className="text-gray-400">Image Placeholder</span>
                </div>
                <div className="p-4">
                  <h4 className="font-bold mb-2">Accommodation {item}</h4>
                  <p className="text-gray-600 mb-4">Near University of Cape Town</p>
                  <p className="text-primary font-bold text-lg mb-4">R{5000 * item}/month</p>
                  <button className="btn-primary w-full py-2">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}