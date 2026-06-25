'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import AC7Logo from '@/components/ac7/AC7Logo';
import ThemeToggle from '@/components/ac7/ThemeToggle';
import LanguageButton from '@/components/ac7/LanguageButton';
import { useAuth } from '@/context/AuthContext';
import { useCopy } from '@/context/LanguageContext';
import { getMainNav } from '@/components/layout/navConfig';

export default function TopNav() {
  const pathname = usePathname() ?? '';
  const { appUser } = useAuth();
  const copy = useCopy();
  const mainNav = getMainNav(copy);
  const initial = (appUser?.name ?? 'A').charAt(0).toUpperCase();

  return (
    <header className="fit-top-nav hidden lg:block">
      <div className="fit-top-nav__inner">
        <nav className="fit-top-nav__links" aria-label="Main">
          {mainNav.map(({ href, label }) => {
            const active =
              href === '/home' ? pathname === '/home' || pathname === '/dashboard' : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`fit-top-nav__link ${active ? 'fit-top-nav__link--active' : ''}`}>
                {label}
              </Link>
            );
          })}
        </nav>

        <Link href="/home" className="fit-top-nav__brand">
          <AC7Logo size={26} />
          <span>AC7 ELITE</span>
        </Link>

        <div className="fit-top-nav__utilities">
          <ThemeToggle />
          <LanguageButton />
          <Link href="/announcements" className="fit-top-nav__icon-btn" aria-label="Notifications">
            <Bell size={18} />
          </Link>
          <Link href="/profile" className="fit-top-nav__avatar fit-top-nav__avatar--img" title={copy.profile.title}>
            {appUser?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={appUser.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              initial
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
