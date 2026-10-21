import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  GraduationCap,
  MapPin,
  TrendingUp,
  Wallet,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Skeleton from "@/components/Skeleton";
import { useApp } from "@/context/AppContext";
import { getCareerBySlug } from "@/lib/api";

export const Route = createFileRoute("/career/$slug")({
  head: () => ({
    meta: [
      { title: "Career detail, Aim Navigator" },
      {
        name: "description",
        content: "Salary, growth, skills, a 6-month roadmap and resources for this career path.",
      },
      { property: "og:title", content: "Career detail, Aim Navigator" },
      {
        property: "og:description",
        content: "Everything you need to start moving towards this career.",
      },
    ],
  }),
  component: CareerDetailPage,
});

function CareerDetailPage() {
  const { slug } = Route.useParams();
  const { savedCareerIds, toggleSavedCareer } = useApp();
  const { data: career, isLoading } = useQuery({
    queryKey: ["career", slug],
    queryFn: () => getCareerBySlug(slug),
  });

  if (isLoading) {
    return (
      <AppShell>
        <Skeleton className="h-40 w-full" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!career) {
    return (
      <AppShell>
        <Card className="py-16 text-center">
          <h1 className="text-xl font-semibold">Career not found</h1>
          <Link to="/explore" search={{} as any} className="mt-4 inline-block text-sm text-muted-foreground underline">
            Back to Explore
          </Link>
        </Card>
      </AppShell>
    );
  }

  const data: any = career;
  const isSaved = (savedCareerIds ?? []).includes(data.id);

  const metrics = [
    { icon: Wallet, label: "Salary range", value: data.salaryDisplay },
    { icon: TrendingUp, label: "Growth", value: `${data.growthPct}% / 10 yrs` },
    { icon: GraduationCap, label: "Education", value: data.educationLevel },
    { icon: MapPin, label: "Environment", value: data.workEnvironment },
  ];

  return (
    <AppShell>
      <Link
        to="/explore" search={{} as any}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Explore
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{data.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{data.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.tags.map((tag: string) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </div>

        <Button
          variant={isSaved ? "star" : "outline"}
          onClick={() => toggleSavedCareer(data.id)}
          className="shrink-0"
        >
          {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {isSaved ? "Saved" : "Save career"}
        </Button>
      </div>

      {/* Metrics bar */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ icon: Icon, label, value }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon className="h-4 w-4 text-star" /> {label}
            </div>
            <p className="mt-1.5 text-sm font-medium">{value}</p>
          </Card>
        ))}
      </div>

      {/* Skills */}
      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Skills you'll build</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.skills.map((skill: string, index: number) => (
            <div
              key={skill}
              className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-3 py-3 text-sm"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-xs">
                {index + 1}
              </span>
              {skill}
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Roadmap timeline */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold">6-month roadmap</h2>
          <ol className="mt-5 space-y-6 border-l border-border pl-6">
            {data.roadmap.map((phase: any) => (
              <li key={phase.month} className="relative">
                <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {phase.month}
                </span>
                <p className="text-xs text-muted-foreground">Month {phase.month}</p>
                <h3 className="mt-0.5 font-medium">{phase.title}</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {phase.tasks.map((task: string) => (
                    <li key={task}>· {task}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Card>

        {/* Resources */}
        <Card>
          <h2 className="text-lg font-semibold">Resources</h2>
          <ul className="mt-4 space-y-3">
            {data.resources.map((resource: any) => (
              <li key={resource.url}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start justify-between gap-3 rounded-xl border border-border px-3 py-3 text-sm transition-colors hover:border-primary/60"
                >
                  <span>
                    <span className="block text-xs text-muted-foreground">{resource.type}</span>
                    {resource.title}
                  </span>
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
