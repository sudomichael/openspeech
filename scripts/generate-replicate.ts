/**
 * Generate samples for Replicate-hosted models, in parallel, with voice variants.
 *
 * Setup:
 *   1. Put REPLICATE_API_TOKEN=r8_... in .env or .env.local
 *   2. Run: npx tsx scripts/generate-replicate.ts
 *      Optional: --missing  (only generate samples that are still null)
 *               --concurrency=30  (override default in-flight cap)
 *
 * Pipeline:
 *   - Upload one shared reference WAV for voice-cloning models.
 *   - Warm Bark with a tiny ping (its cold start is the long pole).
 *   - Build a flat queue of {model, voice, script} jobs.
 *   - Run them in parallel up to the concurrency cap.
 *   - Save data/models.json after every completed job so a crash doesn't lose work.
 */

import { writeFile, mkdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODELS_PATH = join(ROOT, "data/models.json");
const SCRIPTS_PATH = join(ROOT, "data/scripts.json");

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const p = join(ROOT, name);
    if (!existsSync(p)) continue;
    const txt = require("node:fs").readFileSync(p, "utf-8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();

type ScriptId = "neutral" | "emotional" | "numbers";

type Voice = {
  id: string;
  name: string;
  gender: string;
  accent: string;
  samples: Record<ScriptId, string | null>;
};

type Model = {
  id: string;
  voices: Voice[];
  default_voice: string;
};

type Scripts = Record<ScriptId, { text: string }>;

type Ctx = { refUrl: string; scripts: Scripts };

type InputBuilder = (
  text: string,
  voiceId: string,
  ctx: Ctx
) => Record<string, unknown>;

// The reference text matches the audio in REF_AUDIO_PATH (Kokoro neutral).
const REF_TEXT = "The quick brown fox jumps over the lazy dog near the riverbank.";
const REF_AUDIO_PATH = "public/samples/_reference/neutral.wav";

const MAP: Record<string, { slug: string; buildInput: InputBuilder }> = {
  "kokoro-82m": {
    slug: "jaaari/kokoro-82m",
    buildInput: (text, voice) => ({ text, voice, speed: 1.0 }),
  },
  "xtts-v2": {
    slug: "lucataco/xtts-v2",
    buildInput: (text, _v, ctx) => ({
      text,
      speaker: ctx.refUrl,
      language: "en",
    }),
  },
  bark: {
    slug: "suno-ai/bark",
    buildInput: (text, voice) => ({
      prompt: text,
      history_prompt: voice,
      text_temp: 0.7,
      waveform_temp: 0.7,
    }),
  },
  "parler-tts": {
    slug: "cjwbw/parler-tts",
    buildInput: (text, voice) => ({
      prompt: text,
      description: PARLER_DESCRIPTIONS[voice] ?? PARLER_DESCRIPTIONS["clear-female"],
    }),
  },
  chatterbox: {
    slug: "resemble-ai/chatterbox",
    buildInput: (text) => ({ prompt: text, seed: 42 }),
  },
  "f5-tts": {
    slug: "x-lance/f5-tts",
    buildInput: (text, _v, ctx) => ({
      gen_text: text,
      ref_audio: ctx.refUrl,
      ref_text: REF_TEXT,
    }),
  },
  "orpheus-tts": {
    slug: "lucataco/orpheus-3b-0.1-ft",
    buildInput: (text, voice) => ({ text, voice }),
  },
  "fish-speech": {
    slug: "ttsds/fishspeech_1_5",
    buildInput: (text, _v, ctx) => ({
      text,
      speaker_reference: ctx.refUrl,
      text_reference: REF_TEXT,
    }),
  },
  dia: {
    slug: "zsxkib/dia",
    buildInput: (text, voice) => ({
      text: `[${voice === "s2" ? "S2" : "S1"}] ${text}`,
      seed: voice === "s2" ? 123 : 42,
    }),
  },
};

const PARLER_DESCRIPTIONS: Record<string, string> = {
  "clear-female":
    "A clear female voice with moderate pace, calm tone, and high audio quality.",
  "deep-male":
    "A deep, confident male voice speaking with measured pace and clear articulation.",
  "warm-female":
    "A warm, expressive female voice with British accent, friendly and engaging tone.",
  newscaster:
    "A formal male voice in a newscaster style, professional, even pace, clear delivery.",
  "friendly-male":
    "A friendly, casual male voice speaking with relaxed pace and natural intonation.",
};

// ---------- Replicate API helpers ----------

async function fetchLatestVersion(slug: string, token: string): Promise<string> {
  const res = await fetch(`https://api.replicate.com/v1/models/${slug}`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) throw new Error(`models/${slug}: ${res.status}`);
  const d = (await res.json()) as { latest_version?: { id: string } };
  if (!d.latest_version?.id) throw new Error(`no latest_version for ${slug}`);
  return d.latest_version.id;
}

function extractAudioUrl(output: unknown): string | null {
  if (output == null) return null;
  if (typeof output === "string") return output;
  if (Array.isArray(output)) {
    for (const item of output) {
      const u = extractAudioUrl(item);
      if (u) return u;
    }
    return null;
  }
  if (typeof output === "object") {
    const obj = output as Record<string, unknown>;
    for (const key of ["audio_out", "audio", "audio_url", "output", "url", "wav"]) {
      const u = extractAudioUrl(obj[key]);
      if (u) return u;
    }
    for (const v of Object.values(obj)) {
      if (typeof v === "string" && /^https?:\/\//.test(v)) return v;
    }
  }
  return null;
}

async function runPrediction(
  version: string,
  input: Record<string, unknown>,
  token: string
): Promise<string> {
  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
      // Block server-side until the prediction is done (up to 60s) so we don't
      // pay polling latency on fast models.
      Prefer: "wait=60",
    },
    body: JSON.stringify({ version, input }),
  });
  if (!res.ok) {
    throw new Error(`predict: ${res.status} ${await res.text()}`);
  }
  let p = (await res.json()) as {
    status: string;
    output: unknown;
    error?: string | null;
    urls: { get: string };
  };

  // Poll only if Prefer: wait timed out before completion.
  const start = Date.now();
  while (
    (p.status === "starting" || p.status === "processing") &&
    Date.now() - start < 15 * 60_000
  ) {
    await new Promise((r) => setTimeout(r, 3000));
    const r = await fetch(p.urls.get, {
      headers: { Authorization: `Token ${token}` },
    });
    p = (await r.json()) as typeof p;
  }
  if (p.status === "succeeded") {
    const u = extractAudioUrl(p.output);
    if (!u) throw new Error("succeeded but no audio URL");
    return u;
  }
  throw new Error(`${p.status}: ${p.error ?? "no detail"}`);
}

