import { readFile, writeFile } from "node:fs/promises";
process.loadEnvFile(".env");
const pending = JSON.parse(await readFile("data/models.json", "utf8")).filter(
  (m) => m.voices.some((v) => Object.values(v.samples).some((s) => !s)),
);
const found = {};
for (const model of pending) {
  const query = model.id.replace(/-v1-5|-3b-ml|-multilingual-v3|-nano/g, "");
  const r = await fetch("https://api.replicate.com/v1/models", {
    method: "QUERY",
    headers: {
      Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "text/plain",
    },
    body: query,
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) {
    console.log(model.id, r.status);
    continue;
  }
  const data = await r.json();
  found[model.id] = (data.results ?? []).slice(0, 12);
  console.log(
    model.id,
    found[model.id].map((m) => `${m.owner}/${m.name}`).join(", "),
  );
}
await writeFile(
  "/tmp/openspeech-recording-providers.json",
  JSON.stringify(found, null, 2),
);
