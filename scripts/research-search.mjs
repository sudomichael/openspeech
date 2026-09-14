import { writeFile } from 'node:fs/promises';
process.loadEnvFile('../turboConsole/app/.env.local');
const auth = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64');
const queries = process.argv.length > 2 ? process.argv.slice(2) : ['new open source text to speech models September 2026', 'best open source tts 2026', 'XTTS v2 alternatives voice cloning', 'Chatterbox Nano Multilingual V3 release 2026'];
for (const [i, keyword] of queries.entries()) {
  const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' }, body: JSON.stringify([{ keyword, location_code: 2840, language_code: 'en', depth: 10 }]) });
  if (!response.ok) throw new Error(`Search HTTP ${response.status}`);
  const data = await response.json();
  await writeFile(`/tmp/openspeech-serp-${i}.json`, JSON.stringify(data, null, 2));
  console.log(JSON.stringify({ keyword, cost: data.cost, status: data.tasks?.[0]?.status_message, results: data.tasks?.[0]?.result?.[0]?.items?.filter(x=>x.type==='organic').map(x=>({rank:x.rank_group,title:x.title,url:x.url,description:x.description})) }));
}
