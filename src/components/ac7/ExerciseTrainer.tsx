'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  RotateCcw,
  AlertTriangle,
  Flame,
  Clock,
  Play,
  Pause,
  SkipForward,
  ArrowLeft,
  Scan,
  CheckCircle2,
} from 'lucide-react';
import type { Keypoint } from '@tensorflow-models/pose-detection';
import { ExerciseDef } from '@/lib/exercises';
import { bodyVisible, cameraFacingFor, computeMetric, RepCounter } from '@/lib/repCounter';
import ExerciseDemoMedia from '@/components/ac7/ExerciseDemoMedia';
import RepTickTracker from '@/components/ac7/RepTickTracker';
import { COPY } from '@/lib/legacyBrand';

const TIME_LIMIT_SEC = 90;
const MISTAKE_FLASH_MS = 1600;
const READY_FRAMES = 8;

type Phase = 'intro' | 'requesting' | 'active' | 'success' | 'timeout';
type ScanStatus = 'searching' | 'ready' | 'tracking';

function drawSkeleton(ctx: CanvasRenderingContext2D, kp: Keypoint[], exercise: ExerciseDef) {
  const line = (a: string, b: string) => {
    const p1 = kp.find((p) => p.name === a && (p.score ?? 0) > 0.3);
    const p2 = kp.find((p) => p.name === b && (p.score ?? 0) > 0.3);
    if (!p1 || !p2) return;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.85)';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  if (exercise.metric === 'elbowAngle') {
    ['left', 'right'].forEach((s) => {
      line(`${s}_shoulder`, `${s}_elbow`);
      line(`${s}_elbow`, `${s}_wrist`);
      line(`${s}_shoulder`, `${s}_hip`);
    });
  }

  kp.forEach((p) => {
    if ((p.score ?? 0) > 0.3) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#60A5FA';
      ctx.fill();
    }
  });
}

