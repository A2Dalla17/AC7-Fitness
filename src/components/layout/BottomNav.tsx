'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCopy } from '@/context/LanguageContext';
import { getMainNav } from '@/components/layout/navConfig';

export default function BottomNav() {
  const pathname = usePathname() ?? '';
  const copy = useCopy();
  const mainNav = getMainNav(copy);

  return (
    <nav className="fit-bottom-nav lg:hidden" aria-label="Main">
      {mainNav.map(({ href, label, icon: Icon }) => {
        const active = href === '/home' ? pathname === '/home' || pathname === '/dashboard' : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={`fit-bottom-nav__item ${active ? 'fit-bottom-nav__item--active' : ''}`}>
            <span className="fit-bottom-nav__icon-wrap">
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              {active && <span className="fit-bottom-nav__pulse" aria-hidden />}
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
