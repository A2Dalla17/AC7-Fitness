import type { ReactNode } from 'react';

export default function StatsGrid({ children, cols = 4 }: { children: ReactNode; cols?: 2 | 4 }) {
  return <div className={`stats-grid stats-grid--${cols}`}>{children}</div>;
}
