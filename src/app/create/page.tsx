"use client";

import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Headphones, ImagePlus, Loader2, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { BorderBeam } from "@/components/ui/border-beam";
import { BlurFade } from "@/components/ui/blur-fade";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { createFallbackImage, estimateImageCost, type Reel, type Scene } from "@/lib/story";
import { saveReel } from "@/lib/reel-store";

const styles = ["Graphic Novel", "Watercolor", "Anime", "Cinematic Photo", "Comic Book", "Oil Painting"];
const layouts = ["Auto", "Widescreen", "Portrait", "Mixed"];

async function extractPdfText(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).toString();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }

  return pages.join("\n\n");
}

export default function CreatePage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [style, setStyle] = useState(styles[0]);
  const [layout, setLayout] = useState(layouts[0]);
  const [tts, setTts] = useState(false);
  const [sceneCount, setSceneCount] = useState(6);
  const [phase, setPhase] = useState<"idle" | "extracting" | "imaging" | "done">("idle");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [imageProgress, setImageProgress] = useState(0);
  const [error, setError] = useState("");

  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);
  const estimatedCost = estimateImageCost(sceneCount);

  async function handleFile(file?: File) {
    if (!file) return;
    setError("");
    setFileName(file.name);

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      setText(await extractPdfText(file));
      return;
    }

    setText(await file.text());
  }

  async function handleGenerate() {
    setError("");
    setPhase("extracting");
    setScenes([]);
    setImageProgress(0);

    try {
      const extractResponse = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sceneCount, layout }),
      });

      if (!extractResponse.ok) throw new Error(await extractResponse.text());
      const extracted = (await extractResponse.json()) as Omit<Reel, "id" | "style" | "createdAt" | "narrationEnabled">;
      setScenes(extracted.scenes);
      setPhase("imaging");

      const completed: Scene[] = [];
      for (const scene of extracted.scenes.slice(0, 8)) {
        let imageBase64 = "";
        let imageUrl = "";
        try {
          const imageResponse = await fetch("/api/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ visualPrompt: scene.visualPrompt, style, panelStyle: scene.panelStyle }),
          });
          if (!imageResponse.ok) throw new Error("Image generation failed");
          const imageData = (await imageResponse.json()) as { imageBase64: string };
          imageBase64 = imageData.imageBase64;
        } catch {
          imageUrl = createFallbackImage();
        }

        let audioUrl: string | undefined;
        if (tts) {
          try {
            const audioResponse = await fetch("/api/narrate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: scene.narratorText }),
            });
            if (audioResponse.ok) {
              audioUrl = URL.createObjectURL(await audioResponse.blob());
            }
          } catch {
            audioUrl = undefined;
          }
        }

        completed.push({ ...scene, imageBase64, imageUrl, audioUrl });
        setScenes([...completed, ...extracted.scenes.slice(completed.length)]);
        setImageProgress(completed.length);
      }

      const id = crypto.randomUUID();
      const reel: Reel = {
        id,
        title: extracted.title,
        genre: extracted.genre,
        mood: extracted.mood,
        totalScenes: completed.length,
        scenes: completed,
        style,
        narrationEnabled: tts,
        createdAt: new Date().toISOString(),
      };
      saveReel(reel);
      setPhase("done");
      router.push(`/reel/${id}`);
    } catch (caught) {
      setPhase("idle");
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    }
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-5 pb-20 pt-28 text-[#f5f5f0]">
      <FloatingNavbar />
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <Badge className="mb-4 border-[#e8c547]/30 bg-[#e8c547]/10 text-[#e8c547] hover:bg-[#e8c547]/10">
            Up to 8 scenes generated per upload to keep your API costs under $0.65 per reel.
          </Badge>
          <h1 className="font-serif mx-auto max-w-5xl py-2 text-[clamp(3rem,7vw,5.5rem)] leading-[1.08]">
            Create your storyboard reel
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[#cfc6b6]">
            This will generate {sceneCount} images (~${estimatedCost} in API credits).
          </p>
        </div>

        <Card className="relative overflow-hidden border-white/10 bg-[#1a1a1a] text-[#f5f5f0]">
          <BorderBeam />
          <CardContent className="grid gap-8 p-5 md:p-8 lg:grid-cols-[1fr_0.85fr]">
            <div className="space-y-5">
              <label
                onDragOver={(event: DragEvent<HTMLLabelElement>) => event.preventDefault()}
                onDrop={(event: DragEvent<HTMLLabelElement>) => {
                  event.preventDefault();
                  void handleFile(event.dataTransfer.files[0]);
                }}
                className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#e8c547]/35 bg-black/25 p-6 text-center transition hover:bg-[#e8c547]/5"
              >
                <UploadCloud className="mb-4 h-10 w-10 text-[#e8c547]" />
                <span className="text-lg font-medium">Drop a PDF or text file</span>
                <span className="mt-2 text-sm text-[#bfb7a6]">{fileName || "or click to browse .pdf and .txt"}</span>
                <input
                  type="file"
                  accept=".txt,.pdf,text/plain,application/pdf"
                  className="hidden"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => void handleFile(event.target.files?.[0])}
                />
              </label>

              <div>
                <Textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  maxLength={18000}
                  placeholder="Paste up to 3000 words of a chapter or comic script..."
                  className="min-h-72 border-white/10 bg-black/30 text-base text-[#f5f5f0] placeholder:text-[#8b8478]"
                />
                <div className="mt-2 flex justify-between text-sm text-[#a9a08f]">
                  <span>{words} / 3000 words</span>
                  <span>{text.length.toLocaleString()} characters</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <ImagePlus className="h-5 w-5 text-[#e8c547]" /> Art Style
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {styles.map((item) => (
                    <Button
                      key={item}
                      type="button"
                      variant="outline"
                      onClick={() => setStyle(item)}
                      className={`h-16 border-white/10 bg-black/25 text-[#f5f5f0] hover:bg-white/10 ${
                        style === item ? "border-[#e8c547] bg-[#e8c547]/10 text-[#e8c547]" : ""
                      }`}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-lg font-semibold">Panel Layout</h2>
                <div className="grid grid-cols-4 gap-2">
                  {layouts.map((item) => (
                    <Button
                      key={item}
                      type="button"
                      variant="outline"
                      onClick={() => setLayout(item)}
                      className={`border-white/10 bg-black/25 text-[#f5f5f0] hover:bg-white/10 ${
                        layout === item ? "border-[#e8c547] bg-[#e8c547]/10 text-[#e8c547]" : ""
                      }`}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                <label className="flex cursor-pointer items-center justify-between gap-4">
                  <span>
                    <span className="flex items-center gap-2 font-medium">
                      <Headphones className="h-4 w-4 text-[#e8c547]" /> TTS narration
                    </span>
                    <span className="mt-1 block text-sm text-[#aaa292]">Adds an audio track per panel and costs extra.</span>
                  </span>
                  <input className="h-5 w-5 accent-[#e8c547]" type="checkbox" checked={tts} onChange={(event) => setTts(event.target.checked)} />
                </label>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">Scene count</span>
                  <span className="text-[#e8c547]">{sceneCount}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={sceneCount}
                  onChange={(event) => setSceneCount(Number(event.target.value))}
                  className="w-full accent-[#e8c547]"
                />
              </div>

              <Separator className="bg-white/10" />
              {error ? <p className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
              <ShimmerButton
                size="lg"
                className="w-full"
                disabled={phase !== "idle" || words < 20 || words > 3000}
                onClick={handleGenerate}
              >
                {phase === "idle" ? "Generate My Reel" : "Generating Reel"}
              </ShimmerButton>
            </div>
          </CardContent>
        </Card>

        {phase !== "idle" ? (
          <section className="mt-10 rounded-lg border border-white/10 bg-[#1a1a1a] p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="film-spinner" />
              <div>
                <h2 className="text-xl font-semibold">
                  {phase === "extracting" ? "Analyzing your story..." : "Generating scene images..."}
                </h2>
                <p className="text-sm text-[#bfb7a6]">
                  {phase === "extracting"
                    ? "Identifying key moments, characters, mood, and visual beats."
                    : `Generating scene ${Math.min(imageProgress + 1, scenes.length)} of ${scenes.length}.`}
                </p>
              </div>
            </div>
            <Progress value={phase === "extracting" ? 28 : scenes.length ? (imageProgress / scenes.length) * 100 : 40} />
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {scenes.map((scene, index) => (
                <BlurFade key={scene.id} delay={index * 0.04}>
                  <div className="overflow-hidden rounded-lg border border-white/10 bg-black/25">
                    {scene.imageBase64 || scene.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={scene.imageBase64 ? `data:image/png;base64,${scene.imageBase64}` : scene.imageUrl}
                        alt={scene.title}
                        className="aspect-video w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center text-[#a9a08f]">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="text-xs text-[#e8c547]">Scene {scene.sceneNumber}</div>
                      <div className="mt-1 font-medium">{scene.title}</div>
                    </div>
                  </div>
                </BlurFade>
              ))}
              {phase === "extracting" && !scenes.length ? (
                <div className="col-span-full rounded-lg border border-white/10 bg-black/25 p-6 text-[#bfb7a6]">
                  Scene cards will appear after extraction completes.
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
