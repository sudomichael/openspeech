import json,sys
from pathlib import Path
import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel
root=Path(__file__).resolve().parents[1]
model=WhisperModel('base.en',device='cpu',compute_type='int8',cpu_threads=4,download_root='/tmp/openspeech-whisper')
rows=[]
for id in sys.argv[1:]:
 for p in sorted((root/'public/samples'/id).glob('*/*.wav')):
  data,rate=sf.read(p);duration=len(data)/rate;rms=float(np.sqrt(np.mean(data**2)))
  assert 1<duration<40,(str(p),duration)
  assert rms>0.003,(str(p),'silence')
  segments,_=model.transcribe(str(p),language='en',beam_size=5)
  transcript=' '.join(s.text.strip() for s in segments)
  row={'file':str(p.relative_to(root)),'seconds':round(duration,2),'rms':round(rms,4),'transcript':transcript};rows.append(row);print(json.dumps(row),flush=True)
Path('/tmp/openspeech-recording-checks.json').write_text(json.dumps(rows,indent=2))
