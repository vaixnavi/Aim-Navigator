import lightIcon from "../../logo/logo_light_theme.png";
import darkIcon from "../../logo/logo_dark_theme.png";
import { cn } from "@/lib/utils";

// Both logo variants are rendered; CSS shows the one matching the theme.
export default function Logo({ className, withName = true }: { className?: string; withName?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img src={lightIcon} alt="" className="h-8 w-8 rounded-md dark:hidden" />
      <img src={darkIcon} alt="" className="hidden h-8 w-8 rounded-md dark:block" />
      {withName ? (
        <span className="font-display text-sm font-bold tracking-wide uppercase">Aim Navigator</span>
      ) : null}
    </span>
  );
}
