import Link from "next/link";
import { cn } from "@/lib/utils";

export function FloatingNavbar({ className }: { className?: string }) {
  return (
    <nav
      className={cn(
        "fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-2 text-sm text-[#f5f5f0] shadow-2xl backdrop-blur-xl",
        className,
      )}
    >
      <Link className="rounded-full px-3 py-1.5 hover:bg-white/10" href="/">
        PageToReel
      </Link>
      <Link className="rounded-full px-3 py-1.5 hover:bg-white/10" href="/create">
        Create
      </Link>
      <Link className="rounded-full px-3 py-1.5 hover:bg-white/10" href="/reel/demo">
        Demo
      </Link>
    </nav>
  );
}
