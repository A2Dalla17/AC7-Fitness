'use client';

import { Check } from 'lucide-react';

/** Live rep progress — each completed rep gets a green tick (1/10, 2/10, …). */
export default function RepTickTracker({
  completed,
  total,
  compact = false,
}: {
  completed: number;
  total: number;
  compact?: boolean;
}) {
  const ticks = Array.from({ length: total }, (_, i) => i);

  return (
    <div className="rep-tick-tracker">
      <div className="rep-tick-tracker__header">
        <span className="rep-tick-tracker__label">Reps</span>
        <span className="rep-tick-tracker__count">
          {completed} / {total}
        </span>
      </div>
      <div className={`rep-tick-tracker__row ${compact ? 'rep-tick-tracker__row--compact' : ''}`}>
        {ticks.map((i) => {
          const done = i < completed;
          const isLatest = i === completed - 1;
          return (
            <div
              key={i}
              className={`rep-tick ${done ? 'rep-tick--done' : ''} ${isLatest ? 'rep-tick--pulse' : ''}`}
              aria-label={done ? `Rep ${i + 1} complete` : `Rep ${i + 1}`}
            >
              {done ? <Check size={compact ? 10 : 14} strokeWidth={3} /> : <span>{i + 1}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
