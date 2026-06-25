'use client';

import { Play } from 'lucide-react';
import { ExerciseKey } from '@/lib/exercises';
import { demoPosterFor, demoVideoFor } from '@/lib/coachMedia';

type Variant = 'hero' | 'tile';

/** Exercise demo video only — no robot / illustrated avatar. */
export default function ExerciseDemoMedia({
  exerciseKey,
  variant = 'tile',
  autoPlay = false,
}: {
  exerciseKey: ExerciseKey;
  variant?: Variant;
  autoPlay?: boolean;
}) {
  const video = demoVideoFor(exerciseKey);
  const poster = demoPosterFor(exerciseKey);
  const shell = variant === 'hero' ? 'exercise-demo-media exercise-demo-media--hero' : 'exercise-demo-media exercise-demo-media--tile';

  return (
    <div className={shell}>
      <video
        src={video}
        poster={poster}
        className="exercise-demo-media__video"
        autoPlay={autoPlay || variant === 'hero'}
        loop
        muted
        playsInline
        preload="metadata"
      />
      <div className="exercise-demo-media__play" aria-hidden>
        <Play size={variant === 'hero' ? 28 : 18} fill="currentColor" />
      </div>
    </div>
  );
}
