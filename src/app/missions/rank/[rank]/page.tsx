'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { slugToRank, rankToSlug } from '@/lib/seasonProgression';

/** Old URL /missions/rank/bronze → /missions/bronze */
export default function LegacyRankRedirect() {
  const params = useParams();
  const router = useRouter();
  const rank = slugToRank(String(params.rank));

  useEffect(() => {
    if (rank) router.replace(`/missions/${rankToSlug(rank)}`);
    else router.replace('/missions');
  }, [rank, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="caption text-muted">Redirecting...</p>
    </div>
  );
}
