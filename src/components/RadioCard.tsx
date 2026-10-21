import { cn } from "@/lib/utils";

// One selectable option inside a question. Uses a real radio input so
// keyboard and screen-reader behaviour comes for free.
export default function RadioCard({ name, value, label, checked, onChange }: any) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-all",
        checked
          ? "border-primary bg-primary/15 text-foreground shadow-glow"
          : "border-border bg-background/40 text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          checked ? "border-primary" : "border-border",
        )}
      >
        {checked ? <span className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
      </span>
      <span>{label}</span>
    </label>
  );
}
