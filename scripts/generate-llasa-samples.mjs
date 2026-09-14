import { readFile, writeFile, mkdir } from "node:fs/promises";
process.loadEnvFile(".env");
const token = process.env.REPLICATE_API_TOKEN;
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
const version =
  "0494f04972b675631af41c253a45c4341bf637f07eed9a39bad3b1fd66f73a2e";
const scripts = JSON.parse(await readFile("data/scripts.json", "utf8"));
const form = new FormData();
form.append(
  "content",
  new Blob([await readFile("/tmp/openspeech-reference-16k.wav")], {
    type: "audio/wav",
  }),
  "reference.wav",
);
const up = await fetch("https://api.replicate.com/v1/files", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: form,
});
if (!up.ok) throw new Error(`Upload ${up.status}`);
const ref = (await up.json()).urls.get;
for (const [id, s] of Object.entries(scripts)) {
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: { ...headers, "Cancel-After": "600s", Prefer: "wait=1" },
    body: JSON.stringify({
      version,
      input: {
        voice_sample: ref,
        prompt_text: scripts.neutral.text + " " + scripts.emotional.text,
        text: s.text,
      },
    }),
  });
  let p = await response.json();
  if (!response.ok) throw new Error(`Generation ${response.status}`);
  const start = Date.now();
  while (
    ["starting", "processing"].includes(p.status) &&
    Date.now() - start < 630000
  ) {
    await new Promise((r) => setTimeout(r, 3000));
    p = await (
      await fetch(`https://api.replicate.com/v1/predictions/${p.id}`, {
        headers,
      })
    ).json();
  }
  if (p.status !== "succeeded") throw new Error(`${p.status}: ${p.error}`);
  const output = Array.isArray(p.output) ? p.output[0] : p.output;
  const url = typeof output === "string" ? output : output?.audio;
  if (!url?.startsWith("https://")) throw new Error("No audio");
  const audio = await fetch(url);
  if (!audio.ok) throw new Error("Download failed");
  await mkdir("public/samples/llasa/default", { recursive: true });
  await writeFile(
    `public/samples/llasa/default/${id}.wav`,
    Buffer.from(await audio.arrayBuffer()),
  );
  console.log(`llasa ${id} saved`);
}
