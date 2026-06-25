'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lock, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ExerciseTrainer from '@/components/ac7/ExerciseTrainer';
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
  const [celebration, setCelebration] = useState<string | null>(null);

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
      setCelebration(`Season complete! Certificate: ${result.certificateTitle}`);
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
      setCelebration(`${result.nextRankUnlocked} unlocked!`);
      setTimeout(() => router.push(missionRankPath(result.nextRankUnlocked!)), 1800);
      return;
    }

    router.push(missionRankPath(rank));
  };

  return (
    <>
      {celebration && (
        <div className="fixed inset-x-0 top-20 z-50 mx-auto max-w-md px-4">
          <div className="ac7-card flex items-center gap-3 border-navy/40 ring-2 ring-navy/30">
            <Trophy className="text-navy" size={22} />
            <p className="body-text font-semibold">{celebration}</p>
          </div>
        </div>
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
