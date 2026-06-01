"use client";

import { useState } from "react";
import Link from "next/link";
import type { Model } from "@/lib/types";
import SamplePlayer from "./SamplePlayer";
import { ArrowRight } from "./Icons";

const CATEGORY_COLORS: Record<string, string> = {
  flagship: "bg-blue-500",
  lightweight: "bg-emerald-500",
  "voice-cloning": "bg-violet-500",
  expressive: "bg-amber-500",
  dialogue: "bg-pink-500",
  realtime: "bg-sky-500",
  controllable: "bg-indigo-500",
  "long-form": "bg-orange-500",
  experimental: "bg-zinc-400",
};

type Props = {
  model: Model;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
};

export default function ModelCard({
  model,
  selectable,
  selected,
  onToggleSelect,
}: Props) {
  const [voiceId, setVoiceId] = useState(model.default_voice);
  const voice = model.voices.find((v) => v.id === voiceId) ?? model.voices[0];
  const color = CATEGORY_COLORS[model.category] ?? "bg-zinc-400";
  const hasMultipleVoices = model.voices.length > 1;
  const commercial = !/non-commercial|cc.*nc/i.test(model.license);

  return (
    <div
      className={`group relative flex flex-col bg-surface border rounded-xl overflow-hidden transition-all ${
        selected
          ? "border-accent shadow-[0_0_0_3px_var(--accent-soft)]"
          : "border-border hover:border-border-strong hover:shadow-sm"
      }`}
    >
      {selectable && (
        <button
          onClick={onToggleSelect}
          className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
            selected
              ? "bg-accent border-accent text-accent-fg"
              : "bg-surface border-border hover:border-accent"
          }`}
          aria-label={selected ? "Deselect" : "Select for comparison"}
        >
          {selected && (
            <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3">
              <path d="M4.5 8.5L2 6l1-1 1.5 1.5L9 2l1 1z" />
            </svg>
          )}
        </button>
      )}

      {/* Hero: audio is the product */}
      <div className="bg-surface-2/60 px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <Link
            href={`/models/${model.id}`}
            className="flex items-center gap-2 min-w-0 hover:underline decoration-fg-subtle underline-offset-2"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${color} flex-shrink-0`} />
            <h3 className="font-semibold text-[15px] tracking-tight truncate">
              {model.name}
            </h3>
          </Link>
          {hasMultipleVoices ? (
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="text-[11px] font-medium bg-surface border border-border rounded px-1.5 py-0.5 hover:border-border-strong focus:outline-none focus:border-accent transition-colors max-w-[50%]"
              aria-label="Voice"
            >
              {model.voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} {v.gender === "f" ? "♀" : v.gender === "m" ? "♂" : ""}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-[11px] text-fg-subtle">{voice.name}</span>
          )}
        </div>
        <p className="text-[12px] text-fg-muted leading-snug line-clamp-1 mb-3">
          {model.tagline}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <SamplePlayer src={voice.samples.neutral} label="Neutral" />
          <SamplePlayer src={voice.samples.emotional} label="Emotional" />
          <SamplePlayer src={voice.samples.numbers} label="Numbers" />
        </div>
      </div>

      {/* Capability tags — positives only, plus specs */}
      <div className="px-5 py-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px]">
        {commercial && <Tag>Commercial</Tag>}
        {model.voice_cloning && <Tag>Cloning</Tag>}
        {model.streaming && <Tag>Streaming</Tag>}
        {model.vram_gb === 0 && <Tag>CPU</Tag>}
        <span className="text-fg-subtle ml-auto font-mono text-[10.5px]">
          {model.params}
          {model.vram_gb > 0 && (
            <span className="ml-1.5 text-fg-subtle">· {model.vram_gb}GB</span>
          )}
        </span>
      </div>

      <Link
        href={`/models/${model.id}`}
        aria-label={`View ${model.name} details`}
        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-fg-subtle hover:text-fg"
      >
        <ArrowRight />
      </Link>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 bg-surface-2 border border-border rounded px-1.5 py-0.5 text-fg-muted">
      {children}
    </span>
  );
}

