'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  demoHallOfFameData,
  parseHallOfFameData,
  type HallOfFameData,
  type HallOfFamePeriod,
} from '@/lib/hallOfFame';

export function useHallOfFame(initialPeriod: HallOfFamePeriod = 'seasonal') {
  const [period, setPeriod] = useState<HallOfFamePeriod>(initialPeriod);
  const [data, setData] = useState<HallOfFameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  const load = useCallback(async (p: HallOfFamePeriod) => {
    setLoading(true);
    const { data: raw, error } = await supabase.rpc('get_hall_of_fame', { p_period: p });

    if (error || !raw) {
      setData(demoHallOfFameData(p));
      setUsingDemo(true);
    } else {
      setData(parseHallOfFameData(raw as Record<string, unknown>));
      setUsingDemo(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load(period);
  }, [period, load]);

  return { data, loading, period, setPeriod, usingDemo, reload: () => load(period) };
}
