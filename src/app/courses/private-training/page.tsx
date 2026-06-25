'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Star, PlayCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Coach, coachFromRow } from '@/types';

interface CoachWithMedia extends Coach {
  videos: { id: string; title: string; video_url: string }[];
}

export default function PrivateTrainingPage() {
  const [coaches, setCoaches] = useState<CoachWithMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: coachRows } = await supabase.from('coaches').select('*').eq('verified', true);
      const verified = (coachRows ?? []).map((r) => coachFromRow(r as any));

      const { data: vids } = await supabase
        .from('exercise_videos')
        .select('id,title,video_url,uploader_id,kind')
        .eq('kind', 'pct');

      const withMedia: CoachWithMedia[] = verified.map((c) => ({
        ...c,
        videos: (vids ?? []).filter((v: any) => v.uploader_id === c.userId).map((v: any) => ({ id: v.id, title: v.title, video_url: v.video_url })),
      }));
      setCoaches(withMedia);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-bg pb-16">
      <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-8 sm:px-6">
        <header>
          <p className="caption font-semibold uppercase tracking-wide text-navy">Coach-led</p>
          <h1 className="h-xl">Private Coach Training</h1>
          <p className="body-text mt-1 text-muted">
            Verified AC7 coaches — explore their training videos, ratings and programs, then book a session.
          </p>
        </header>

        {loading ? (
          <p className="caption text-muted">Loading coaches…</p>
        ) : coaches.length === 0 ? (
          <div className="ac7-card text-center">
            <ShieldCheck size={30} className="mx-auto text-muted" />
            <p className="h-m mt-2">No verified coaches yet</p>
            <p className="caption text-muted">Verified coaches and their programs will appear here.</p>
          </div>
        ) : (
          <div className="ac7-grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3">
            {coaches.map((c) => (
              <div key={c.userId} className="ac7-card flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-lg font-bold text-white">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="h-m flex items-center gap-1">
                      {c.name} <ShieldCheck size={15} className="text-navy" />
                    </p>
                    <p className="caption text-muted">
                      <Star size={12} className="mb-0.5 inline text-navy" /> {c.rating.toFixed(1)} ({c.reviewCount}) · {c.experience}+ yrs
                    </p>
                  </div>
                </div>

                {c.bio && <p className="caption text-muted line-clamp-2">{c.bio}</p>}

                {c.videos.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {c.videos.slice(0, 2).map((v) => (
                      <div key={v.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <PlayCircle size={16} className="text-navy" />
                        <span className="caption truncate">{v.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="caption text-muted">No training videos yet.</p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <span className="h-m text-navy">${c.price}/session</span>
                  <Link href={`/coach/${c.userId}`} className="ac7-btn !py-2 caption">
                    View · Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
