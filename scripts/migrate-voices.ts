/**
 * One-shot: migrate data/models.json from { samples } to { voices[] }.
 * Defines the voice presets per model, attaches them, clears all sample paths.
 */

import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODELS_PATH = join(ROOT, "data/models.json");

type VoicePreset = {
  id: string;
  name: string;
  gender: "m" | "f" | "n";
  accent: string;
};

// Per-model voice presets. Tier-1 expansion: 5+ voices per model where possible.
const PRESETS: Record<string, VoicePreset[]> = {
  "kokoro-82m": [
    { id: "af_bella", name: "Bella", gender: "f", accent: "american" },
    { id: "af_nicole", name: "Nicole", gender: "f", accent: "american" },
    { id: "am_michael", name: "Michael", gender: "m", accent: "american" },
    { id: "am_adam", name: "Adam", gender: "m", accent: "american" },
    { id: "bf_emma", name: "Emma", gender: "f", accent: "british" },
    { id: "bm_george", name: "George", gender: "m", accent: "british" },
    { id: "af_sky", name: "Sky", gender: "f", accent: "american" },
    { id: "am_onyx", name: "Onyx", gender: "m", accent: "american" },
  ],
  bark: [
    { id: "en_speaker_6", name: "Speaker 6", gender: "m", accent: "english" },
    { id: "en_speaker_3", name: "Speaker 3", gender: "f", accent: "english" },
    { id: "en_speaker_0", name: "Speaker 0", gender: "f", accent: "english" },
    { id: "en_speaker_5", name: "Speaker 5", gender: "m", accent: "english" },
    { id: "en_speaker_9", name: "Speaker 9", gender: "f", accent: "english" },
    { id: "announcer", name: "Announcer", gender: "n", accent: "english" },
  ],
  "orpheus-tts": [
    { id: "tara", name: "Tara", gender: "f", accent: "american" },
    { id: "dan", name: "Dan", gender: "m", accent: "american" },
    { id: "josh", name: "Josh", gender: "m", accent: "american" },
    { id: "emma", name: "Emma", gender: "f", accent: "american" },
  ],
  "parler-tts": [
    {
      id: "clear-female",
      name: "Clear female, calm",
      gender: "f",
      accent: "american",
    },
    {
      id: "deep-male",
      name: "Deep male, confident",
      gender: "m",
      accent: "american",
    },
    {
      id: "warm-female",
      name: "Warm female, expressive",
      gender: "f",
      accent: "british",
    },
    {
      id: "newscaster",
      name: "Newscaster, formal",
      gender: "m",
      accent: "american",
    },
    {
      id: "friendly-male",
      name: "Friendly male, casual",
      gender: "m",
      accent: "american",
    },
  ],
  dia: [
    { id: "s1", name: "Speaker 1", gender: "f", accent: "american" },
    { id: "s2", name: "Speaker 2", gender: "m", accent: "american" },
  ],
  // Voice-cloning models: stay at 1 voice (the shared reference) for now
  "xtts-v2": [
    { id: "ref", name: "Reference clone", gender: "f", accent: "american" },
  ],
  "f5-tts": [
    { id: "ref", name: "Reference clone", gender: "f", accent: "american" },
  ],
  "fish-speech": [
    { id: "ref", name: "Reference clone", gender: "f", accent: "american" },
  ],
  chatterbox: [
    { id: "default", name: "Default", gender: "f", accent: "american" },
  ],
};

const DEFAULT_VOICE: Record<string, string> = {
  "kokoro-82m": "af_bella",
  bark: "en_speaker_6",
  "orpheus-tts": "tara",
  "parler-tts": "clear-female",
  dia: "s1",
  "xtts-v2": "ref",
  "f5-tts": "ref",
  "fish-speech": "ref",
  chatterbox: "default",
};

type OldModel = {
  id: string;
  samples?: Record<string, string | null>;
  [k: string]: unknown;
};

async function main() {
  const models = JSON.parse(await readFile(MODELS_PATH, "utf-8")) as OldModel[];

  for (const m of models) {
    const presets = PRESETS[m.id];
    const defVoice = DEFAULT_VOICE[m.id];
    // Skip models we haven't onboarded to Replicate yet — they get a single
    // placeholder voice so the UI can still render.
    const voices =
      presets ??
      [
        {
          id: "default",
          name: "Default",
          gender: "n" as const,
          accent: "unspecified",
        },
      ];
    (m as Record<string, unknown>).voices = voices.map((v) => ({
      ...v,
      samples: { neutral: null, emotional: null, numbers: null },
    }));
    (m as Record<string, unknown>).default_voice = defVoice ?? voices[0].id;
    delete m.samples;
  }

  await writeFile(MODELS_PATH, JSON.stringify(models, null, 2));
  console.log(`Migrated ${models.length} models.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
