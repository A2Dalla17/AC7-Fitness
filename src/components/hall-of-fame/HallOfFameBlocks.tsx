import type { ReactNode } from 'react';
import { Crown, Trophy } from 'lucide-react';
import Ac7BrandWatermark from '@/components/ac7/Ac7BrandWatermark';

export function HallOfFameMedal({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="hof-medal hof-medal--gold" aria-label="1st place">
        <Crown size={18} />
      </span>
    );
  }
  if (rank === 2) {
    return <span className="hof-medal hof-medal--silver">{rank}</span>;
  }
  if (rank === 3) {
    return <span className="hof-medal hof-medal--bronze">{rank}</span>;
  }
  return <span className="hof-medal hof-medal--default">{rank}</span>;
}

export function HallOfFameSection({
  icon,
  title,
  subtitle,
  children,
  featured,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
  featured?: boolean;
}) {
  return (
    <section className={`hof-section ${featured ? 'hof-section--featured' : ''}`}>
      <header className="hof-section__header">
        <span className="hof-section__icon">{icon}</span>
        <div>
          <h2 className="hof-section__title">{title}</h2>
          {subtitle && <p className="hof-section__subtitle">{subtitle}</p>}
        </div>
      </header>
      <div className="hof-section__body">{children}</div>
    </section>
  );
}

export function HallOfFameEntry({
  rank,
  name,
  primary,
  secondary,
  highlight,
}: {
  rank: number;
  name: string;
  primary: string;
  secondary?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`hof-entry ${highlight ? 'hof-entry--highlight' : ''} ${rank <= 3 ? 'hof-entry--podium' : ''}`}>
      <HallOfFameMedal rank={rank} />
      <div className="hof-entry__info">
        <p className="hof-entry__name">{name}</p>
        <p className="hof-entry__primary">{primary}</p>
        {secondary && <p className="hof-entry__secondary">{secondary}</p>}
      </div>
      {rank === 1 && (
        <span className="hof-entry__champion">
          <Trophy size={14} /> Champion
        </span>
      )}
    </div>
  );
}

export function HallOfFameEmpty({ message }: { message: string }) {
  return (
    <div className="hof-empty">
      <Ac7BrandWatermark />
      <p>{message}</p>
    </div>
  );
}

export function HallOfFamePeriodTabs({
  period,
  onChange,
}: {
  period: 'seasonal' | 'monthly' | 'all_time';
  onChange: (p: 'seasonal' | 'monthly' | 'all_time') => void;
}) {
  const tabs = [
    { id: 'seasonal' as const, label: 'This Season' },
    { id: 'monthly' as const, label: 'This Month' },
    { id: 'all_time' as const, label: 'All-Time' },
  ];

  return (
    <div className="hof-period-tabs" role="tablist" aria-label="Ranking period">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={period === id}
          className={`hof-period-tabs__tab ${period === id ? 'hof-period-tabs__tab--active' : ''}`}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function HallOfFameProfileBanner({
  isMember,
  isChampion,
  awards,
}: {
  isMember: boolean;
  isChampion: boolean;
  awards: { label: string; rankPosition: number }[];
}) {
  if (!isMember) return null;

  return (
    <div className={`hof-profile-banner ${isChampion ? 'hof-profile-banner--champion' : ''}`}>
      <Crown size={20} className="hof-profile-banner__icon" />
      <div>
        <p className="hof-profile-banner__title">
          {isChampion ? 'Season Champion' : 'Hall of Fame Member'}
        </p>
        {awards.length > 0 && (
          <div className="hof-profile-banner__badges">
            {awards.slice(0, 3).map((a) => (
              <span key={a.label} className="hof-profile-badge">
                {a.label}
                {a.rankPosition > 1 && ` · #${a.rankPosition}`}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
