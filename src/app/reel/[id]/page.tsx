"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Copy, Pause, Play, Printer, SkipBack, SkipForward } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { getReel } from "@/lib/reel-store";
import { type Reel, type Scene } from "@/lib/story";

function imageSrc(scene: Scene) {
  if (scene.imageBase64) return `data:image/png;base64,${scene.imageBase64}`;
  return scene.imageUrl ?? "";
}

function DemoArtNote() {
  return (
    <div className="mt-2 max-w-[13rem] rounded-full border border-[#e8c547]/30 bg-[#e8c547]/10 px-3 py-2 text-xs leading-5 text-[#e8c547] backdrop-blur">
      Demo uses atmospheric illustrations. Live reels generate DALL-E 3 art per scene.
    </div>
  );
}

function ScenePanel({ scene, total }: { scene: Scene; total: number }) {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1]);

  return (
    <section className="relative min-h-screen border-b border-white/10 bg-[#0f0f0f] print:min-h-0 print:break-after-page">
      <div className="sticky left-4 top-28 z-20 hidden w-fit md:block">
        <div className="rounded-full border border-[#e8c547]/30 bg-black/60 px-3 py-1 text-sm text-[#e8c547] backdrop-blur">
          {scene.sceneNumber}/{total}
        </div>
        <DemoArtNote />
      </div>
      <div
        className={`mx-auto grid max-w-7xl gap-6 px-5 py-20 ${
          scene.panelStyle === "portrait" ? "min-h-screen items-center md:grid-cols-[0.72fr_0.62fr]" : ""
        }`}
      >
        <motion.div
          style={{ scale }}
          className={`relative overflow-hidden rounded-lg border border-white/10 bg-[#1a1a1a] ${
            scene.panelStyle === "portrait" ? "aspect-[4/5]" : scene.panelStyle === "square" ? "aspect-square" : "aspect-[16/9]"
          }`}
        >
          <Image src={imageSrc(scene)} alt={scene.title} fill className="object-cover" />
          {scene.panelStyle === "square" ? <Narration scene={scene} overlay /> : null}
        </motion.div>
        {scene.panelStyle !== "square" ? <Narration scene={scene} /> : null}
      </div>
    </section>
  );
}

function Narration({ scene, overlay = false }: { scene: Scene; overlay?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.45 }}
      transition={{ duration: 0.5 }}
      className={
        overlay
          ? "absolute inset-x-4 bottom-4 rounded-lg border border-white/10 bg-black/55 p-5 text-[#f5f5f0] backdrop-blur-xl"
          : "rounded-lg border border-white/10 bg-white/[0.06] p-6 text-[#f5f5f0] backdrop-blur-xl"
      }
    >
      <div className="mb-3 text-xs uppercase tracking-[0.3em] text-[#e8c547]">Scene {scene.sceneNumber}</div>
      <h2 className="font-serif py-1 text-[clamp(2rem,4vw,3rem)] leading-[1.12]">{scene.title}</h2>
      <p className="mt-4 text-lg leading-8 text-[#ddd5c5]">{scene.narratorText}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {scene.characters.map((character) => (
          <span key={character} className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-sm">
            {character}
          </span>
        ))}
      </div>
      <p className="mt-4 text-sm text-[#aaa292]">{scene.setting}</p>
      {scene.audioUrl ? (
        <audio controls src={scene.audioUrl} className="mt-5 w-full" />
      ) : null}
    </motion.div>
  );
}

