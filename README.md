# OpenSpeech

**An open directory of open-source text-to-speech models.**
Every voice reads the same three scripts so you can actually compare them.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## Why

ElevenLabs is expensive. Open-source TTS has caught up — but the models are scattered across GitHub, Hugging Face, and a dozen comparison blog posts. Finding one and actually *hearing* it usually means cloning a repo, fighting CUDA, and praying the weights still download.

OpenSpeech fixes that:

- Every voice reads the same three scripts.
- Specs, license, and install in one place.
- Filter by license, VRAM, language, capability.
- Add a new model with one PR.

## What's inside

- **22 curated models** from the broader OSS TTS ecosystem
- **~40 voices** across them
- **3 standardized scripts** per voice: neutral, emotional, numbers
- Side-by-side audio so you can pick the model that fits your use case

## Stack

- [Next.js 16](https://nextjs.org) (App Router, static site)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Replicate](https://replicate.com) for sample generation
- Data lives in plain JSON in `data/` — no database

## Run locally

```bash
git clone https://github.com/sudomichael/openspeech
cd openspeech
npm install
npm run dev
```

The samples are committed to `public/samples/` — you don't need a Replicate token just to browse.

## Generate new samples

To add a new model or regenerate existing ones:

```bash
echo "REPLICATE_API_TOKEN=r8_..." > .env.local
npx tsx scripts/generate-replicate.ts          # full run
npx tsx scripts/generate-replicate.ts --missing  # only missing samples
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.

## Contributing

We want this to be the obvious place to compare open-source TTS. **Adding a model is one PR.**

- 🆕 [Add a new model](CONTRIBUTING.md#adding-a-model)
- 🐛 [Report a broken sample](https://github.com/sudomichael/openspeech/issues/new/choose)
- 🗣️ [Suggest a model](https://github.com/sudomichael/openspeech/issues/new/choose)

## Credits

- Model list curated from [awesome-ai-voice](https://github.com/wildminder/awesome-ai-voice)
- Sample generation via [Replicate](https://replicate.com)
- Not affiliated with any model author

## License

MIT for the code. Each model retains its own license — see the individual model cards.
