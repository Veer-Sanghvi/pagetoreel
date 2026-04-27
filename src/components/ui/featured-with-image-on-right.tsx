import Image from "next/image";
import { cn } from "@/lib/utils";

export function FeaturedWithImageOnRight({
  title,
  body,
  image,
  className,
}: {
  title: string;
  body: string;
  image: string;
  className?: string;
}) {
  return (
    <section className={cn("grid gap-8 md:grid-cols-[1fr_0.9fr] md:items-center", className)}>
      <div>
        <h2 className="font-serif text-4xl text-[#f5f5f0] md:text-6xl">{title}</h2>
        <p className="mt-4 max-w-xl text-lg leading-8 text-[#d7d2c4]">{body}</p>
      </div>
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5">
        <Image src={image} alt="" width={1000} height={700} className="h-full w-full object-cover" />
      </div>
    </section>
  );
}
