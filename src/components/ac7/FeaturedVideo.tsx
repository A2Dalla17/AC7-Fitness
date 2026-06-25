'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ExerciseVideo, exerciseVideoFromRow } from '@/types';

const FALLBACK_VIDEO = '/demos/pushup.mp4';

/**
 * Full-width featured video on the dashboard. Plays the most recently uploaded
 * exercise video (falling back to the bundled demo), looping continuously and
 * silently like an always-on showcase reel — it never stops or pauses.
 */
export default function FeaturedVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [video, setVideo] = useState<ExerciseVideo | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('exercise_videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0) setVideo(exerciseVideoFromRow(data[0] as any));
    })();
  }, []);

  // Keep it playing even if the browser tab/throttling pauses it.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const keepPlaying = () => {
      v.play().catch(() => {});
    };
    v.addEventListener('pause', keepPlaying);
    v.addEventListener('ended', keepPlaying);
    return () => {
      v.removeEventListener('pause', keepPlaying);
      v.removeEventListener('ended', keepPlaying);
    };
  }, [video]);

  const src = video?.videoUrl ?? FALLBACK_VIDEO;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">
      <video
        ref={videoRef}
        src={src}
        className="aspect-[9/16] max-h-[70vh] w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">AC7 Coach</p>
        <p className="text-sm font-bold text-white">{video?.title ?? 'Perfect Push-Up Form'}</p>
      </div>
    </div>
  );
}
