import { cn } from "@/lib/utils";

export function BorderBeam({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] border border-[#e8c547]/25 shadow-[0_0_40px_rgba(232,197,71,0.12),inset_0_0_28px_rgba(232,197,71,0.06)]",
        className,
      )}
      aria-hidden
    />
  );
}
