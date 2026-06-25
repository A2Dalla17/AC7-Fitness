'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import FollowStats from '@/components/profile/FollowStats';
import RankBadge from '@/components/home/RankBadge';
import { useFollowStats, useIsFollowing } from '@/hooks/useFollow';
import { useCopy } from '@/context/LanguageContext';
import { rankForXp } from '@/types';
import { type SeasonRank } from '@/lib/seasons';

function PublicProfileContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const copy = useCopy();
  const { supabaseUser } = useAuth();
  const userId = params.id;

  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [rankKey, setRankKey] = useState<SeasonRank>('Bronze');

  const { followers, following, refresh: refreshStats } = useFollowStats(userId);
  const { isFollowing, loading: followLoading, toggle } = useIsFollowing(userId, supabaseUser?.id);

  useEffect(() => {
    if (!userId) return;
    if (supabaseUser?.id === userId) {
      router.replace('/profile');
      return;
    }
    (async () => {
      const { data: user } = await supabase.from('users').select('name,role,avatar_url').eq('id', userId).maybeSingle();
      if (!user) return;
      setName((user as any).name);
      setRole((user as any).role ?? 'member');
      setAvatarUrl((user as any).avatar_url ?? null);
      const { data: m } = await supabase.from('missions').select('xp,level').eq('user_id', userId).maybeSingle();
      if (m) {
        setXp((m as any).xp ?? 0);
        const r = rankForXp((m as any).xp ?? 0);
        setRankKey((r?.rank as SeasonRank) ?? 'Bronze');
      }
    })();
  }, [userId, supabaseUser?.id, router]);

  const handleFollow = async () => {
    await toggle();
    refreshStats();
  };

  if (!userId) return null;

  return (
    <div className="fit-page">
      <Link href="/community" className="inline-flex items-center gap-1 text-sm text-muted mb-4">
        <ArrowLeft size={16} /> {copy.community.title}
      </Link>

      <div className="fit-profile-header">
        <ProfileAvatar userId={userId} name={name} avatarUrl={avatarUrl} size="lg" />
        <h1 className="fit-profile-name">{name}</h1>
        <RankBadge rank={rankKey} />
        <p className="fit-profile-rank">{copy.profile.rank(role, rankKey, xp)}</p>
        <FollowStats userId={userId} followers={followers} following={following} />

        {supabaseUser && supabaseUser.id !== userId && (
          <button
            type="button"
            onClick={handleFollow}
            disabled={followLoading}
            className={`fit-btn mt-4 ${isFollowing ? 'fit-btn--ghost' : 'fit-btn--primary'}`}
          >
            {isFollowing ? copy.profile.unfollow : copy.profile.follow}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  return (
    <ProtectedRoute>
      <PublicProfileContent />
    </ProtectedRoute>
  );
}
