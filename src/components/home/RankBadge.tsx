import type { CSSProperties } from 'react';
import type { SeasonRank } from '@/lib/seasons';
import { RANK_COLORS } from '@/lib/seasons';
import { rankDisplayName } from '@/lib/rankDisplay';

/** Inline rank label — color dot, no card container */
export default function RankBadge({
  rank,
  size = 'md',
}: {
  rank: SeasonRank;
  size?: 'sm' | 'md';
}) {
  const color = RANK_COLORS[rank];

  return (
    <span
      className={`rank-badge rank-badge--${size}`}
      style={{ '--rank-color': color } as CSSProperties}
    >
      <span className="rank-badge__dot" aria-hidden />
      {rankDisplayName(rank)}
    </span>
  );
}
