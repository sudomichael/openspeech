"use client";

import { useMemo, useState } from "react";
import type { Model } from "@/lib/types";
import { hasSamples } from "@/lib/data";
import ModelCard from "./ModelCard";
import Filters, { type FilterState } from "./Filters";
import { useCompare } from "./CompareProvider";

function parseParams(s: string): number {
  const m = s.match(/([\d.]+)\s*([MBK]?)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const mult = m[2].toUpperCase() === "B" ? 1e9 : m[2].toUpperCase() === "K" ? 1e3 : 1e6;
  return n * mult;
}

export default function ModelGrid({ models }: { models: Model[] }) {
  const compare = useCompare();
  const [state, setState] = useState<FilterState>({
    query: "",
    samplesOnly: false,
    license: "",
    maxVram: null,
    voiceCloning: false,
    streaming: false,
    language: "",
    category: "",
    sort: "name",
  });

  const filtered = useMemo(() => {
    const out = models.filter((m) => {
      if (state.query && !`${m.name} ${m.tagline} ${m.category} ${m.voices.map(v => v.name).join(" ")}`.toLowerCase().includes(state.query.toLowerCase().trim())) return false;
      if (state.samplesOnly && !hasSamples(m)) return false;
      if (state.license && m.license !== state.license) return false;
      if (state.maxVram !== null && (m.vram_gb === null || m.vram_gb > state.maxVram)) return false;
      if (state.voiceCloning && !m.voice_cloning) return false;
      if (state.streaming && !m.streaming) return false;
      if (state.language && !m.languages.includes(state.language)) return false;
      if (state.category && m.category !== state.category) return false;
      return true;
    });

    out.sort((a, b) => {
      if (state.sort === "name") {
        const aHas = hasSamples(a);
        const bHas = hasSamples(b);
        if (aHas !== bHas) return aHas ? -1 : 1;
        return a.name.localeCompare(b.name);
      }
      if (state.sort === "newest") return (b.added_at ?? "").localeCompare(a.added_at ?? "") || a.name.localeCompare(b.name);
      if (state.sort === "params") return parseParams(a.params) - parseParams(b.params);
      if (state.sort === "speed") return (a.realtime_factor ?? Infinity) - (b.realtime_factor ?? Infinity);
      return 0;
    });
    return out;
  }, [models, state]);

  const sampledCount = filtered.filter(hasSamples).length;

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <Filters state={state} setState={setState} models={models} />
      <div className="flex-1 min-w-0">
        <label htmlFor="directory-search" className="sr-only">Search models</label>
        <input id="directory-search" type="search" placeholder="Search models, voices, or use cases…" value={state.query} onChange={e => setState({ ...state, query: e.target.value })} className="w-full rounded-xl border border-border bg-surface p-4 text-sm mb-5" />
        <div className="flex items-baseline justify-between mb-5">
          <p className="text-sm text-fg-muted">
            <span className="text-fg font-medium">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "model" : "models"}
            {sampledCount < filtered.length && (
              <span className="text-fg-subtle">
                {" "}
                · {sampledCount} with samples
              </span>
            )}
          </p>
          <p className="text-xs text-fg-subtle hidden sm:block">
            Tip: tap the checkbox on any card to compare
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <ModelCard
              key={m.id}
              model={m}
              selectable
              selected={compare.isSelected(m.id)}
              onToggleSelect={() => compare.toggle(m.id)}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-fg-muted text-sm border border-dashed border-border rounded-xl">
            <p>No models match these filters.</p>
            <button type="button" className="mt-3 text-highlight underline" onClick={() => setState({ query: "", samplesOnly: false, license: "", maxVram: null, voiceCloning: false, streaming: false, language: "", category: "", sort: "name" })}>Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
