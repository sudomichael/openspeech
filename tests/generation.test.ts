import test from 'node:test';
import assert from 'node:assert/strict';
import { validateGeneration, audioOutput } from '../lib/generation-models';
import { readSmallJson, sameOrigin } from '../lib/request-guards';

test('only allowlisted models and bounded text reach the speech provider', () => {
  assert.equal(validateGeneration({ model: 'kokoro-82m', text: '  Hello  ' }).text, 'Hello');
  for (const body of [{ model: 'arbitrary/model', text: 'Hello' }, { model: 'kokoro-82m', text: '' }, { model: 'kokoro-82m', text: 'a'.repeat(301) }, { model: 'kokoro-82m', text: {} }]) assert.throws(() => validateGeneration(body));
});
test('audio results must use the expected HTTPS delivery host', () => {
  assert.equal(audioOutput('https://replicate.delivery/a.wav'), 'https://replicate.delivery/a.wav');
  assert.equal(audioOutput('https://sub.replicate.delivery/a.wav'), 'https://sub.replicate.delivery/a.wav');
  for (const output of ['http://replicate.delivery/a.wav','https://replicate.delivery.evil.example/a.wav','javascript:alert(1)',{},null]) assert.equal(audioOutput(output),null);
});
test('JSON body reader rejects malformed, oversized, and non-object requests', async () => {
  const request=(body:string)=>new Request('https://www.openspeech.dev/api/generate',{method:'POST',headers:{'content-type':'application/json'},body});
  assert.deepEqual(await readSmallJson(request('{"text":"hi"}')), {text:'hi'});
  for(const value of ['null','[]','bad',JSON.stringify({text:'x'.repeat(5000)})]) await assert.rejects(()=>readSmallJson(request(value)));
});
test('cross-origin generation and signup cannot be initiated by another site',()=>{
  assert(sameOrigin(new Request('https://www.openspeech.dev/api/generate',{headers:{origin:'https://www.openspeech.dev'}})));
  assert(!sameOrigin(new Request('https://www.openspeech.dev/api/generate',{headers:{origin:'https://other.example'}})));
  assert(!sameOrigin(new Request('https://www.openspeech.dev/api/generate')));
});
