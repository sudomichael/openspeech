import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
process.loadEnvFile(".env");
const models = JSON.parse(
  readFileSync(process.env.HOSTED_MODELS_PATH ?? new URL("../../openspeech-app/data/hosted-models.json", import.meta.url)),
).filter(
  (m) => process.argv.length === 2 || process.argv.slice(2).includes(m.id),
);
const headers = {
  Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
  "Content-Type": "application/json",
};
const rows =
  process.argv.length > 2
    ? JSON.parse(readFileSync("/tmp/openspeech-hosted-checks.json")).filter(
        (r) => !models.some((m) => m.id === r.id),
      )
    : [];
let cursor = 0;
mkdirSync("/tmp/openspeech-hosted-audio", { recursive: true });
async function worker() {
  while (cursor < models.length) {
    const m = models[cursor++];
    let prediction;
    try {
      let text =
        "Every story starts with a voice. Make something worth hearing.";
      if (m.id === "dia") text = "[S1] " + text;
      const r = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          ...headers,
          "Cancel-After": m.timeout + "s",
          Prefer: "wait=1",
        },
        body: JSON.stringify({
          version: m.version,
          input: { ...m.input, [m.textField]: text },
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!r.ok)
        throw Error("HTTP " + r.status + ": " + (await r.text()).slice(0, 150));
      prediction = await r.json();
      const start = Date.now();
      while (
        ["starting", "processing"].includes(prediction.status) &&
        Date.now() - start < (m.timeout + 30) * 1000
      ) {
        await new Promise((r) => setTimeout(r, 2500));
        const poll = await fetch(
          "https://api.replicate.com/v1/predictions/" + prediction.id,
          { headers, signal: AbortSignal.timeout(15000) },
        );
        if (!poll.ok) throw Error("Polling " + poll.status);
        prediction = await poll.json();
      }
      if (prediction.status !== "succeeded")
        throw Error(prediction.status + ": " + String(prediction.error));
      const url =
        typeof prediction.output === "string"
          ? prediction.output
          : prediction.output?.audio_out;
      if (
        !url ||
        new URL(url).protocol !== "https:" ||
        !new URL(url).hostname.endsWith("replicate.delivery")
      )
        throw Error("Unexpected audio output");
      const audio = await fetch(url);
      const data = Buffer.from(await audio.arrayBuffer());
      if (!audio.ok || data.length < 1000) throw Error("Empty audio");
      writeFileSync(
        "/tmp/openspeech-hosted-audio/" + m.id + "." + m.format,
        data,
      );
      rows.push({
        id: m.id,
        status: "passed",
        prediction: prediction.id,
        bytes: data.length,
        mime: audio.headers.get("content-type"),
        metrics: prediction.metrics,
      });
      console.log(
        m.id,
        "PASSED",
        data.length,
        JSON.stringify(prediction.metrics),
      );
    } catch (e) {
      rows.push({
        id: m.id,
        status: "failed",
        prediction: prediction?.id,
        error: e.message,
      });
      console.log(m.id, "FAILED", e.message);
    }
    writeFileSync(
      "/tmp/openspeech-hosted-checks.json",
      JSON.stringify(rows, null, 2),
    );
  }
}
await Promise.all([worker(), worker()]);
