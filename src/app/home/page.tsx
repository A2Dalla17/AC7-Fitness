'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Megaphone, Trophy, Crown, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomeHero from '@/components/home/HomeHero';
import HomeSection from '@/components/home/HomeSection';
import JourneyProgressRing from '@/components/home/JourneyProgressRing';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';
import { rankForXp } from '@/types';
import { COPY } from '@/lib/legacyBrand';
import { CommunityRow, AchievementRow } from '@/components/journey/JourneyBlocks';
import { rankDisplayName } from '@/lib/rankDisplay';
import type { SeasonRank } from '@/lib/seasons';
import { completedStagesInRank } from '@/lib/seasonProgression';
import { RANK_STAGE_COUNTS } from '@/lib/seasons';

function HomeContent() {
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

  return (
    <>
      {!loading && (
        <HomeHero
          firstName={firstName}
          seasonCode={seasonCode}
          rankLabel={rankLabel}
          missionTitle={missionTitle}
          missionMeta={missionMeta}
          continueHref={continueHref}
          continueLabel={continueLabel}
          profileInitial={initial}
        />
      )}

      {progress && (
        <div className="home-progress-row">
          <HomeSection title={COPY.home.missionProgress} className="home-section--inline">
            <p className="home-stat-lead">
              {rankLabel} · Stage {Math.min(rankDone + 1, rankTotal)} of {rankTotal}
            </p>
            <div className="fit-progress-bar">
              <div className="fit-progress-bar__fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="home-stat-meta">{COPY.home.seasonProgress(seasonCode, pct, xp)}</p>
            {continueTraining && (
              <p className="home-stat-hint">
                Next: {continueTraining.exerciseName} · {continueTraining.reps} reps
              </p>
            )}
            <Link href="/missions" className="fit-journey-link inline-flex items-center gap-1 mt-2">
              {COPY.home.openMissions} <ChevronRight size={14} />
            </Link>
          </HomeSection>

          <div className="home-progress-ring-wrap">
            <JourneyProgressRing percent={pct} seasonCode={seasonCode} rankLabel={rankLabel} xp={xp} />
          </div>
        </div>
      )}

      <div className="home-split">
        <HomeSection title={COPY.home.communityHighlights}>
          <CommunityRow href="/community" announcement={announcement} />
        </HomeSection>
        <HomeSection title={COPY.journey.achievements}>
          <AchievementRow href="/profile" badges={achievements} />
          <Link href="/certificates" className="fit-journey-link mt-2 inline-block">
            View certificates →
          </Link>
        </HomeSection>
      </div>

      <div className="home-split">
        <HomeSection title={COPY.home.announcements}>
          {announcement ? (
            <Link href="/announcements" className="home-link-row">
              <Megaphone size={18} className="shrink-0 text-orange-400" />
              <span>{announcement}</span>
            </Link>
          ) : (
            <p className="text-sm text-muted">{COPY.home.announcementsEmpty}</p>
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

      <div className="home-footer-links">
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
