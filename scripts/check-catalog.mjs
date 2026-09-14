import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const models=JSON.parse(await readFile('data/models.json','utf8'));
const ids=new Set();let samples=0;
for(const model of models){
  assert.match(model.id,/^[a-z0-9-]+$/);assert(!ids.has(model.id),`Duplicate ${model.id}`);ids.add(model.id);
  assert(model.voices.some(v=>v.id===model.default_voice),`${model.id}: missing default voice`);
  assert(model.vram_gb===null||Number.isFinite(model.vram_gb)&&model.vram_gb>=0,`${model.id}: invalid VRAM`);
  if(model.added_at){assert(model.reviewed_at&&model.sources?.length>=2,`${model.id}: missing review evidence`);assert(model.best_for&&model.limitations,`${model.id}: missing decision notes`);}
  for(const source of model.sources??[])assert(new URL(source.url).protocol==='https:');
  for(const voice of model.voices)for(const [script,src]of Object.entries(voice.samples)){
    assert(['neutral','emotional','numbers'].includes(script));if(!src)continue;
    assert(src.startsWith(`/samples/${model.id}/`),`${model.id}: reused another version's sample`);
    assert(!src.includes('..'));await access(`public${src}`);samples++;
  }
}
for(const model of models)if(model.newer_model_id)assert(ids.has(model.newer_model_id),`${model.id}: broken newer-version link`);
console.log(`Validated ${models.length} models and ${samples} sample paths.`);
