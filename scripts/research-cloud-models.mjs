import { writeFileSync } from "node:fs";
process.loadEnvFile(".env");
const headers = { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` };
const collection = await fetch(
  "https://api.replicate.com/v1/collections/text-to-speech",
  { headers },
);
if (!collection.ok) throw Error("Collection " + collection.status);
const list = await collection.json();
writeFileSync(
  "/tmp/openspeech-replicate-collection.json",
  JSON.stringify(list, null, 2),
);
const names = [
  ...new Set([
    ...(list.models ?? []).map((m) => `${m.owner}/${m.name}`),
    "resemble-ai/chatterbox",
    "qwen/qwen3-tts",
    "resemble-ai/chatterbox-turbo",
  ]),
];
const rows = [];
let i = 0;
async function worker() {
  while (i < names.length) {
    const name = names[i++];
    const r = await fetch("https://api.replicate.com/v1/models/" + name, {
      headers,
    });
    if (!r.ok) {
      console.log(name, r.status);
      continue;
    }
    const m = await r.json();
    rows.push(m);
    const s = m.latest_version?.openapi_schema?.components?.schemas;
    console.log(
      JSON.stringify({
        name,
        version: m.latest_version?.id,
        license: m.license_url,
        description: m.description,
        input: s?.Input,
        output: s?.Output,
      }),
    );
  }
}
await Promise.all([worker(), worker(), worker()]);
writeFileSync(
  "/tmp/openspeech-replicate-models.json",
  JSON.stringify(rows, null, 2),
);
