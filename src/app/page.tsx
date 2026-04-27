"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clapperboard, Headphones, Images, Sparkles } from "lucide-react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { BlurFade } from "@/components/ui/blur-fade";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { TiltedCard } from "@/components/ui/tilted-card";
import { demoReel } from "@/lib/story";

const stats = [
  { value: "8", label: "scenes generated", Icon: Images },
  { value: "DALL-E 3", label: "illustrations", Icon: Sparkles },
  { value: "TTS", label: "narration", Icon: Headphones },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0f0f0f] text-[#f5f5f0]">
      <FloatingNavbar />
      <section className="relative flex min-h-screen items-start px-6 pt-24 film-grain">
        <BackgroundBeams />
        <div className="mx-auto grid w-full max-w-7xl gap-10 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
          <div className="relative z-10">
            <motion.div
              initial={{ rotate: -18, y: -18, opacity: 0 }}
              animate={{ rotate: [0, -10, 0], y: 0, opacity: 1 }}
              transition={{ duration: 0.9, type: "spring" }}
              className="mb-7 inline-flex h-16 w-16 items-center justify-center rounded-md border border-[#e8c547]/35 bg-[#e8c547]/10"
            >
              <Clapperboard className="h-8 w-8 text-[#e8c547]" />
            </motion.div>

            <h1 className="font-serif text-6xl leading-none tracking-normal text-[#f5f5f0] drop-shadow-[0_0_28px_rgba(232,197,71,0.24)] md:text-8xl">
              PageToReel
            </h1>
            <p className="mt-6 max-w-2xl text-2xl text-[#f5f5f0] md:text-3xl">
              Your book. Seen, not just read.
            </p>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[#d8d0bf]">
              Upload a chapter and watch it become a cinematic visual story with illustrated panels,
              narration, motion, and an optional voice track.
            </p>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {stats.map(({ value, label, Icon }) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <Icon className="mb-4 h-5 w-5 text-[#e8c547]" />
                  <div className="text-xl font-semibold">{value}</div>
                  <div className="text-sm text-[#b8b0a0]">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ShimmerButton asChild size="lg">
                <Link href="/reel/demo">Try Demo Reel</Link>
              </ShimmerButton>
              <ShimmerButton asChild size="lg" className="bg-white text-black hover:bg-[#f5f5f0]">
                <Link href="/create">Upload Your Story</Link>
              </ShimmerButton>
            </div>
          </div>

          <BlurFade className="relative z-10">
            <div className="mb-3 inline-flex rounded-full border border-[#e8c547]/30 bg-[#e8c547]/10 px-3 py-1 text-sm text-[#e8c547]">
              Demo Reel
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {demoReel.scenes.map((scene, index) => (
                <TiltedCard key={scene.id}>
                  <Link
                    href="/reel/demo"
                    className="group block overflow-hidden rounded-lg border border-white/10 bg-[#1a1a1a] shadow-2xl"
                  >
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={scene.imageUrl ?? ""}
                        alt={scene.title}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-xs uppercase tracking-[0.28em] text-[#e8c547]">
                        Panel {index + 1}
                      </div>
                      <h3 className="mt-2 font-serif text-2xl">{scene.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#c8bfaf]">
                        {scene.narratorText}
                      </p>
                    </div>
                  </Link>
                </TiltedCard>
              ))}
            </div>
          </BlurFade>
        </div>
      </section>
    </main>
  );
}
