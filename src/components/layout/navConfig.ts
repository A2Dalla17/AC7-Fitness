import { Home, BookOpen, Users, Calendar, ShoppingBag } from 'lucide-react';
import { COPY } from '@/lib/legacyBrand';

export const MAIN_NAV = [
  { href: '/home', label: COPY.nav.home, icon: Home },
  { href: '/courses', label: COPY.nav.courses, icon: BookOpen },
  { href: '/community', label: COPY.nav.community, icon: Users },
  { href: '/calendar', label: COPY.nav.calendar, icon: Calendar },
  { href: '/shop', label: COPY.nav.shop, icon: ShoppingBag },
] as const;

export const AUTH_ROUTES = ['/', '/login', '/register'];

export function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.includes(pathname) || pathname.startsWith('/onboarding');
}

export function isImmersiveRoute(pathname: string) {
  return (
    /^\/missions\/[^/]+\/train\/\d+/.test(pathname) ||
    /^\/community\/thread\//.test(pathname) ||
    /^\/shop\/[^/]+$/.test(pathname)
  );
}

export function isSubPageRoute(pathname: string) {
  return (
    pathname.startsWith('/missions') ||
    pathname.startsWith('/courses/') ||
    pathname === '/settings' ||
    pathname === '/certificates' ||
    pathname === '/hall-of-fame' ||
    pathname === '/announcements'
  );
}
