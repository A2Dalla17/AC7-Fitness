'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import AC7Logo from '@/components/ac7/AC7Logo';

const ADVICE_LINKS = [
  { label: 'All Advice', href: '/advice' },
  { label: 'Fitness', href: '/advice?category=fitness' },
  { label: 'Nutrition', href: '/advice?category=nutrition' },
  { label: 'Self Care', href: '/advice?category=self-care' },
  { label: 'Wellness', href: '/advice?category=wellness' },
];

const COURSES_LINKS = [
  { label: 'Missions', href: '/courses/missions', desc: 'Daily XP tasks open to every member' },
  { label: 'Private Training', href: '/courses/private-training', desc: 'Unlocked only when your coach assigns it' },
];

export default function TopNav() {
  const [openMenu, setOpenMenu] = useState<'advice' | 'courses' | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-30 border-b border-white/10 nav-surface backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <AC7Logo size={30} />
          <span className="text-sm font-bold tracking-wide">AC7 FITNESS</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setOpenMenu('advice')}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button className="flex items-center gap-1 rounded-full px-3 py-2 text-sm text-ink/90 hover:text-navy">
              Advice <ChevronDown size={14} />
            </button>
            {openMenu === 'advice' && (
              <div className="absolute left-0 top-full w-56 rounded-2xl border border-white/10 bg-surface p-2 shadow-xl">
                {ADVICE_LINKS.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="block rounded-xl px-3 py-2 text-sm text-ink/90 hover:bg-navy/10 hover:text-navy"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setOpenMenu('courses')}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button className="flex items-center gap-1 rounded-full px-3 py-2 text-sm text-ink/90 hover:text-navy">
              Courses
              <span className="rounded-full bg-navy px-1.5 py-0.5 text-[9px] font-bold text-white">new</span>
              <ChevronDown size={14} />
            </button>
            {openMenu === 'courses' && (
              <div className="absolute left-0 top-full w-72 rounded-2xl border border-white/10 bg-surface p-2 shadow-xl">
                {COURSES_LINKS.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="block rounded-xl px-3 py-2 hover:bg-navy/10"
                  >
                    <p className="text-sm font-semibold text-ink/90">{l.label}</p>
                    <p className="text-xs text-muted">{l.desc}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/guides" className="rounded-full px-3 py-2 text-sm text-ink/90 hover:text-navy">
            Guides
          </Link>
          <Link href="/health" className="rounded-full px-3 py-2 text-sm text-ink/90 hover:text-navy">
            Health
          </Link>
          <Link href="/shop" className="rounded-full px-3 py-2 text-sm text-ink/90 hover:text-navy">
            Shop
          </Link>
          <Link href="/help" className="rounded-full px-3 py-2 text-sm text-ink/90 hover:text-navy">
            Help
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-ink/90 hover:text-navy">
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-white shadow-[0_0_16px_rgba(163,230,53,0.3)]"
          >
            Sign Up
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 nav-surface px-5 py-4 md:hidden">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Advice</p>
          {ADVICE_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="block py-2 text-sm text-ink/90">
              {l.label}
            </Link>
          ))}
          <p className="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">Courses</p>
          {COURSES_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="block py-2 text-sm text-ink/90">
              {l.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-1 border-t border-white/10 pt-3">
            <Link href="/guides" className="py-2 text-sm text-ink/90">Guides</Link>
            <Link href="/health" className="py-2 text-sm text-ink/90">Health</Link>
            <Link href="/shop" className="py-2 text-sm text-ink/90">Shop</Link>
            <Link href="/help" className="py-2 text-sm text-ink/90">Help</Link>
          </div>
          <div className="mt-4 flex gap-2">
            <Link href="/login" className="flex-1 rounded-full border border-white/15 py-2.5 text-center text-sm font-semibold">
              Login
            </Link>
            <Link href="/register" className="flex-1 rounded-full bg-navy py-2.5 text-center text-sm font-bold text-white">
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
