'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileHeader from '@/components/layout/MobileHeader';
import BottomNav from '@/components/layout/BottomNav';
import { isAuthRoute, isImmersiveRoute } from '@/components/layout/navConfig';
import AmbientBackground from '@/components/motion/AmbientBackground';

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';

  if (isImmersiveRoute(pathname)) {
    return <>{children}</>;
  }

  if (isAuthRoute(pathname)) {
    return (
      <div className="ac7-auth-shell">
        <AmbientBackground />
        {children}
      </div>
    );
  }

  const isChat = pathname.startsWith('/community');
  const isHome = pathname === '/home' || pathname === '/dashboard';

  const composeClass = [
    'elite-compose',
    isHome && 'elite-compose--home',
    isChat && 'elite-compose--chat',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`fit-app ${isChat ? 'fit-app--chat' : ''}`}>
      <AmbientBackground />
      <TopNav />
      {!isChat && !isHome && <MobileHeader />}
      <main className="fit-app__main">
        <div key={pathname} className={`${composeClass} elite-page-enter`}>
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
