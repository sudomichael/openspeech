# Generating samples for Tier 2 models (not on Replicate)

13 of our 22 models aren't on Replicate, so we need to run them ourselves. This doc describes a Modal-based pipeline.

## Why Modal

- Free tier: $30/mo of compute credits, plenty for this use case
- Per-second billing on GPUs
- Easy to define a container with PyTorch + a model's requirements
- Persistent volumes for cached weights between runs

Alternatives that would also work: Runpod, Lambda Labs, or a local GPU. Modal is the easiest to script.

## Models to do

| Model | Approx VRAM | Notes |
|---|---|---|
| Piper | 0 | CPU-only; run on Modal CPU or just locally |
| CosyVoice 2 | 6 GB | A10G fine |
| VibeVoice | 16 GB | L4 or A100 |
| IndexTTS 2 | 8 GB | A10G |
| Qwen3-TTS | 8 GB | A10G |
| StyleTTS 2 | 4 GB | A10G |
| MeloTTS | 0 | CPU-only |
| OpenVoice v2 | 4 GB | A10G |
| KittenTTS | 0 | CPU-only |
| Spark-TTS | 8 GB | A10G |
| MegaTTS 3 | 8 GB | A10G |
| WhisperSpeech | 6 GB | A10G |
| Higgs Audio v2 | 12 GB | L4 |

## Pattern

Each model needs a `scripts/modal/<model-id>.py` file:

```python
import modal

app = modal.App("openspeech-cosyvoice2")
image = (
    modal.Image.debian_slim()
    .pip_install(["torch", "torchaudio", "cosyvoice"])
    .apt_install(["git", "ffmpeg"])
)

@app.function(image=image, gpu="A10G", timeout=600)
def generate(text: str, voice_id: str) -> bytes:
    import io, torchaudio
    from cosyvoice.cli.cosyvoice import CosyVoice
    cv = CosyVoice("iic/CosyVoice2-0.5B")
    audio = cv.inference_sft(text, voice_id)
    buf = io.BytesIO()
    torchaudio.save(buf, audio["tts_speech"], 22050, format="wav")
    return buf.getvalue()

@app.local_entrypoint()
def main():
    # the same 3 scripts every model uses
    SCRIPTS = {
        "neutral": "The quick brown fox jumps over the lazy dog near the riverbank.",
        "emotional": "I can't believe you actually did it. This is incredible!",
        "numbers": "On March 14th, 2025, the team raised $4.2 million at a 38% margin.",
    }
    # voices pulled from data/models.json
    VOICES = ["mandarin-female", "english-male", ...]
    import os, pathlib
    for v in VOICES:
        for sid, text in SCRIPTS.items():
            wav = generate.remote(text, v)
            p = pathlib.Path(f"public/samples/cosyvoice2/{v}/{sid}.wav")
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_bytes(wav)
            print(f"  ✓ {v}/{sid}")
```

Then run:

```bash
modal run scripts/modal/cosyvoice2.py
```

## Workflow

1. Sign up at modal.com, run `pip install modal && modal token new`
2. For each model: read the model's README, write the per-model script
3. Update `data/models.json` voices for that model (id, name, gender, accent)
4. Update sample paths in `data/models.json` after generation
5. Commit and push

## Bash helper

After generating samples, run `node scripts/link-samples.mjs <model-id>` to auto-update the JSON paths from filesystem state. (Not yet written — feel free to add.)

## CPU-only path

Piper, MeloTTS, KittenTTS run on CPU. Skip Modal entirely:

```bash
pip install piper-tts
echo "..." | piper -m en_US-amy-medium -f neutral.wav
```

Drop the WAV directly into `public/samples/<model-id>/<voice-id>/`.

## Cost estimate

Modal A10G is ~$1.10/hr. Each model takes ~5-15 min for all voices × 3 scripts. Conservative budget: **$5-10 of compute for all 13 models**. Plus the time to write 13 Python scripts.
