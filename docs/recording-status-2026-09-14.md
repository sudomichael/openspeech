# Recording coverage — September 14, 2026

44 models, 29 with recordings, and 147 validated sample paths. This release adds 15 recordings: the standard neutral, emotional, and numbers scripts for five previously silent models.

| Model | Configuration | Source |
| --- | --- | --- |
| piper | Piper 1.8.0 · en_US-ljspeech-medium · local CPU | [Provider/checkpoint](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/ljspeech/medium/MODEL_CARD) |
| pocket-tts | Pocket TTS · English 2026-01 checkpoint · Alba · local CPU | [Provider/checkpoint](https://huggingface.co/kyutai/tts-voices) |
| chatterbox-nano | Chatterbox Nano 110M · official demo · synthetic Bella reference | [Provider/checkpoint](https://huggingface.co/spaces/ResembleAI/chatterbox-nano-demo) |
| moss-tts-nano | MOSS-TTS Nano 100M · official ONNX CPU checkpoint · synthetic Bella reference | [Provider/checkpoint](https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M-ONNX) |
| llasa | Llasa-3B · kjjk10/llasa-3b-long · synthetic Bella reference | [Provider/checkpoint](https://replicate.com/kjjk10/llasa-3b-long) |

The synthetic reference uses our existing Kokoro Bella recordings of the neutral and emotional scripts. No real-person voice recording was uploaded. Checkpoint labels and SHA-256 hashes are in data/sample-provenance.json. Piper's current GPL engine and voice-dependent licensing replace the obsolete blanket MIT description; its recordings use the public-domain LJ Speech voice. Llasa's noncommercial model license remains disclosed.

All 15 files passed duration and signal-level checks, followed by local speech recognition against the expected scripts. The MOSS Nano emotional clip repeats the final sentence once: the raw output is retained and this limitation is disclosed on its model page. ASR punctuation differences are not treated as speech errors. Catalog validation checks every referenced file exists.

## Remaining coverage

15 models still need verified recordings:

- MegaTTS 3 (megatts3)
- GPT-SoVITS (gpt-sovits)
- Step-Audio-EditX (step-audio-editx)
- Kyutai TTS (kyutai-tts)
- Maya1 (maya1)
- SoulX-Podcast (soulx-podcast)
- Muyan-TTS (muyan-tts)
- Voxtral TTS (voxtral-tts)
- Chatterbox Multilingual V3 (chatterbox-multilingual-v3)
- CosyVoice 3 (cosyvoice3)
- Fish Audio S2 Pro (fish-audio-s2-pro)
- MOSS-TTS v1.5 (moss-tts-v1-5)
- MOSS-TTS Local Transformer v1.5 (moss-tts-local-v1-5)
- OmniVoice (omnivoice)
- TADA 3B Multilingual (tada-3b-ml)

Eight models hit exhausted Hugging Face GPU quota: GPT-SoVITS, Chatterbox Multilingual v3, CosyVoice 3, Fish Audio S2 Pro, MOSS-TTS v1.5, MOSS-TTS Local v1.5, OmniVoice, and TADA 3B multilingual. The provider explicitly requests authenticated access for more quota. Required nullable API arguments were corrected and retried before recording these blockers. The Fish demo is community maintained; official demos are preferred where available.

Voxtral TTS requires Hugging Face sign-in. SoulX Podcast's Space returned a configuration error. Maya1 timed out during a bounded 300-second attempt. An exact-version hosted provider was not established for MegaTTS3, Step-Audio-EditX, Kyutai TTS, or MuYan TTS; these need a verified runtime/checkpoint or suitable provider. No recordings are silently substituted with a different model or version.

To resume authenticated jobs, provide the location of an authorized local Hugging Face token, never the token itself in chat. Authentication may still require sufficient GPU quota. The prepared generator uses inspected endpoint schemas, fixed scripts, and bounded waits. New files are attached to the catalog only after verification.

## Reproduction

Utilities: scripts/generate-local-samples.py, scripts/generate-space-samples.py, scripts/generate-moss-samples.py, scripts/generate-llasa-samples.mjs, scripts/inspect-recording-spaces.py, and scripts/check-recordings.py. Inspect their imports and configured local runtime paths before use. Large model weights and credentials remain outside the repository. Validate catalog paths with npm run check:catalog.
