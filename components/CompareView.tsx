"use client";

import { useState } from "react";
import type { Model, ScriptId } from "@/lib/types";
import { scripts } from "@/lib/data";
import AudioSequence from "./AudioSequence";

export default function CompareView({ models }: { models: Model[] }) {
  const [voices, setVoices] = useState<Record<string, string>>({});
  const picked = models.map((model) => ({ model, voice: model.voices.find((v) => v.id === (voices[model.id] ?? model.default_voice)) ?? model.voices[0] }));
  const key = picked.map(({ model, voice }) => `${model.id}:${voice.id}`).join(",");
  return <div className="space-y-10">
    <div className="flex flex-wrap gap-4">{picked.map(({ model, voice }) => <label key={model.id} className="text-sm">{model.name} voice
      <select aria-label={`${model.name} voice`} value={voice.id} onChange={(event) => setVoices({ ...voices, [model.id]: event.target.value })} className="block mt-1 bg-surface border border-border rounded-lg p-2">{model.voices.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select>
    </label>)}</div>
    {(["neutral", "emotional", "numbers"] as ScriptId[]).map((script) => <section key={script}>
      <h2 className="text-xs uppercase tracking-wider text-highlight font-semibold mb-2">{scripts[script].label}</h2>
      <p className="display text-xl mb-4">“{scripts[script].text}”</p>
      <AudioSequence key={`${key}:${script}`} script={script} items={picked.map(({ model, voice }) => ({ id: model.id, name: model.name, voice: voice.name, src: voice.samples[script] }))} />
    </section>)}
  </div>;
}
