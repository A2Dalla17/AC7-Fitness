import { Home, BookOpen, Users, Calendar, ShoppingBag } from 'lucide-react';
import type { AppCopy } from '@/lib/i18n/types';

export const NAV_ITEMS = [
  { href: '/home', icon: Home },
  { href: '/courses', icon: BookOpen },
  { href: '/community', icon: Users },
  { href: '/calendar', icon: Calendar },
  { href: '/shop', icon: ShoppingBag },
] as const;

export function getMainNav(copy: AppCopy) {
  const labels = [copy.nav.home, copy.nav.courses, copy.nav.community, copy.nav.calendar, copy.nav.shop];
  return NAV_ITEMS.map((item, i) => ({ ...item, label: labels[i] }));
}

export const AUTH_ROUTES = ['/', '/login', '/register'];

export function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.includes(pathname) || pathname.startsWith('/onboarding');
}

export function isImmersiveRoute(pathname: string) {
  return (
    /^\/missions\/[^/]+\/train\/\d+/.test(pathname) ||
    /^\/community\/thread\//.test(pathname) ||
    /^\/shop\/[0-9a-f-]{36}$/i.test(pathname)
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
