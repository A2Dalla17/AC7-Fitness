'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Coach, coachFromRow } from '@/types';

function CoachProfileContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [coach, setCoach] = useState<Coach | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('coaches').select('*').eq('user_id', id).maybeSingle();
      if (data) setCoach(coachFromRow(data as any));
    })();
  }, [id]);

  if (!coach) {
    return (
      <div className="flex min-h-screen flex-col bg-bg">
        <Header title="Coach Profile" back />
        <p className="px-4 py-6 text-sm text-muted">Loading coach...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header title="Coach Profile" back />
      <main className="flex-1 space-y-6 px-4 py-6 pb-24">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-xl font-bold">
            {coach.name.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-bold">{coach.name}</p>
            <p className="text-sm text-muted">{coach.specializations?.join(', ')}</p>
            <p className="text-sm text-muted">⭐ {coach.rating.toFixed(1)} ({coach.reviewCount} reviews)</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl2 border border-navy-deep p-3">
            <p className="text-lg font-bold">{coach.experience}+</p>
            <p className="text-xs text-muted">Years Exp.</p>
          </div>
          <div className="rounded-xl2 border border-navy-deep p-3">
            <p className="text-lg font-bold">{coach.reviewCount}</p>
            <p className="text-xs text-muted">Sessions</p>
          </div>
          <div className="rounded-xl2 border border-navy-deep p-3">
            <p className="text-lg font-bold">{coach.rating.toFixed(1)}</p>
            <p className="text-xs text-muted">Rating</p>
          </div>
        </div>

        <div>
          <p className="mb-2 font-semibold">About Me</p>
          <p className="text-sm text-muted">{coach.bio || 'This coach has not added a bio yet.'}</p>
        </div>

        <div>
          <p className="mb-2 font-semibold">Specializations</p>
          <div className="flex flex-wrap gap-2">
            {(coach.specializations ?? []).map((s) => (
              <span key={s} className="rounded-full border border-navy-deep px-3 py-1 text-xs">
                {s.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl2 border border-navy-deep p-4">
          <p className="text-lg font-bold">${coach.price} / session</p>
          <button
            onClick={() => router.push(`/calendar?coachId=${coach.userId}`)}
            className="rounded-xl2 bg-navy px-6 py-3 font-semibold"
          >
            Book Session
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export default function CoachProfilePage() {
  return (
    <ProtectedRoute>
      <CoachProfileContent />
    </ProtectedRoute>
  );
}
