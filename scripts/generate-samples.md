# Sample Generation

We need 3 audio samples (`neutral`, `emotional`, `numbers`) for each of the 22 models in `data/models.json`.

## Status: not yet generated

Once generated, samples should live in `public/samples/<model-id>/<script-id>.wav` and the `samples` field in `models.json` should be updated to point to those paths (e.g. `/samples/kokoro-82m/neutral.wav`).

## Approach

### Tier 1 — On Replicate (easy, ~$0.01–0.10/run)

Models with hosted Replicate versions. Run `scripts/generate-replicate.ts` after setting `REPLICATE_API_TOKEN`.

Confirmed Replicate-hosted (verify slugs before running):
- `kokoro-82m` → `jaaari/kokoro-82m`
- `xtts-v2` → `lucataco/xtts-v2`
- `bark` → `suno-ai/bark`
- `f5-tts` → `x-lance/f5-tts`
- `parler-tts` → `parler-tts/parler-tts-mini`
- `chatterbox` → `resemble-ai/chatterbox`
- `dia` → `nari-labs/dia`
- `orpheus-tts` → `canopyai/orpheus-3b-0.1-ft`
- `fish-speech` → `lucataco/fish-speech-1.5`

### Tier 2 — Modal / Runpod (harder, ~$0.50–2/model setup)

Models without a Replicate version. Use a one-shot Modal container per model, run the 3 scripts, upload results to R2/S3 or commit to `public/samples/`.

These models will need this path:
- `cosyvoice2`, `indextts2`, `vibevoice`, `qwen3-tts`, `kittentts`, `openvoice-v2`, `styletts2`, `melotts`, `spark-tts`, `megatts3`, `whisperspeech`, `higgs-audio-v2`, `piper`

### Tier 3 — Use author demos (lazy fallback)

If a model has official sample audio on its HF/GitHub page that happens to use one of our 3 scripts, link directly. Otherwise generate.

## Storage

Samples are small (~50–200KB each WAV, ~30KB MP3). 22 models × 3 = 66 files. Total ≲ 15MB. Just commit to `public/samples/` — no CDN needed for v0.

## Next steps

1. Get a Replicate API token, populate `.env.local`.
2. Run `bun scripts/generate-replicate.ts` (TODO) to handle Tier 1.
3. Spin up Modal accounts and write per-model containers for Tier 2 (slow).
