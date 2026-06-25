'use client';

import type { ReactNode } from 'react';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import PremiumCard from './PremiumCard';

export default function StatCard({
  label,
  value,
  hint,
  icon,
  accent,
  animateValue,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  accent?: boolean;
  /** Count-up animation for numeric values (~0.8s) */
  animateValue?: boolean;
}) {
  const numeric = typeof value === 'number' ? value : null;
  const animated = useAnimatedNumber(numeric ?? 0, 800, animateValue && numeric !== null);
  const display =
    animateValue && numeric !== null ? animated.toLocaleString() : value;

  return (
    <PremiumCard className={`stat-card ${accent ? 'stat-card--accent' : ''}`} glow={accent}>
      <span className="stat-card__icon">{icon}</span>
      <div className="stat-card__body">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{display}</p>
        {hint && <p className="stat-card__hint">{hint}</p>}
      </div>
    </PremiumCard>
  );
}
