/**
 * One-shot: add `editorial` field to opinionated models. Run once and commit.
 */

import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODELS_PATH = join(ROOT, "data/models.json");

type Editorial = {
  rank?: "gold" | "silver" | "bronze";
  pitch: string; // one-liner shown in featured slots
  good_for?: string; // optional secondary line
};

// Opinionated editorial. Update over time; eventually swap to Arena-driven.
const EDITORIAL: Record<string, Editorial> = {
  "kokoro-82m": {
    rank: "gold",
    pitch: "The current default recommendation.",
    good_for: "Excellent quality. Tiny model. Runs almost anywhere.",
  },
  "orpheus-tts": {
    rank: "silver",
    pitch: "Most natural-sounding conversations.",
    good_for: "Llama-3 based. Empathetic. Built for interactive apps.",
  },
  chatterbox: {
    rank: "bronze",
    pitch: "Best voice cloning, MIT-licensed.",
    good_for: "ElevenLabs-tier quality from a few seconds of reference audio.",
  },
  dia: {
    pitch: "Sounds like a podcast — two-speaker dialogue out of the box.",
  },
  "xtts-v2": {
    pitch: "The most-downloaded TTS on Hugging Face for a reason.",
    good_for: "17 languages, voice cloning from 6 seconds.",
  },
  "fish-speech": {
    pitch: "Benchmarks above closed-source models on multilingual quality.",
  },
  "f5-tts": {
    pitch: "Fast, flow-matched voice cloning. Zero-shot from a short reference.",
  },
  bark: {
    pitch: "The chaotic one — generates laughter, sighs, even music. Use with intention.",
  },
};

async function main() {
  const models = JSON.parse(await readFile(MODELS_PATH, "utf-8")) as Array<{
    id: string;
    [k: string]: unknown;
  }>;

  let count = 0;
  for (const m of models) {
    const ed = EDITORIAL[m.id];
    if (ed) {
      (m as Record<string, unknown>).editorial = ed;
      count++;
    }
  }

  await writeFile(MODELS_PATH, JSON.stringify(models, null, 2));
  console.log(`Added editorial to ${count} models.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
