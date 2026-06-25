'use client';

import { ExerciseKey } from '@/lib/exercises';

const DURATIONS: Record<ExerciseKey, string> = {
  pushup: '1.8s',
  situp: '1.8s',
  squat: '1.8s',
  jumpingjack: '1.1s',
  lunge: '1.8s',
};

const SKIN = '#8C5A3A';
const HAIR = '#0E0A08';
const SHIRT = '#F2F2F0';
const SHIRT_TRIM = '#2563EB';
const SHORTS = '#1B1D1F';

/** Illustrated AI coach demonstrating correct exercise form, looping continuously. */
export default function AICoachDemo({
  exerciseKey,
  hero = false,
  compact = false,
}: {
  exerciseKey: ExerciseKey;
  hero?: boolean;
  compact?: boolean;
}) {
  const dur = DURATIONS[exerciseKey];
  const heightClass = hero ? 'h-full min-h-[280px]' : compact ? 'h-full min-h-[64px]' : 'h-52';

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-b from-[#0a1628] to-[#060d1c] ${
        hero ? 'h-full w-full rounded-none border-0' : compact ? 'h-full w-full rounded-xl border-0' : 'rounded-2xl border border-navy/30'
      }`}
    >
      {!hero && !compact && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-navy/20 px-3 py-1 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-navy" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-navy">AI Coach Demo</span>
        </div>
      )}

      <svg viewBox="0 0 220 160" className={`${heightClass} w-full`}>
        <line x1="10" y1="135" x2="210" y2="135" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="2" />

        {exerciseKey === 'pushup' && (
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,16; 0,0" dur={dur} repeatCount="indefinite" />
            <path d="M150 100 L185 118 L195 118" stroke={SHORTS} strokeWidth="14" strokeLinecap="round" fill="none" />
            <path d="M70 95 L150 100" stroke={SHIRT} strokeWidth="24" strokeLinecap="round" fill="none" />
            <path d="M75 90 L145 95" stroke={SHIRT_TRIM} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
            <g>
              <circle cx="58" cy="92" r="14" fill={SKIN} />
              <path d="M46 84 Q58 72 70 84 Q66 80 58 80 Q50 80 46 84Z" fill={HAIR} />
              <circle cx="54" cy="93" r="1.4" fill="#1a1a1a" />
              <circle cx="62" cy="93" r="1.4" fill="#1a1a1a" />
              <path d="M55 99 Q58 101 61 99" stroke="#7a4a2a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </g>
            <path d="M78 92 L108 108" stroke={SKIN} strokeWidth="11" strokeLinecap="round" />
            <g>
              <animateTransform attributeName="transform" type="rotate" values="0 108 108; 35 108 108; 0 108 108" dur={dur} repeatCount="indefinite" />
              <path d="M108 108 L112 130" stroke={SKIN} strokeWidth="10" strokeLinecap="round" />
            </g>
          </g>
        )}

        {exerciseKey === 'situp' && (
          <g>
            <path d="M150 120 L125 120 L125 100" stroke={SHORTS} strokeWidth="15" strokeLinecap="round" fill="none" />
            <path d="M165 120 L150 120" stroke={SHORTS} strokeWidth="15" strokeLinecap="round" fill="none" />
            <g>
              <animateTransform attributeName="transform" type="rotate" values="0 125 120; -60 125 120; 0 125 120" dur={dur} repeatCount="indefinite" />
              <path d="M125 120 L80 120" stroke={SHIRT} strokeWidth="23" strokeLinecap="round" fill="none" />
              <path d="M95 118 L80 105" stroke={SKIN} strokeWidth="12" strokeLinecap="round" />
              <circle cx="68" cy="118" r="13" fill={SKIN} />
              <path d="M57 110 Q68 99 80 110 Q73 106 68 106 Q61 106 57 110Z" fill={HAIR} />
              <circle cx="65" cy="119" r="1.3" fill="#1a1a1a" />
              <circle cx="72" cy="119" r="1.3" fill="#1a1a1a" />
            </g>
          </g>
        )}

        {(exerciseKey === 'squat' || exerciseKey === 'lunge') && (
          <g>
            <circle cx="110" cy="38" r="13" fill={SKIN} />
            <path d="M98 31 Q110 19 122 31 Q115 27 110 27 Q103 27 98 31Z" fill={HAIR} />
            <circle cx="106" cy="39" r="1.3" fill="#1a1a1a" />
            <circle cx="114" cy="39" r="1.3" fill="#1a1a1a" />
            <path d="M110 50 L110 85" stroke={SHIRT} strokeWidth="23" strokeLinecap="round" />
            <path d="M110 62 L140 70" stroke={SKIN} strokeWidth="12" strokeLinecap="round" />
            <path d="M110 62 L80 70" stroke={SKIN} strokeWidth="12" strokeLinecap="round" />
            <g>
              <animateTransform attributeName="transform" type="translate" values="0,0; 0,24; 0,0" dur={dur} repeatCount="indefinite" />
              <path d="M110 85 L92 112" stroke={SHORTS} strokeWidth="14" strokeLinecap="round" />
              <path d="M110 85 L128 112" stroke={SHORTS} strokeWidth="14" strokeLinecap="round" />
              <path d="M92 112 L90 135" stroke={SKIN} strokeWidth="11" strokeLinecap="round" />
              <path d="M128 112 L130 135" stroke={SKIN} strokeWidth="11" strokeLinecap="round" />
            </g>
          </g>
        )}

        {exerciseKey === 'jumpingjack' && (
          <g>
            <circle cx="110" cy="32" r="13" fill={SKIN} />
            <path d="M98 25 Q110 13 122 25 Q115 21 110 21 Q103 21 98 25Z" fill={HAIR} />
            <circle cx="106" cy="33" r="1.3" fill="#1a1a1a" />
            <circle cx="114" cy="33" r="1.3" fill="#1a1a1a" />
            <path d="M110 44 L110 90" stroke={SHIRT} strokeWidth="23" strokeLinecap="round" />
            <g>
              <animateTransform attributeName="transform" type="rotate" values="0 110 52; -65 110 52; 0 110 52" dur={dur} repeatCount="indefinite" />
              <path d="M110 52 L150 30" stroke={SKIN} strokeWidth="12" strokeLinecap="round" />
            </g>
            <g>
              <animateTransform attributeName="transform" type="rotate" values="0 110 52; 65 110 52; 0 110 52" dur={dur} repeatCount="indefinite" />
              <path d="M110 52 L70 30" stroke={SKIN} strokeWidth="12" strokeLinecap="round" />
            </g>
            <g>
              <animateTransform attributeName="transform" type="rotate" values="0 110 90; 22 110 90; 0 110 90" dur={dur} repeatCount="indefinite" />
              <path d="M110 90 L130 132" stroke={SHORTS} strokeWidth="13" strokeLinecap="round" />
            </g>
            <g>
              <animateTransform attributeName="transform" type="rotate" values="0 110 90; -22 110 90; 0 110 90" dur={dur} repeatCount="indefinite" />
              <path d="M110 90 L90 132" stroke={SHORTS} strokeWidth="13" strokeLinecap="round" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
