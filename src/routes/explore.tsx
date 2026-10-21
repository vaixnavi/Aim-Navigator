import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SearchX } from "lucide-react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import Card from "@/components/Card";
import CareerCard from "@/components/CareerCard";
import Skeleton from "@/components/Skeleton";
import { getCareers } from "@/lib/api";
import { EDUCATION_LEVELS, WORK_ENVIRONMENTS, WORK_STYLE_TAGS } from "@/mocks/careers";

// Filter state lives in the URL so students can share or bookmark a search.
export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : "",
    tag: typeof search["tag"] === "string" ? (search["tag"] as string) : "",
    education: typeof search["education"] === "string" ? (search["education"] as string) : "",
    environment: typeof search["environment"] === "string" ? (search["environment"] as string) : "",
    maxSalary: Number(search["maxSalary"]) > 0 ? Number(search["maxSalary"]) : 3000000,
  }),
  head: () => ({
    meta: [
      { title: "Explore careers, Aim Navigator" },
      {
        name: "description",
        content: "Search and filter careers by work style, education level, salary and environment.",
      },
      { property: "og:title", content: "Explore careers, Aim Navigator" },
      {
        property: "og:description",
        content: "Browse the full career library with filters that stay in the URL.",
      },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { data: careers, isLoading } = useQuery({ queryKey: ["careers"], queryFn: getCareers });

  // Helper that updates one filter while keeping the others in the URL.
  function setFilter(patch: Record<string, unknown>) {
    navigate({ to: "/explore", search: { ...search, ...patch } as any });
  }

  const list: any[] = (careers as any[]) ?? [];
  const filtered = list.filter((career) => {
    const text = `${career.title} ${career.description} ${career.tags.join(" ")}`.toLowerCase();
    if (search.q && !text.includes(search.q.toLowerCase())) return false;
    if (search.tag && !career.tags.includes(search.tag)) return false;
    if (search.education && career.educationLevel !== search.education) return false;
    if (search.environment && career.workEnvironment !== search.environment) return false;
    if (career.salaryMin > search.maxSalary) return false;
    return true;
  });

  const hasFilters =
    Boolean(search.q || search.tag || search.education || search.environment) ||
    search.maxSalary !== 3000000;

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold sm:text-4xl">Explore careers</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {list.length} careers in the library. Filters stay in the page address, so you can share
        them.
      </p>

      <Card className="mt-6">
        <input
          value={search.q}
          onChange={(e) => setFilter({ q: e.target.value })}
          placeholder="Search by title, skill or keyword"
          className="h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {WORK_STYLE_TAGS.map((tag) => {
            const active = search.tag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setFilter({ tag: active ? "" : tag })}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Education level</label>
            <select
              value={search.education}
              onChange={(e) => setFilter({ education: e.target.value })}
              className="h-10 w-full rounded-xl border border-input bg-background/60 px-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Any</option>
              {EDUCATION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Work environment</label>
            <select
              value={search.environment}
              onChange={(e) => setFilter({ environment: e.target.value })}
              className="h-10 w-full rounded-xl border border-input bg-background/60 px-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Any</option>
              {WORK_ENVIRONMENTS.map((env) => (
                <option key={env} value={env}>
                  {env}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              Starting salary up to ₹{(search.maxSalary / 100000).toFixed(1)}L
            </label>
            <input
              type="range"
              min={300000}
              max={3000000}
              step={100000}
              value={search.maxSalary}
              onChange={(e) => setFilter({ maxSalary: Number(e.target.value) })}
              className="mt-3 w-full accent-[var(--color-primary)]"
            />
          </div>
        </div>

        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() =>
              navigate({
                to: "/explore",
                search: { q: "", tag: "", education: "", environment: "", maxSalary: 3000000 },
              })
            }
          >
            Clear filters
          </Button>
        ) : null}
      </Card>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-56 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 py-16 text-center">
            <SearchX className="h-8 w-8 text-star" />
            <h2 className="font-semibold">No careers match those filters</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try removing a filter or widening the salary range.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((career) => (
              <CareerCard key={career.id} career={career} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
