"use client";

import { useState } from "react";
import type { Model } from "@/lib/types";

export type FilterState = {
  query: string;
  samplesOnly: boolean;
  license: string;
  maxVram: number | null;
  voiceCloning: boolean;
  streaming: boolean;
  language: string;
  category: string;
  sort: "name" | "params" | "speed" | "newest";
};

type Props = {
  state: FilterState;
  setState: (s: FilterState) => void;
  models: Model[];
};

export default function Filters({ state, setState, models }: Props) {
  const [expanded, setExpanded] = useState(false);
  const licenses = Array.from(new Set(models.map((m) => m.license))).sort();
  const categories = Array.from(new Set(models.map((m) => m.category))).sort();
  const languages = Array.from(new Set(models.flatMap((m) => m.languages))).sort();

  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setState({ ...state, [key]: value });
  };

  const selectCls =
    "w-full border border-border rounded-md px-3 py-1.5 bg-surface text-fg text-sm hover:border-border-strong focus:outline-none focus:border-accent transition-colors";
  const labelCls =
    "block text-[11px] font-semibold uppercase tracking-wider text-fg-subtle mb-1.5";

  return (
    <aside className="w-full lg:w-60 flex-shrink-0">
      <button type="button" className="lg:hidden w-full border border-border rounded-lg px-4 py-3 text-left text-sm" aria-expanded={expanded} aria-controls="model-filters" onClick={() => setExpanded(!expanded)}>{expanded ? "Hide filters −" : "Filter models +"}</button>
      <div id="model-filters" className={`${expanded ? "flex" : "hidden"} lg:flex lg:sticky lg:top-20 flex-col gap-5 pt-5 lg:pt-0`}>
        <div>
          <label htmlFor="filter-sort" className={labelCls}>Sort by</label>
          <select
            id="filter-sort"
            value={state.sort}
            onChange={(e) => update("sort", e.target.value as FilterState["sort"])}
            className={selectCls}
          >
            <option value="name">Name</option>
            <option value="newest">Recently added</option>
            <option value="params">Size (small → large)</option>
            <option value="speed">Speed (fastest first)</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-license" className={labelCls}>License</label>
          <select
            id="filter-license"
            value={state.license}
            onChange={(e) => update("license", e.target.value)}
            className={selectCls}
          >
            <option value="">All licenses</option>
            {licenses.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-maxVram" className={labelCls}>Max VRAM</label>
          <select
            id="filter-maxVram"
            value={state.maxVram ?? ""}
            onChange={(e) =>
              update("maxVram", e.target.value === "" ? null : Number(e.target.value))
            }
            className={selectCls}
          >
            <option value="">Any</option>
            <option value="0">CPU only</option>
            <option value="4">≤ 4 GB</option>
            <option value="8">≤ 8 GB</option>
            <option value="16">≤ 16 GB</option>
            <option value="24">≤ 24 GB</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-language" className={labelCls}>Language</label>
          <select
            id="filter-language"
            value={state.language}
            onChange={(e) => update("language", e.target.value)}
            className={selectCls}
          >
            <option value="">Any</option>
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-category" className={labelCls}>Category</label>
          <select
            id="filter-category"
            value={state.category}
            onChange={(e) => update("category", e.target.value)}
            className={selectCls}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 pt-1 text-sm">
          <label className="flex items-center gap-2 cursor-pointer text-fg-muted"><input type="checkbox" checked={state.samplesOnly} onChange={e => update("samplesOnly", e.target.checked)} />With audio samples</label>
          <label className="flex items-center gap-2 cursor-pointer text-fg-muted hover:text-fg">
            <input
              type="checkbox"
              checked={state.voiceCloning}
              onChange={(e) => update("voiceCloning", e.target.checked)}
              className="accent-[var(--accent)]"
            />
            <span>Voice cloning</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-fg-muted hover:text-fg">
            <input
              type="checkbox"
              checked={state.streaming}
              onChange={(e) => update("streaming", e.target.checked)}
              className="accent-[var(--accent)]"
            />
            <span>Streaming</span>
          </label>
        </div>
      </div>
    </aside>
  );
}
