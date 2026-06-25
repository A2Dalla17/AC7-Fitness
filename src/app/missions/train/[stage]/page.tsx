'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { loadSeasonProgress, missionTrainPath, nextIncompleteStage } from '@/lib/seasonProgression';

/** Legacy route — redirects to the user's current rank/stage trainer. */
function LegacyTrainRedirect() {
  const { supabaseUser } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('Finding your next stage...');

  useEffect(() => {
    if (!supabaseUser) return;
    (async () => {
      const progress = await loadSeasonProgress(supabase, supabaseUser.id);
      if (!progress) {
        router.replace('/missions');
        return;
      }
      const next = nextIncompleteStage(progress.completions);
      if (next) {
        router.replace(missionTrainPath(next.rank, next.stageIndex));
        return;
      }
      setMessage('Season complete — opening missions.');
      router.replace('/missions');
    })();
  }, [supabaseUser, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <p className="caption text-muted">{message}</p>
    </div>
  );
}

export default function LegacyTrainPage() {
  return (
    <ProtectedRoute>
      <LegacyTrainRedirect />
    </ProtectedRoute>
  );
}
