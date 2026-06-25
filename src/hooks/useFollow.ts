'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useFollowStats(userId: string | undefined) {
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const [{ count: fc }, { count: fg }] = await Promise.all([
      supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
    ]);
    setFollowers(fc ?? 0);
    setFollowing(fg ?? 0);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { followers, following, refresh };
}

export function useIsFollowing(targetId: string | undefined, viewerId: string | undefined) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetId || !viewerId || targetId === viewerId) {
      setIsFollowing(false);
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('user_follows')
        .select('follower_id')
        .eq('follower_id', viewerId)
        .eq('following_id', targetId)
        .maybeSingle();
      setIsFollowing(Boolean(data));
      setLoading(false);
    })();
  }, [targetId, viewerId]);

  const toggle = async () => {
    if (!targetId || !viewerId || targetId === viewerId) return;
    if (isFollowing) {
      await supabase.from('user_follows').delete().eq('follower_id', viewerId).eq('following_id', targetId);
      setIsFollowing(false);
    } else {
      await supabase.from('user_follows').insert({ follower_id: viewerId, following_id: targetId });
      setIsFollowing(true);
    }
  };

  return { isFollowing, loading, toggle };
}
