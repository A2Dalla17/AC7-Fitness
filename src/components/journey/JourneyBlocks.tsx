'use client';

import Link from 'next/link';
import { Award, ChevronRight, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCopy } from '@/context/LanguageContext';

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
  home,
}: {
  href: string;
  announcement?: string | null;
  /** Open home layout — no card row */
  home?: boolean;
}) {
  const COPY = useCopy();
  if (home) {
    return (
      <Link href={href} className="home-community">
        <div className="home-community__icon-wrap">
          <span className="home-community__pulse" aria-hidden />
          <Users size={18} className="home-community__icon" />
        </div>
        <div className="home-community__body">
          <p className="home-community__title">{COPY.home.communityCta}</p>
          <p className="home-community__preview">
            {announcement ?? COPY.home.communityMeta}
          </p>
        </div>
        <ChevronRight size={16} className="home-community__chevron" />
      </Link>
    );
  }

  return (
    <Link href={href} className="fit-journey-nation">
      <Users size={20} className="shrink-0 text-orange-400" />
      <div className="min-w-0 flex-1">
        <p className="fit-journey-nation__title">{COPY.home.communityCta}</p>
        <p className="fit-journey-nation__meta">
          {announcement ? announcement : COPY.home.communityMeta}
        </p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-muted" />
    </Link>
  );
}

export function AchievementRow({
  href,
  badges,
  home,
}: {
  href: string;
  badges: { id: string; label: string }[];
  home?: boolean;
}) {
  const COPY = useCopy();
  if (home) {
    return (
      <div className="home-achievements">
        <div className="home-achievements__head">
          <Award size={16} className="home-achievements__icon" />
          <span className="home-achievements__count">
            {badges.length === 0 ? 'No badges yet' : `${badges.length} earned`}
          </span>
        </div>
        {badges.length === 0 ? (
          <p className="home-achievements__empty">{COPY.home.achievementsEmpty}</p>
        ) : (
          <ul className="home-achievements__list">
            {badges.slice(0, 4).map((b) => (
              <li key={b.id} className="home-achievement-pill">
                {b.label}
              </li>
            ))}
            {badges.length > 4 && (
              <li className="home-achievement-pill home-achievement-pill--more">
                +{badges.length - 4}
              </li>
            )}
          </ul>
        )}
        <Link href={href} className="home-achievements__link">
          View profile <ChevronRight size={14} />
        </Link>
      </div>
    );
  }

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
