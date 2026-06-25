import { ExerciseKey } from '@/lib/exercises';

export interface CoachMedia {
  video?: string;
  photo?: string;
}

/** Demo videos per exercise — drop .mp4 files into /public/demos/ */
export const COACH_MEDIA: Record<ExerciseKey, CoachMedia> = {
  pushup: { video: '/demos/pushup.mp4', photo: '/demos/posters/pushup.jpg' },
  situp: { video: '/demos/situp.mp4', photo: '/demos/posters/situp.jpg' },
  squat: { video: '/demos/squat.mp4', photo: '/demos/posters/squat.jpg' },
  jumpingjack: { video: '/demos/jumpingjack.mp4', photo: '/demos/posters/jumpingjack.jpg' },
  lunge: { video: '/demos/lunge.mp4', photo: '/demos/posters/lunge.jpg' },
};

export function demoVideoFor(key: ExerciseKey): string {
  return COACH_MEDIA[key].video ?? `/demos/${key}.mp4`;
}

export function demoPosterFor(key: ExerciseKey): string {
  return COACH_MEDIA[key].photo ?? '/gym-bg.png';
}
