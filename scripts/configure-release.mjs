import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { execFileSync } from 'node:child_process';
const directory = parseEnv(readFileSync('.env','utf8'));
const cloud = parseEnv(readFileSync(process.argv[2] ?? '/tmp/openspeech-cloud-production.env','utf8'));
const values = {
  WAITLIST_REDIS_REST_URL: cloud.KV_REST_API_URL,
  WAITLIST_REDIS_REST_TOKEN: cloud.KV_REST_API_TOKEN,
  REPLICATE_API_TOKEN: directory.REPLICATE_API_TOKEN,
};
for(const [name,value]of Object.entries(values)){
  if(!value?.trim())throw new Error(`Missing ${name}`);
  for(const environment of ['preview','production']){
    try { execFileSync('vercel',['env','add',name,environment,'--force'],{input:value.trim(),stdio:['pipe','pipe','pipe']}); console.log(`Configured ${name} for ${environment}`); }
    catch { throw new Error(`Could not configure ${name} for ${environment}; no secret values were printed.`); }
  }
}
