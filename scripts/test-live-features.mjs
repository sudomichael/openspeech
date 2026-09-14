import assert from 'node:assert/strict';
import { Redis } from '@upstash/redis';
import { randomUUID } from 'node:crypto';
process.loadEnvFile('.env');process.loadEnvFile('.env.local');
const base=process.env.TEST_BASE_URL??'http://localhost:3107';
const headers={'content-type':'application/json',origin:base,'x-forwarded-for':'198.51.100.87'};
const post=(path,body,extra={})=>fetch(`${base}${path}`,{method:'POST',headers:{...headers,...extra},body:JSON.stringify(body)});
assert.equal((await post('/api/generate',{model:'not-allowed',text:'Hello'})).status,400);
assert.equal((await post('/api/generate',{model:'kokoro-82m',text:'Hello'},{origin:'https://other.example'})).status,403);
assert.equal((await post('/api/waitlist',{email:'invalid'})).status,400);
if (process.argv.length <= 2) {
const redis=new Redis({url:process.env.WAITLIST_REDIS_REST_URL,token:process.env.WAITLIST_REDIS_REST_TOKEN});
const email=`openspeech-smoke-${randomUUID()}@example.com`;
let inserted=false;
try {
  const countBefore=Number(await redis.get('waitlist:total')??0);
  const response=await post('/api/waitlist',{email,model:'kokoro-82m'});
  assert.equal(response.status,200,JSON.stringify(await response.json()));inserted=true;
  const afterFirst=Number(await redis.get('waitlist:total'));
  assert.equal(afterFirst,countBefore+1);
  assert.equal((await post('/api/waitlist',{email,model:'orpheus-tts'})).status,200);
  assert.equal(Number(await redis.get('waitlist:total')),afterFirst);
  assert.equal(await redis.hget(`waitlist:meta:${email}`,'model_interest'),'orpheus-tts');
  console.log('Waitlist: real storage, model interest, and duplicate handling passed.');
} finally {
  if(inserted)await redis.eval(`local removed=redis.call('SREM',KEYS[1],ARGV[1]); if removed==1 then redis.call('DECR',KEYS[2]); redis.call('DEL',KEYS[3]); end; return removed`,['waitlist','waitlist:total',`waitlist:meta:${email}`],[email]);
}
}
for(const model of (process.argv.length>2?process.argv.slice(2):['kokoro-82m','chatterbox-turbo','orpheus-tts','qwen3-tts'])){
  const response=await post('/api/generate',{model,text:'Hello from OpenSpeech. This is a short comparison test.'});
  let result=await response.json();assert.equal(response.status,200,`${model}: ${JSON.stringify(result)}`);
  const id=result.id;const started=Date.now();
  while(result.status==='processing'&&Date.now()-started<205000){await new Promise(resolve=>setTimeout(resolve,2500));const poll=await fetch(`${base}/api/generate?id=${id}`,{headers});result=await poll.json();assert.equal(poll.status,200,JSON.stringify(result));}
  assert.equal(result.status,'succeeded',`${model}: ${JSON.stringify(result)}`);
  const audio=await fetch(result.audio);assert(audio.ok);const bytes=await audio.arrayBuffer();assert(bytes.byteLength>1000);
  console.log(`${model}: generated playable audio (${bytes.byteLength} bytes).`);
}
console.log('Live feature checks passed. Test subscriber removed.');
