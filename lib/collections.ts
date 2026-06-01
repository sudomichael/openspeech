import type { Model } from "./types";

export type Collection = {
  id: string;
  label: string;
  description: string;
  filter: (models: Model[]) => Model[];
};

function parseParams(s: string): number {
  const m = s.match(/([\d.]+)\s*([MBK]?)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const mult = m[2].toUpperCase() === "B" ? 1e9 : m[2].toUpperCase() === "K" ? 1e3 : 1e6;
  return n * mult;
}

const sampled = (m: Model) =>
  m.voices.some((v) => v.samples.neutral || v.samples.emotional || v.samples.numbers);

export const COLLECTIONS: Collection[] = [
  {
    id: "cloning",
    label: "Best for voice cloning",
    description: "Clone a voice from a short reference clip.",
    filter: (models) =>
      models.filter((m) => m.voice_cloning && sampled(m)).slice(0, 8),
  },
  {
    id: "fastest",
    label: "Best for real-time",
    description: "Stream tokens fast enough for voice agents.",
    filter: (models) =>
      [...models]
        .filter((m) => m.streaming && sampled(m))
        .sort((a, b) => a.realtime_factor - b.realtime_factor)
        .slice(0, 8),
  },
  {
    id: "cpu",
    label: "Best for CPU",
    description: "No GPU? No problem. These run on a laptop.",
    filter: (models) =>
      models.filter((m) => m.vram_gb === 0 && sampled(m)).slice(0, 8),
  },
  {
    id: "multilingual",
    label: "Best for multilingual",
    description: "Five or more languages in one model.",
    filter: (models) =>
      [...models]
        .filter((m) => m.languages.length >= 5 && sampled(m))
        .sort((a, b) => b.languages.length - a.languages.length)
        .slice(0, 8),
  },
  {
    id: "tiny",
    label: "Best for edge deployment",
    description: "Under 200M parameters — embed anywhere.",
    filter: (models) =>
      [...models]
        .filter((m) => parseParams(m.params) <= 200e6 && sampled(m))
        .sort((a, b) => parseParams(a.params) - parseParams(b.params))
        .slice(0, 8),
  },
  {
    id: "expressive",
    label: "Best for emotion + flavor",
    description: "Long-form, dialogue, and expressive models.",
    filter: (models) =>
      models
        .filter(
          (m) =>
            ["expressive", "dialogue", "long-form"].includes(m.category) &&
            sampled(m)
        )
        .slice(0, 8),
  },
];
