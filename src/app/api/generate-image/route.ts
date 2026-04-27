import { experimental_generateImage } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

const sizeForPanel = (panelStyle: string) => {
  if (panelStyle === "wide" || panelStyle === "panoramic") return "1792x1024" as const;
  if (panelStyle === "portrait") return "1024x1792" as const;
  return "1024x1024" as const;
};

export async function POST(req: Request) {
  const { visualPrompt, style = "Graphic Novel", panelStyle = "wide" } = await req.json();

  if (!visualPrompt) {
    return Response.json({ error: "visualPrompt is required." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    return Response.json({ error: "OPENAI_API_KEY is not configured." }, { status: 503 });
  }

  const { image } = await experimental_generateImage({
    model: openai.image("dall-e-3"),
    prompt: `${visualPrompt}. Art style: ${style}. Cinematic lighting. No text, captions, letters, symbols, logos, or watermarks in image. Aspect ratio matches: ${panelStyle}.`,
    size: sizeForPanel(panelStyle),
  });

  return Response.json({ imageBase64: image.base64 });
}
