import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { SceneSchema } from "@/lib/scene-schema";
import { type Emotion, type PanelStyle } from "@/lib/story";

export const runtime = "nodejs";
export const maxDuration = 60;

const emotions: Emotion[] = ["mysterious", "dramatic", "tense", "action", "melancholic", "peaceful", "joyful", "romantic"];
const panels: PanelStyle[] = ["wide", "portrait", "square", "panoramic"];

function fallbackExtraction(text: string, count: number, layout: string) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 30);
  const usable = sentences.length ? sentences : [text];
  const words = text.split(/\s+/).filter(Boolean);
  const storyTitle = words.slice(0, 5).join(" ").replace(/[^\w\s'-]/g, "") || "Untitled Story";

  const scenes = Array.from({ length: count }, (_, index) => {
    const sliceStart = Math.floor((usable.length / count) * index);
    const sliceEnd = Math.max(sliceStart + 1, Math.floor((usable.length / count) * (index + 1)));
    const chunk = usable.slice(sliceStart, sliceEnd).join(" ");
    const titleWords = chunk.split(/\s+/).slice(0, 5).join(" ").replace(/[^\w\s'-]/g, "");
    const panelStyle =
      layout === "Widescreen"
        ? "wide"
        : layout === "Portrait"
          ? "portrait"
          : panels[index % panels.length];

    return {
      id: `scene-${index + 1}`,
      sceneNumber: index + 1,
      title: titleWords || `Scene ${index + 1}`,
      narratorText: chunk.split(/\s+/).slice(0, 46).join(" "),
      keyMoment: chunk.split(/\s+/).slice(0, 22).join(" "),
      visualPrompt: `Cinematic storyboard illustration of: ${chunk.slice(0, 260)}. Moody film lighting, expressive composition, no text in image.`,
      characters: ["Protagonist"],
      setting: "A cinematic interpretation of the uploaded story",
      emotion: emotions[index % emotions.length],
      panelStyle,
    };
  });

  return {
    title: storyTitle,
    totalScenes: scenes.length,
    genre: "Uploaded story",
    mood: "Cinematic",
    scenes,
  };
}

export async function POST(req: Request) {
  const { text, sceneCount = 6, layout = "Auto" } = await req.json();
  const trimmed = String(text ?? "").replace(/\s+/g, " ").trim().slice(0, 18000);
  const count = Math.min(Math.max(Number(sceneCount) || 6, 3), 8);

  if (!trimmed || trimmed.length < 80) {
    return Response.json({ error: "Please provide at least a few paragraphs of story text." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const shouldUseFallback = !apiKey || apiKey === "your_key_here";

  try {
    if (shouldUseFallback) {
      return Response.json(fallbackExtraction(trimmed, count, layout));
    }

    const result = streamObject({
      model: openai("gpt-4o"),
      schema: SceneSchema,
      prompt: `Extract a cinematic storyboard reel from this book chapter or comic script.

Rules:
- Return exactly ${count} scenes, never more than 8.
- Use compact narration, 28 to 55 words per scene.
- The visualPrompt must be image-model ready and must not request text, logos, captions, speech bubbles, or typography.
- Keep character names consistent across scenes.
- Layout preference from user: ${layout}. If Auto or Mixed, choose the strongest panelStyle per scene.
- totalScenes must equal the number of scenes returned.
- id values should be short stable slugs.

Story text:
${trimmed}`,
    });

    const object = await result.object;
    return Response.json({
      ...object,
      scenes: object.scenes.slice(0, 8).map((scene, index) => ({
        ...scene,
        sceneNumber: index + 1,
      })),
      totalScenes: Math.min(object.scenes.length, 8),
    });
  } catch {
    return Response.json(fallbackExtraction(trimmed, count, layout));
  }
}
