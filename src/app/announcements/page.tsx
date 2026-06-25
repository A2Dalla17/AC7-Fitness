'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Megaphone, Newspaper, Sparkles, Trophy, ChevronRight, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Announcement, AnnouncementCategory, announcementFromRow } from '@/types';
import WorldPageHeader from '@/components/world/WorldPageHeader';
import PremiumCard from '@/components/premium/PremiumCard';
import { LEGACY } from '@/lib/legacyBrand';

const TABS: { value: AnnouncementCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'news', label: 'News' },
  { value: 'feature', label: 'Updates' },
  { value: 'tournament', label: 'Events' },
];

const CATEGORY_ICON: Partial<Record<AnnouncementCategory, typeof Megaphone>> = {
  news: Newspaper,
  feature: Sparkles,
  tournament: Trophy,
  verification: ShieldCheck,
  maintenance: Megaphone,
};

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
  const featured = filtered[0];

  return (
    <div className="fit-page">
      <WorldPageHeader title="Announcements" subline={LEGACY.philosophy} eyebrow="The Nation" />

      <div className="fit-pill-row">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`fit-pill ${tab === t.value ? 'fit-pill--active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {featured && tab === 'all' && (
        <PremiumCard className="announce-featured premium-card--glow">
          <span className="announce-featured__badge">Featured</span>
          <div className="announce-card">
            <p className="announce-card__title">{featured.title}</p>
            <p className="announce-card__body">{featured.body}</p>
            <p className="announce-card__foot">
              {formatDistanceToNow(featured.createdAt, { addSuffix: true })}
              <span className="announce-card__read">Read more <ChevronRight size={14} className="inline" /></span>
            </p>
          </div>
        </PremiumCard>
      )}

      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <PremiumCard>
            <p className="text-sm text-muted">No announcements yet. The nation will share updates here.</p>
          </PremiumCard>
        )}
        {filtered.slice(tab === 'all' && featured ? 1 : 0).map((a) => {
          const Icon = CATEGORY_ICON[a.category] ?? Megaphone;
          const priority = a.category === 'tournament';
          return (
            <PremiumCard key={a.id} className="announce-card premium-card--interactive">
              <div className="announce-card__head">
                <span className="announce-card__category">
                  <Icon size={14} /> {a.category}
                </span>
                {priority && <span className="announce-card__priority">Priority</span>}
              </div>
              <p className="announce-card__title">{a.title}</p>
              <p className="announce-card__body">{a.body}</p>
              <p className="announce-card__foot">
                {formatDistanceToNow(a.createdAt, { addSuffix: true })}
                <span className="announce-card__read">Read more</span>
              </p>
            </PremiumCard>
          );
        })}
      </div>
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
