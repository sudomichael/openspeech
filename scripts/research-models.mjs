import { writeFile } from 'node:fs/promises';
process.loadEnvFile('.env');
const slugs = ['jaaari/kokoro-82m', 'resemble-ai/chatterbox-turbo', 'lucataco/orpheus-3b-0.1-ft', 'qwen/qwen3-tts', 'resemble-ai/chatterbox'];
for (const slug of slugs) {
  const response = await fetch(`https://api.replicate.com/v1/models/${slug}`, { headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` } });
  if (!response.ok) { console.log(slug, response.status); continue; }
  const model = await response.json();
  const schema = model.latest_version?.openapi_schema?.components?.schemas;
  await writeFile(`/tmp/openspeech-${slug.replaceAll('/', '-')}.json`, JSON.stringify(model, null, 2));
  console.log(JSON.stringify({ slug, version: model.latest_version?.id, input: schema?.Input, output: schema?.Output }));
}
