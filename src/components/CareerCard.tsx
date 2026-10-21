import { Link } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import Badge from "@/components/Badge";
import Card from "@/components/Card";

export default function CareerCard({ career, rank, matchPct, reason }: any) {
  return (
    <Link
      to="/career/$slug"
      params={{ slug: career.slug }}
      className="block transition-transform duration-200 hover:-translate-y-1"
    >
      <Card className="h-full">
        <div className="flex items-start justify-between gap-3">
          <div>
            {rank ? (
              <Badge tone="star" className="mb-2">
                #{rank}
              </Badge>
            ) : null}
            <h3 className="text-base font-semibold">{career.title}</h3>
          </div>
          {matchPct != null ? (
            <span className="font-display text-lg font-semibold text-star">{matchPct}%</span>
          ) : null}
        </div>

        <p className="mt-2 text-sm text-muted-foreground">{career.description}</p>
        {reason ? <p className="mt-2 text-xs text-foreground/80">{reason}</p> : null}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {career.tags.map((tag: any) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{career.salaryDisplay}</span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> {career.growthPct}% growth
          </span>
          <span>{career.educationLevel}</span>
        </div>
      </Card>
    </Link>
  );
}
