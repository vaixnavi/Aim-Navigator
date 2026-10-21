import { type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Compass, LayoutDashboard, LogOut, Search } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/explore", label: "Explore", icon: Search },
  { to: "/results", label: "Results", icon: Compass },
];

// Shared header + page container for the signed-in part of the app.
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <AppShellFrame>{children}</AppShellFrame>
    </AuthGate>
  );
}

function AppShellFrame({ children }: { children: ReactNode }) {
  const { user, signOut } = useApp();
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await signOut();
      void navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign out.");
    }
  }

  return (
    <div className="starfield min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/dashboard" aria-label="Aim Navigator dashboard">
            <Logo className="[&>span]:hidden sm:[&>span]:inline" />
          </Link>

          <nav className="flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to as any}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:px-3"
                activeProps={{ className: "text-foreground underline decoration-star decoration-2 underline-offset-8" }}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}

            {/* Reserved space for a future "Ask" button (out of scope for now). */}
            <span aria-hidden className="hidden w-9 sm:block" data-future-slot="ask-button" />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:px-3"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">{children}</main>

      <footer className="mx-auto flex max-w-6xl justify-between px-4 pb-10 text-xs text-muted-foreground">
        <span>
          {user?.email ? `Signed in as ${user.fullName || user.email}` : "Aim Navigator"}
        </span>
        <span className="eyebrow">Discover The Career That Fits You</span>
      </footer>
    </div>
  )
}