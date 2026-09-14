import { readFile, writeFile } from "node:fs/promises";
const models = JSON.parse(await readFile("data/models.json", "utf8")).filter(
  (m) =>
    m.voices.some((v) => Object.values(v.samples).some((s) => !s)) && m.hf_url,
);
const result = [];
for (const m of models) {
  const r = await fetch(
    m.hf_url.replace("huggingface.co/", "huggingface.co/api/models/"),
    { signal: AbortSignal.timeout(20000) },
  );
  const d = await r.json();
  const spaces = d.spaces ?? [];
  result.push({ id: m.id, spaces });
  console.log(m.id, spaces.slice(0, 12));
}
await writeFile(
  "/tmp/openspeech-model-spaces.json",
  JSON.stringify(result, null, 2),
);
