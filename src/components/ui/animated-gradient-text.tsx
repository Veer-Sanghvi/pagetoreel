import { cn } from "@/lib/utils";

export function AnimatedGradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[#f5f5f0] drop-shadow-[0_0_28px_rgba(232,197,71,0.24)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
