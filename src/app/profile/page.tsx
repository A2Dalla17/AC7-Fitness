'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Award, Medal, Settings, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import RankLadder from '@/components/training/RankLadder';
import { HallOfFameProfileBanner } from '@/components/hall-of-fame/HallOfFameBlocks';
import { useHallOfFameProfile } from '@/hooks/useHallOfFameProfile';
import { JourneySection } from '@/components/journey/JourneyBlocks';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';
import { rankForXp } from '@/types';
import { COPY, LEGACY } from '@/lib/legacyBrand';
import { SEASON_RANK_ORDER } from '@/lib/seasons';
import { isRankComplete, isRankUnlocked } from '@/lib/seasonProgression';

function ProfileContent() {
  const { appUser, supabaseUser, signOut } = useAuth();
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
  const rankLabel = progress?.currentRank ?? rank?.rank ?? COPY.defaultRank;
  const xp = missions?.xp ?? 0;
  const initial = appUser?.name?.charAt(0).toUpperCase() ?? 'A';

  const ranks = SEASON_RANK_ORDER.filter((r) => r !== 'Master');
  const nextRank = progress
    ? ranks.find((r) => isRankUnlocked(progress.completions, r) && !isRankComplete(progress.completions, r))
    : null;

  return (
    <div className="fit-page">
      <header className="flex items-center justify-end">
        <Link href="/settings" className="fit-top-nav__icon-btn !h-9 !w-9" aria-label={COPY.profile.settings}>
          <Settings size={18} />
        </Link>
      </header>

      <div className="fit-profile-header">
        <div className="fit-profile-avatar">{initial}</div>
        <h1 className="fit-profile-name">{appUser?.name ?? COPY.profile.title}</h1>
        <HallOfFameProfileBanner
          isMember={hofStatus.isMember}
          isChampion={hofStatus.isChampion}
          awards={hofStatus.awards}
        />
        <p className="fit-profile-rank">{COPY.profile.rank(appUser?.role ?? 'member', rankLabel, xp)}</p>
        <p className="fit-legacy-whisper">{COPY.profile.legacySubline}</p>
      </div>

      <div className="fit-profile-body">
      <JourneySection title={COPY.profile.hallOfFame} priority={2}>
        <Link href="/hall-of-fame" className="fit-hub-row fit-hub-row--primary">
          <span className="fit-hub-row__icon">
            <Award size={22} className="text-orange-400" />
          </span>
          <div className="fit-hub-row__body">
            <p className="fit-hub-row__title">{COPY.hallOfFame.title}</p>
            <p className="fit-hub-row__meta">{COPY.profile.viewHallOfFame}</p>
          </div>
        </Link>
      </JourneySection>

      {progress && (
        <JourneySection title={COPY.profile.seasonProgress} priority={3}>
          <p className="fit-journey-progress__label">
            Season {progress.season.code} · {progress.progressPercent}% · {COPY.profile.currentRank}:{' '}
            <strong>{rankLabel}</strong>
            {nextRank && (
              <>
                {' '}
                → {COPY.profile.nextRank}: <strong>{nextRank}</strong>
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

      <JourneySection title={COPY.profile.achievements} priority={4}>
        {achievements.length === 0 ? (
          <p className="text-sm text-muted">{COPY.profile.achievementsEmpty}</p>
        ) : (
          <div className="fit-badge-list">
            {achievements.map((a) => (
              <span key={a.id} className="fit-badge">
                <Medal size={14} className="text-blue-400" /> {a.label}
              </span>
            ))}
          </div>
        )}
      </JourneySection>

      <JourneySection title={COPY.profile.certificates} priority={4}>
        {certificates.length === 0 ? (
          <p className="text-sm text-muted">{COPY.profile.certificatesEmpty}</p>
        ) : (
          certificates.map((c) => (
            <Link key={c.id} href="/certificates" className="fit-cert-row">
              <Award size={18} className="text-blue-400 shrink-0" />
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
          {COPY.profile.settings}
        </Link>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.push('/login');
          }}
          className="fit-btn fit-btn--ghost fit-btn--danger fit-btn--block"
        >
          <LogOut size={16} /> {COPY.profile.signOut}
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
