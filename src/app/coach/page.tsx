'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Coach, coachFromRow, Goal } from '@/types';

const GOALS: { value: Goal | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'fat_loss', label: 'Fat Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'strength', label: 'Strength' },
  { value: 'bodybuilding', label: 'Bodybuilding' },
  { value: 'calisthenics', label: 'Calisthenics' },
];

function MarketplaceContent() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [filter, setFilter] = useState<Goal | 'all'>('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('coaches').select('*');
      if (data) setCoaches(data.map((r) => coachFromRow(r as any)));
    })();
  }, []);

  const filtered =
    filter === 'all' ? coaches : coaches.filter((c) => c.specializations?.includes(filter));

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header title="Coach Marketplace" />
      <main className="flex-1 px-4 py-4 pb-24">
        <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-none">
          {GOALS.map((g) => (
            <button
              key={g.value}
              onClick={() => setFilter(g.value)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
                filter === g.value ? 'bg-navy text-white' : 'border border-navy-deep text-muted'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <p className="text-sm text-muted">No coaches found yet. Check back soon.</p>
          )}
          {filtered.map((c) => (
            <Link
              key={c.userId}
              href={`/coach/${c.userId}`}
              className="rounded-xl2 bg-gradient-to-br from-navy to-navy-deep p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted">
                    {c.specializations?.join(', ') || 'General Fitness'}
                  </p>
                  <p className="mt-1 text-xs text-muted">⭐ {c.rating.toFixed(1)} ({c.reviewCount}) · {c.experience}+ yrs</p>
                </div>
                <p className="font-bold">${c.price}/session</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <ProtectedRoute>
      <MarketplaceContent />
    </ProtectedRoute>
  );
}
