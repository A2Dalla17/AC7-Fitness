'use client';

import Image from 'next/image';
import { ExerciseKey } from '@/lib/exercises';
import { COACH_MEDIA } from '@/lib/coachMedia';
import AICoachDemo from '@/components/ac7/AICoachDemo';

type CoachAvatarVariant = 'default' | 'hero' | 'thumb' | 'avatar';

/**
 * AC7 Demo Coach for an exercise.
 * Prefers video → photo → illustrated AI avatar.
 */
export default function CoachAvatar({
  exerciseKey,
  variant = 'default',
}: {
  exerciseKey: ExerciseKey;
  variant?: CoachAvatarVariant;
}) {
  const media = COACH_MEDIA[exerciseKey];

  const Badge = variant === 'hero' ? null : (
    <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 backdrop-blur-sm">
      <span className="h-1 w-1 rounded-full bg-navy" />
      <span className="text-[9px] font-bold uppercase tracking-wide text-white/90">AI Coach</span>
    </div>
  );

  const shellClass =
    variant === 'hero'
      ? 'mission-coach-hero-media'
      : variant === 'thumb'
        ? 'mission-coach-thumb-media'
        : variant === 'avatar'
          ? 'mission-coach-avatar-media'
          : 'relative overflow-hidden rounded-2xl border border-navy/30 bg-black';

  const mediaClass =
    variant === 'hero'
      ? 'h-full w-full object-cover'
      : variant === 'thumb'
        ? 'h-full w-full object-cover'
        : variant === 'avatar'
          ? 'h-full w-full object-cover scale-150'
          : 'h-52 w-full object-cover';

  if (media?.video && variant !== 'avatar') {
    return (
      <div className={shellClass}>
        {Badge}
        <video
          src={media.video}
          className={mediaClass}
          autoPlay
          loop
          muted
          playsInline
          poster={media.photo}
        />
      </div>
    );
  }

  if (media?.photo && variant !== 'avatar') {
    return (
      <div className={shellClass}>
        {Badge}
        <div className={`relative ${variant === 'hero' ? 'h-full w-full' : variant === 'thumb' ? 'h-full w-full' : 'h-52 w-full'}`}>
          <Image src={media.photo} alt="AC7 coach demonstrating correct form" fill className="object-cover" />
        </div>
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={shellClass}>
        <AICoachDemo exerciseKey={exerciseKey} compact />
      </div>
    );
  }

  return (
    <div className={shellClass}>
      {Badge}
      <AICoachDemo exerciseKey={exerciseKey} hero={variant === 'hero'} compact={variant === 'thumb'} />
    </div>
  );
}
