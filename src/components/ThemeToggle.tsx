import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

// Flips the "dark" class on <html> and remembers the choice.
// The first-visit default (system preference) is set by a tiny script in
// __root.tsx so the page never flashes the wrong theme.
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      window.localStorage.setItem("aim-theme", next ? "dark" : "light");
    } catch {
      // storage blocked, theme still changes for this visit
    }
    setIsDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
