"use client";

import type { Model } from "@/lib/types";

export type FilterState = {
  license: string;
  maxVram: number | null;
  voiceCloning: boolean;
  streaming: boolean;
  language: string;
  category: string;
  sort: "name" | "params" | "speed";
};

type Props = {
  state: FilterState;
  setState: (s: FilterState) => void;
  models: Model[];
};

export default function Filters({ state, setState, models }: Props) {
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
      <div className="lg:sticky lg:top-20 flex flex-col gap-5">
        <div>
          <label className={labelCls}>Sort by</label>
          <select
            value={state.sort}
            onChange={(e) => update("sort", e.target.value as FilterState["sort"])}
            className={selectCls}
          >
            <option value="name">Name</option>
            <option value="params">Size (small → large)</option>
            <option value="speed">Speed (fastest first)</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>License</label>
          <select
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
          <label className={labelCls}>Max VRAM</label>
          <select
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
          <label className={labelCls}>Language</label>
          <select
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
          <label className={labelCls}>Category</label>
          <select
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
