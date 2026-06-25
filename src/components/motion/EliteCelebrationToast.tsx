'use client';

import { Check } from 'lucide-react';
import { rankDisplayName } from '@/lib/rankDisplay';
import type { SeasonRank } from '@/lib/seasons';

export default function EliteCelebrationToast({
  message,
  xp,
  previousRank,
  nextRank,
  achievement,
}: {
  message: string;
  xp?: number;
  previousRank?: SeasonRank | string;
  nextRank?: SeasonRank | string;
  /** Season / certificate unlock — subtle confetti */
  achievement?: boolean;
}) {
  const isRankUnlock = Boolean(nextRank && message.toLowerCase().includes('unlock'));
  const prevLabel = previousRank ? rankDisplayName(previousRank as SeasonRank) : '';
  const nextLabel = nextRank ? rankDisplayName(nextRank as SeasonRank) : '';

  return (
    <div className="fixed inset-x-0 top-20 z-50 mx-auto max-w-md px-4">
      <div
        className={`premium-card p-5 elite-celebration elite-celebration__glow ${achievement ? 'achievement-unlock' : ''}`}
      >
        {isRankUnlock && nextLabel ? (
          <div className="rank-unlock text-center">
            {prevLabel && <p className="rank-unlock__out text-lg font-bold text-muted">{prevLabel}</p>}
            <p className="rank-unlock__in text-xl font-extrabold">{nextLabel}</p>
            <p className="mt-2 text-sm text-muted">Rank unlocked</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="elite-celebration__check">
              <Check size={20} strokeWidth={3} />
            </div>
            <p className="mt-3 text-base font-bold text-ink">
              {achievement ? '🏆 Achievement Unlocked' : '✓ Mission Complete'}
            </p>
            <p className="mt-1 text-sm text-ink-secondary">{message}</p>
            {xp !== undefined && xp > 0 && (
              <p className="elite-celebration__xp mt-2 text-lg">+{xp} XP</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
