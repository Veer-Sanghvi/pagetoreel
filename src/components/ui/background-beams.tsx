import { cn } from "@/lib/utils";

export function BackgroundBeams({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute left-[-15%] top-20 h-px w-[130%] rotate-[-12deg] bg-gradient-to-r from-transparent via-[#e8c547]/35 to-transparent" />
      <div className="absolute left-[-10%] top-1/2 h-px w-[120%] rotate-[8deg] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute bottom-16 left-[-20%] h-px w-[140%] rotate-[-4deg] bg-gradient-to-r from-transparent via-[#e8c547]/25 to-transparent" />
    </div>
  );
}
