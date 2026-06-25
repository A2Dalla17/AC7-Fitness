'use client';

import Link from 'next/link';
import { Megaphone, Settings, ShieldCheck, ShoppingBag, Users2, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

function MoreContent() {
  const { appUser } = useAuth();

  const links = [
    { href: '/community', label: 'Community', icon: Users2, accent: 'text-community border-community' },
    { href: '/shop', label: 'Shop', icon: ShoppingBag, accent: 'text-ink border-navy-deep' },
    { href: '/announcements', label: 'Announcements', icon: Megaphone, accent: 'text-announce border-announce' },
    { href: '/settings', label: 'Settings', icon: Settings, accent: 'text-ink border-navy-deep' },
  ];

  if (appUser?.role === 'coach') {
    links.push({ href: '/coach-dashboard', label: 'Coach Dashboard', icon: LayoutDashboard, accent: 'text-ink border-navy-deep' });
  }
  if (appUser?.role === 'admin') {
    links.push({ href: '/admin', label: 'Admin Panel', icon: ShieldCheck, accent: 'text-ink border-navy-deep' });
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header title="More" />
      <main className="flex-1 px-4 py-6 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {links.map(({ href, label, icon: Icon, accent }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-2 rounded-xl2 border bg-white/5 p-6 text-center text-sm font-semibold ${accent}`}
            >
              <Icon size={24} />
              {label}
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export default function MorePage() {
  return (
    <ProtectedRoute>
      <MoreContent />
    </ProtectedRoute>
  );
}
