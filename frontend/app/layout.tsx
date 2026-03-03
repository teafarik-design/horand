import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const syne = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['400', '600', '700', '800'] });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });

export const metadata: Metadata = {
  title: 'HORAND Partnership',
  description: 'Manage partnership agreements with ease',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className={`${syne.variable} ${dmSans.variable} font-body bg-gray-50 text-gray-900 antialiased`}>
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontFamily: 'var(--font-dm-sans)', borderRadius: '12px' } }} />
      </body>
    </html>
  );
}
