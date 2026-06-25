'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

/**
 * Only an admin, or a coach whose profile is verified, may upload exercise videos.
 * Regular clients and unverified/inactive coaches cannot. Mirrors the RLS policy
 * in migration 008 so the UI matches what the database will actually allow.
 */
export function useCanUploadVideos() {
  const { appUser, supabaseUser } = useAuth();
  const [canUpload, setCanUpload] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setChecking(true);
      if (!supabaseUser || !appUser) {
        if (active) {
          setCanUpload(false);
          setChecking(false);
        }
        return;
      }

      if (appUser.role === 'admin') {
        if (active) {
          setCanUpload(true);
          setChecking(false);
        }
        return;
      }

      if (appUser.role === 'coach') {
        const { data } = await supabase
          .from('coaches')
          .select('verified')
          .eq('user_id', supabaseUser.id)
          .maybeSingle();
        if (active) {
          setCanUpload(!!data?.verified);
          setChecking(false);
        }
        return;
      }

      if (active) {
        setCanUpload(false);
        setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [appUser, supabaseUser]);

  return { canUpload, checking };
}