export default function ExerciseTrainer({
  exercise,
  targetReps,
  onComplete,
  stageLabel,
}: {
  exercise: ExerciseDef;
  targetReps: number;
  onComplete: (repsDone: number) => void;
  stageLabel?: string;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const counterRef = useRef(new RepCounter(exercise));
  const rafRef = useRef<number | null>(null);
  const detectorRef = useRef<any>(null);
  const mistakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(false);
  const readyFramesRef = useRef(0);

  const [phase, setPhase] = useState<Phase>('intro');
  const [reps, setReps] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TIME_LIMIT_SEC);
  const [error, setError] = useState('');
  const [mistakeHint, setMistakeHint] = useState<string | null>(null);
  const [minorIssues, setMinorIssues] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('searching');
  const [repPhase, setRepPhase] = useState<'up' | 'down' | 'unknown'>('unknown');
  const [repFlash, setRepFlash] = useState(false);

  useEffect(() => {
    counterRef.current = new RepCounter(exercise);
    setReps(0);
  }, [exercise]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (phase !== 'active') return;
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setPhase((p) => (p === 'active' ? 'timeout' : p));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    setError('');
    setPhase('requesting');
    setScanStatus('searching');
    readyFramesRef.current = 0;
    try {
      const facing = cameraFacingFor(exercise);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const tf = await import('@tensorflow/tfjs');
      await import('@tensorflow/tfjs-backend-webgl');
      await tf.setBackend('webgl');
      const poseDetection = await import('@tensorflow-models/pose-detection');
      detectorRef.current = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      });

      counterRef.current.reset();
      setReps(0);
      setMinorIssues([]);
      setMistakeHint(null);
      setPaused(false);
      setSecondsLeft(TIME_LIMIT_SEC);
      setPhase('active');
      loop();
    } catch (e: any) {
      setError(e?.message ?? 'Could not access the camera. Check permissions and try again.');
      setPhase('intro');
    }
  };

  const flashMistake = (hint: string) => {
    setMistakeHint(hint);
    if (mistakeTimeoutRef.current) clearTimeout(mistakeTimeoutRef.current);
    mistakeTimeoutRef.current = setTimeout(() => setMistakeHint(null), MISTAKE_FLASH_MS);
  };

  const flashRep = () => {
    setRepFlash(true);
    setTimeout(() => setRepFlash(false), 500);
  };

  const loop = () => {
    const run = async () => {
      if (!videoRef.current || !detectorRef.current) return;

      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(run);
        return;
      }

      const poses = await detectorRef.current.estimatePoses(videoRef.current);
      const kp = poses[0]?.keypoints;

      const canvas = canvasRef.current;
      if (canvas && videoRef.current) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (kp) drawSkeleton(ctx, kp, exercise);
        }
      }

      if (kp && bodyVisible(kp, exercise)) {
        readyFramesRef.current += 1;
        if (readyFramesRef.current >= READY_FRAMES) {
          setScanStatus(reps > 0 || counterRef.current.reps > 0 ? 'tracking' : 'ready');
        }

        const value = computeMetric(kp, exercise);
        if (value !== null) {
          const result = counterRef.current.update(value);
          setRepPhase(counterRef.current.currentPhase);

          if (result.quality === 'major' && result.hint) {
            flashMistake(`Rep didn't count — ${result.hint}`);
            if (result.shouldResetSet) {
              stopCamera();
              counterRef.current.reset();
              setReps(0);
              setMinorIssues([]);
              setError('Too many form mistakes — restart and go lower on each push-up.');
              setPhase('intro');
              return;
            }
          }

          if (result.repCompleted) {
            setReps(counterRef.current.reps);
            flashRep();
            setScanStatus('tracking');
            if (result.quality === 'minor' && result.hint) {
              flashMistake(result.hint);
              setMinorIssues((prev) => [...prev, result.hint!]);
            }
            if (counterRef.current.reps >= targetReps) {
              stopCamera();
              setMinorIssues(counterRef.current.minorIssues);
              setPhase('success');
              return;
            }
          }
        }
      } else {
        readyFramesRef.current = 0;
        setScanStatus('searching');
        setRepPhase('unknown');
      }

      rafRef.current = requestAnimationFrame(run);
    };
    run();
  };

  const retry = () => {
    stopCamera();
    setError('');
    setPhase('intro');
  };

  const exitMission = () => {
    stopCamera();
    router.back();
  };

  const skipMission = () => {
    if (typeof window !== 'undefined' && !window.confirm("Skipping won't mark this stage complete. Exit anyway?")) return;
    exitMission();
  };

  const calories = Math.round(reps * exercise.caloriesPerRep * 10) / 10;
  const mirrorVideo = cameraFacingFor(exercise) === 'user';

  const scanMessage =
    scanStatus === 'searching'
      ? exercise.key === 'pushup'
        ? 'Place phone to your SIDE · get full body in frame'
        : 'Step into frame so the camera can see you'
      : scanStatus === 'ready'
        ? 'Body detected — start your reps!'
        : repPhase === 'down'
          ? 'Down… now push up!'
          : 'Keep going — each rep gets a tick ✓';

  if (phase === 'success') {
    const uniqueIssues = Array.from(new Set(minorIssues));
    return (
      <div className="mission-train-shell flex flex-col items-center justify-center p-6 text-center">
        <RepTickTracker completed={reps} total={targetReps} />
        <p className="mt-6 text-4xl">🎉</p>
        <h3 className="mt-3 text-xl font-extrabold text-white">{COPY.train.stageComplete}</h3>
        <p className="mt-2 text-sm text-muted">
          {COPY.train.stageCompleteBody(reps, exercise.name, reps)}
        </p>
        {uniqueIssues.length > 0 && (
          <div className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Practice next time</p>
            <ul className="mt-2 space-y-1.5">
              {uniqueIssues.map((issue) => (
                <li key={issue} className="text-sm text-ink/90">
                  • {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button onClick={() => onComplete(reps)} className="mission-start-btn mt-6">
          {COPY.train.continue}
        </button>
      </div>
    );
  }

  if (phase === 'timeout') {
    return (
      <div className="mission-train-shell flex flex-col items-center justify-center p-6 text-center">
        <RepTickTracker completed={reps} total={targetReps} />
        <p className="mt-6 text-3xl">⏱️</p>
        <h3 className="mt-3 text-lg font-bold text-white">Time&apos;s up</h3>
        <p className="mt-2 text-sm text-muted">
          You got {reps} of {targetReps}. Try again.
        </p>
        <button onClick={retry} className="ac7-btn ac7-btn-outline mt-5">
          <RotateCcw size={16} /> Try Again
        </button>
      </div>
    );
  }

  if (phase === 'intro' || phase === 'requesting') {
    return (
      <div className="mission-course">
        <section className="mission-course-hero">
          <ExerciseDemoMedia exerciseKey={exercise.key} variant="hero" autoPlay />
          <div className="mission-course-hero__overlay" />
          <button type="button" onClick={exitMission} className="mission-course-icon-btn mission-course-icon-btn--left">
            <ArrowLeft size={20} />
          </button>
          <div className="mission-course-hero__content">
            <h1 className="mission-course-hero__title">{exercise.name}</h1>
            <p className="mission-course-hero__meta">
              {stageLabel ?? 'Mission stage'} · {targetReps} reps · live camera count
            </p>
          </div>
        </section>

        <section className="mission-course-panel">
          <p className="body-text text-muted">{exercise.instruction}</p>
          <div className="mt-4">
            <RepTickTracker completed={0} total={targetReps} />
          </div>
          <p className="caption mt-3 text-muted">
            Open camera → the app scans your body and counts each {exercise.name.toLowerCase()} with a tick ✓
          </p>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          <button
            onClick={startCamera}
            disabled={phase === 'requesting'}
            className="mission-start-btn mt-5"
          >
            <Camera size={18} />
            {phase === 'requesting' ? 'Opening camera...' : 'Open Camera & Start'}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="mission-train-shell">
      <div className={`relative aspect-[3/4] w-full overflow-hidden bg-black ${repFlash ? 'trainer-rep-flash' : ''}`}>
        <video
          ref={videoRef}
          className={`h-full w-full object-cover ${mirrorVideo ? '-scale-x-100' : ''}`}
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full ${mirrorVideo ? '-scale-x-100' : ''}`}
        />

        <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/85 to-transparent p-4">
          <div className="flex items-center justify-between">
            <button onClick={exitMission} className="mission-course-icon-btn !relative !left-0 !top-0 !h-10 !w-10">
              <ArrowLeft size={18} />
            </button>
            <p className="text-sm font-bold text-white">{exercise.name}</p>
            <span className="w-10" />
          </div>
          <div className="mt-3">
            <RepTickTracker completed={reps} total={targetReps} compact={targetReps > 12} />
          </div>
        </div>

        {/* Live scan status */}
        <div
          className={`absolute inset-x-4 top-36 z-10 flex items-center gap-2 rounded-2xl px-4 py-3 ${
            scanStatus === 'searching'
              ? 'bg-amber-500/20 border border-amber-500/40'
              : 'bg-green-500/20 border border-green-500/40'
          }`}
        >
          {scanStatus === 'searching' ? (
            <Scan size={18} className="shrink-0 text-amber-400 animate-pulse" />
          ) : (
            <CheckCircle2 size={18} className="shrink-0 text-green-400" />
          )}
          <p className="text-sm font-medium text-white">{scanMessage}</p>
        </div>

        <div className="absolute bottom-4 left-4 rounded-2xl bg-black/75 px-3 py-2">
          <p className="flex items-center gap-1 text-[10px] uppercase text-white/70">
            <Flame size={12} className="text-orange-400" /> {calories} kcal
          </p>
        </div>

        <div className="absolute bottom-4 right-4 rounded-2xl bg-black/75 px-3 py-2 text-right">
          <p className="flex items-center justify-end gap-1 text-[10px] uppercase text-white/70">
            <Clock size={12} /> Time
          </p>
          <p className="text-lg font-extrabold text-white">
            {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}
          </p>
        </div>

        {paused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <p className="text-lg font-extrabold text-navy">PAUSED</p>
          </div>
        )}

        {mistakeHint && !paused && (
          <div className="absolute inset-x-4 bottom-24 flex items-start gap-2 rounded-2xl bg-black/85 p-3">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-amber-400" />
            <p className="text-sm text-white">{mistakeHint}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-4 py-4">
        <button onClick={exitMission} className="flex items-center gap-1.5 text-sm font-medium text-muted">
          <ArrowLeft size={16} /> {COPY.train.exit}
        </button>
        <button
          onClick={() => setPaused((p) => !p)}
          className="flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white"
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button onClick={skipMission} className="flex items-center gap-1.5 text-sm font-medium text-muted">
          Skip <SkipForward size={16} />
        </button>
      </div>
    </div>
  );
}