function Autoplay({ reel }: { reel: Reel }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const scene = reel.scenes[index];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % reel.scenes.length), 6000);
    return () => window.clearTimeout(timer);
  }, [index, playing, reel.scenes.length]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-6xl flex-col justify-center px-5 py-16">
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.45 }}
          className="overflow-hidden rounded-lg border border-white/10 bg-[#1a1a1a]"
        >
          <div className="relative aspect-[16/9] overflow-hidden">
            <motion.div initial={{ scale: 1 }} animate={{ scale: playing ? 1.08 : 1.02 }} transition={{ duration: 6, ease: "linear" }} className="absolute inset-0">
              <Image src={imageSrc(scene)} alt={scene.title} fill className="object-cover" />
            </motion.div>
          </div>
          <div className="p-6 md:p-8">
            <Badge className="bg-[#e8c547]/10 text-[#e8c547] hover:bg-[#e8c547]/10">
              {scene.sceneNumber}/{reel.scenes.length}
            </Badge>
            <DemoArtNote />
            <h2 className="mt-4 font-serif py-1 text-[clamp(2rem,4vw,3rem)] leading-[1.12]">
              {scene.title}
            </h2>
            <p className="mt-3 text-lg leading-8 text-[#d8d0bf]">{scene.narratorText}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      <motion.div
        key={`${index}-${playing}`}
        initial={{ width: "0%" }}
        animate={{ width: playing ? "100%" : "0%" }}
        transition={{ duration: 6, ease: "linear" }}
        className="mt-5 h-1 rounded-full bg-[#e8c547]"
      />
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button variant="outline" onClick={() => setIndex((current) => (current - 1 + reel.scenes.length) % reel.scenes.length)}>
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button onClick={() => setPlaying((current) => !current)} className="bg-[#e8c547] text-black hover:bg-[#f2d76d]">
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="outline" onClick={() => setIndex((current) => (current + 1) % reel.scenes.length)}>
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ReelPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const reel = useMemo(() => getReel(params.id), [params.id]);

  const shareUrl = useMemo(() => (typeof window === "undefined" ? "" : window.location.href), []);

  if (!reel) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] p-6 text-[#f5f5f0]">
        <div className="text-center">
          <h1 className="font-serif py-2 text-[clamp(3rem,8vw,5rem)] leading-[1.12]">Reel not found</h1>
          <Button asChild className="mt-6 bg-[#e8c547] text-black hover:bg-[#f2d76d]">
            <Link href="/create">Start New Reel</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-[#f5f5f0]">
      <FloatingNavbar />
      {reel.isDemo ? (
        <div className="fixed inset-x-0 top-20 z-40 mx-auto w-fit rounded-full border border-[#e8c547]/30 bg-black/70 px-4 py-2 text-sm text-[#e8c547] backdrop-blur">
          Demo Reel - Upload your own story to create your personal reel
        </div>
      ) : null}
      <header className="mx-auto max-w-7xl px-5 pb-8 pt-32">
        <Badge className="mb-4 bg-[#e8c547]/10 text-[#e8c547] hover:bg-[#e8c547]/10">{reel.genre}</Badge>
        <h1 className="font-serif max-w-5xl py-2 text-[clamp(3rem,6vw,5rem)] leading-[1.12]">
          {reel.title}
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-[#cfc6b6]">{reel.mood}</p>
        <div className="mt-6 flex flex-wrap gap-3 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Download as PDF Storyboard
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await navigator.clipboard.writeText(shareUrl);
              setCopied(true);
            }}
          >
            <Copy className="mr-2 h-4 w-4" /> {copied ? "Copied" : "Share Reel"}
          </Button>
          <Button onClick={() => router.push("/create")} className="bg-[#e8c547] text-black hover:bg-[#f2d76d]">
            Start New Reel
          </Button>
        </div>
      </header>

      <Tabs defaultValue="scroll" className="print:hidden">
        <div className="sticky top-20 z-30 mx-auto mb-2 flex max-w-7xl justify-end px-5">
          <TabsList className="border border-white/10 bg-black/60 backdrop-blur">
            <TabsTrigger value="scroll">Scroll Mode</TabsTrigger>
            <TabsTrigger value="autoplay">Autoplay Mode</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="scroll" className="mt-0">
          {reel.scenes.map((scene) => (
            <ScenePanel key={scene.id} scene={scene} total={reel.scenes.length} />
          ))}
        </TabsContent>
        <TabsContent value="autoplay" className="mt-0">
          <Autoplay reel={reel} />
        </TabsContent>
      </Tabs>

      <div className="hidden print:block">
        {reel.scenes.map((scene) => (
          <ScenePanel key={scene.id} scene={scene} total={reel.scenes.length} />
        ))}
      </div>
      <Progress value={100} className="fixed bottom-0 left-0 right-0 h-1 rounded-none print:hidden" />
    </main>
  );
}
