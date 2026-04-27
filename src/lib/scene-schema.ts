import { z } from "zod";

export const SceneSchema = z.object({
  title: z.string(),
  totalScenes: z.number(),
  genre: z.string(),
  mood: z.string(),
  scenes: z
    .array(
      z.object({
        id: z.string(),
        sceneNumber: z.number(),
        title: z.string(),
        narratorText: z.string(),
        keyMoment: z.string(),
        visualPrompt: z.string(),
        characters: z.array(z.string()),
        setting: z.string(),
        emotion: z.enum([
          "tense",
          "joyful",
          "melancholic",
          "dramatic",
          "peaceful",
          "mysterious",
          "action",
          "romantic",
        ]),
        panelStyle: z.enum(["wide", "portrait", "square", "panoramic"]),
      }),
    )
    .max(8),
});
