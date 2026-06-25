'use client';

import Link from 'next/link';
import { Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import VideoUpload from '@/components/ac7/VideoUpload';
import { useCanUploadVideos } from '@/lib/useCanUploadVideos';
import SeasonBanner from '@/components/training/SeasonBanner';
import StageChecklist from '@/components/training/StageChecklist';
import MissionRoadmap from '@/components/missions/MissionRoadmap';
import { JourneySection } from '@/components/journey/JourneyBlocks';
import { useTrainingProgress } from '@/hooks/useTrainingProgress';
import { useCopy } from '@/context/LanguageContext';
import WorldPageHeader from '@/components/world/WorldPageHeader';
import {
  completedStagesInRank,
  missionRankPath,
} from '@/lib/seasonProgression';
import { RANK_STAGE_COUNTS } from '@/lib/seasons';

function MissionsContent() {
  const COPY = useCopy();
  const { supabaseUser } = useAuth();
  const { progress, loading, continueTraining } = useTrainingProgress(supabaseUser?.id);
  const { canUpload } = useCanUploadVideos();

  if (loading || !progress) {
    return (
      <div className="fit-page">
        <p className="text-muted">Loading your climb…</p>
      </div>
    );
  }

  const currentRank = progress.currentRank;
  const rankDone = completedStagesInRank(progress.completions, currentRank);
  const rankTotal = RANK_STAGE_COUNTS[currentRank];
  const continueHref = continueTraining?.href ?? missionRankPath(currentRank);

  return (
    <div className="fit-page fit-page--missions">
      <div className="fit-sub-bar">
        <Link href="/courses">{COPY.missions.back}</Link>
      </div>

      <WorldPageHeader title={COPY.missions.title} subline={COPY.missions.roadmapSubline} />

      <SeasonBanner progress={progress} />

      <JourneySection title={COPY.missions.roadmapTitle} priority={1} center>
        <MissionRoadmap
          centered
          completions={progress.completions}
          currentRank={currentRank}
          seasonComplete={progress.seasonComplete}
        />
      </JourneySection>

      <JourneySection title={COPY.journey.currentMission} priority={2}>
        <div className="ac7-section-card">
          <p className="text-sm text-muted mb-1">
            {currentRank} · Stage {Math.min(rankDone + 1, rankTotal)} of {rankTotal}
          </p>
          <p className="fit-page-title text-lg font-bold">{rankDone}/{rankTotal} stages complete</p>
          <Link href={continueHref} className="fit-btn fit-btn--primary fit-btn--sm mt-4 inline-flex">
            {continueTraining
              ? COPY.missions.continue(continueTraining.stageNumber)
              : COPY.missions.continue(Math.min(rankDone + 1, rankTotal))}
          </Link>
        </div>
      </JourneySection>

      <JourneySection title={COPY.journey.nextStage} priority={3}>
        <StageChecklist rank={currentRank} completions={progress.completions} limit={5} />
        {rankTotal > 5 && (
          <Link href={missionRankPath(currentRank)} className="fit-journey-link">
            {COPY.missions.viewAll(rankTotal)}
          </Link>
        )}
      </JourneySection>

      {canUpload && (
        <JourneySection title={COPY.missions.coachTools} priority={5}>
          <div className="fit-hub-row flex-col !items-start gap-3">
            <div className="flex items-center gap-2">
              <Upload size={16} className="text-orange-400" />
              <span className="text-sm font-semibold">Upload demonstration</span>
            </div>
            <VideoUpload />
          </div>
        </JourneySection>
      )}
    </div>
  );
}

export default function MissionsPage() {
  return (
    <ProtectedRoute>
      <MissionsContent />
    </ProtectedRoute>
  );
}
