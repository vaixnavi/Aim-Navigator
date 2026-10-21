import Logo from "@/components/Logo";

// Loading state: the compass logo slowly pulsing with a short label.
export default function LogoLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20" role="status">
      <Logo withName={false} className="animate-pulse [&_img]:h-12 [&_img]:w-12" />
      <p className="eyebrow">{label}</p>
    </div>
  );
}
