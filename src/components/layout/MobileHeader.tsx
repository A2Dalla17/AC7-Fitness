'use client';

import Link from 'next/link';
import AC7Logo from '@/components/ac7/AC7Logo';
import { useAuth } from '@/context/AuthContext';
import { useCopy } from '@/context/LanguageContext';

export default function MobileHeader() {
  const { appUser } = useAuth();
  const copy = useCopy();
  const initial = (appUser?.name ?? 'A').charAt(0).toUpperCase();

  return (
    <header className="fit-mobile-header lg:hidden">
      <div className="fit-mobile-header__inner">
        <Link href="/home" className="fit-mobile-header__brand">
          <AC7Logo size={24} />
          <span>AC7 ELITE</span>
        </Link>
        <Link href="/profile" className="fit-mobile-header__avatar fit-top-nav__avatar--img" title={copy.profile.title}>
          {appUser?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={appUser.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            initial
          )}
        </Link>
      </div>
    </header>
  );
}
