'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Megaphone, Trophy, Crown, ChevronRight, Flame, Target, Zap, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomeHero from '@/components/home/HomeHero';
import HomeSection from '@/components/home/HomeSection';
import JourneyProgressRing from '@/components/home/JourneyProgressRing';
import RankBadge from '@/components/home/RankBadge';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';
import { rankForXp } from '@/types';
import { useCopy } from '@/context/LanguageContext';
import { CommunityRow, AchievementRow } from '@/components/journey/JourneyBlocks';
import { rankDisplayName } from '@/lib/rankDisplay';
import { RANK_COLORS, RANK_STAGE_COUNTS, type SeasonRank } from '@/lib/seasons';
import { completedStagesInRank } from '@/lib/seasonProgression';
import StatCard from '@/components/premium/StatCard';
import StatsGrid from '@/components/premium/StatsGrid';
import PremiumCard from '@/components/premium/PremiumCard';
import { useJourneyStats } from '@/hooks/useJourneyStats';
import { formatLegacyScore } from '@/lib/legacyScore';

function HomeContent() {
  const COPY = useCopy();
  const { appUser, supabaseUser } = useAuth();
  const { missions, progress, loading, continueTraining } = useTrainingProgress(supabaseUser?.id);
  const [achievements, setAchievements] = useState<{ id: string; label: string }[]>([]);
  const [announcement, setAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseUser) return;
    (async () => {
      const [{ data: a }, { data: ann }] = await Promise.all([
        supabase.from('achievements').select('id,label').eq('user_id', supabaseUser.id).limit(5),
        supabase
          .from('announcements')
          .select('title')
          .order('created_at', { ascending: false })
          .limit(1),
      ]);
      if (a) setAchievements(a as any);
      if (ann?.length) setAnnouncement((ann[0] as any).title);
    })();
  }, [supabaseUser]);

  const firstName = appUser?.name?.split(' ')[0] ?? COPY.defaultName;
  const rank = missions ? rankForXp(missions.xp) : null;
  const rankKey: SeasonRank = progress?.currentRank ?? (rank?.rank as SeasonRank) ?? 'Bronze';
  const rankLabel = rankDisplayName(rankKey);
  const rankColor = RANK_COLORS[rankKey];
  const xp = missions?.xp ?? 0;
  const pct = progress?.progressPercent ?? 0;
  const seasonCode = progress?.season.code ?? 'A1';
  const initial = appUser?.name?.charAt(0).toUpperCase() ?? 'A';

  const missionTitle = continueTraining
    ? continueTraining.exerciseName
    : progress?.seasonComplete
      ? progress.season.name
      : COPY.home.continueIdleTitle;

  const missionMeta = continueTraining
    ? `${continueTraining.rank} · Stage ${continueTraining.stageNumber} · ${continueTraining.reps} reps`
    : progress?.seasonComplete
      ? COPY.home.seasonCompleteTitle
      : COPY.home.continueIdleMeta(seasonCode);

  const continueHref = continueTraining?.href ?? (progress?.seasonComplete ? '/certificates' : '/missions');
  const continueLabel = continueTraining
    ? COPY.home.continueJourney
    : progress?.seasonComplete
      ? COPY.home.seasonCompleteCta
      : COPY.home.continueJourney;

  const rankDone = progress ? completedStagesInRank(progress.completions, progress.currentRank) : 0;
  const rankTotal = progress ? RANK_STAGE_COUNTS[progress.currentRank] : 0;
  const stageCurrent = Math.min(rankDone + 1, rankTotal);
  const rankStagePct = rankTotal > 0 ? Math.round((rankDone / rankTotal) * 100) : 0;
  const journeyStats = useJourneyStats(supabaseUser?.id, progress, xp);
  const weeklyPct = Math.min(100, Math.round((journeyStats.weeklyXp / 500) * 100));
  const monthlyPct = Math.min(100, Math.round((journeyStats.monthlyStages / 20) * 100));

  return (
    <>
      {!loading && (
        <HomeHero
          firstName={firstName}
          seasonCode={seasonCode}
          rankKey={rankKey}
          missionTitle={missionTitle}
          missionMeta={missionMeta}
          continueHref={continueHref}
          continueLabel={continueLabel}
          profileInitial={initial}
        />
      )}

      {!loading && (
        <StatsGrid cols={4}>
          <StatCard
            accent
            label={COPY.home.statsRank}
            value={rankLabel}
            icon={<Award size={18} />}
          />
          <StatCard
            label={COPY.home.statsXp}
            value={xp}
            animateValue
            hint={`Legacy ${formatLegacyScore(journeyStats.legacyScore)}`}
            icon={<Zap size={18} />}
          />
          <StatCard
            label={COPY.home.statsStreak}
            value={`${journeyStats.streakDays}d`}
            hint="Keep the discipline"
            icon={<Flame size={18} />}
          />
          <StatCard
            label={COPY.home.statsMissions}
            value={journeyStats.missionsCompleted}
            hint={`${achievements.length} achievements`}
            icon={<Target size={18} />}
          />
        </StatsGrid>
      )}

      {progress && (
        <div className="home-progress-row home-animate home-animate--2">
          <HomeSection title={COPY.home.missionProgress} className="home-section--progress">
            <div className="home-mission-head">
              <RankBadge rank={rankKey} />
              <span className="home-mission-head__stage">
                Stage {stageCurrent}
                <span className="home-mission-head__sep">/</span>
                {rankTotal}
              </span>
            </div>

            <div
              className="fit-progress-bar home-progress-bar"
              style={{ '--rank-color': rankColor } as CSSProperties}
            >
              <div
                className="fit-progress-bar__fill home-progress-bar__fill"
                style={{ width: `${rankStagePct}%` }}
              />
            </div>

            <div className="home-mission-stats">
              <p className="home-stat-meta">{COPY.home.seasonProgress(seasonCode, pct, xp)}</p>
              {continueTraining && (
                <p className="home-stat-hint">
                  Next · {continueTraining.exerciseName} · {continueTraining.reps} reps
                </p>
              )}
            </div>

            <Link href="/missions" className="home-mission-link">
              {COPY.home.openMissions} <ChevronRight size={14} />
            </Link>
          </HomeSection>

          <div className="home-progress-ring-wrap">
            <JourneyProgressRing
              compact
              percent={pct}
              seasonCode={seasonCode}
              rankLabel={rankLabel}
              xp={xp}
            />
            <p className="home-progress-ring-caption">{xp.toLocaleString()} XP</p>
          </div>
        </div>
      )}

      {progress && (
        <HomeSection title={COPY.home.momentum} className="home-animate home-animate--2">
          <div className="momentum-grid">
            <PremiumCard className="momentum-card">
              <p className="momentum-card__label">{COPY.home.weeklyProgress}</p>
              <p className="momentum-card__value">{weeklyPct}%</p>
              <div className="momentum-card__bar">
                <div className="momentum-card__fill" style={{ width: `${weeklyPct}%` }} />
              </div>
            </PremiumCard>
            <PremiumCard className="momentum-card">
              <p className="momentum-card__label">{COPY.home.monthlyProgress}</p>
              <p className="momentum-card__value">{monthlyPct}%</p>
              <div className="momentum-card__bar">
                <div className="momentum-card__fill" style={{ width: `${monthlyPct}%` }} />
              </div>
            </PremiumCard>
            <PremiumCard className="momentum-card">
              <p className="momentum-card__label">{COPY.home.xpThisWeek}</p>
              <p className="momentum-card__value">+{journeyStats.weeklyXp}</p>
              <div className="momentum-card__bar">
                <div className="momentum-card__fill" style={{ width: `${Math.min(100, weeklyPct)}%` }} />
              </div>
            </PremiumCard>
          </div>
        </HomeSection>
      )}

      <div className="home-split home-animate home-animate--3">
        <HomeSection title={COPY.home.communityHighlights}>
          <CommunityRow home href="/community" announcement={announcement} />
        </HomeSection>
        <HomeSection title={COPY.journey.achievements}>
          <AchievementRow home href="/profile" badges={achievements} />
          <Link href="/certificates" className="home-section-foot-link">
            Certificates <ChevronRight size={14} />
          </Link>
        </HomeSection>
      </div>

      <div className="home-split home-animate home-animate--4">
        <HomeSection title={COPY.home.announcements}>
          {announcement ? (
            <Link href="/announcements" className="home-link-row">
              <Megaphone size={18} className="shrink-0 text-orange-400" />
              <span>{announcement}</span>
            </Link>
          ) : (
            <p className="home-empty-line">{COPY.home.announcementsEmpty}</p>
          )}
        </HomeSection>
        <HomeSection title={COPY.home.challenges}>
          <Link href="/courses" className="home-link-row">
            <Trophy size={18} className="shrink-0 text-orange-400" />
            <span>
              <strong className="block text-ink">{COPY.courses.challenges}</strong>
              <span className="text-sm text-muted">{COPY.courses.challengesMeta}</span>
            </span>
          </Link>
        </HomeSection>
      </div>

      <div className="home-footer-links home-animate home-animate--5">
        <Link href="/hall-of-fame" className="home-link-row">
          <Crown size={18} className="shrink-0 text-orange-400" />
          <span>
            <strong className="block text-ink">{COPY.hallOfFame.title}</strong>
            <span className="text-sm text-muted">{COPY.home.hallOfFameCta}</span>
          </span>
        </Link>
        <Link href="/calendar" className="fit-journey-link">
          {COPY.home.bookCoach} →
        </Link>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
