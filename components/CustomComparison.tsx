"use client";

import { useEffect, useRef, useState } from "react";
import { GENERATION_MODELS, MAX_TEXT_LENGTH } from "@/lib/generation-models";
import { track } from "@/lib/analytics";
import AudioSequence from "./AudioSequence";

type Result = { model: string; status: string; audio?: string; error?: string };
export default function CustomComparison() {
  const [text, setText] = useState("Welcome back! Your next appointment is on September 21st at 10:30 AM. Let’s find a voice that sounds right for you.");
  const [selected, setSelected] = useState<string[]>(["kokoro-82m", "chatterbox-turbo"]);
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState("");
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);

  async function generate() {
    abort.current?.abort();
    const controller = new AbortController(); abort.current = controller;
    setBusy(true); setSubmitted(text.trim());
    setResults(selected.map((model) => ({ model, status: "processing" })));
    track("custom_compare_start", { models: selected.join(","), characters: text.trim().length });
    const update = (result: Result) => { if (!controller.signal.aborted) setResults((current) => current.map((r) => r.model === result.model ? result : r)); };
    await Promise.all(selected.map(async (model) => {
      try {
        const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model, text }), signal: controller.signal });
        let result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not start generation.");
        const id = result.id;
        const started = Date.now();
        while (result.status === "processing" && Date.now() - started < 200000) {
          await new Promise<void>((resolve) => setTimeout(resolve, 2500));
          if (controller.signal.aborted) return;
          const poll = await fetch(`/api/generate?id=${encodeURIComponent(id)}`, { signal: controller.signal });
          result = await poll.json();
          if (!poll.ok) throw new Error(result.error || "Could not check generation.");
        }
        if (result.status === "processing") throw new Error("This model took too long. Try another model.");
        update({ model, ...result });
        if (result.status === "succeeded") track("custom_generate_success", { model });
      } catch (error) { update({ model, status: "failed", error: error instanceof Error ? error.message : "Generation failed." }); }
    }));
    if (!controller.signal.aborted) setBusy(false);
  }
  const ready = results.filter((r) => r.status === "succeeded" && r.audio);
  return <section id="your-text" className="mb-12 rounded-xl border border-highlight/30 bg-highlight-soft p-5 sm:p-7 scroll-mt-24">
    <h2 className="text-2xl font-semibold mb-2">Compare with your own text</h2>
    <p className="text-sm text-fg-muted mb-4">Hear the same English text in up to three models. Preset voices, no account needed.</p>
    <label htmlFor="comparison-text" className="text-sm font-medium">What should they say?</label>
    <textarea id="comparison-text" value={text} disabled={busy} onChange={(event) => setText(event.target.value)} maxLength={MAX_TEXT_LENGTH} rows={3} className="block w-full mt-2 bg-canvas border border-border rounded-lg p-3 text-sm" />
    <p className="mt-1 text-xs text-fg-muted">{text.length}/{MAX_TEXT_LENGTH} characters · 9 model generations per day per network, subject to daily demo capacity.</p>
    <fieldset disabled={busy} className="my-4"><legend className="text-sm mb-2">Choose 1–3 models</legend><div className="flex flex-wrap gap-3">{GENERATION_MODELS.map((model) => <label key={model.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(model.id)} disabled={!selected.includes(model.id) && selected.length >= 3} onChange={() => setSelected((current) => current.includes(model.id) ? current.filter((id) => id !== model.id) : [...current, model.id])} />{model.name} <span className="text-xs text-fg-muted">({model.voice})</span></label>)}</div></fieldset>
    <button onClick={() => void generate()} disabled={busy || !text.trim() || !selected.length} className="rounded-full bg-fg text-canvas px-5 py-2.5 text-sm font-medium disabled:opacity-40">{busy ? "Generating samples…" : "Generate & compare"}</button>
    <p className="text-xs text-fg-muted mt-3">Text is sent to Replicate to generate audio. Don’t include private information. Generated audio is temporary; your text is not sent to analytics.</p>
    <div aria-live="polite" className="mt-4 space-y-2">{results.map((result) => <p key={result.model} className="text-sm">{GENERATION_MODELS.find((m) => m.id === result.model)?.name}: {result.status === "processing" ? "Generating… Cold starts can take up to three minutes." : result.status === "succeeded" ? "Ready to listen" : result.error}</p>)}</div>
    {ready.length > 0 && <div className="mt-5"><p className="text-sm text-fg-muted mb-3">“{submitted}”</p><AudioSequence key={ready.map((r) => r.audio).join(",")} script="custom" items={ready.map((result) => { const model = GENERATION_MODELS.find((m) => m.id === result.model)!; return { id: model.id, name: model.name, voice: model.voice, src: result.audio! }; })} /></div>}
  </section>;
}
