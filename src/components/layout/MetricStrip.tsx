import { ReactNode } from 'react';

export default function MetricStrip({ children }: { children: ReactNode }) {
  return <div className="fit-metric-strip">{children}</div>;
}

export function Metric({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="fit-metric">
      {icon}
      {children}
    </span>
  );
}
