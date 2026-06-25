'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { parseHallOfFameProfile, type HallOfFameProfileStatus } from '@/lib/hallOfFame';

const EMPTY: HallOfFameProfileStatus = { isMember: false, isChampion: false, awards: [] };

export function useHallOfFameProfile(userId: string | undefined) {
  const [status, setStatus] = useState<HallOfFameProfileStatus>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setStatus(EMPTY);
      setLoading(false);
      return;
    }

    (async () => {
      const { data, error } = await supabase.rpc('get_hall_of_fame_profile', {
        p_user_id: userId,
      });
      if (error || !data) {
        setStatus(EMPTY);
      } else {
        setStatus(parseHallOfFameProfile(data as Record<string, unknown>));
      }
      setLoading(false);
    })();
  }, [userId]);

  return { status, loading };
}
