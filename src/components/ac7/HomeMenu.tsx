'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Settings, Users, Info, Grid2x2 } from 'lucide-react';

const LINKS = [
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Community', href: '/community', icon: Users },
  { label: 'About Us', href: '/about', icon: Info },
  { label: 'More', href: '/more', icon: Grid2x2 },
];

export default function HomeMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-ink"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-30 w-48 overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-xl">
            {LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-ink/90 hover:bg-navy/10 hover:text-navy"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
