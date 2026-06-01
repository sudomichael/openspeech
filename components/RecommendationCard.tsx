"use client";

import { useState } from "react";
import Link from "next/link";
import type { Model } from "@/lib/types";
import SamplePlayer from "./SamplePlayer";
import { ArrowRight } from "./Icons";
import { useCompare } from "./CompareProvider";

const RANK_STYLES: Record<string, { medal: string; label: string; ring: string }> = {
  gold: {
    medal: "🥇",
    label: "Best overall",
    ring: "ring-amber-300/40 dark:ring-amber-400/30",
  },
  silver: {
    medal: "🥈",
    label: "Runner-up",
    ring: "ring-zinc-300/40 dark:ring-zinc-300/20",
  },
  bronze: {
    medal: "🥉",
    label: "Third place",
    ring: "ring-orange-300/40 dark:ring-orange-400/20",
  },
};

export default function RecommendationCard({ model }: { model: Model }) {
  const [voiceId, setVoiceId] = useState(model.default_voice);
  const voice = model.voices.find((v) => v.id === voiceId) ?? model.voices[0];
  const compare = useCompare();
  const rank = model.editorial?.rank ?? "gold";
  const style = RANK_STYLES[rank];
  const selected = compare.isSelected(model.id);

  return (
    <div
      className={`group relative flex flex-col bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow ring-1 ${style.ring}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl leading-none">{style.medal}</span>
          <div className="text-[10px] uppercase tracking-wider text-fg-subtle font-semibold">
            {style.label}
          </div>
        </div>
        <button
          onClick={() => compare.toggle(model.id)}
          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
            selected
              ? "bg-accent border-accent text-accent-fg"
              : "bg-surface border-border hover:border-accent"
          }`}
          aria-label={selected ? "Deselect" : "Select for comparison"}
          title={selected ? "Selected for comparison" : "Add to comparison"}
        >
          {selected && (
            <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3">
              <path d="M4.5 8.5L2 6l1-1 1.5 1.5L9 2l1 1z" />
            </svg>
          )}
        </button>
      </div>

      <Link
        href={`/models/${model.id}`}
        className="display text-4xl tracking-tight mb-2 hover:underline decoration-fg-subtle underline-offset-4"
      >
        {model.name}
      </Link>

      <p className="text-base text-fg leading-snug mb-2">
        {model.editorial?.pitch ?? model.tagline}
      </p>
      {model.editorial?.good_for && (
        <p className="text-sm text-fg-muted leading-relaxed mb-5">
          {model.editorial.good_for}
        </p>
      )}

      <div className="mt-auto pt-2">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] text-fg-subtle">Voice</span>
          {model.voices.length > 1 ? (
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="text-[11px] font-medium bg-surface-2 border border-border rounded px-1.5 py-0.5 hover:border-border-strong focus:outline-none focus:border-accent transition-colors max-w-[50%]"
              aria-label="Voice"
            >
              {model.voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} {v.gender === "f" ? "♀" : v.gender === "m" ? "♂" : ""}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-[11px] text-fg-muted font-medium">{voice.name}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          <SamplePlayer src={voice.samples.neutral} label="Neutral" />
          <SamplePlayer src={voice.samples.emotional} label="Emotional" />
          <SamplePlayer src={voice.samples.numbers} label="Numbers" />
        </div>
        <Link
          href={`/models/${model.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg group-hover:translate-x-0.5 transition-all"
        >
          Read more
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