async function uploadReference(path: string, token: string): Promise<string> {
  const fs = require("node:fs");
  const buf = fs.readFileSync(path);
  const form = new FormData();
  form.append("content", new Blob([buf], { type: "audio/wav" }), "reference.wav");
  form.append("type", "audio/wav");
  const res = await fetch("https://api.replicate.com/v1/files", {
    method: "POST",
    headers: { Authorization: `Token ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(`upload: ${res.status} ${await res.text()}`);
  const d = (await res.json()) as { urls: { get: string } };
  return d.urls.get;
}

async function downloadTo(url: string, dest: string) {
  await mkdir(dirname(dest), { recursive: true });
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download: ${r.status}`);
  await writeFile(dest, Buffer.from(await r.arrayBuffer()));
}

function extFromUrl(url: unknown): string {
  if (typeof url !== "string") return "wav";
  const m = url.match(/\.(wav|mp3|ogg|flac|m4a)(\?|$)/i);
  return m ? m[1].toLowerCase() : "wav";
}

// ---------- Concurrency pool ----------

async function runPool<T>(items: T[], limit: number, worker: (t: T) => Promise<void>) {
  let i = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++;
      try {
        await worker(items[idx]);
      } catch (e) {
        console.error(`[worker] ${(e as Error).message}`);
      }
    }
  });
  await Promise.all(workers);
}

// ---------- Main ----------

type Job = {
  modelId: string;
  voice: Voice;
  scriptId: ScriptId;
  text: string;
};

