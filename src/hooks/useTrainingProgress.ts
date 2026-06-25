'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Missions, missionsFromRow } from '@/types';
import { SeasonRank, stagesForRank } from '@/lib/seasons';
import {
  loadSeasonProgress,
  missionTrainPath,
  nextIncompleteStage,
  type SeasonProgressState,
} from '@/lib/seasonProgression';

export interface ContinueTraining {
  href: string;
  exerciseName: string;
  rank: SeasonRank;
  stageNumber: number;
  reps: number;
  estMinutes: number;
}

export function useTrainingProgress(userId: string | undefined) {
  const [missions, setMissions] = useState<Missions | null>(null);
  const [progress, setProgress] = useState<SeasonProgressState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [{ data }, seasonState] = await Promise.all([
        supabase.from('missions').select('*').eq('user_id', userId).maybeSingle(),
        loadSeasonProgress(supabase, userId),
      ]);
      if (data) setMissions(missionsFromRow(data as any));
      setProgress(seasonState);
      setLoading(false);
    })();
  }, [userId]);

  const nextStage = progress ? nextIncompleteStage(progress.completions) : null;

  const continueTraining: ContinueTraining | null = nextStage
    ? (() => {
        const stage = stagesForRank(nextStage.rank)[nextStage.stageIndex];
        return {
          href: missionTrainPath(nextStage.rank, nextStage.stageIndex),
          exerciseName: stage?.name ?? 'Milestone',
          rank: nextStage.rank,
          stageNumber: nextStage.stageIndex + 1,
          reps: stage?.reps ?? 10,
          estMinutes: Math.max(2, Math.ceil((stage?.reps ?? 10) / 5)),
        };
      })()
    : null;

  return { missions, progress, loading, continueTraining, nextStage };
}
