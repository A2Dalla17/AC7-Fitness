'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RankBadge from '@/components/home/RankBadge';
import JourneyProgressRing from '@/components/home/JourneyProgressRing';
import StatCard from '@/components/premium/StatCard';
import { useJourneyStats } from '@/hooks/useJourneyStats';
import { formatLegacyScore } from '@/lib/legacyScore';
import { type SeasonRank } from '@/lib/seasons';
import { Flame, Award, Zap, Medal, Settings, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import RankLadder from '@/components/training/RankLadder';
import { HallOfFameProfileBanner } from '@/components/hall-of-fame/HallOfFameBlocks';
import { useHallOfFameProfile } from '@/hooks/useHallOfFameProfile';
import { JourneySection } from '@/components/journey/JourneyBlocks';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';
import { rankForXp } from '@/types';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import FollowStats from '@/components/profile/FollowStats';
import { useFollowStats } from '@/hooks/useFollow';
import { useCopy } from '@/context/LanguageContext';
import { LEGACY } from '@/lib/legacyBrand';
import { SEASON_RANK_ORDER } from '@/lib/seasons';
import { isRankComplete, isRankUnlocked } from '@/lib/seasonProgression';

function ProfileContent() {
  const copy = useCopy();
  const { appUser, supabaseUser, signOut, refreshAppUser } = useAuth();
  const router = useRouter();
  const { missions, progress } = useTrainingProgress(supabaseUser?.id);
  const { status: hofStatus } = useHallOfFameProfile(supabaseUser?.id);
  const [achievements, setAchievements] = useState<{ id: string; label: string }[]>([]);
  const [certificates, setCertificates] = useState<{ id: string; title: string; issued_at: string }[]>([]);

  useEffect(() => {
    if (!supabaseUser) return;
    (async () => {
      const { data: c } = await supabase
        .from('certificates')
        .select('id,title,issued_at')
        .eq('user_id', supabaseUser.id);
      if (c) setCertificates(c as any);
      const { data: a } = await supabase.from('achievements').select('id,label').eq('user_id', supabaseUser.id);
      if (a) setAchievements(a as any);
    })();
  }, [supabaseUser]);

  const rank = missions ? rankForXp(missions.xp) : null;
  const rankKey = (progress?.currentRank ?? rank?.rank ?? 'Bronze') as SeasonRank;
  const rankLabel = progress?.currentRank ?? rank?.rank ?? copy.defaultRank;
  const xp = missions?.xp ?? 0;
  const journeyStats = useJourneyStats(supabaseUser?.id, progress, xp);
  const { followers, following } = useFollowStats(supabaseUser?.id);

  const ranks = SEASON_RANK_ORDER.filter((r) => r !== 'Master');
  const nextRank = progress
    ? ranks.find((r) => isRankUnlocked(progress.completions, r) && !isRankComplete(progress.completions, r))
    : null;

  return (
    <div className="fit-page">
      <header className="flex items-center justify-end">
        <Link href="/settings" className="fit-top-nav__icon-btn !h-9 !w-9" aria-label={copy.profile.settings}>
          <Settings size={18} />
        </Link>
      </header>

      <div className="fit-profile-header">
        {supabaseUser && (
          <ProfileAvatar
            userId={supabaseUser.id}
            name={appUser?.name ?? copy.defaultName}
            avatarUrl={appUser?.avatarUrl}
            editable
            onUploaded={() => refreshAppUser(supabaseUser.id)}
          />
        )}
        <p className="text-xs text-muted -mt-2 mb-2">{copy.profile.uploadPhoto}</p>
        <h1 className="fit-profile-name">{appUser?.name ?? copy.profile.title}</h1>
        <HallOfFameProfileBanner
          isMember={hofStatus.isMember}
          isChampion={hofStatus.isChampion}
          awards={hofStatus.awards}
        />
        <RankBadge rank={rankKey} />
        <p className="fit-profile-rank">{copy.profile.rank(appUser?.role ?? 'member', rankLabel, xp)}</p>
        <p className="fit-legacy-whisper">{copy.profile.legacySubline}</p>
        {supabaseUser && <FollowStats userId={supabaseUser.id} followers={followers} following={following} />}

        {progress && (
          <div className="legacy-profile-ring-wrap">
            <JourneyProgressRing
              compact
              percent={progress.progressPercent}
              seasonCode={progress.season.code}
              rankLabel={rankLabel}
              xp={xp}
            />
          </div>
        )}

        <div className="legacy-profile-stats">
          <StatCard label="Legacy Score" value={formatLegacyScore(journeyStats.legacyScore)} icon={<Award size={16} />} />
          <StatCard label="Streak" value={`${journeyStats.streakDays}d`} icon={<Flame size={16} />} />
          <StatCard label="Achievements" value={journeyStats.achievementCount} icon={<Medal size={16} />} />
          <StatCard label="Total XP" value={xp} animateValue icon={<Zap size={16} />} accent />
        </div>
      </div>

      <div className="fit-profile-body">
      <JourneySection title={copy.profile.hallOfFame} priority={2}>
        <Link href="/hall-of-fame" className="fit-hub-row fit-hub-row--primary premium-card premium-card--interactive">
          <span className="fit-hub-row__icon">
            <Award size={22} className="text-orange-400" />
          </span>
          <div className="fit-hub-row__body">
            <p className="fit-hub-row__title">{copy.hallOfFame.title}</p>
            <p className="fit-hub-row__meta">{copy.profile.viewHallOfFame}</p>
          </div>
        </Link>
      </JourneySection>

      {progress && (
        <JourneySection title={copy.profile.seasonProgress} priority={3}>
          <p className="fit-journey-progress__label">
            Season {progress.season.code} · {progress.progressPercent}% · {copy.profile.currentRank}:{' '}
            <strong>{rankLabel}</strong>
            {nextRank && (
              <>
                {' '}
                → {copy.profile.nextRank}: <strong>{nextRank}</strong>
              </>
            )}
          </p>
          <div className="fit-progress-bar">
            <div className="fit-progress-bar__fill" style={{ width: `${progress.progressPercent}%` }} />
          </div>
          <RankLadder completions={progress.completions} currentRank={progress.currentRank} />
          <Link href="/missions" className="fit-journey-link">
            Open missions →
          </Link>
        </JourneySection>
      )}

      <JourneySection title={copy.profile.achievements} priority={4}>
        {achievements.length === 0 ? (
          <p className="text-sm text-muted">{copy.profile.achievementsEmpty}</p>
        ) : (
          <div className="fit-badge-list">
            {achievements.map((a) => (
              <span key={a.id} className="fit-badge">
                <Medal size={14} className="text-orange-400" /> {a.label}
              </span>
            ))}
          </div>
        )}
      </JourneySection>

      <JourneySection title={copy.profile.certificates} priority={4}>
        {certificates.length === 0 ? (
          <p className="text-sm text-muted">{copy.profile.certificatesEmpty}</p>
        ) : (
          certificates.map((c) => (
            <Link key={c.id} href="/certificates" className="fit-cert-row">
              <Award size={18} className="text-orange-400 shrink-0" />
              <span className="flex-1">{c.title}</span>
              <span className="text-sm text-muted">{new Date(c.issued_at).toLocaleDateString()}</span>
            </Link>
          ))
        )}
      </JourneySection>
      </div>

      <p className="fit-legacy-whisper">{LEGACY.emotionalGoal}</p>

      <div className="flex flex-col gap-2 pt-2">
        <Link href="/settings" className="fit-btn fit-btn--ghost fit-btn--block">
          {copy.profile.settings}
        </Link>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.push('/login');
          }}
          className="fit-btn fit-btn--ghost fit-btn--danger fit-btn--block"
        >
          <LogOut size={16} /> {copy.profile.signOut}
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
