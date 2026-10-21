import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Scale } from "lucide-react";
import AppShell from "@/components/AppShell";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import CareerCard from "@/components/CareerCard";
import HexagonChart from "@/components/HexagonChart";
import Skeleton from "@/components/Skeleton";
import LogoLoader from "@/components/LogoLoader";
import Constellation from "@/components/Constellation";
import { useApp } from "@/context/AppContext";
import { getCareers } from "@/lib/api";
import { DIMENSION_LABELS } from "@/mocks/questions";
import { codeBlurb } from "@/mocks/matchResult";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your results, Aim Navigator" },
      {
        name: "description",
        content: "Your RIASEC hexagon, three-letter Holland Code and ranked career matches.",
      },
      { property: "og:title", content: "Your results, Aim Navigator" },
      {
        property: "og:description",
        content: "See which careers fit your interest profile and why.",
      },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const navigate = useNavigate();
  const { result, hydrated } = useApp();
  const { data: careers, isLoading } = useQuery({ queryKey: ["careers"], queryFn: getCareers });

  if (!hydrated) {
    return (
      <AppShell>
        <LogoLoader label="Reading your chart" />
      </AppShell>
    );
  }

  if (!result) {
    return (
      <AppShell>
        <Card className="py-16 text-center">
          <h1 className="text-xl font-semibold">No results yet</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Complete all 8 steps of the assessment and your hexagon profile will appear here.
          </p>
          <Button className="mt-6" onClick={() => navigate({ to: "/assessment" })}>
            Take the assessment
          </Button>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-8 grid items-center gap-6 sm:grid-cols-[1fr_220px]">
        <div>
          <Badge tone="star" className="mb-3">
            Your Holland Code
          </Badge>
          <h1 className="font-display text-5xl font-extrabold tracking-widest sm:text-6xl">
            <span className="text-star">{result.topCode}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {codeBlurb(result.topCode)}
          </p>
        </div>
        {/* Your six scores drawn as a constellation; top 3 types glow gold */}
        <Constellation
          scores={result.scores}
          highlight={result.topCode}
          className="mx-auto w-44 sm:w-full"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="mb-2 text-lg font-semibold">Your interest hexagon</h2>
          <HexagonChart scores={result.scores} />
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Score breakdown</h2>
          <ul className="space-y-3">
            {Object.entries(result.scores)
              .sort((a: any, b: any) => b[1] - a[1])
              .map(([dimension, score]: any) => (
                <li key={dimension}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>
                      {dimension} · {(DIMENSION_LABELS as any)[dimension]}
                    </span>
                    <span className="text-muted-foreground">{score}/40</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(score / 40) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
          </ul>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Matched careers</h2>

        {result.isFlatProfile ? (
          <Card className="flex flex-col items-center gap-4 py-12 text-center">
            <Scale className="h-8 w-8 text-star" />
            <div>
              <h3 className="font-semibold">Your profile is very balanced</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Your six scores are too close together to rank careers fairly. That usually means
                you're open to many paths, try the assessment again and answer with stronger
                preferences, or browse everything in Explore.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => navigate({ to: "/assessment" })}>Retake assessment</Button>
              <Link to="/explore" search={{} as any}>
                <Button variant="outline">Explore careers</Button>
              </Link>
            </div>
          </Card>
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-56 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.matches.slice(0, 6).map((match: any, index: number) => {
              const career = ((careers as any[]) ?? []).find((c: any) => c.id === match.careerId);
              if (!career) return null;
              return (
                <CareerCard
                  key={match.careerId}
                  career={career}
                  rank={index + 1}
                  matchPct={match.finalScore}
                  reason={match.reason}
                />
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
