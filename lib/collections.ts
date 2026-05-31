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
    id: "popular",
    label: "Most popular",
    description: "Where most people start — the workhorses of the OSS TTS scene.",
    filter: (models) => {
      const order = [
        "kokoro-82m",
        "chatterbox",
        "xtts-v2",
        "orpheus-tts",
        "dia",
        "bark",
      ];
      return order
        .map((id) => models.find((m) => m.id === id))
        .filter((m): m is Model => !!m && sampled(m));
    },
  },
  {
    id: "cloning",
    label: "Best voice cloning",
    description: "Clone a voice from a short reference clip.",
    filter: (models) =>
      models
        .filter((m) => m.voice_cloning && sampled(m))
        .slice(0, 6),
  },
  {
    id: "fastest",
    label: "Fastest",
    description: "Real-time and beyond — lowest realtime factor wins.",
    filter: (models) =>
      [...models]
        .filter(sampled)
        .sort((a, b) => a.realtime_factor - b.realtime_factor)
        .slice(0, 6),
  },
  {
    id: "cpu",
    label: "Runs on CPU",
    description: "No GPU? No problem. These run on a laptop.",
    filter: (models) =>
      models
        .filter((m) => m.vram_gb === 0 && sampled(m))
        .slice(0, 6),
  },
  {
    id: "tiny",
    label: "Tiny models",
    description: "Under 200M parameters — edge-ready, embed anywhere.",
    filter: (models) =>
      [...models]
        .filter((m) => parseParams(m.params) <= 200e6 && sampled(m))
        .sort((a, b) => parseParams(a.params) - parseParams(b.params))
        .slice(0, 6),
  },
];
