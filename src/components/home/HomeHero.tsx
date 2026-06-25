import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { SeasonRank } from '@/lib/seasons';
import RankBadge from '@/components/home/RankBadge';

interface HomeHeroProps {
  firstName: string;
  seasonCode: string;
  rankKey: SeasonRank;
  missionTitle: string;
  missionMeta: string;
  continueHref: string;
  continueLabel: string;
  profileInitial: string;
}

/** Centered focal hero — single premium block, not split cards */
export default function HomeHero({
  firstName,
  seasonCode,
  rankKey,
  missionTitle,
  missionMeta,
  continueHref,
  continueLabel,
  profileInitial,
}: HomeHeroProps) {
  return (
    <section className="ac7-home-hero home-animate home-animate--1">
      <div
        className="ac7-home-hero__media"
        style={{ backgroundImage: "url('/gym-bg.png')" }}
        aria-hidden
      />
      <div className="ac7-home-hero__overlay" aria-hidden />

      <div className="ac7-home-hero__content">
        <div className="ac7-home-hero__head">
          <div className="ac7-home-hero__identity">
            <p className="ac7-home-hero__eyebrow">Season {seasonCode}</p>
            <h1 className="ac7-home-hero__greeting">Welcome back, {firstName}</h1>
            <RankBadge rank={rankKey} size="sm" />
          </div>
          <Link href="/profile" className="ac7-home-hero__avatar" title="Profile">
            {profileInitial}
          </Link>
        </div>

        <div className="ac7-home-hero__mission">
          <p className="ac7-home-hero__mission-label">Today&apos;s mission</p>
          <p className="ac7-home-hero__mission-title">{missionTitle}</p>
          <p className="ac7-home-hero__mission-meta">{missionMeta}</p>
          <Link href={continueHref} className="fit-btn fit-btn--primary fit-btn--sm ac7-home-hero__cta">
            {continueLabel}
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
