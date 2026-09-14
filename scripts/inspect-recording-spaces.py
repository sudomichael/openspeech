import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from gradio_client import Client
spaces={'maya1':'maya-research/maya1','chatterbox-nano':'ResembleAI/chatterbox-nano-demo','chatterbox-multilingual-v3':'ResembleAI/Chatterbox-Multilingual-TTS-V3','cosyvoice3':'FunAudioLLM/Fun-CosyVoice3-0.5B','moss-tts-v1-5':'OpenMOSS-Team/MOSS-TTS-v1.5','moss-tts-local-v1-5':'multimodalart/MOSS-TTS-Local-Transformer-v1.5','omnivoice':'k2-fsa/OmniVoice','tada-3b-ml':'HumeAI/tada','voxtral-tts':'mistralai/voxtral-tts-demo','soulx-podcast':'Soul-AILab/SoulX-Podcast-1.7B','gpt-sovits':'lj1995/GPT-SoVITS-ProPlus','moss-tts-nano':'victor/MOSS-TTS-Nano','fish-audio-s2-pro':'artificialguybr/fish-s2-pro-zero'}
def inspect(item):
 id,space=item
 try:
  c=Client(space,verbose=False,httpx_kwargs={'timeout':30});api=c.view_api(return_format='dict',print_info=False)
  Path('/tmp/openspeech-space-'+id+'.json').write_text(json.dumps({'space':space,'api':api},indent=2))
  print(id,'OK',list(api.get('named_endpoints',{})),flush=True)
 except Exception as e:print(id,'ERROR',str(e)[:200],flush=True)
with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(inspect,spaces.items()))
