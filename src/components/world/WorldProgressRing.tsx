import type { ReactNode } from 'react';

/** Circular rank progress — "I am progressing" at a glance */
export default function WorldProgressRing({
  percent,
  children,
  size = 52,
}: {
  percent: number;
  children: ReactNode;
  size?: number;
}) {
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="ac7-progress-ring" style={{ width: size, height: size }}>
      <svg
        className="ac7-progress-ring__svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <circle
          className="ac7-progress-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="ac7-progress-ring__fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ac7-progress-ring__inner">{children}</div>
    </div>
  );
}
