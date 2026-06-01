"use client";

import { useEffect, useRef, useState } from "react";
import type { Model, ScriptId } from "@/lib/types";
import { scripts } from "@/lib/data";
import { PauseIcon, PlayIcon } from "./Icons";

const SCRIPT_IDS: ScriptId[] = ["neutral", "emotional", "numbers"];

type Pair = {
  a: Model;
  b: Model;
  scriptId: ScriptId;
  aSrc: string;
  bSrc: string;
};

function pickPair(models: Model[]): Pair | null {
  if (models.length < 2) return null;
  const scriptId = SCRIPT_IDS[Math.floor(Math.random() * SCRIPT_IDS.length)];
  const withSample = models.filter((m) => {
    const v = m.voices.find((v) => v.id === m.default_voice) ?? m.voices[0];
    return !!v.samples[scriptId];
  });
  if (withSample.length < 2) return null;
  const shuffled = [...withSample].sort(() => Math.random() - 0.5);
  const a = shuffled[0];
  const b = shuffled[1];
  const aVoice = a.voices.find((v) => v.id === a.default_voice) ?? a.voices[0];
  const bVoice = b.voices.find((v) => v.id === b.default_voice) ?? b.voices[0];
  return {
    a,
    b,
    scriptId,
    aSrc: aVoice.samples[scriptId]!,
    bSrc: bVoice.samples[scriptId]!,
  };
}

export default function Arena({ models }: { models: Model[] }) {
  const [pair, setPair] = useState<Pair | null>(null);
  const [reveal, setReveal] = useState(false);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voteCount, setVoteCount] = useState(0);
  const aRef = useRef<HTMLAudioElement | null>(null);
  const bRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<"a" | "b" | null>(null);

  useEffect(() => {
    setPair(pickPair(models));
  }, [models]);

  const next = () => {
    aRef.current?.pause();
    bRef.current?.pause();
    setPair(pickPair(models));
    setReveal(false);
    setVoted(false);
    setError(null);
    setPlaying(null);
  };

  const play = (which: "a" | "b") => {
    if (!pair) return;
    aRef.current?.pause();
    bRef.current?.pause();
    if (playing === which) {
      setPlaying(null);
      return;
    }
    setPlaying(which);
    const el = which === "a" ? aRef.current : bRef.current;
    el?.play();
  };

  const vote = async (pick: "a" | "b") => {
    if (!pair || voted) return;
    setVoted(true);
    const winner = pick === "a" ? pair.a.id : pair.b.id;
    const loser = pick === "a" ? pair.b.id : pair.a.id;
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winner, loser, script: pair.scriptId }),
      });
      if (res.ok) {
        setReveal(true);
        setVoteCount((c) => c + 1);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Vote failed");
        setVoted(false);
      }
    } catch {
      setError("Network error — try again");
      setVoted(false);
    }
  };

  if (!pair) {
    return (
      <div className="border border-dashed border-border rounded-xl p-8 text-center text-fg-muted">
        Not enough models with samples to start the arena.
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-highlight">
          {scripts[pair.scriptId].label}
        </div>
        <div className="text-[11px] text-fg-subtle">Round {voteCount + 1}</div>
      </div>
      <p className="display text-xl italic mb-6">
        &ldquo;{scripts[pair.scriptId].text}&rdquo;
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {(["a", "b"] as const).map((which) => {
          const model = which === "a" ? pair.a : pair.b;
          const src = which === "a" ? pair.aSrc : pair.bSrc;
          const isPlaying = playing === which;
          return (
            <div
              key={which}
              className={`border rounded-xl p-4 transition-all ${
                isPlaying
                  ? "border-accent shadow-[0_0_0_2px_var(--accent-soft)]"
                  : "border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-2xl text-fg-subtle">
                  {which.toUpperCase()}
                </div>
                {reveal && (
                  <div className="text-xs font-medium text-fg">{model.name}</div>
                )}
              </div>
              <button
                onClick={() => play(which)}
                className={`w-full inline-flex items-center justify-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium mb-3 transition-colors ${
                  isPlaying
                    ? "bg-accent text-accent-fg"
                    : "bg-surface-2 hover:bg-border text-fg"
                }`}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                {isPlaying ? "Playing" : "Play"}
              </button>
              <button
                onClick={() => vote(which)}
                disabled={voted}
                className={`w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  voted
                    ? "bg-surface-2 text-fg-subtle cursor-not-allowed"
                    : "bg-fg text-canvas hover:opacity-90"
                }`}
              >
                {voted && reveal ? "Voted" : "This one"}
              </button>
              <audio
                ref={(el) => {
                  if (which === "a") aRef.current = el;
                  else bRef.current = el;
                }}
                src={src}
                preload="none"
                onEnded={() => setPlaying(null)}
                onPause={() => setPlaying((p) => (p === which ? null : p))}
              />
            </div>
          );
        })}
      </div>

      {error && (
        <div className="text-xs text-rose-500 mb-3 text-center">{error}</div>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={next}
          className="text-sm text-fg-muted hover:text-fg transition-colors"
        >
          Skip →
        </button>
        {reveal && (
          <button
            onClick={next}
            className="bg-accent text-accent-fg rounded-full px-4 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Next round
          </button>
        )}
      </div>
    </div>
  );
}