async function main() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    console.error("Missing REPLICATE_API_TOKEN");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const onlyMissing = args.includes("--missing");
  const concurrencyArg = args.find((a) => a.startsWith("--concurrency="));
  const concurrency = concurrencyArg ? parseInt(concurrencyArg.split("=")[1], 10) : 30;

  const models = JSON.parse(await readFile(MODELS_PATH, "utf-8")) as Model[];
  const scripts = JSON.parse(await readFile(SCRIPTS_PATH, "utf-8")) as Scripts;

  // 1. Ensure reference audio exists. If we don't have one yet (e.g. fresh clean run),
  //    do one Kokoro neutral generation first so voice-cloning models can use it.
  const refAbs = join(ROOT, REF_AUDIO_PATH);
  if (!existsSync(refAbs)) {
    console.log("Generating reference audio (one-time, Kokoro af_bella neutral)...");
    const kokoroVersion = await fetchLatestVersion("jaaari/kokoro-82m", token);
    const url = await runPrediction(
      kokoroVersion,
      { text: REF_TEXT, voice: "af_bella", speed: 1.0 },
      token
    );
    await downloadTo(url, refAbs);
    console.log(`  saved ${REF_AUDIO_PATH}`);
  }

  console.log("Uploading reference audio for voice-cloning models...");
  const refUrl = await uploadReference(refAbs, token);
  console.log(`  ref: ${refUrl}`);

  // 2. Cache latest_version per model so we hit /models/{slug} only once.
  console.log("Fetching latest versions...");
  const versions: Record<string, string> = {};
  await Promise.all(
    Object.entries(MAP).map(async ([modelId, cfg]) => {
      try {
        versions[modelId] = await fetchLatestVersion(cfg.slug, token);
      } catch (e) {
        console.error(`  ✗ ${modelId} (${cfg.slug}): ${(e as Error).message}`);
      }
    })
  );

  // 3. Warm Bark — its cold start dominates wall-clock. Fire a tiny prediction
  //    in the background so it's hot by the time the real jobs hit it.
  if (versions.bark) {
    console.log("Warming Bark cold start in background...");
    runPrediction(
      versions.bark,
      { prompt: "Hi.", history_prompt: "en_speaker_6" },
      token
    ).catch(() => {});
  }

  // 4. Build jobs.
  const jobs: Job[] = [];
  for (const model of models) {
    if (!MAP[model.id] || !versions[model.id]) continue;
    for (const voice of model.voices) {
      for (const sid of ["neutral", "emotional", "numbers"] as ScriptId[]) {
        if (onlyMissing && voice.samples[sid]) continue;
        jobs.push({
          modelId: model.id,
          voice,
          scriptId: sid,
          text: scripts[sid].text,
        });
      }
    }
  }
  console.log(
    `Queued ${jobs.length} jobs across ${
      new Set(jobs.map((j) => j.modelId)).size
    } models. Concurrency: ${concurrency}.`
  );

  const ctx: Ctx = { refUrl, scripts };
  let done = 0;
  const total = jobs.length;
  const startedAt = Date.now();
  let lastSavedAt = 0;

  await runPool(jobs, concurrency, async (job) => {
    const cfg = MAP[job.modelId];
    const version = versions[job.modelId];
    const input = cfg.buildInput(job.text, job.voice.id, ctx);
    let url: string;
    try {
      url = await runPrediction(version, input, token);
    } catch (e) {
      done++;
      console.error(
        `  ✗ [${done}/${total}] ${job.modelId}/${job.voice.id}/${job.scriptId}: ${
          (e as Error).message
        }`
      );
      return;
    }
    const ext = extFromUrl(url);
    const destRel = `/samples/${job.modelId}/${job.voice.id}/${job.scriptId}.${ext}`;
    const destAbs = join(ROOT, "public", destRel);
    await downloadTo(url, destAbs);
    job.voice.samples[job.scriptId] = destRel;
    done++;
    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(
      `  ✓ [${done}/${total}] ${elapsed}s  ${job.modelId}/${job.voice.id}/${job.scriptId}`
    );

    // Save at most every 2s to avoid thrashing the file.
    if (Date.now() - lastSavedAt > 2000) {
      lastSavedAt = Date.now();
      await writeFile(MODELS_PATH, JSON.stringify(models, null, 2));
    }
  });

  // Final save.
  await writeFile(MODELS_PATH, JSON.stringify(models, null, 2));
  const total_s = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`\nDone in ${total_s}s.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
