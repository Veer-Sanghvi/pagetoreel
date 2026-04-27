import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { SceneSchema } from "@/lib/scene-schema";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { text, sceneCount = 6, layout = "Auto" } = await req.json();
  const trimmed = String(text ?? "").replace(/\s+/g, " ").trim().slice(0, 18000);
  const count = Math.min(Math.max(Number(sceneCount) || 6, 3), 8);

  if (!trimmed || trimmed.length < 80) {
    return Response.json({ error: "Please provide at least a few paragraphs of story text." }, { status: 400 });
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
}
