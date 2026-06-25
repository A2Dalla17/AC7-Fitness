import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import './ac7-elite.css';
import './ac7-premium.css';
import './ac7-motion.css';
import AppProviders from '@/components/AppProviders';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AC7 Elite — Train. Rank. Conquer.',
  description:
    'Fitness platform with seasons, missions, ranks, verified coaches, certificates, and community. Build your legacy through discipline.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="bg-bg font-sans text-ink antialiased">
        <div id="app-content">
          <AppProviders>{children}</AppProviders>
        </div>
      </body>
    </html>
  );
}
