export default function ProgressRing({
  percent,
  size = 64,
  stroke = 6,
  label,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  /** override the centered "N%" text with custom content, e.g. "7 / 15\nREPS" */
  label?: { top: string; bottom?: string };
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#A3E635"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      {label ? (
        <g transform={`rotate(90 ${size / 2} ${size / 2})`}>
          <text x="50%" y={label.bottom ? size * 0.42 : '50%'} textAnchor="middle" dominantBaseline="central" className="fill-white font-extrabold" style={{ fontSize: size * 0.24 }}>
            {label.top}
          </text>
          {label.bottom && (
            <text x="50%" y={size * 0.68} textAnchor="middle" dominantBaseline="central" className="fill-white/60 font-semibold" style={{ fontSize: size * 0.13 }}>
              {label.bottom}
            </text>
          )}
        </g>
      ) : (
        <text
          x="50%"
          y="50%"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white font-extrabold"
          style={{ fontSize: size * 0.26 }}
        >
          {Math.round(percent)}%
        </text>
      )}
    </svg>
  );
}
