/**
 * Legacy Score — the true measure of an AC7 Elite member's legacy.
 * More important than raw XP alone.
 */

export const LEGACY_WEIGHTS = {
  xp: 1,
  missionStage: 50,
  certificate: 500,
  communityPost: 15,
  communityComment: 8,
  chatMessage: 3,
  seasonComplete: 1500,
  streakDay: 30,
} as const;

export interface LegacyScoreInput {
  xp: number;
  missionStages: number;
  certificates: number;
  communityPosts: number;
  communityComments: number;
  chatMessages: number;
  seasonsCompleted: number;
  streakDays: number;
}

export function computeLegacyScore(input: LegacyScoreInput): number {
  const w = LEGACY_WEIGHTS;
  return (
    input.xp * w.xp +
    input.missionStages * w.missionStage +
    input.certificates * w.certificate +
    input.communityPosts * w.communityPost +
    input.communityComments * w.communityComment +
    input.chatMessages * w.chatMessage +
    input.seasonsCompleted * w.seasonComplete +
    input.streakDays * w.streakDay
  );
}

export function formatLegacyScore(score: number): string {
  if (score >= 10000) return `${(score / 1000).toFixed(1)}k`;
  return score.toLocaleString();
}

/** Human-readable breakdown for tooltips / education */
export function legacyScoreBreakdown(input: LegacyScoreInput): { label: string; points: number }[] {
  const w = LEGACY_WEIGHTS;
  return [
    { label: 'XP', points: input.xp * w.xp },
    { label: 'Mission stages', points: input.missionStages * w.missionStage },
    { label: 'Certificates', points: input.certificates * w.certificate },
    { label: 'Community posts', points: input.communityPosts * w.communityPost },
    { label: 'Comments', points: input.communityComments * w.communityComment },
    { label: 'Chat activity', points: input.chatMessages * w.chatMessage },
    { label: 'Seasons completed', points: input.seasonsCompleted * w.seasonComplete },
    { label: 'Consistency (30d)', points: input.streakDays * w.streakDay },
  ].filter((row) => row.points > 0);
}
