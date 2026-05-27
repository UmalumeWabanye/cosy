import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'For Landlords | Cosy',
  description: 'List student accommodation, manage room allocations, and communicate with tenants from one platform.',
};

const landlordWins = [
  'Publish listings and target student demand near campus',
  'Track applications with clear pipeline visibility',
  'Manage room allocations and occupancy pressure',
  'Automated messaging and notifications for key tenancy events',
];

export default function ForLandlordsPage() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 20px 80px' }}>
      <section style={{ marginBottom: 34 }}>
        <p style={{ color: '#1565c0', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', fontSize: 12, marginBottom: 10 }}>
          Landlord Growth Platform
        </p>
        <h1 style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', lineHeight: 1.1, marginBottom: 14 }}>
          Fill rooms faster with better tenant workflow
        </h1>
        <p style={{ color: '#425466', fontSize: 18, lineHeight: 1.7, maxWidth: 760, marginBottom: 22 }}>
          Cosy helps landlords move from listing to allocation and ongoing tenant communication with fewer manual steps.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/register?role=landlord" style={{ background: '#1565c0', color: 'white', fontWeight: 700, padding: '12px 18px', borderRadius: 10, textDecoration: 'none' }}>
            Create Landlord Account
          </Link>
          <Link href="/landlord" style={{ border: '1px solid #c8d7e6', color: '#0f2237', fontWeight: 700, padding: '12px 18px', borderRadius: 10, textDecoration: 'none' }}>
            View Landlord Portal
          </Link>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 12 }}>
        {landlordWins.map((point) => (
          <article key={point} style={{ border: '1px solid #dde7f0', borderRadius: 12, padding: 16, background: 'white' }}>
            <p style={{ margin: 0, color: '#0f2237', lineHeight: 1.6 }}>{point}</p>
          </article>
        ))}
      </section>

      <section style={{ marginTop: 30, border: '1px solid #dce8f5', borderRadius: 14, padding: 18, background: '#f8fbff' }}>
        <h2 style={{ marginTop: 0 }}>Need to start quickly?</h2>
        <p style={{ color: '#425466', marginBottom: 0 }}>
          Start by publishing one listing and using allocation tools to monitor occupancy and tenant onboarding.
        </p>
      </section>
    </main>
  );
}
