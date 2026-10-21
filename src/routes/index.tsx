import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { GuestOnly } from "@/components/AuthGate";
import { useApp } from "@/context/AppContext";
import { authErrorMessage, postAuthPath } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aim Navigator: RIASEC quiz, matched careers, roadmap" },
      {
        name: "description",
        content:
          "Answer 48 RIASEC questions, get your three-letter Holland Code, and see ranked careers with a 6-month roadmap.",
      },
      { property: "og:title", content: "Aim Navigator: RIASEC quiz, matched careers, roadmap" },
      {
        property: "og:description",
        content: "48 questions. One Holland Code. Ranked careers with a month-by-month plan.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <GuestOnly>
      <AuthForm />
    </GuestOnly>
  );
}

function AuthForm() {
  const navigate = useNavigate();
  const { signInWithPassword, signUpWithPassword, signInWithGoogle } = useApp();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmNotice, setConfirmNotice] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const isValid = email.includes("@") && password.length >= 6;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid || submitting) return;
    setConfirmNotice(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        const user = await signInWithPassword(email, password);
        void navigate({ to: postAuthPath(user) });
      } else {
        const { user, needsEmailConfirmation } = await signUpWithPassword(email, password);
        if (needsEmailConfirmation) {
          setConfirmNotice("Check your email and open the confirmation link to finish creating your account.");
          toast.success("Confirmation email sent");
          return;
        }
        void navigate({ to: postAuthPath(user) });
      }
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    if (submitting) return;
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error(authErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <div className="starfield flex min-h-screen flex-col overflow-hidden">
      <header className="mx-auto flex h-16 w-full max-w-6xl shrink-0 items-center justify-between px-4">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-4">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <section>
            <h3 className="mt-4 text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.15] font-extrabold">
              Take the RIASEC quiz.
              <br />
              Get matched careers.
              <br />
              Follow the <span className="text-star">roadmap</span>.
            </h3>
            <p className="mt-5 max-w-lg text-base text-muted-foreground">
              Aim Navigator scores what you enjoy across six Holland types and points you to
              careers that fit, with a plan for the next six months.
            </p>
          </section>

          <div className="lg:pt-0">
            <Card className="mx-auto w-full max-w-sm">
              {!configured ? (
                <p className="mb-4 rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground">
                  Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a .env file, then restart the
                  dev server. See the README for Google provider setup.
                </p>
              ) : null}

              <div className="mb-6 grid grid-cols-2 border-b border-border">
                {(["login", "signup"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setMode(value);
                      setConfirmNotice(null);
                    }}
                    className={`-mb-px border-b-2 pb-3 font-display text-sm font-bold transition-colors ${
                      mode === value ? "border-star text-foreground" : "border-transparent text-muted-foreground"
                    }`}
                  >
                    {value === "login" ? "Log in" : "Sign up"}
                  </button>
                ))}
              </div>

              <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm text-muted-foreground">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@domain.com"
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm text-muted-foreground">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={!isValid || submitting || !configured}
                >
                  {submitting
                    ? "Please wait…"
                    : mode === "login"
                      ? "Log in"
                      : "Create account"}
                </Button>
              </form>

              {confirmNotice ? (
                <p className="mt-3 text-center text-xs text-muted-foreground">{confirmNotice}</p>
              ) : null}

              <div className="my-4 flex items-center gap-3" aria-hidden>
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => void handleGoogle()}
                disabled={submitting || !configured}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A12 12 0 0 0 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.29a12 12 0 0 0 0 10.76l4-3.1Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.62l4 3.1C6.23 6.88 8.88 4.77 12 4.77Z"
                  />
                </svg>
                Continue with Google
              </Button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                 Your session is stored securely by Supabase Auth.
              </p>
            </Card>
          </div>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-6xl shrink-0 px-4 pb-4 text-xs text-muted-foreground">
 
      </footer>
    </div>
  );
}
