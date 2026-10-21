import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ProgressBar from "@/components/ProgressBar";
import { useApp } from "@/context/AppContext";
import { authErrorMessage } from "@/lib/auth";
import { toast } from "sonner";

const ACADEMIC_LEVELS = [
  "First year undergraduate",
  "Second year undergraduate",
  "Third year undergraduate",
  "Final year undergraduate",
  "Postgraduate",
];

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Tell us about you, Aim Navigator" },
      {
        name: "description",
        content: "Share your name, academic level and field of study to personalise your matches.",
      },
      { property: "og:title", content: "Tell us about you, Aim Navigator" },
      {
        property: "og:description",
        content: "A few details so your career matches make sense for where you are.",
      },
    ],
  }),
  component: OnboardingRoute,
});

function OnboardingRoute() {
  return (
    <AuthGate allowIncompleteProfile>
      <OnboardingPage />
    </AuthGate>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const { completeOnboarding, user } = useApp();
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [academicLevel, setAcademicLevel] = useState(user?.academicLevel ?? "");
  const [fieldOfStudy, setFieldOfStudy] = useState(user?.fieldOfStudy ?? "");
  const [isAdult, setIsAdult] = useState(Boolean(user?.isAdult));

  // "Continue" stays disabled until every field is valid.
  const isValid =
    fullName.trim().length >= 2 && academicLevel !== "" && fieldOfStudy.trim().length >= 2 && isAdult;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await completeOnboarding({
        fullName: fullName.trim(),
        academicLevel,
        fieldOfStudy: fieldOfStudy.trim(),
      });
      void navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-12">
      <div className="mb-6">
        <ProgressBar value={35} />
        <p className="mt-2 text-xs text-muted-foreground">Step 1 of 2 · Your details</p>
      </div>

      <Card glow>
        <h1 className="text-2xl font-semibold">A little about you</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {user?.email ? `Signed in as ${user.email}. ` : ""}This helps us word your results for
          where you are right now.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-sm text-muted-foreground">
              Full name
            </label>
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Vaishnavi Mane"
              className="h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <div>
            <label htmlFor="academicLevel" className="mb-1.5 block text-sm text-muted-foreground">
              Academic level
            </label>
            <select
              id="academicLevel"
              value={academicLevel}
              onChange={(e) => setAcademicLevel(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
            >
              <option value="">Select your level</option>
              {ACADEMIC_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fieldOfStudy" className="mb-1.5 block text-sm text-muted-foreground">
              Field of study
            </label>
            <input
              id="fieldOfStudy"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
              placeholder="Computer Science"
              className="h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 text-sm">
            <input
              type="checkbox"
              checked={isAdult}
              onChange={(e) => setIsAdult(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
            />
            <span className="text-muted-foreground">
              I confirm I am 18 years or older.
            </span>
          </label>

          <Button type="submit" size="lg" className="w-full" disabled={!isValid || submitting}>
            {submitting ? "Saving…" : "Continue to dashboard"}
          </Button>
          {!isValid ? (
            <p className="text-center text-xs text-muted-foreground">
              Fill in all fields and confirm your age to continue.
            </p>
          ) : null}
        </form>
      </Card>
    </div>
  );
}
