import { Crown, Medal, Trophy } from 'lucide-react';
import PremiumCard from '@/components/premium/PremiumCard';

export interface PodiumEntry {
  rank: number;
  name: string;
  primary: string;
  score?: string;
}

const PODIUM_ICONS = [Trophy, Medal, Crown] as const;

/** Top 3 podium — prestigious, not a leaderboard table */
export default function HallOfFamePodium({
  entries,
  title,
}: {
  entries: PodiumEntry[];
  title: string;
}) {
  const top3 = entries.filter((e) => e.rank <= 3).sort((a, b) => a.rank - b.rank);
  if (top3.length === 0) return null;

  const order = [top3.find((e) => e.rank === 2), top3.find((e) => e.rank === 1), top3.find((e) => e.rank === 3)].filter(
    Boolean,
  ) as PodiumEntry[];

  return (
    <section className="hof-podium">
      <p className="hof-podium__title">{title}</p>
      <div className="hof-podium__stage">
        {order.map((entry) => {
          const Icon = PODIUM_ICONS[entry.rank - 1] ?? Medal;
          return (
            <PremiumCard
              key={entry.rank}
              className={`hof-podium__slot hof-podium__slot--${entry.rank} hof-podium__slot--rise`}
              glow={entry.rank === 1}
            >
              <Icon size={entry.rank === 1 ? 28 : 22} className="hof-podium__trophy" />
              <span className="hof-podium__place">#{entry.rank}</span>
              <p className="hof-podium__name">{entry.name}</p>
              <p className="hof-podium__primary">{entry.primary}</p>
              {entry.score && <p className="hof-podium__score">{entry.score}</p>}
            </PremiumCard>
          );
        })}
      </div>
    </section>
  );
}
