import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface HomeHeroProps {
  firstName: string;
  seasonCode: string;
  rankLabel: string;
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
  rankLabel,
  missionTitle,
  missionMeta,
  continueHref,
  continueLabel,
  profileInitial,
}: HomeHeroProps) {
  return (
    <section className="ac7-home-hero">
      <div
        className="ac7-home-hero__media"
        style={{ backgroundImage: "url('/gym-bg.png')" }}
        aria-hidden
      />
      <div className="ac7-home-hero__overlay" aria-hidden />

      <div className="ac7-home-hero__content">
        <div className="ac7-home-hero__head">
          <div>
            <h1 className="ac7-home-hero__greeting">Welcome Back, {firstName}</h1>
            <p className="ac7-home-hero__season">Season {seasonCode}</p>
            <p className="ac7-home-hero__rank">{rankLabel}</p>
          </div>
          <Link href="/profile" className="ac7-home-hero__avatar" title="Profile">
            {profileInitial}
          </Link>
        </div>

        <div className="ac7-home-hero__mission">
          <p className="ac7-home-hero__mission-label">Today&apos;s Mission</p>
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
