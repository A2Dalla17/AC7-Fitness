'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ExerciseTrainer from '@/components/ac7/ExerciseTrainer';
import EliteCelebrationToast from '@/components/motion/EliteCelebrationToast';
import { STAGE_EXERCISES } from '@/lib/exercises';
import { SeasonRank } from '@/lib/seasons';
import {
  exerciseForStage,
  isStageUnlocked,
  loadSeasonProgress,
  missionRankPath,
  missionTrainPath,
  nextIncompleteStage,
  recordStageCompletion,
  slugToRank,
  type SeasonProgressState,
} from '@/lib/seasonProgression';

function TrainContent() {
  const { supabaseUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const rank = slugToRank(String(params.rank));
  const stageIndex = parseInt(String(params.stage), 10);

  const [progress, setProgress] = useState<SeasonProgressState | null>(null);
  const [loading, setLoading] = useState(true);
  const [celebration, setCelebration] = useState<
    | { kind: 'season'; message: string; xp: number }
    | { kind: 'rank'; nextRank: SeasonRank; xp: number }
    | null
  >(null);

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

  if (!rank || Number.isNaN(stageIndex)) {
    router.replace('/missions');
    return null;
  }

  if (loading) {
    return (
      <div className="mission-train-shell flex min-h-screen items-center justify-center">
        <p className="caption text-muted">Loading...</p>
      </div>
    );
  }

  if (!progress) {
    router.replace('/missions');
    return null;
  }

  const stageDef = exerciseForStage(rank, stageIndex);
  const exercise = stageDef ? STAGE_EXERCISES.find((e) => e.key === stageDef.exerciseKey) : null;
  const unlocked = isStageUnlocked(progress.completions, rank, stageIndex);

  if (!stageDef || !exercise) {
    router.replace(missionRankPath(rank));
    return null;
  }

  if (!unlocked) {
    const next = nextIncompleteStage(progress.completions);
    return (
      <div className="mission-train-shell flex min-h-screen flex-col items-center justify-center p-6">
        <div className="ac7-card text-center">
          <Lock className="mx-auto text-muted" size={28} />
          <h2 className="h-m mt-3">Stage locked</h2>
          <p className="caption mt-2 text-muted">Complete the previous stage first.</p>
          {next && (
            <button
              onClick={() => router.push(missionTrainPath(next.rank, next.stageIndex))}
              className="ac7-btn mt-4"
            >
              Go to current stage
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleComplete = async (repsDone: number) => {
    if (!supabaseUser || !progress) return;

    const result = await recordStageCompletion(
      supabase,
      supabaseUser.id,
      progress.season.id,
      rank as SeasonRank,
      stageIndex,
      repsDone,
    );

    if (result.seasonCompleted) {
      setCelebration({
        kind: 'season',
        message: result.certificateTitle ?? 'Season complete',
        xp: result.xpAwarded,
      });
      setTimeout(() => router.push('/certificates'), 2200);
      return;
    }

    const nextStageIndex = stageIndex + 1;
    const nextStageDef = exerciseForStage(rank, nextStageIndex);

    if (nextStageDef) {
      setTimeout(
        () => router.push(missionTrainPath(rank, nextStageIndex)),
        result.nextRankUnlocked ? 1800 : 400,
      );
      return;
    }

    if (result.nextRankUnlocked) {
      setCelebration({ kind: 'rank', nextRank: result.nextRankUnlocked, xp: result.xpAwarded });
      setTimeout(() => router.push(missionRankPath(result.nextRankUnlocked!)), 1800);
      return;
    }

    router.push(missionRankPath(rank));
  };

  return (
    <>
      {celebration?.kind === 'season' && (
        <EliteCelebrationToast
          achievement
          message={celebration.message}
          xp={celebration.xp}
        />
      )}
      {celebration?.kind === 'rank' && (
        <EliteCelebrationToast
          message={`${celebration.nextRank} unlocked!`}
          previousRank={rank}
          nextRank={celebration.nextRank}
          xp={celebration.xp}
        />
      )}
      <ExerciseTrainer
        exercise={exercise}
        targetReps={stageDef.reps}
        onComplete={handleComplete}
        stageLabel={`${rank} · Stage ${stageIndex + 1}`}
      />
    </>
  );
}

export default function RankTrainPage() {
  return (
    <ProtectedRoute>
      <TrainContent />
    </ProtectedRoute>
  );
}
