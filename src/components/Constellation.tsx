// The six RIASEC types drawn as a constellation. Optional `scores` (0..40)
// pulls each star outward, so the same drawing becomes a personal chart.
const ORDER = ["R", "I", "A", "S", "E", "C"];

export default function Constellation({
  scores,
  highlight = "",
  className,
}: {
  scores?: Record<string, number>;
  highlight?: string;
  className?: string;
}) {
  const cx = 150;
  const cy = 150;
  const points = ORDER.map((d, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const r = scores ? 40 + ((scores[d] ?? 0) / 40) * 90 : 110;
    return { d, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, lx: cx + Math.cos(angle) * 138, ly: cy + Math.sin(angle) * 138 };
  });
  const path = points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + "Z";

  return (
    <svg viewBox="0 0 300 300" className={className} aria-hidden>
      <circle cx={cx} cy={cy} r={110} fill="none" stroke="var(--color-border)" strokeDasharray="2 6" />
      <circle cx={cx} cy={cy} r={60} fill="none" stroke="var(--color-border)" strokeDasharray="2 6" />
      <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth={1.25} strokeOpacity={0.8} />
      {points.map((p) => {
        const lit = highlight.includes(p.d);
        return (
          <g key={p.d}>
            <circle cx={p.x} cy={p.y} r={lit ? 5 : 3} fill={lit ? "var(--color-star)" : "var(--color-foreground)"} />
            <text
              x={p.lx}
              y={p.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fontFamily="var(--font-display)"
              fontWeight="700"
              fill={lit ? "var(--color-star)" : "var(--color-muted-foreground)"}
            >
              {p.d}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
