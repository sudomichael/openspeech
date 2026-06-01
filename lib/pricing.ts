/**
 * Per-minute audio pricing estimates. Last reviewed 2026-06.
 *
 * All values are rough — vendor pricing changes and self-hosted costs depend
 * heavily on utilization. We surface this with a disclaimer on the calculator.
 */

export type Provider = {
  id: string;
  name: string;
  category: "closed" | "hosted-oss" | "self-hosted";
  perMinUsd: number;
  notes: string;
  source?: string;
};

export const PROVIDERS: Provider[] = [
  // Closed-source incumbents
  {
    id: "elevenlabs-creator",
    name: "ElevenLabs Creator",
    category: "closed",
    perMinUsd: 0.3,
    notes: "Public Creator tier (~$0.30/min equivalent at typical speaking rate)",
    source: "elevenlabs.io/pricing",
  },
  {
    id: "elevenlabs-pro",
    name: "ElevenLabs Pro",
    category: "closed",
    perMinUsd: 0.18,
    notes: "Pro / Scale tier (volume discount)",
    source: "elevenlabs.io/pricing",
  },
  {
    id: "openai-tts",
    name: "OpenAI TTS-1",
    category: "closed",
    perMinUsd: 0.09,
    notes: "$15 per 1M chars ≈ $0.09/min at typical pace",
    source: "openai.com/api/pricing",
  },

  // OSS, hosted on Replicate (pay per use)
  {
    id: "replicate-kokoro",
    name: "Kokoro on Replicate",
    category: "hosted-oss",
    perMinUsd: 0.003,
    notes: "Tiny, fast, cheapest hosted OSS option",
  },
  {
    id: "replicate-xtts",
    name: "XTTS-v2 on Replicate",
    category: "hosted-oss",
    perMinUsd: 0.015,
    notes: "Voice cloning, popular default",
  },
  {
    id: "replicate-chatterbox",
    name: "Chatterbox on Replicate",
    category: "hosted-oss",
    perMinUsd: 0.025,
    notes: "EL-tier quality, voice cloning",
  },
  {
    id: "replicate-bark",
    name: "Bark on Replicate",
    category: "hosted-oss",
    perMinUsd: 0.08,
    notes: "Slow + expressive; cold starts hurt",
  },

  // Self-hosted (assumes reasonable utilization)
  {
    id: "self-hosted-small",
    name: "Self-hosted Kokoro (Modal/Runpod)",
    category: "self-hosted",
    perMinUsd: 0.0005,
    notes: "Assumes ~60 generations/hr on A10G",
  },
  {
    id: "self-hosted-mid",
    name: "Self-hosted XTTS / F5 / Chatterbox",
    category: "self-hosted",
    perMinUsd: 0.005,
    notes: "Assumes moderate utilization on A10G/L4",
  },
  {
    id: "self-hosted-large",
    name: "Self-hosted Bark / VibeVoice",
    category: "self-hosted",
    perMinUsd: 0.05,
    notes: "Heavier models, A100 territory",
  },
];

export function formatUsd(amount: number): string {
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  if (amount < 1) return `$${amount.toFixed(3)}`;
  if (amount < 100) return `$${amount.toFixed(2)}`;
  return `$${Math.round(amount).toLocaleString()}`;
}
