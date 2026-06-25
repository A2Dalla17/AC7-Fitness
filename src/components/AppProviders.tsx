'use client';

import { ReactNode } from 'react';
import { SupabaseSetupNotice } from '@/components/SupabaseSetupNotice';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AppLayout from '@/components/layout/AppLayout';
import GlobalAnnouncementBanner from '@/components/ac7/GlobalAnnouncementBanner';

/** Single client boundary for the root layout — avoids RSC manifest drift in dev. */
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GlobalAnnouncementBanner />
        <AppLayout>
          <SupabaseSetupNotice>{children}</SupabaseSetupNotice>
        </AppLayout>
      </AuthProvider>
    </ThemeProvider>
  );
}
