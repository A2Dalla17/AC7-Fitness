'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { SeasonProgressState } from '@/lib/seasonProgression';
import { computeLegacyScore } from '@/lib/legacyScore';

export interface JourneyStats {
  missionsCompleted: number;
  streakDays: number;
  weeklyXp: number;
  monthlyStages: number;
  legacyScore: number;
  achievementCount: number;
  certificateCount: number;
}

function daysBetween(a: Date, b: Date) {
  const ms = 86400000;
  return Math.floor((b.getTime() - a.getTime()) / ms);
}

function computeStreak(completionDates: Date[]): number {
  if (completionDates.length === 0) return 0;
  const uniqueDays = [...new Set(completionDates.map((d) => d.toDateString()))]
    .map((s) => new Date(s))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const latest = uniqueDays[0];
  latest.setHours(0, 0, 0, 0);
  if (daysBetween(latest, today) > 1) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = uniqueDays[i - 1];
    const cur = uniqueDays[i];
    if (daysBetween(cur, prev) === 1) streak++;
    else break;
  }
  return streak;
}

export function useJourneyStats(
  userId: string | undefined,
  progress: SeasonProgressState | null,
  xp: number,
) {
  const [stats, setStats] = useState<JourneyStats>({
    missionsCompleted: 0,
    streakDays: 0,
    weeklyXp: 0,
    monthlyStages: 0,
    legacyScore: 0,
    achievementCount: 0,
    certificateCount: 0,
  });

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      const monthAgo = new Date(now.getTime() - 30 * 86400000);

      const [{ data: completions }, { data: achievements }, { data: certificates }] = await Promise.all([
        supabase
          .from('stage_completions')
          .select('completed_at, reps_done')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false }),
        supabase.from('achievements').select('id').eq('user_id', userId),
        supabase.from('certificates').select('id').eq('user_id', userId),
      ]);

      const dates = (completions ?? []).map((c: any) => new Date(c.completed_at));
      const weeklyRows = (completions ?? []).filter((c: any) => new Date(c.completed_at) >= weekAgo);
      const monthlyRows = (completions ?? []).filter((c: any) => new Date(c.completed_at) >= monthAgo);
      const weeklyXp = weeklyRows.reduce(
        (sum: number, c: any) => sum + (c.reps_done ?? 0) + 25,
        0,
      );

      const missionsCompleted = progress?.completedStageCount ?? completions?.length ?? 0;
      const streakDays = computeStreak(dates);
      const legacyScore = computeLegacyScore({
        xp,
        missionStages: missionsCompleted,
        certificates: certificates?.length ?? 0,
        communityPosts: 0,
        communityComments: 0,
        chatMessages: 0,
        seasonsCompleted: progress?.seasonComplete ? 1 : 0,
        streakDays,
      });

      setStats({
        missionsCompleted,
        streakDays,
        weeklyXp,
        monthlyStages: monthlyRows.length,
        legacyScore,
        achievementCount: achievements?.length ?? 0,
        certificateCount: certificates?.length ?? 0,
      });
    })();
  }, [userId, progress?.completedStageCount, progress?.seasonComplete, xp]);

  return stats;
}
