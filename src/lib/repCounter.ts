import type { Keypoint } from '@tensorflow-models/pose-detection';
import { ExerciseDef } from '@/lib/exercises';

function angle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAb = Math.hypot(ab.x, ab.y);
  const magCb = Math.hypot(cb.x, cb.y);
  if (magAb === 0 || magCb === 0) return 180;
  const cos = Math.min(1, Math.max(-1, dot / (magAb * magCb)));
  return (Math.acos(cos) * 180) / Math.PI;
}

function find(keypoints: Keypoint[], name: string): Keypoint | undefined {
  return keypoints.find((k) => k.name === name && (k.score ?? 0) > 0.3);
}

/** Picks whichever side (left/right) has higher-confidence keypoints. */
function bestSide(keypoints: Keypoint[], joints: [string, string, string]): [Keypoint, Keypoint, Keypoint] | null {
  const sideScore = (prefix: 'left' | 'right') =>
    joints.reduce((sum, j) => sum + (find(keypoints, `${prefix}_${j}`)?.score ?? 0), 0);

  const left = joints.map((j) => find(keypoints, `left_${j}`));
  const right = joints.map((j) => find(keypoints, `right_${j}`));

  const leftOk = left.every(Boolean);
  const rightOk = right.every(Boolean);
  if (leftOk && rightOk) {
    return sideScore('left') >= sideScore('right')
      ? (left as [Keypoint, Keypoint, Keypoint])
      : (right as [Keypoint, Keypoint, Keypoint]);
  }
  if (leftOk) return left as [Keypoint, Keypoint, Keypoint];
  if (rightOk) return right as [Keypoint, Keypoint, Keypoint];
  return null;
}

export function bodyVisible(keypoints: Keypoint[], exercise: ExerciseDef): boolean {
  return computeMetric(keypoints, exercise) !== null;
}

export function cameraFacingFor(exercise: ExerciseDef): 'user' | 'environment' {
  if (exercise.key === 'pushup' || exercise.key === 'situp' || exercise.key === 'lunge') {
    return 'environment';
  }
  return 'user';
}

export function computeMetric(keypoints: Keypoint[], exercise: ExerciseDef): number | null {
  switch (exercise.metric) {
    case 'elbowAngle': {
      const joints = bestSide(keypoints, ['shoulder', 'elbow', 'wrist']);
      if (!joints) return null;
      return angle(...joints);
    }
    case 'hipAngle': {
      const joints = bestSide(keypoints, ['shoulder', 'hip', 'knee']);
      if (!joints) return null;
      return angle(...joints);
    }
    case 'kneeAngle': {
      const joints = bestSide(keypoints, ['hip', 'knee', 'ankle']);
      if (!joints) return null;
      return angle(...joints);
    }
    case 'armsRaised': {
      const lShoulder = find(keypoints, 'left_shoulder');
      const rShoulder = find(keypoints, 'right_shoulder');
      const lWrist = find(keypoints, 'left_wrist');
      const rWrist = find(keypoints, 'right_wrist');
      if (!lShoulder || !rShoulder || !lWrist || !rWrist) return null;
      const raised = lWrist.y < lShoulder.y && rWrist.y < rShoulder.y;
      return raised ? 1 : 0;
    }
    default:
      return null;
  }
}

export type RepPhase = 'up' | 'down' | 'unknown';
export type RepQuality = 'good' | 'minor' | 'major';

export interface RepResult {
  repCompleted: boolean;
  quality?: RepQuality;
  hint?: string;
  /** true once too many major mistakes have piled up — caller should restart the whole set */
  shouldResetSet?: boolean;
}

const MAX_MAJOR_MISTAKES = 3;

export class RepCounter {
  private phase: RepPhase = 'unknown';
  private exertionExtreme: number | null = null;
  /** the threshold value that represents full, ideal depth for this exercise */
  private targetDepth: number;
  private exertionPhase: RepPhase;

  reps = 0;
  majorMistakes = 0;
  minorIssues: string[] = [];
  /** Current position for live UI feedback */
  currentPhase: RepPhase = 'unknown';

  constructor(private exercise: ExerciseDef) {
    this.targetDepth = Math.min(exercise.downThreshold, exercise.upThreshold);
    this.exertionPhase = exercise.downThreshold <= exercise.upThreshold ? 'down' : 'up';
  }

  /** Feed a new metric reading. */
  update(value: number): RepResult {
    const { downThreshold, upThreshold, countOnUp } = this.exercise;
    const atDown = countOnUp ? value <= downThreshold : value >= downThreshold;
    const atUp = countOnUp ? value >= upThreshold : value <= upThreshold;
    const currentPhase: RepPhase = atDown ? 'down' : atUp ? 'up' : this.phase;

    if (currentPhase === this.exertionPhase) {
      this.exertionExtreme =
        this.exertionExtreme === null ? value : Math.min(this.exertionExtreme, value);
    }

    const countingTransition = countOnUp ? atUp && this.phase === 'down' : atDown && this.phase === 'up';

    if (countingTransition) {
      this.phase = countOnUp ? 'up' : 'down';
      this.currentPhase = this.phase;

      if (this.exercise.metric === 'armsRaised' || this.exertionExtreme === null) {
        this.reps += 1;
        this.exertionExtreme = null;
        return { repCompleted: true, quality: 'good' };
      }

      const deviation = Math.max(0, this.exertionExtreme - this.targetDepth);
      this.exertionExtreme = null;

      if (deviation <= this.exercise.minorTolerance) {
        this.reps += 1;
        return { repCompleted: true, quality: 'good' };
      }
      if (deviation <= this.exercise.majorTolerance) {
        this.reps += 1;
        this.minorIssues.push(this.exercise.formHint);
        return { repCompleted: true, quality: 'minor', hint: this.exercise.formHint };
      }

      this.majorMistakes += 1;
      const shouldResetSet = this.majorMistakes >= MAX_MAJOR_MISTAKES;
      return { repCompleted: false, quality: 'major', hint: this.exercise.formHint, shouldResetSet };
    }

    if (atDown) this.phase = 'down';
    else if (atUp) this.phase = 'up';
    this.currentPhase = this.phase;
    return { repCompleted: false };
  }

  reset() {
    this.phase = 'unknown';
    this.currentPhase = 'unknown';
    this.reps = 0;
    this.majorMistakes = 0;
    this.minorIssues = [];
    this.exertionExtreme = null;
  }
}
