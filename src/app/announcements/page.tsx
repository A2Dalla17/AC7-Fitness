'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Announcement, AnnouncementCategory, announcementFromRow } from '@/types';

const TABS: { value: AnnouncementCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'news', label: 'News' },
  { value: 'feature', label: 'Updates' },
  { value: 'tournament', label: 'Events' },
];

function AnnouncementsContent() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [tab, setTab] = useState<AnnouncementCategory | 'all'>('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (data) setItems(data.map((r) => announcementFromRow(r as any)));
    })();
  }, []);

  const filtered = tab === 'all' ? items : items.filter((a) => a.category === tab);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header title="Announcements" />
      <main className="flex-1 px-4 py-4 pb-24">
        <div className="mb-4 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`rounded-full px-4 py-2 text-sm ${
                tab === t.value ? 'bg-announce text-white' : 'border border-navy-deep text-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {filtered.length === 0 && <p className="text-sm text-muted">No announcements yet.</p>}
          {filtered.map((a) => (
            <div key={a.id} className="rounded-xl2 bg-announce p-4 text-white">
              <p className="font-semibold">{a.title}</p>
              <p className="mt-1 text-sm text-white/70">{a.body}</p>
              <p className="mt-2 text-xs text-white/50">{formatDistanceToNow(a.createdAt, { addSuffix: true })}</p>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export default function AnnouncementsPage() {
  return (
    <ProtectedRoute>
      <AnnouncementsContent />
    </ProtectedRoute>
  );
}
