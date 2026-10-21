import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import Button from "@/components/Button";
import Card from "@/components/Card";
import ConfirmDialog from "@/components/ConfirmDialog";
import ProgressBar from "@/components/ProgressBar";
import RadioCard from "@/components/RadioCard";
import { useApp } from "@/context/AppContext";
import { LIKERT_OPTIONS, TOTAL_STEPS } from "@/mocks/questions";
import { submitAssessment, getQuestions } from "@/lib/api";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Assessment, Aim Navigator" },
      {
        name: "description",
        content: "48 RIASEC questions in 8 short steps, with your answers saved as you go.",
      },
      { property: "og:title", content: "Assessment, Aim Navigator" },
      {
        property: "og:description",
        content: "Rate how much you'd enjoy each activity to build your Holland Code.",
      },
    ],
  }),
  component: AssessmentRoute,
});

function AssessmentRoute() {
  return (
    <AuthGate>
      <AssessmentPage />
    </AuthGate>
  );
}

function AssessmentPage() {
  const navigate = useNavigate();
  const { answers, setAnswer, setResult } = useApp();
const [questions, setQuestions] = useState<any[]>([]);
const [loadError, setLoadError] = useState("");

useEffect(() => {
  getQuestions()
    .then(setQuestions)
    .catch((e) => setLoadError(e.message));
}, []);


  const [step, setStep] = useState(1);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const stepQuestions = useMemo(() => questions.filter((q) => q.step === step), [step, questions]);

  // "Next" unlocks only when all 6 questions on this page are answered.
  const allAnswered = stepQuestions.every((q) => Boolean(answers?.[q.id]));
  const answeredCount = Object.keys(answers ?? {}).length;
  const isLastStep = step === TOTAL_STEPS;

  async function handleNext() {
    if (loadError) return <p className="p-6">Could not load questions: {loadError}</p>;
if (questions.length === 0) return <p className="p-6">Loading questions...</p>;
    if (!allAnswered) return;
    if (!isLastStep) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Last step: ask the (mock) backend to score the answers.
    setSubmitting(true);
    const result = await submitAssessment(answers);
    setResult(result);
    setSubmitting(false);
    navigate({ to: "/results" });
  }

  function handleExitAttempt() {
    // Only warn if the quiz is genuinely in progress.
    if (answeredCount > 0 && answeredCount < questions.length) {
      setShowExitConfirm(true);
    } else {
      navigate({ to: "/dashboard" });
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-sm font-semibold">
              Step {step} of {TOTAL_STEPS}
            </p>
            <p className="text-xs text-muted-foreground">
              {answeredCount} of {questions.length} answered
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleExitAttempt}>
            <X className="h-4 w-4" /> Exit
          </Button>
        </div>

        <ProgressBar value={(step / TOTAL_STEPS) * 100} />

        <h1 className="mt-8 text-2xl font-semibold">How much would you enjoy this?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          There are no right answers, pick what feels true for you.
        </p>

        <div className="mt-6 space-y-4">
          {stepQuestions.map((question, index) => (
            <Card key={question.id}>
              <div className="mb-4 flex items-start gap-3">
                <span className="font-display text-sm text-muted-foreground">
                  {(step - 1) * 6 + index + 1}.
                </span>
                <div>
                  <p className="font-medium">{question.prompt}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-5">
                {LIKERT_OPTIONS.map((option) => (
                  <RadioCard
                    key={option.value}
                    name={question.id}
                    value={option.value}
                    label={option.label}
                    checked={answers?.[question.id] === option.value}
                    onChange={(value: number) => setAnswer(question.id, value)}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          <div className="flex flex-col items-end gap-1">
            <Button size="lg" onClick={handleNext} disabled={!allAnswered || submitting}>
              {submitting ? "Scoring…" : isLastStep ? "See my results" : "Next"}
              {!submitting ? <ArrowRight className="h-4 w-4" /> : null}
            </Button>
            {!allAnswered ? (
              <p className="text-xs text-muted-foreground">Answer all 6 to continue</p>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showExitConfirm}
        title="Leave the assessment?"
        description="Your answers so far are saved, so you can come back and resume from this step."
        confirmLabel="Leave"
        cancelLabel="Keep going"
        onConfirm={() => navigate({ to: "/dashboard" })}
        onCancel={() => setShowExitConfirm(false)}
      />
    </div>
  );
}
