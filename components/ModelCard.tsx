"use client";

import { useState } from "react";
import Link from "next/link";
import type { Model } from "@/lib/types";
import SamplePlayer from "./SamplePlayer";
import { ArrowRight } from "./Icons";

const CATEGORY_COLORS: Record<string, string> = {
  flagship: "bg-accent",
  lightweight: "bg-emerald-500",
  "voice-cloning": "bg-violet-500",
  expressive: "bg-amber-500",
  dialogue: "bg-pink-500",
  realtime: "bg-sky-500",
  controllable: "bg-indigo-500",
  "long-form": "bg-orange-500",
  experimental: "bg-zinc-400",
};

export default function ModelCard({ model }: { model: Model }) {
  const [voiceId, setVoiceId] = useState(model.default_voice);
  const voice = model.voices.find((v) => v.id === voiceId) ?? model.voices[0];
  const color = CATEGORY_COLORS[model.category] ?? "bg-zinc-400";
  const hasMultipleVoices = model.voices.length > 1;

  return (
    <div className="group relative flex flex-col bg-surface border border-border rounded-xl p-5 hover:border-border-strong hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <Link
          href={`/models/${model.id}`}
          className="flex items-center gap-2.5 min-w-0 hover:underline decoration-fg-subtle underline-offset-2"
        >
          <span className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
          <h3 className="font-semibold text-[15px] tracking-tight truncate">
            {model.name}
          </h3>
        </Link>
        <span className="text-[10px] uppercase tracking-wider text-fg-subtle border border-border rounded px-1.5 py-0.5 flex-shrink-0">
          {model.license}
        </span>
      </div>

      <p className="text-[13px] text-fg-muted leading-relaxed mb-4 line-clamp-2">
        {model.tagline}
      </p>

      <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[11px] text-fg-subtle mb-4">
        <span className="font-mono">{model.params}</span>
        <span>·</span>
        <span>{model.vram_gb === 0 ? "CPU OK" : `${model.vram_gb}GB`}</span>
        <span>·</span>
        <span>{model.languages.length} lang{model.languages.length === 1 ? "" : "s"}</span>
        {model.voice_cloning && (
          <>
            <span>·</span>
            <span>cloning</span>
          </>
        )}
        {model.streaming && (
          <>
            <span>·</span>
            <span>streaming</span>
          </>
        )}
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] text-fg-subtle">Voice</span>
          {hasMultipleVoices ? (
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="text-[11px] font-medium bg-surface-2 border border-border rounded px-1.5 py-0.5 hover:border-border-strong focus:outline-none focus:border-accent transition-colors max-w-[60%]"
            >
              {model.voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.gender === "f" ? "♀" : v.gender === "m" ? "♂" : "•"})
                </option>
              ))}
            </select>
          ) : (
            <span className="text-[11px] font-medium text-fg-muted">{voice.name}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <SamplePlayer src={voice.samples.neutral} label="Neutral" variant="compact" />
          <SamplePlayer src={voice.samples.emotional} label="Emotional" variant="compact" />
          <SamplePlayer src={voice.samples.numbers} label="Numbers" variant="compact" />
        </div>
      </div>

      <Link
        href={`/models/${model.id}`}
        aria-label={`View ${model.name} details`}
        className="absolute top-4 right-12 sm:right-14 opacity-0 group-hover:opacity-100 transition-opacity text-fg-subtle hover:text-fg"
      >
        <ArrowRight />
      </Link>
    </div>
  );
}
