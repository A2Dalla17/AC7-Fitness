'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileHeader from '@/components/layout/MobileHeader';
import BottomNav from '@/components/layout/BottomNav';
import { isAuthRoute, isImmersiveRoute } from '@/components/layout/navConfig';

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';

  if (isAuthRoute(pathname) || isImmersiveRoute(pathname)) {
    return <>{children}</>;
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
      <TopNav />
      {!isChat && !isHome && <MobileHeader />}
      <main className="fit-app__main">
        <div className={composeClass}>{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
