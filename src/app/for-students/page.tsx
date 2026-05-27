import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'For Students | Cosy',
  description: 'Find verified student accommodation near campus with fast applications and clear next steps.',
};

const points = [
  'Personalized search by campus, budget, room type, and NSFAS support',
  'Application timeline with blockers and next-step clarity',
  'Secure direct messaging with landlords',
  'Affordability compare to estimate total monthly cost',
];

export default function ForStudentsPage() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 20px 80px' }}>
      <section style={{ marginBottom: 34 }}>
        <p style={{ color: '#1565c0', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', fontSize: 12, marginBottom: 10 }}>
          Student Housing Made Practical
        </p>
        <h1 style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', lineHeight: 1.1, marginBottom: 14 }}>
          Find the right place faster, with less stress
        </h1>
        <p style={{ color: '#425466', fontSize: 18, lineHeight: 1.7, maxWidth: 760, marginBottom: 22 }}>
          Cosy helps students move from browsing to approved move-in with better filters, verified options, and transparent application progress.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/browse" style={{ background: '#1565c0', color: 'white', fontWeight: 700, padding: '12px 18px', borderRadius: 10, textDecoration: 'none' }}>
            Start Searching
          </Link>
          <Link href="/register" style={{ border: '1px solid #c8d7e6', color: '#0f2237', fontWeight: 700, padding: '12px 18px', borderRadius: 10, textDecoration: 'none' }}>
            Create Free Account
          </Link>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 12 }}>
        {points.map((point) => (
          <article key={point} style={{ border: '1px solid #dde7f0', borderRadius: 12, padding: 16, background: 'white' }}>
            <p style={{ margin: 0, color: '#0f2237', lineHeight: 1.6 }}>{point}</p>
          </article>
        ))}
      </section>

      <section style={{ marginTop: 30, border: '1px solid #dce8f5', borderRadius: 14, padding: 18, background: '#f8fbff' }}>
        <h2 style={{ marginTop: 0 }}>Next best step</h2>
        <p style={{ color: '#425466', marginBottom: 0 }}>
          Go to Browse, save your best options, and compare total monthly cost before applying.
        </p>
      </section>
    </main>
  );
}
