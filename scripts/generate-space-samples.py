"""Generate only the three standard scripts through inspected model demos.
Outputs remain separate from catalog edits until audio and provenance are checked.
"""
import json,sys,shutil,subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from gradio_client import Client,handle_file
root=Path(__file__).resolve().parents[1]
scripts=json.loads((root/'data/scripts.json').read_text());ref='/tmp/openspeech-reference.wav'
reftext=scripts['neutral']['text']+' '+scripts['emotional']['text']
configs={
 'maya1':('/generate_speech','text',{'preset_name':'Male American'}),
 'chatterbox-nano':('/generate','text',{'audio_prompt_path':handle_file(ref),'seed_num':42}),
 'chatterbox-multilingual-v3':('/generate_tts_audio','text_input',{'audio_prompt_path_input':handle_file(ref),'language_id_input':'en','seed_num_input':42}),
 'cosyvoice3':('/generate_audio','tts_text',{'mode_value':'zero_shot','prompt_text':reftext,'prompt_wav_upload':handle_file(ref),'ui_lang':'En','seed':42}),
 'moss-tts-v1-5':('/run_inference','text',{'reference_audio':handle_file(ref),'language_tag':'English','max_new_tokens':1200}),
 'moss-tts-local-v1-5':('/generate','text',{'reference_audio':handle_file(ref),'language':'English','max_new_tokens':1200}),
 'omnivoice':('/_clone_fn','text',{'ref_aud':handle_file(ref),'ref_text':reftext,'lang':'English'}),
 'tada-3b-ml':('/generate','text',{'audio_path':handle_file(ref)}),
 'voxtral-tts':('/gradio_tts','input_text',{'audio_choice':'EN - Jane, Neutral'}),
 'gpt-sovits':('/get_tts_wav','text',{'ref_wav_path':handle_file(ref),'prompt_text':reftext,'prompt_language':'英文','text_language':'英文'}),
 'moss-tts-nano':('/generate_speech','text',{'reference_audio':handle_file(ref),'seed':42,'max_new_frames':512}),
 'fish-audio-s2-pro':('/tts_inference','text',{'ref_audio':handle_file(ref),'ref_text':reftext,'max_new_tokens':1200})}
def audio_path(v):
 if isinstance(v,str) and Path(v).is_file() and Path(v).suffix.lower() in ['.wav','.mp3','.flac','.ogg']:return v
 if isinstance(v,(list,tuple)):
  for x in v:
   p=audio_path(x)
   if p:return p
 if isinstance(v,dict):return audio_path(v.get('path') or v.get('audio'))
 return None

def run(id):
 ep,field,overrides=configs[id]
 info=json.loads(Path('/tmp/openspeech-space-'+id+'.json').read_text());space=info['space']; records=[]
 try:
  client=Client(space,verbose=False,httpx_kwargs={'timeout':60})
  for sid,s in scripts.items():
   dest=root/f'public/samples/{id}/default/{sid}.wav'
   if dest.exists(): print(id,sid,'already generated',flush=True);continue
   kwargs={p['parameter_name']:p.get('parameter_default') for p in info['api']['named_endpoints'][ep]['parameters']};kwargs.update(overrides);kwargs[field]=s['text']
   print(id,sid,'starting',flush=True)
   job=client.submit(api_name=ep,**kwargs)
   try:result=job.result(timeout=300)
   except Exception:job.cancel();raise
   audio=audio_path(result)
   if not audio:raise RuntimeError('No audio returned: '+str(result)[:150])
   dest.parent.mkdir(parents=True,exist_ok=True)
   subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',audio,'-c:a','pcm_s16le',str(dest)],check=True)
   records.append({'script':sid,'file':str(dest.relative_to(root)),'space':space,'endpoint':ep,'voice':'Male American' if id=='maya1' else 'Jane Neutral' if id=='voxtral-tts' else 'Synthetic Kokoro Bella reference'})
   print(id,sid,'saved',dest.stat().st_size,flush=True)
 except Exception as e:print(id,'STOPPED',str(e)[:350],flush=True);records.append({'error':str(e)[:500],'space':space})
 Path('/tmp/openspeech-generation-'+id+'.json').write_text(json.dumps(records,indent=2))
ids=sys.argv[1:] or list(configs)
with ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(run,ids))
