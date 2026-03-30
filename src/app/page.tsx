'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [searchForm, setSearchForm] = useState({
    university: '',
    city: '',
    fundingType: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchForm.university) params.append('university', searchForm.university);
    if (searchForm.city) params.append('city', searchForm.city);
    router.push(`/browse?${params.toString()}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-24 px-4">
        <div className="container text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">
            Find Your Perfect Student Home
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Discover safe, affordable accommodation near your university. Browse verified listings from trusted property owners.
          </p>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">University</label>
                    <input
                      type="text"
                      name="university"
                      placeholder="e.g. UCT, Wits"
                      value={searchForm.university}
                      onChange={handleInputChange}
                      className="input-base w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Cape Town"
                      value={searchForm.city}
                      onChange={handleInputChange}
                      className="input-base w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Funding</label>
                    <select 
                      name="fundingType"
                      value={searchForm.fundingType}
                      onChange={handleInputChange}
                      className="input-base w-full"
                    >
                      <option value="">All types</option>
                      <option value="NSFAS">NSFAS</option>
                      <option value="Private">Private</option>
                      <option value="Self-funded">Self-funded</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="btn-primary w-full py-2.5 font-semibold">
                      Search
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose Cosy?</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="text-4xl mb-4">✓</div>
              <h4 className="font-bold text-lg mb-2">Verified Listings</h4>
              <p className="text-gray-600">All properties verified and reviewed</p>
            </div>
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h4 className="font-bold text-lg mb-2">Safe & Secure</h4>
              <p className="text-gray-600">Secure booking and payment process</p>
            </div>
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h4 className="font-bold text-lg mb-2">Real Reviews</h4>
              <p className="text-gray-600">Honest reviews from students</p>
            </div>
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="text-4xl mb-4">💰</div>
              <h4 className="font-bold text-lg mb-2">Best Prices</h4>
              <p className="text-gray-600">Direct from owners, no hidden fees</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container">
          <div className="mb-12">
            <h3 className="text-3xl font-bold mb-2">Featured Listings</h3>
            <p className="text-gray-600">Discover some of our most popular student accommodations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="card overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-48 flex items-center justify-center text-gray-400 text-sm">
                  Property Image {item}
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-lg mb-2">Student Home {item}</h4>
                  <p className="text-gray-600 mb-4">📍 Near University of Cape Town</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-yellow-400">★★★★★</span>
                    <span className="text-sm text-gray-600">(24 reviews)</span>
                  </div>
                  <p className="text-primary font-bold text-2xl mb-4">R{5000 * item}/month</p>
                  <Link href="/browse" className="btn-primary w-full py-2 text-center block">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/browse" className="btn-primary py-3 px-8 text-lg font-semibold">
              Browse All Listings
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-primary text-white py-16 px-4">
        <div className="container text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Find Your Home?</h3>
          <p className="text-lg mb-8 opacity-90">Join thousands of students who found their perfect accommodation on Cosy</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse" className="btn-base bg-white text-primary hover:bg-gray-100 font-semibold">
              Start Browsing
            </Link>
            <Link href="/register" className="btn-base bg-white/20 hover:bg-white/30 text-white border border-white font-semibold">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold text-lg mb-4">Cosy</h4>
              <p className="text-sm">Making student accommodation easy and affordable</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Browse</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/browse" className="hover:text-white transition">All Properties</Link></li>
                <li><a href="#" className="hover:text-white transition">NSFAS Accredited</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Cosy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
