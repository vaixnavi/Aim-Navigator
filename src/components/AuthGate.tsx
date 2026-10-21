import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import LogoLoader from "@/components/LogoLoader";
import { useApp } from "@/context/AppContext";
import { hasCompletedOnboarding, postAuthPath } from "@/lib/auth";

function FullPageLoader({ label }: { label: string }) {
  return (
    <div className="starfield flex min-h-screen items-center justify-center">
      <LogoLoader label={label} />
    </div>
  );
}

export function AuthGate({
  children,
  allowIncompleteProfile = false,
}: {
  children: ReactNode;
  allowIncompleteProfile?: boolean;
}) {
  const navigate = useNavigate();
  const { authReady, user } = useApp();
  const profileComplete = hasCompletedOnboarding(user);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      void navigate({ to: "/" });
      return;
    }
    if (allowIncompleteProfile && profileComplete) {
      void navigate({ to: "/dashboard" });
      return;
    }
    if (!allowIncompleteProfile && !profileComplete) {
      void navigate({ to: "/onboarding" });
    }
  }, [allowIncompleteProfile, authReady, navigate, profileComplete, user]);

  if (!authReady) return <FullPageLoader label="Checking your session" />;
  if (!user) return <FullPageLoader label="Redirecting" />;
  if (allowIncompleteProfile && profileComplete) return <FullPageLoader label="Redirecting" />;
  if (!allowIncompleteProfile && !profileComplete) return <FullPageLoader label="Redirecting" />;

  return <>{children}</>;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { authReady, user } = useApp();

  useEffect(() => {
    if (!authReady || !user) return;
    void navigate({ to: postAuthPath(user) });
  }, [authReady, navigate, user]);

  if (!authReady) return <FullPageLoader label="Checking your session" />;
  if (user) return <FullPageLoader label="Redirecting" />;

  return <>{children}</>;
}
