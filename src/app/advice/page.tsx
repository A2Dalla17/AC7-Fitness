'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const CATEGORIES = ['All Advice', 'Fitness', 'Nutrition', 'Self Care', 'Wellness'];

const ARTICLES = [
  { title: '5 Warm-Up Mistakes Killing Your Gains', category: 'Fitness', read: '4 min' },
  { title: 'How Much Protein Do You Really Need?', category: 'Nutrition', read: '6 min' },
  { title: 'Building a Recovery Routine That Sticks', category: 'Self Care', read: '5 min' },
  { title: 'Sleep, Stress, and Strength: The Hidden Link', category: 'Wellness', read: '7 min' },
  { title: 'Progressive Overload Explained Simply', category: 'Fitness', read: '5 min' },
  { title: 'Meal Timing Around Your Workouts', category: 'Nutrition', read: '4 min' },
];

function AdviceContent() {
  const params = useSearchParams();
  const active = params.get('category');
  const activeLabel = CATEGORIES.find((c) => c.toLowerCase().replace(' ', '-') === active) ?? 'All Advice';

  const filtered = activeLabel === 'All Advice' ? ARTICLES : ARTICLES.filter((a) => a.category === activeLabel);

  return (
    <main className="min-h-screen bg-bg pb-16">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="text-3xl font-extrabold">Advice</h1>
        <p className="mt-2 text-sm text-muted">Practical tips from the AC7 coaching team.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const slug = c === 'All Advice' ? '/advice' : `/advice?category=${c.toLowerCase().replace(' ', '-')}`;
            const isActive = c === activeLabel;
            return (
              <a
                key={c}
                href={slug}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  isActive ? 'bg-navy text-white' : 'border border-white/10 text-muted'
                }`}
              >
                {c}
              </a>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {filtered.map((a) => (
            <div key={a.title} className="rounded-2xl border border-white/10 bg-surface p-5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-navy">{a.category}</span>
              <h3 className="mt-2 text-lg font-bold leading-snug">{a.title}</h3>
              <p className="mt-2 text-xs text-muted">{a.read} read</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function AdvicePage() {
  return (
    <Suspense>
      <AdviceContent />
    </Suspense>
  );
}
