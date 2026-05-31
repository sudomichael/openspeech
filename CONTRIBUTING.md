# Contributing to OpenSpeech

Thanks for thinking about contributing! OpenSpeech exists because the OSS TTS world is fragmented — your contribution makes it less so.

## Quick paths

- **Add a new model** — see below
- **Fix a sample that sounds wrong** — open an issue with the model + voice + script
- **Improve the UI / docs** — open a PR

## Hard rule: models must be genuinely open-source

We only accept models whose **weights AND code** are released under an OSI-approved or weights-permissive license (Apache-2.0, MIT, BSD, MPL, CC-BY, CC-BY-SA, OpenRAIL).

We **do not** accept:

- Closed-source models with an API wrapper
- "Open weights" that are research-only / non-commercial with no commercial path (we will list non-commercial OSS like XTTS's CPML, but only if the weights themselves are freely downloadable)
- Wrappers around proprietary models (e.g. an "open source" client for ElevenLabs)
- Models whose weights are gated behind manual approval, application forms, or non-public hosting

If you're not sure, open an issue and ask before doing the work.

## Adding a model

A PR adds two things:

1. A new entry in [`data/models.json`](data/models.json)
2. Three audio samples per voice in `public/samples/<model-id>/<voice-id>/`

That's it. No build step required.

### 1. The model entry

Add an object to `data/models.json` using an existing entry as a template:

```json
{
  "id": "your-model-id",
  "name": "Your Model",
  "tagline": "One line on what makes it interesting.",
  "repo_url": "https://github.com/owner/repo",
  "hf_url": "https://huggingface.co/owner/model",
  "license": "Apache-2.0",
  "params": "500M",
  "vram_gb": 8,
  "languages": ["en", "zh"],
  "voice_cloning": false,
  "streaming": true,
  "realtime_factor": 0.15,
  "install": "pip install your-model",
  "category": "flagship",
  "default_voice": "voice-1",
  "voices": [
    {
      "id": "voice-1",
      "name": "Voice 1",
      "gender": "f",
      "accent": "american",
      "samples": {
        "neutral": "/samples/your-model-id/voice-1/neutral.wav",
        "emotional": "/samples/your-model-id/voice-1/emotional.wav",
        "numbers": "/samples/your-model-id/voice-1/numbers.wav"
      }
    }
  ]
}
```

**Fields:**

| field | what it is |
|---|---|
| `id` | URL-safe slug, must be unique |
| `params` | Human-readable size, e.g. `82M`, `1.5B` |
| `vram_gb` | Approx VRAM needed. Use `0` for CPU-runnable |
| `realtime_factor` | Seconds of compute per second of audio. Lower = faster |
| `category` | `flagship`, `lightweight`, `voice-cloning`, `expressive`, `dialogue`, `realtime`, `controllable`, `long-form`, or `experimental` |
| `gender` | `f`, `m`, or `n` |
| `accent` | `american`, `british`, `english`, etc. Or `"unspecified"` |

### 2. The audio samples

Drop three WAV (or MP3) files per voice into `public/samples/<model-id>/<voice-id>/`:

- `neutral.wav`
- `emotional.wav`
- `numbers.wav`

**The exact text each file must contain:**

1. **`neutral`** — "The quick brown fox jumps over the lazy dog near the riverbank."
2. **`emotional`** — "I can't believe you actually did it. This is incredible!"
3. **`numbers`** — "On March 14th, 2025, the team raised $4.2 million at a 38% margin."

These three scripts are fixed. Don't paraphrase, don't translate, don't substitute. Same scripts for every voice is the whole point.

**Audio requirements:**
- Format: WAV preferred, MP3 OK
- Sample rate: ≥ 22 kHz
- Mono or stereo
- Duration: whatever the model naturally produces — don't trim or pad
- File size: < 2 MB each (re-encode if needed)
- **No post-processing** — submit the raw model output

You can generate the samples however you want: local install, Colab, Modal, Replicate, the author's hosted demo. If the model is on Replicate, the maintainers have a script (`scripts/generate-replicate.ts`) you can use, but it's not required for your PR.

### 3. Opening the PR

- **Title:** `Add <ModelName>`
- **PR body must include:**
  - Link to the model's GitHub or Hugging Face page
  - Explicit confirmation the weights are publicly downloadable (link to weights)
  - License identifier (must match what you put in `data/models.json`)
  - How you generated the samples (so we can reproduce)
  - One sentence on what makes this model worth adding

PRs missing any of the above will be asked for more info before review.

## Code style

- TypeScript strict, no `any` unless unavoidable
- Tailwind for styling, no CSS modules
- Components in `components/`, data helpers in `lib/`
- Keep `data/scripts.json` immutable

## Questions

[Open an issue](https://github.com/sudomichael/openspeech/issues/new/choose) — we're happy to help.
