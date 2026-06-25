'use client';

import Link from 'next/link';
import AC7Logo from '@/components/ac7/AC7Logo';
import { useAuth } from '@/context/AuthContext';
import { COPY } from '@/lib/legacyBrand';

export default function MobileHeader() {
  const { appUser } = useAuth();
  const initial = (appUser?.name ?? 'A').charAt(0).toUpperCase();

  return (
    <header className="fit-mobile-header lg:hidden">
      <div className="fit-mobile-header__inner">
        <Link href="/home" className="fit-mobile-header__brand">
          <AC7Logo size={24} />
          <span>AC7 ELITE</span>
        </Link>
        <Link href="/profile" className="fit-mobile-header__avatar" title={COPY.profile.title}>
          {initial}
        </Link>
      </div>
    </header>
  );
}
