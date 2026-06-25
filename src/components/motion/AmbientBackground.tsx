'use client';

import { useMemo } from 'react';
import Ac7MarkSvg from '@/components/ac7/Ac7MarkSvg';

type Particle = {
  id: number;
  kind: 'moon' | 'star';
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  driftX: number;
  driftY: number;
  rotate: number;
  twinkle: boolean;
};

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999.1337) * 10000;
  return x - Math.floor(x);
}

/** 4 tiny moons/stars (within 3–5 spec) drifting slowly */
function buildParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const r = (n: number) => seededRandom(i * 23 + n);
    const isMoon = i % 2 === 0;
    return {
      id: i,
      kind: isMoon ? 'moon' : 'star',
      left: 8 + r(1) * 84,
      top: 8 + r(2) * 84,
      size: 10 + Math.floor(r(3) * 6),
      delay: r(4) * 8,
      duration: 36 + r(5) * 24,
      driftX: 10 + r(6) * 16,
      driftY: 8 + r(7) * 14,
      rotate: -6 + r(8) * 12,
      twinkle: !isMoon && r(9) > 0.5,
    };
  });
}

export default function AmbientBackground() {
  const particles = useMemo(() => buildParticles(4), []);

  return (
    <div className="ac7-universe" aria-hidden>
      {particles.map((p) => (
        <div
          key={p.id}
          className={`ac7-universe__particle ac7-universe__particle--${p.kind}${
            p.twinkle ? ' ac7-universe__particle--twinkle' : ''
          }`}
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              ['--ac7-dur' as string]: `${p.duration}s`,
              ['--ac7-dx' as string]: `${p.driftX}px`,
              ['--ac7-dy' as string]: `${-p.driftY}px`,
              ['--ac7-rot' as string]: `${p.rotate}deg`,
            } as React.CSSProperties
          }
        >
          <Ac7MarkSvg size={p.size} moonOnly={p.kind === 'moon'} starOnly={p.kind === 'star'} />
        </div>
      ))}
    </div>
  );
}
