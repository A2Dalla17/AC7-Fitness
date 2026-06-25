import Link from 'next/link';
import { Check, Lock } from 'lucide-react';
import { SEASON_RANK_ORDER, RANK_COLORS, SeasonRank } from '@/lib/seasons';
import { LEGEND_LABEL, rankDisplayName } from '@/lib/rankDisplay';
import {
  isRankComplete,
  isRankUnlocked,
  missionRankPath,
} from '@/lib/seasonProgression';

export default function MissionRoadmap({
  completions,
  currentRank,
  seasonComplete,
  centered = false,
}: {
  completions: Set<string>;
  currentRank: SeasonRank;
  seasonComplete?: boolean;
  /** Vertical roadmap centered in section */
  centered?: boolean;
}) {
  const ranks = SEASON_RANK_ORDER.filter((r) => r !== 'Master');

  return (
    <nav
      className={`ac7-roadmap ${centered ? 'ac7-roadmap--centered' : ''}`}
      aria-label="Mission journey"
    >
      {ranks.map((rank, index) => {
        const unlocked = isRankUnlocked(completions, rank);
        const complete = isRankComplete(completions, rank);
        const current = currentRank === rank && !complete;
        const color = RANK_COLORS[rank];

        return (
          <div key={rank} className="ac7-roadmap__segment">
            <Link
              href={unlocked ? missionRankPath(rank) : '#'}
              className={`ac7-roadmap__node ${complete ? 'ac7-roadmap__node--complete' : ''} ${current ? 'ac7-roadmap__node--current' : ''} ${!unlocked ? 'ac7-roadmap__node--locked' : ''}`}
              style={{ '--rank-color': color } as Record<string, string>}
              onClick={(e) => !unlocked && e.preventDefault()}
            >
              <span className="ac7-roadmap__marker" aria-hidden>
                {complete ? (
                  <Check size={14} strokeWidth={3} />
                ) : unlocked ? (
                  <span className="ac7-roadmap__dot" />
                ) : (
                  <Lock size={12} />
                )}
              </span>
              <span className="ac7-roadmap__label">{rankDisplayName(rank)}</span>
              {current && <span className="ac7-roadmap__badge">You are here</span>}
            </Link>
            {index < ranks.length - 1 && <span className="ac7-roadmap__connector" aria-hidden />}
          </div>
        );
      })}

      <div className="ac7-roadmap__segment">
        <Link
          href={seasonComplete ? '/certificates' : missionRankPath('Master')}
          className={`ac7-roadmap__node ac7-roadmap__node--master ${seasonComplete ? 'ac7-roadmap__node--complete' : ''}`}
          style={{ '--rank-color': RANK_COLORS.Master } as Record<string, string>}
        >
          <span className="ac7-roadmap__marker" aria-hidden>
            {seasonComplete ? <Check size={14} strokeWidth={3} /> : <span className="ac7-roadmap__dot" />}
          </span>
          <span className="ac7-roadmap__label">{rankDisplayName('Master')}</span>
        </Link>
        <span className="ac7-roadmap__connector" aria-hidden />
      </div>

      <div className="ac7-roadmap__segment ac7-roadmap__segment--legend">
        <div
          className={`ac7-roadmap__node ac7-roadmap__node--legend ${seasonComplete ? 'ac7-roadmap__node--complete' : 'ac7-roadmap__node--locked'}`}
        >
          <span className="ac7-roadmap__marker" aria-hidden>
            {seasonComplete ? <Check size={14} strokeWidth={3} /> : <Lock size={12} />}
          </span>
          <span className="ac7-roadmap__label">{LEGEND_LABEL}</span>
        </div>
      </div>
    </nav>
  );
}
