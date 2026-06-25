'use client';

import Link from 'next/link';
import { ChevronRight, Target, User, Trophy, Layers, BookOpen, Flame, Clock, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ContinueHero from '@/components/training/ContinueHero';
import RankLadder from '@/components/training/RankLadder';
import { JourneySection } from '@/components/journey/JourneyBlocks';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';
import { useJourneyStats } from '@/hooks/useJourneyStats';
import StatCard from '@/components/premium/StatCard';
import StatsGrid from '@/components/premium/StatsGrid';
import PremiumCard from '@/components/premium/PremiumCard';
import { useCopy } from '@/context/LanguageContext';
import { LEGACY } from '@/lib/legacyBrand';
import WorldPageHeader from '@/components/world/WorldPageHeader';

function CoursesContent() {
  const COPY = useCopy();
  const { supabaseUser } = useAuth();
  const { progress, loading, continueTraining, missions } = useTrainingProgress(supabaseUser?.id);
  const xp = missions?.xp ?? 0;
  const journeyStats = useJourneyStats(supabaseUser?.id, progress, xp);

  const programs = [
    {
      href: '/missions',
      icon: Target,
      title: COPY.courses.missions,
      meta: progress
        ? COPY.courses.missionsMeta(progress.season.code, progress.currentRank, progress.progressPercent)
        : 'Seasonal missions · Bronze → Master',
      primary: true,
    },
    {
      href: '/courses/private-training',
      icon: User,
      title: COPY.courses.pct,
      meta: COPY.courses.pctMeta,
    },
    {
      href: '/courses/missions',
      icon: Trophy,
      title: COPY.courses.challenges,
      meta: COPY.courses.challengesMeta,
    },
    {
      href: '/courses/private-training',
      icon: Layers,
      title: COPY.courses.masterLevels,
      meta: COPY.courses.masterLevelsMeta,
    },
  ];

  const trainingMinutes = journeyStats.missionsCompleted * 8;

  return (
    <div className="fit-page">
      <WorldPageHeader title={COPY.courses.title} subline={`${COPY.courses.trainingHub} · ${LEGACY.philosophy}`} />

      {!loading && (
        <StatsGrid cols={4}>
          <StatCard
            accent
            label={COPY.courses.statsStreak}
            value={`${journeyStats.streakDays}d`}
            icon={<Flame size={18} />}
          />
          <StatCard
            label={COPY.courses.statsWeeklyXp}
            value={`+${journeyStats.weeklyXp}`}
            icon={<Zap size={18} />}
          />
          <StatCard
            label={COPY.courses.statsTrainingTime}
            value={`${trainingMinutes}m`}
            icon={<Clock size={18} />}
          />
          <StatCard
            label={COPY.courses.statsCompletion}
            value={`${progress?.progressPercent ?? 0}%`}
            icon={<TrendingUp size={18} />}
          />
        </StatsGrid>
      )}

      <JourneySection title={COPY.courses.currentMission} priority={1}>
        {!loading && continueTraining ? (
          <ContinueHero training={continueTraining} premium />
        ) : (
          <Link href="/missions" className="fit-continue-hero fit-continue-hero--idle premium-card premium-card--glow">
            <p className="fit-continue-hero__label">{COPY.courses.resume}</p>
            <h2 className="fit-continue-hero__title">{COPY.courses.missions}</h2>
            <p className="fit-continue-hero__meta">
              {progress
                ? COPY.courses.missionsMeta(progress.season.code, progress.currentRank, progress.progressPercent)
                : `Season A1 · ${COPY.defaultRank}`}
            </p>
          </Link>
        )}
      </JourneySection>

      {progress && (
        <JourneySection title={COPY.journey.rankProgression} priority={3}>
          <PremiumCard className="rank-progress-panel">
            <p className="fit-journey-progress__label">{COPY.missions.rankPath}</p>
            <div className="fit-progress-bar">
              <div
                className="fit-progress-bar__fill home-progress-bar__fill"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
            <RankLadder completions={progress.completions} currentRank={progress.currentRank} />
          </PremiumCard>
        </JourneySection>
      )}

      <JourneySection title={COPY.courses.yourPrograms} priority={2}>
        {programs.map(({ href, icon: Icon, title, meta, primary }) => (
          <Link
            key={title}
            href={href}
            className={`fit-hub-row premium-card premium-card--interactive mb-2 ${primary ? 'fit-hub-row--primary' : ''}`}
          >
            <span className="fit-hub-row__icon">
              <Icon size={22} className={primary ? 'text-orange-400' : 'text-muted'} />
            </span>
            <div className="fit-hub-row__body">
              <p className="fit-hub-row__title">{title}</p>
              <p className="fit-hub-row__meta">{meta}</p>
            </div>
            <ChevronRight size={20} className="fit-hub-row__chevron" />
          </Link>
        ))}
      </JourneySection>

      <JourneySection title="Resources" priority={4}>
        <Link href="/guides" className="fit-journey-secondary premium-card premium-card--interactive">
          <BookOpen size={16} className="shrink-0 text-muted" />
          <div className="min-w-0 flex-1">
            <p className="fit-journey-secondary__title">{COPY.courses.guides}</p>
            <p className="fit-journey-secondary__meta">{COPY.courses.guidesMeta}</p>
          </div>
          <ChevronRight size={16} className="shrink-0 text-muted" />
        </Link>
      </JourneySection>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <ProtectedRoute>
      <CoursesContent />
    </ProtectedRoute>
  );
}
