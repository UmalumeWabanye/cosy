import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import '../globals.css';
import Providers from '@/providers';
import Navbar from '@/components/Navbar';

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Cosy - Student Accommodation Marketplace',
  description: 'Find affordable student accommodation near your university',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="cinema-body">
        <Providers>
          <Navbar />
          <main className="cinema-main">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
