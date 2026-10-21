import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Compass, RotateCcw } from "lucide-react";
import AppShell from "@/components/AppShell";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import CareerCard from "@/components/CareerCard";
import ProgressBar from "@/components/ProgressBar";
import Skeleton from "@/components/Skeleton";
import { useApp } from "@/context/AppContext";
import { getCareers } from "@/lib/api";
import { questions } from "@/mocks/questions";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard, Aim Navigator" },
      {
        name: "description",
        content: "Start, resume or retake your RIASEC assessment and see your top career matches.",
      },
      { property: "og:title", content: "Dashboard, Aim Navigator" },
      {
        property: "og:description",
        content: "Your assessment progress and top three career matches in one place.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { user, answers, result, resetAssessment, hydrated } = useApp();

  const answeredCount = Object.keys(answers ?? {}).length;
  const totalQuestions = questions.length;
  const percent = (answeredCount / totalQuestions) * 100;

  const { data: careers, isLoading } = useQuery({
    queryKey: ["careers"],
    queryFn: getCareers,
  });

  const topMatches = (result?.matches ?? []).slice(0, 3);

  function handleRetake() {
    resetAssessment();
    navigate({ to: "/assessment" });
  }

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Welcome back.</p>
        <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">
          Hi {user?.fullName?.split(" ")[0] ?? "there"}!
        </h1>
        {user?.fieldOfStudy ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {user.academicLevel} · {user.fieldOfStudy}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            <Link to="/onboarding" className="text-foreground underline">
              Complete your profile
            </Link>{" "}
            to personalise your results.
          </p>
        )}
      </div>

      {/* Assessment card: start / resume / retake depending on progress */}
      <Card glow className="mb-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <Badge tone="primary" className="mb-3">
              RIASEC assessment
            </Badge>
            <h2 className="text-xl font-semibold">
              {!hydrated
                ? "Loading your progress…"
                : answeredCount === 0
                  ? "Start your assessment"
                  : result
                    ? "You've completed the assessment"
                    : "Resume where you left off"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              48 questions across 8 short steps. 
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:w-48">
            <Button onClick={() => navigate({ to: "/assessment" })} size="lg">
              {answeredCount === 0 ? "Start" : result ? "Review" : "Resume"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            {answeredCount > 0 ? (
              <Button variant="outline" onClick={handleRetake}>
                <RotateCcw className="h-4 w-4" /> Retake
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <ProgressBar value={percent} />
          <p className="mt-2 text-xs text-muted-foreground">
            {answeredCount} of {totalQuestions} questions answered
          </p>
        </div>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your top matches</h2>
        {result ? (
          <Link to="/results" className="text-sm text-muted-foreground hover:text-foreground">
            See full results
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : !result || result.isFlatProfile ? (
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
          <Compass className="h-8 w-8 text-star" />
          <div>
            <h3 className="font-semibold">No matches yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Finish the assessment and we'll rank careers that fit your interest profile.
            </p>
          </div>
          <Button onClick={() => navigate({ to: "/assessment" })}>Take the assessment</Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topMatches.map((match: any, index: number) => {
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
    </AppShell>
  );
}
