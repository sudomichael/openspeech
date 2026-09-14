export const MAX_TEXT_LENGTH = 300;
export const GENERATIONS_PER_DAY = 9;
export const GENERATION_MODELS = [
  { id: "kokoro-82m", name: "Kokoro-82M", voice: "Bella", version: "f559560eb822dc509045f3921a1921234918b91739db4bf3daab2169b71c7a13", input: { voice: "af_bella", speed: 1 } },
  { id: "chatterbox-turbo", name: "Chatterbox Turbo", voice: "Andy", version: "95c87b883ff3e842a1643044dff67f9d204f70a80228f24ff64bffe4a4b917d4", input: { voice: "Andy", seed: 42 } },
  { id: "orpheus-tts", name: "Orpheus TTS", voice: "Tara", version: "79f2a473e6a9720716a473d9b2f2951437dbf91dc02ccb7079fb3d89b881207f", input: { voice: "tara", max_new_tokens: 1200 } },
  { id: "qwen3-tts", name: "Qwen3-TTS", voice: "Serena", version: "d490a561cf1171a8dc3d96d1e57efffea7dd34607148bb641f3d9de4e38c472e", input: { speaker: "Serena", mode: "custom_voice", language: "English" } },
] as const;

export function validateGeneration(body: Record<string, unknown>) {
  const model = GENERATION_MODELS.find((m) => m.id === body.model);
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!model) throw new Error("Choose one of the available demo models.");
  if (!text || text.length > MAX_TEXT_LENGTH) throw new Error(`Enter between 1 and ${MAX_TEXT_LENGTH} characters.`);
  return { model, text };
}

export function audioOutput(output: unknown): string | null {
  if (typeof output !== "string") return null;
  try {
    const url = new URL(output);
    return url.protocol === "https:" && (url.hostname === "replicate.delivery" || url.hostname.endsWith(".replicate.delivery")) ? url.href : null;
  } catch { return null; }
}
