'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import { useCopy } from '@/context/LanguageContext';
import type { ContinueTraining } from '@/hooks/useTrainingProgress';

export default function ContinueHero({
  training,
  premium,
}: {
  training: ContinueTraining;
  premium?: boolean;
}) {
  const COPY = useCopy();

  return (
    <Link
      href={training.href}
      className={`fit-continue-hero ${premium ? 'premium-card premium-card--glow' : ''}`}
    >
      <div className="fit-continue-hero__glow" aria-hidden />
      <div className="fit-continue-hero__content">
        <span className="fit-continue-hero__label">
          <Play size={16} fill="currentColor" /> {COPY.home.continueLabel}
        </span>
        <h2 className="fit-continue-hero__title">{training.exerciseName}</h2>
        <p className="fit-continue-hero__meta">
          {training.rank} · Stage {training.stageNumber} · {training.reps} reps
        </p>
      </div>
    </Link>
  );
}
