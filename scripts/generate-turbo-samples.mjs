import { readFile, writeFile, mkdir } from 'node:fs/promises';
process.loadEnvFile('.env');
const token = process.env.REPLICATE_API_TOKEN;
if (!token) throw new Error('REPLICATE_API_TOKEN is required');
const version = '95c87b883ff3e842a1643044dff67f9d204f70a80228f24ff64bffe4a4b917d4';
const scripts = JSON.parse(await readFile('data/scripts.json','utf8'));
const dir = 'public/samples/chatterbox-turbo/default';
await mkdir(dir,{recursive:true});
const paths = {};
for (const [id, script] of Object.entries(scripts)) {
  const path = `${dir}/${id}.wav`;
  try { await readFile(path); paths[id]=`/${path.slice(7)}`; console.log(`${id}: existing`); continue; } catch {}
  let response = await fetch('https://api.replicate.com/v1/predictions', { method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','Cancel-After':'90s'},body:JSON.stringify({version,input:{text:script.text,voice:'Andy',seed:42}})});
  if(!response.ok)throw new Error(`Create HTTP ${response.status}`);
  let prediction=await response.json();const started=Date.now();
  while(!['succeeded','failed','canceled','aborted'].includes(prediction.status)&&Date.now()-started<120000){
    await new Promise(resolve=>setTimeout(resolve,2000));
    response=await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`,{headers:{Authorization:`Bearer ${token}`}});
    if(!response.ok)throw new Error(`Poll HTTP ${response.status}`);prediction=await response.json();
  }
  if(prediction.status!=='succeeded'||typeof prediction.output!=='string')throw new Error(`${id}: ${prediction.status}`);
  const audio=await fetch(prediction.output);if(!audio.ok)throw new Error('Audio download failed');
  const bytes=Buffer.from(await audio.arrayBuffer());if(bytes.toString('ascii',0,4)!=='RIFF')throw new Error('Expected WAV output');
  await writeFile(path,bytes);paths[id]=`/${path.slice(7)}`;console.log(`${id}: ${bytes.length} bytes`);
}
const models=JSON.parse(await readFile('data/models.json','utf8'));const model=models.find(m=>m.id==='chatterbox-turbo');
model.voices[0].samples=paths;model.voices[0].name='Andy';
await writeFile('data/models.json',JSON.stringify(models,null,2)+'\n');
console.log('Saved three standardized Turbo recordings.');
