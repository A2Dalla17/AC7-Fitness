'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { slugToRank, rankToSlug } from '@/lib/seasonProgression';

/** Old URL /missions/rank/bronze/train/0 → /missions/bronze/train/0 */
export default function LegacyRankTrainRedirect() {
  const params = useParams();
  const router = useRouter();
  const rank = slugToRank(String(params.rank));
  const stage = params.stage;

  useEffect(() => {
    if (rank) router.replace(`/missions/${rankToSlug(rank)}/train/${stage}`);
    else router.replace('/missions');
  }, [rank, stage, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="caption text-muted">Redirecting...</p>
    </div>
  );
}
