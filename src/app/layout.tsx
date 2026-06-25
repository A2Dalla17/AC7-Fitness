import type { Metadata } from 'next';
import { Inter, Poppins, Sora, Space_Grotesk } from 'next/font/google';
import './globals.css';
import './ac7-elite.css';
import './ac7-premium.css';
import './ac7-motion.css';
import AppProviders from '@/components/AppProviders';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['800'],
  variable: '--font-sora',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AC7 Elite — Train. Rank. Conquer.',
  description:
    'Fitness platform with seasons, missions, ranks, verified coaches, certificates, and community. Build your legacy through discipline.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${sora.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-bg font-body text-ink antialiased">
        <div id="app-content">
          <AppProviders>{children}</AppProviders>
        </div>
      </body>
    </html>
  );
}
