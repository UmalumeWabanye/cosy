import type { Metadata } from 'next';
import '../globals.css';
import Providers from '@/providers';

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
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}