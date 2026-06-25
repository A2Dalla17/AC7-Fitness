import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { COPY } from '@/lib/legacyBrand';

/** Guided journey section — experience layer; features unchanged underneath */
export function JourneySection({
  title,
  priority,
  children,
  center,
}: {
  title: string;
  priority?: 1 | 2 | 3 | 4 | 5;
  children: ReactNode;
  /** Center progress rings, roadmap, etc. */
  center?: boolean;
}) {
  return (
    <section
      className={`fit-journey ${priority ? `fit-journey--p${priority}` : ''} ${center ? 'fit-journey--center' : ''}`}
    >
      <h2 className="fit-journey__title">{title}</h2>
      {children}
    </section>
  );
}

export function NextMilestoneRow({
  href,
  label,
  meta,
}: {
  href: string;
  label: string;
  meta: string;
}) {
  return (
    <Link href={href} className="fit-journey-next">
      <div>
        <p className="fit-journey-next__label">{label}</p>
        <p className="fit-journey-next__meta">{meta}</p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-muted" />
    </Link>
  );
}

export function CommunityRow({
  href,
  announcement,
}: {
  href: string;
  announcement?: string | null;
}) {
  return (
    <Link href={href} className="fit-journey-nation">
      <Users size={20} className="shrink-0 text-blue-400" />
      <div className="min-w-0 flex-1">
        <p className="fit-journey-nation__title">{COPY.home.communityCta}</p>
        <p className="fit-journey-nation__meta">
          {announcement ? `📢 ${announcement}` : COPY.home.communityMeta}
        </p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-muted" />
    </Link>
  );
}

export function AchievementRow({
  href,
  badges,
}: {
  href: string;
  badges: { id: string; label: string }[];
}) {
  return (
    <Link href={href} className="fit-journey-achieve">
      <div className="min-w-0 flex-1">
        {badges.length === 0 ? (
          <p className="fit-journey-achieve__empty">{COPY.home.achievementsEmpty}</p>
        ) : (
          <div className="fit-badge-list">
            {badges.slice(0, 3).map((b) => (
              <span key={b.id} className="fit-badge">
                {b.label}
              </span>
            ))}
            {badges.length > 3 && (
              <span className="fit-badge text-muted">+{badges.length - 3}</span>
            )}
          </div>
        )}
      </div>
      <ChevronRight size={18} className="shrink-0 text-muted" />
    </Link>
  );
}
