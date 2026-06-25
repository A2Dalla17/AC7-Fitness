import Link from 'next/link';
import { ChevronRight, Play } from 'lucide-react';
import { COPY } from '@/lib/legacyBrand';
import type { ContinueTraining } from '@/hooks/useTrainingProgress';

export default function ResumeCard({ training }: { training: ContinueTraining }) {
  return (
    <Link href={training.href} className="fit-resume-card">
      <div className="fit-resume-card__icon">
        <Play size={14} fill="currentColor" />
      </div>
      <div className="fit-resume-card__body">
        <p className="fit-resume-card__label">{COPY.courses.resume}</p>
        <p className="fit-resume-card__title">
          {training.exerciseName} · {training.rank}
        </p>
        <p className="fit-resume-card__meta">Stage {training.stageNumber}</p>
      </div>
      <ChevronRight size={18} className="fit-resume-card__chevron" />
    </Link>
  );
}
