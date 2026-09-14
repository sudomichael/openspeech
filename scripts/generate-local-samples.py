"""Generate the standard scripts locally; model metadata is applied after validation."""
import json,wave,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
scripts=json.loads((root/'data/scripts.json').read_text())
which=sys.argv[1]
if which=='piper':
 from piper import PiperVoice
 voice=PiperVoice.load('/tmp/openspeech-piper/en_US-ljspeech-medium.onnx')
 for sid,s in scripts.items():
  path=root/f'public/samples/piper/ljspeech/{sid}.wav';path.parent.mkdir(parents=True,exist_ok=True)
  with wave.open(str(path),'wb') as f:voice.synthesize_wav(s['text'],f)
  print(path,flush=True)
elif which=='pocket-tts':
 from pocket_tts import TTSModel
 from scipy.io.wavfile import write
 model=TTSModel.load_model(language='english_2026-01')
 voice=model.get_state_for_audio_prompt('alba')
 for sid,s in scripts.items():
  path=root/f'public/samples/pocket-tts/alba/{sid}.wav';path.parent.mkdir(parents=True,exist_ok=True)
  audio=model.generate_audio(voice,s['text']);write(str(path),model.sample_rate,audio.numpy());print(path,flush=True)
