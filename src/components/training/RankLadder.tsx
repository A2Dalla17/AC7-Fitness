import Link from 'next/link';
import { CheckCircle2, Lock } from 'lucide-react';
import { SEASON_RANK_ORDER, RANK_COLORS, SeasonRank } from '@/lib/seasons';
import { isRankComplete, isRankUnlocked, missionRankPath } from '@/lib/seasonProgression';

export default function RankLadder({
  completions,
  currentRank,
}: {
  completions: Set<string>;
  currentRank: SeasonRank;
}) {
  const ranks = SEASON_RANK_ORDER.filter((r) => r !== 'Master');

  return (
    <div className="fit-rank-ladder">
      {ranks.map((rank) => {
        const unlocked = isRankUnlocked(completions, rank);
        const complete = isRankComplete(completions, rank);
        const current = currentRank === rank && !complete;
        const color = RANK_COLORS[rank];

        return (
          <Link
            key={rank}
            href={unlocked ? missionRankPath(rank) : '#'}
            className={`fit-rank-ladder__item ${current ? 'fit-rank-ladder__item--current' : ''} ${!unlocked ? 'fit-rank-ladder__item--locked' : ''}`}
            style={{ '--rank-color': color } as Record<string, string>}
            onClick={(e) => !unlocked && e.preventDefault()}
          >
            {complete ? (
              <CheckCircle2 size={14} className="text-green-400" />
            ) : unlocked ? (
              <span className="fit-rank-ladder__dot" />
            ) : (
              <Lock size={12} />
            )}
            <span>{rank}</span>
          </Link>
        );
      })}
    </div>
  );
}
