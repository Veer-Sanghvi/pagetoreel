"use client";

import { demoReel, type Reel } from "@/lib/story";

const key = "pagetoreel.reels";

export function getReels(): Reel[] {
  if (typeof window === "undefined") return [demoReel];
  const stored = window.localStorage.getItem(key);
  if (!stored) return [demoReel];

  try {
    const reels = JSON.parse(stored) as Reel[];
    return [demoReel, ...reels.filter((reel) => reel.id !== "demo")];
  } catch {
    return [demoReel];
  }
}

export function getReel(id: string): Reel | undefined {
  return getReels().find((reel) => reel.id === id);
}

export function saveReel(reel: Reel) {
  const reels = getReels().filter((existing) => existing.id !== "demo" && existing.id !== reel.id);
  window.localStorage.setItem(key, JSON.stringify([reel, ...reels].slice(0, 8)));
}
