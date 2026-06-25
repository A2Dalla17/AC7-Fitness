import { ExerciseKey, STAGE_EXERCISES } from '@/lib/exercises';

export type SeasonRank =
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Diamond'
  | 'Platinum'
  | 'Ace 1'
  | 'Ace 2'
  | 'Ace 3'
  | 'Ace 4'
  | 'Ace 5'
  | 'Master';

/** Rank order within a 3-month season. Diamond sits between Gold and Platinum. */
export const SEASON_RANK_ORDER: SeasonRank[] = [
  'Bronze',
  'Silver',
  'Gold',
  'Diamond',
  'Platinum',
  'Ace 1',
  'Ace 2',
  'Ace 3',
  'Ace 4',
  'Ace 5',
  'Master',
];

/**
 * Stages per rank (per the spec). Each successive rank has fewer but harder stages.
 * Diamond sits between Gold (21) and Platinum (17).
 * Master = coach-uploaded challenge missions (count is dynamic), shown separately.
 */
export const RANK_STAGE_COUNTS: Record<SeasonRank, number> = {
  Bronze: 30,
  Silver: 27,
  Gold: 21,
  Diamond: 17,
  Platinum: 17,
  'Ace 1': 11,
  'Ace 2': 10,
  'Ace 3': 7,
  'Ace 4': 4,
  'Ace 5': 2,
  Master: 0,
};

export const RANK_COLORS: Record<SeasonRank, string> = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Diamond: '#38BDF8',
  Platinum: '#A78BFA',
  'Ace 1': '#EF4444',
  'Ace 2': '#F97316',
  'Ace 3': '#EC4899',
  'Ace 4': '#EF4444',
  'Ace 5': '#F97316',
  Master: '#FFD700',
};

export interface StageDef {
  index: number;
  exerciseKey: ExerciseKey;
  name: string;
  reps: number;
}

/**
 * Deterministically generate the stages for a rank. Cycles through the exercise
 * library and scales reps up with both rank difficulty and stage index, so every
 * next stage is harder than the last.
 */
export function stagesForRank(rank: SeasonRank): StageDef[] {
  const count = RANK_STAGE_COUNTS[rank];
  const rankIdx = SEASON_RANK_ORDER.indexOf(rank);
  const baseReps = 10 + rankIdx * 4; // higher ranks start harder
  return Array.from({ length: count }, (_, i) => {
    const ex = STAGE_EXERCISES[i % STAGE_EXERCISES.length];
    return {
      index: i,
      exerciseKey: ex.key,
      name: ex.name,
      reps: baseReps + i * 2,
    };
  });
}

export function totalStagesInSeason(): number {
  return SEASON_RANK_ORDER.filter((r) => r !== 'Master').reduce((sum, r) => sum + RANK_STAGE_COUNTS[r], 0);
}
