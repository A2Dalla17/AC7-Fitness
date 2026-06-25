'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Lock, MoreHorizontal } from 'lucide-react';
import { STAGE_EXERCISES } from '@/lib/exercises';
import { RANK_COLORS, SeasonRank, StageDef, stagesForRank } from '@/lib/seasons';
import ExerciseDemoMedia from '@/components/ac7/ExerciseDemoMedia';
import {
  isStageComplete,
  isStageUnlocked,
  missionTrainPath,
  nextIncompleteStage,
  type SeasonProgressState,
} from '@/lib/seasonProgression';

const RANK_TAGLINES: Partial<Record<SeasonRank, string>> = {
  Bronze: 'Build your foundation — push-ups, sit-ups, and more.',
  Silver: 'Level up your endurance and control.',
  Gold: 'Stronger reps, sharper form.',
};

export default function MissionCourseView({
  rank,
  progress,
}: {
  rank: SeasonRank;
  progress: SeasonProgressState;
}) {
  const router = useRouter();
  const stages = stagesForRank(rank);
  const { completions } = progress;
  const next = nextIncompleteStage(completions);
  const heroStage: StageDef | null =
    next && next.rank === rank
      ? stages[next.stageIndex] ?? null
      : stages.find((s) => !isStageComplete(completions, rank, s.index)) ?? stages[0] ?? null;
  const heroExercise = heroStage
    ? STAGE_EXERCISES.find((e) => e.key === heroStage.exerciseKey)
    : STAGE_EXERCISES[0];
  const color = RANK_COLORS[rank];
  const doneCount = stages.filter((s) => isStageComplete(completions, rank, s.index)).length;
  const startHref =
    next && next.rank === rank
      ? missionTrainPath(rank, next.stageIndex)
      : missionTrainPath(rank, 0);

  return (
    <div className="mission-course mission-course--wide">
      <section className="mission-course-hero">
        {heroStage && <ExerciseDemoMedia exerciseKey={heroStage.exerciseKey} variant="hero" autoPlay />}
        <div className="mission-course-hero__overlay" />

        <button
          type="button"
          onClick={() => router.push('/missions')}
          className="mission-course-icon-btn mission-course-icon-btn--left"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <button type="button" className="mission-course-icon-btn mission-course-icon-btn--right" aria-label="More">
          <MoreHorizontal size={20} />
        </button>

        <div className="mission-course-hero__content">
          <span className="mission-rank-badge" style={{ backgroundColor: color }}>
            {rank}
          </span>
          <h1 className="mission-course-hero__title">
            {RANK_TAGLINES[rank] ?? 'Make your body healthier and stronger'}
          </h1>
          <p className="mission-course-hero__meta">
            {progress.season.code} · {doneCount}/{stages.length} stages · {heroExercise?.name ?? 'Workout'}
          </p>
        </div>
      </section>

      <section className="mission-course-panel">
        <div className="mission-course-panel__head">
          <h2 className="h-m">{rank} Mission Path</h2>
          <p className="caption text-muted">Tap a video to train — camera counts your reps live.</p>
        </div>

        <div className="mission-video-grid">
          {stages.map((stage) => {
            const exercise = STAGE_EXERCISES.find((e) => e.key === stage.exerciseKey);
            const complete = isStageComplete(completions, rank, stage.index);
            const unlocked = isStageUnlocked(completions, rank, stage.index);
            const href = missionTrainPath(rank, stage.index);
            const isCurrent = next?.rank === rank && next.stageIndex === stage.index;
            const name = exercise?.name ?? stage.name;

            const inner = (
              <>
                <div className={`mission-video-tile__media ${!unlocked ? 'mission-video-tile__media--locked' : ''}`}>
                  <ExerciseDemoMedia exerciseKey={stage.exerciseKey} variant="tile" />
                  {complete && (
                    <span className="mission-video-tile__done">
                      <CheckCircle2 size={16} />
                    </span>
                  )}
                  {!unlocked && (
                    <span className="mission-video-tile__lock">
                      <Lock size={18} />
                    </span>
                  )}
                  {isCurrent && !complete && <span className="mission-video-tile__now">Now</span>}
                </div>
                <p className="mission-video-tile__name">{name}</p>
                <p className="mission-video-tile__meta">
                  Stage {String(stage.index + 1).padStart(2, '0')} · {stage.reps} reps
                </p>
              </>
            );

            if (unlocked && !complete) {
              return (
                <Link key={stage.index} href={href} className="mission-video-tile">
                  {inner}
                </Link>
              );
            }

            return (
              <div
                key={stage.index}
                className={`mission-video-tile ${!unlocked ? 'mission-video-tile--locked' : ''}`}
              >
                {inner}
              </div>
            );
          })}
        </div>

        {next && next.rank === rank ? (
          <Link href={startHref} className="mission-start-btn">
            Start Stage {next.stageIndex + 1} ·{' '}
            {STAGE_EXERCISES.find((e) => e.key === stages[next.stageIndex]?.exerciseKey)?.name}
          </Link>
        ) : doneCount === stages.length ? (
          <div className="mission-start-btn mission-start-btn--done">Rank complete ✓</div>
        ) : (
          <Link href={startHref} className="mission-start-btn">
            Start Course
          </Link>
        )}
      </section>
    </div>
  );
}
