'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import MissionCourseView from '@/components/ac7/MissionCourseView';
import { SeasonRank } from '@/lib/seasons';
import {
  isRankUnlocked,
  loadSeasonProgress,
  slugToRank,
  type SeasonProgressState,
} from '@/lib/seasonProgression';

function RankStagesContent() {
  const { supabaseUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const rank = slugToRank(String(params.rank));
  const [progress, setProgress] = useState<SeasonProgressState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseUser) return;
    (async () => {
      try {
        const state = await loadSeasonProgress(supabase, supabaseUser.id);
        setProgress(state);
      } finally {
        setLoading(false);
      }
    })();
  }, [supabaseUser]);

  if (!rank) {
    router.replace('/missions');
    return null;
  }

  if (loading) {
    return (
      <div className="mission-course flex min-h-screen items-center justify-center">
        <p className="caption text-muted">Loading mission...</p>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="mission-course flex min-h-screen flex-col items-center justify-center p-6">
        <p className="h-m text-white">Season unavailable</p>
        <Link href="/missions" className="ac7-btn mt-4">
          Back to Missions
        </Link>
      </div>
    );
  }

  const rankUnlocked = isRankUnlocked(progress.completions, rank);

  if (!rankUnlocked) {
    return (
      <div className="mission-course flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <Lock className="text-muted" size={32} />
        <p className="h-m mt-4 text-white">{rank} locked</p>
        <p className="caption mt-2 text-muted">Finish the previous rank first.</p>
        <Link href="/missions" className="ac7-btn mt-4">
          Back to Missions
        </Link>
      </div>
    );
  }

  return <MissionCourseView rank={rank as SeasonRank} progress={progress} />;
}

export default function RankStagesPage() {
  return (
    <ProtectedRoute>
      <RankStagesContent />
    </ProtectedRoute>
  );
}
