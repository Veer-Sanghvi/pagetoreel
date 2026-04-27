import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ShimmerButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      className={cn(
        "relative overflow-hidden border border-[#e8c547]/40 bg-[#e8c547] text-black shadow-[0_0_34px_rgba(232,197,71,0.18)] hover:bg-[#f2d76d]",
        "before:absolute before:inset-y-0 before:-left-1/2 before:w-1/2 before:skew-x-[-20deg] before:bg-white/35 before:content-[''] before:animate-[shimmer_2.4s_infinite]",
        className,
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </Button>
  );
}
