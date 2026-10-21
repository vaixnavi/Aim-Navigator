import { cn } from "@/lib/utils";

export default function Card({ className, glow = false, ...props }: any) {
  return (
    <div
      className={cn("surface p-5 sm:p-6", glow && "shadow-glow", className)}
      {...props}
    />
  );
}
