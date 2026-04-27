import { experimental_generateSpeech as generateSpeech } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text) {
    return Response.json({ error: "text is required." }, { status: 400 });
  }

  const { audio } = await generateSpeech({
    model: openai.speech("tts-1"),
    text: String(text).slice(0, 1200),
    voice: "nova",
  });

  const body = new Uint8Array(audio.uint8Array);

  return new Response(body.buffer, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
