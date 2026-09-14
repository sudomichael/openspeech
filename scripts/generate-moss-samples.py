"""Generate with the official ONNX CPU runtime checked out in /tmp/openspeech-moss-nano."""
import sys,json
from pathlib import Path
sys.path.insert(0,'/tmp/openspeech-moss-nano')
from onnx_tts_runtime import OnnxTtsRuntime
root=Path(__file__).resolve().parents[1]
runtime=OnnxTtsRuntime(model_dir='/tmp/openspeech-moss-nano/models',thread_count=4,max_new_frames=375,do_sample=True,sample_mode='fixed',execution_provider='cpu')
for sid,s in json.loads((root/'data/scripts.json').read_text()).items():
 path=root/f'public/samples/moss-tts-nano/default/{sid}.wav';path.parent.mkdir(parents=True,exist_ok=True)
 result=runtime.synthesize(text=s['text'],voice='Junhao',prompt_audio_path='/tmp/openspeech-reference.wav',output_audio_path=str(path),sample_mode='fixed',do_sample=True,streaming=True,max_new_frames=375,voice_clone_max_text_tokens=150,enable_wetext=False,enable_normalize_tts_text=True,seed=42)
 print(sid,result['audio_path'],flush=True)
