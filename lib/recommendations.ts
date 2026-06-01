import { models } from "./data";
import type { Model } from "./types";

export function getRecommendations(): Model[] {
  const ranked = models
    .filter((m) => m.editorial?.rank)
    .sort((a, b) => {
      const order = { gold: 0, silver: 1, bronze: 2 };
      const ra = order[a.editorial!.rank!];
      const rb = order[b.editorial!.rank!];
      return ra - rb;
    });
  return ranked.slice(0, 3);
}

export const RECOMMENDED_IDS = [
  "kokoro-82m",
  "orpheus-tts",
  "chatterbox",
];
