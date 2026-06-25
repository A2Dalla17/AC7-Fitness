import Link from 'next/link';
import { format } from 'date-fns';
import { SeasonRank, RANK_COLORS } from '@/lib/seasons';
import type { SeasonProgressState } from '@/lib/seasonProgression';

export default function SeasonBanner({ progress }: { progress: SeasonProgressState }) {
  const endsOn = progress.season.ends_on ? format(new Date(progress.season.ends_on), 'MMM d') : '—';

  return (
    <div className="fit-season-banner">
      <div>
        <p className="fit-season-banner__code">SEASON {progress.season.code}</p>
        <p className="fit-season-banner__name">{progress.season.name}</p>
      </div>
      <div className="fit-season-banner__right">
        <p className="fit-season-banner__pct">{progress.progressPercent}%</p>
        <p className="fit-season-banner__ends">Ends {endsOn}</p>
      </div>
    </div>
  );
}

export function RankSpotlight({
  rank,
  done,
  total,
  href,
}: {
  rank: SeasonRank;
  done: number;
  total: number;
  href: string;
}) {
  const color = RANK_COLORS[rank];
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="fit-rank-spotlight" style={{ '--rank-color': color } as Record<string, string>}>
      <p className="fit-rank-spotlight__badge">{rank.toUpperCase()} · CURRENT RANK</p>
      <p className="fit-rank-spotlight__stages">
        Stage {Math.min(done + 1, total)} of {total}
      </p>
      <div className="fit-progress-bar">
        <div className="fit-progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="fit-rank-spotlight__count">
        {done}/{total} complete
      </p>
      <Link href={href} className="fit-btn fit-btn--primary">
        Continue mission
      </Link>
    </div>
  );
}
