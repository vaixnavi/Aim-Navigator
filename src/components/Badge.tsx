import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  default: "bg-secondary text-muted-foreground",
  primary: "bg-primary/20 text-foreground ring-1 ring-primary/40",
  star: "bg-star/20 text-foreground ring-1 ring-star/40",
};

export default function Badge({ tone = "default", className, ...props }: any) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
