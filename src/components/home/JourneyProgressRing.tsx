/** Large journey progress ring — hero visual for home zone */
export default function JourneyProgressRing({
  percent,
  seasonCode,
  rankLabel,
  xp,
  size = 168,
}: {
  percent: number;
  seasonCode: string;
  rankLabel: string;
  xp: number;
  size?: number;
}) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="journey-progress-ring">
      <div className="journey-progress-ring__visual" style={{ width: size, height: size }}>
        <svg
          className="journey-progress-ring__svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden
        >
          <circle
            className="journey-progress-ring__track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
          />
          <circle
            className="journey-progress-ring__fill"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="journey-progress-ring__center">
          <span className="journey-progress-ring__pct">{clamped}%</span>
          <span className="journey-progress-ring__label">Season</span>
        </div>
      </div>
      <div className="journey-progress-ring__meta">
        <p className="journey-progress-ring__season">Season {seasonCode}</p>
        <p className="journey-progress-ring__rank">{rankLabel}</p>
        <p className="journey-progress-ring__xp">{xp.toLocaleString()} XP</p>
      </div>
    </div>
  );
}
