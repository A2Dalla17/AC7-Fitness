import { Rank, RANK_THRESHOLDS } from '@/types';

export type ExerciseKey = 'pushup' | 'situp' | 'squat' | 'jumpingjack' | 'lunge';

export interface ExerciseDef {
  key: ExerciseKey;
  name: string;
  instruction: string;
  /** short tagline shown under the mission title */
  tagline: string;
  /** numbered "How To Perform" steps */
  steps: string[];
  /** rough calories burned per rep, for the live calorie counter */
  caloriesPerRep: number;
  metric: 'elbowAngle' | 'hipAngle' | 'kneeAngle' | 'armsRaised';
  /** value when in the "down"/contracted position */
  downThreshold: number;
  /** value when in the "up"/extended position */
  upThreshold: number;
  /** true if a rep is counted going down->up (most reps), false if up->down */
  countOnUp: boolean;
  /** degrees past the target depth that are still tolerated as a minor, pass-but-flagged mistake */
  minorTolerance: number;
  /** degrees past the target depth beyond which the rep doesn't count and must be redone */
  majorTolerance: number;
  /** shown when a rep falls in the minor or major mistake band */
  formHint: string;
}

export const STAGE_EXERCISES: ExerciseDef[] = [
  {
    key: 'pushup',
    name: 'Push-Ups',
    instruction: 'Prop your phone on the floor to your SIDE so your full body is in frame. Lower your chest, then push back up — the app counts each rep automatically.',
    tagline: 'Build upper body strength and endurance.',
    steps: [
      'Place phone on the floor, camera facing your SIDE (not your face).',
      'Get into plank — hands shoulder-width apart.',
      'Lower until chest nears the floor, then push back up. Each rep gets a tick ✓',
    ],
    caloriesPerRep: 0.5,
    metric: 'elbowAngle',
    downThreshold: 100,
    upThreshold: 150,
    countOnUp: true,
    minorTolerance: 15,
    majorTolerance: 35,
    formHint: 'Bend your elbows further — lower your chest closer to the floor.',
  },
  {
    key: 'situp',
    name: 'Sit-Ups',
    instruction: 'Lie on your back, knees bent, camera to your side. Curl up until your torso is upright.',
    tagline: 'Strengthen your core and abs.',
    steps: [
      'Lie on your back with knees bent, feet flat on the floor.',
      'Curl your torso up until it is nearly vertical.',
      'Lower back down with control to the starting position.',
    ],
    caloriesPerRep: 0.4,
    metric: 'hipAngle',
    downThreshold: 130,
    upThreshold: 70,
    countOnUp: false,
    minorTolerance: 15,
    majorTolerance: 35,
    formHint: 'Curl up further — bring your chest closer to your knees.',
  },
  {
    key: 'squat',
    name: 'Squats',
    instruction: 'Stand facing the camera, feet shoulder-width apart. Squat down until thighs are parallel to the floor.',
    tagline: 'Build leg and glute strength.',
    steps: [
      'Stand with feet shoulder-width apart, facing the camera.',
      'Squat down until your thighs are parallel to the floor.',
      'Push through your heels back up to standing.',
    ],
    caloriesPerRep: 0.6,
    metric: 'kneeAngle',
    downThreshold: 100,
    upThreshold: 160,
    countOnUp: true,
    minorTolerance: 15,
    majorTolerance: 35,
    formHint: 'Squat lower — get your thighs closer to parallel with the floor.',
  },
  {
    key: 'jumpingjack',
    name: 'Jumping Jacks',
    instruction: 'Stand facing the camera with space around you. Jump, raising both arms overhead each rep.',
    tagline: 'Get your heart rate up fast.',
    steps: [
      'Stand with feet together, arms at your sides.',
      'Jump while spreading your legs and raising both arms overhead.',
      'Jump back to the starting position and repeat.',
    ],
    caloriesPerRep: 0.8,
    metric: 'armsRaised',
    downThreshold: 0,
    upThreshold: 1,
    countOnUp: true,
    minorTolerance: Infinity,
    majorTolerance: Infinity,
    formHint: 'Raise both arms fully overhead each jump.',
  },
  {
    key: 'lunge',
    name: 'Lunges',
    instruction: 'Stand sideways to the camera. Step forward and lower your back knee toward the floor.',
    tagline: 'Build single-leg strength and balance.',
    steps: [
      'Stand tall, then step one leg forward.',
      'Lower your back knee toward the floor, front knee at 90°.',
      'Push back up to standing and repeat, alternating legs.',
    ],
    caloriesPerRep: 0.6,
    metric: 'kneeAngle',
    downThreshold: 100,
    upThreshold: 160,
    countOnUp: true,
    minorTolerance: 15,
    majorTolerance: 35,
    formHint: 'Lower your back knee closer to the floor on each rep.',
  },
];

/** Target reps scale with rank — Bronze starts at 5, +2 reps per rank up. */
export function targetRepsForRank(rank: Rank): number {
  const idx = RANK_THRESHOLDS.findIndex((r) => r.rank === rank);
  return 5 + Math.max(0, idx) * 2;
}

export function stageKeyFor(rank: Rank, stageIndex: number): string {
  return `${rank}_${stageIndex}`;
}

export type StageProgress = Record<string, boolean[]>;

export function getRankStages(progress: StageProgress, rank: Rank): boolean[] {
  return progress[rank] ?? STAGE_EXERCISES.map(() => false);
}

export function isStageUnlocked(progress: StageProgress, rank: Rank, stageIndex: number): boolean {
  if (stageIndex === 0) return true;
  const stages = getRankStages(progress, rank);
  return stages[stageIndex - 1] === true;
}

export function isRankComplete(progress: StageProgress, rank: Rank): boolean {
  const stages = getRankStages(progress, rank);
  return stages.length === STAGE_EXERCISES.length && stages.every(Boolean);
}
