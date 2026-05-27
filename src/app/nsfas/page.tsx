import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'NSFAS Accommodation | Cosy',
  description: 'Explore NSFAS-friendly student accommodation with transparent pricing and campus-focused search.',
};

const nsfasBenefits = [
  'Quickly filter for NSFAS-friendly and accredited options',
  'Compare estimated monthly cost before applying',
  'Track approval, allocation, and move-in progress in one place',
  'Get in-app reminders and updates for key application events',
];

export default function NsfasPage() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 20px 80px' }}>
      <section style={{ marginBottom: 34 }}>
        <p style={{ color: '#1565c0', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', fontSize: 12, marginBottom: 10 }}>
          NSFAS-Focused Discovery
        </p>
        <h1 style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', lineHeight: 1.1, marginBottom: 14 }}>
          Find NSFAS-friendly student accommodation with confidence
        </h1>
        <p style={{ color: '#425466', fontSize: 18, lineHeight: 1.7, maxWidth: 760, marginBottom: 22 }}>
          Use Cosy to identify funding-aligned housing options near your university, compare costs, and apply faster.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/browse?fundingType=nsfas&source=nsfas-landing" style={{ background: '#1565c0', color: 'white', fontWeight: 700, padding: '12px 18px', borderRadius: 10, textDecoration: 'none' }}>
            Browse NSFAS Listings
          </Link>
          <Link href="/for-students" style={{ border: '1px solid #c8d7e6', color: '#0f2237', fontWeight: 700, padding: '12px 18px', borderRadius: 10, textDecoration: 'none' }}>
            Student Guide
          </Link>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 12 }}>
        {nsfasBenefits.map((point) => (
          <article key={point} style={{ border: '1px solid #dde7f0', borderRadius: 12, padding: 16, background: 'white' }}>
            <p style={{ margin: 0, color: '#0f2237', lineHeight: 1.6 }}>{point}</p>
          </article>
        ))}
      </section>

      <section style={{ marginTop: 30, border: '1px solid #dce8f5', borderRadius: 14, padding: 18, background: '#f8fbff' }}>
        <h2 style={{ marginTop: 0 }}>Helpful tip</h2>
        <p style={{ color: '#425466', marginBottom: 0 }}>
          Save your search once your filters are right so you can receive digest alerts when new matching options appear.
        </p>
      </section>
    </main>
  );
}
