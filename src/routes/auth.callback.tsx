import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import LogoLoader from "@/components/LogoLoader";
import { completeOAuthCallback, mapUser, postAuthPath, authErrorMessage } from "@/lib/auth";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Signing you in, Aim Navigator" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      try {
        const session = await completeOAuthCallback();
        if (cancelled) return;
        const user = mapUser(session.user);
        void navigate({ to: postAuthPath(user) });
      } catch (caught) {
        if (!cancelled) setError(authErrorMessage(caught));
      }
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="starfield flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">Could not complete sign-in</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <a href="/" className="mt-6 inline-block text-sm underline">
            Back to log in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="starfield flex min-h-screen items-center justify-center">
      <LogoLoader label="Finishing sign-in" />
    </div>
  );
}
