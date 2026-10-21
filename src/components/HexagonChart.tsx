import { useEffect, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { DIMENSION_LABELS, DIMENSIONS } from "@/mocks/questions";
import Skeleton from "@/components/Skeleton";

// Radar (hexagon) chart of the six RIASEC scores. Max possible score is 40
// (8 questions x 5 points) per dimension.
export default function HexagonChart({ scores }: any) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = DIMENSIONS.map((d) => ({
    dimension: `${d} · ${(DIMENSION_LABELS as any)[d]}`,
    score: scores?.[d] ?? 0,
  }));

  if (!mounted) return <Skeleton className="h-72 w-full" />;

  return (
    <div className="h-72 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
          />
          <PolarRadiusAxis domain={[0, 40]} tick={false} axisLine={false} />
          <Radar
            dataKey="score"
            stroke="var(--color-primary)"
            fill="var(--color-star)"
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
