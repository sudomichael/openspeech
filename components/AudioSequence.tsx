"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { claimPlayback } from "@/lib/audio-bus";
import { track } from "@/lib/analytics";

export type AudioItem = { id: string; name: string; src: string | null; voice?: string };

export default function AudioSequence({ items, script }: { items: AudioItem[]; script: string }) {
  const refs = useRef<(HTMLAudioElement | null)[]>([]);
  const sequence = useRef(false);
  const active = useRef<number | null>(null);
  const run = useRef(0);
  const [playing, setPlaying] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const played = useRef(new Set<string>());

  function stop() {
    run.current++;
    sequence.current = false;
    active.current = null;
    refs.current.forEach((audio) => audio?.pause());
    setPlaying(null);
  }
  useEffect(() => {
    const audio = refs.current;
    // This ref is an operation counter, not a DOM node; invalidate pending play promises.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { run.current++; sequence.current = false; active.current = null; audio.forEach((a) => a?.pause()); };
  }, []);

  async function play(index: number, all: boolean) {
    const next = items.findIndex((item, i) => i >= index && !!item.src);
    if (next < 0) { stop(); return; }
    const audio = refs.current[next];
    if (!audio) { stop(); return; }
    const token = ++run.current;
    sequence.current = all;
    // Change ownership before pausing the previous element.
    active.current = next;
    refs.current.forEach((a, i) => { if (i !== next) a?.pause(); });
    setErrors((current) => ({ ...current, [items[next].id]: "" }));
    audio.currentTime = 0;
    try { await audio.play(); }
    catch {
      if (token !== run.current) return;
      setErrors((current) => ({ ...current, [items[next].id]: "Could not play this sample. Try again." }));
      if (all) void play(next + 1, true); else stop();
    }
  }

  return <div>
    <button type="button" disabled={!items.some((item) => item.src)} onClick={() => playing !== null ? stop() : void play(0, true)} className="mb-4 rounded-full bg-fg text-canvas px-4 py-2 text-sm disabled:opacity-40">
      {playing !== null ? "Stop playback" : "Play all back-to-back"}
    </button>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item, index) => <div key={item.id} className={`rounded-xl border p-4 bg-surface ${playing === index ? "border-accent" : "border-border"}`}>
        <Link href={`/models/${item.id}`} className="font-medium text-sm hover:underline">{item.name}</Link>
        {item.voice && <p className="text-xs text-fg-muted mt-1">{item.voice}</p>}
        {item.src ? <>
          <button type="button" aria-label={`${playing === index ? "Pause" : "Play"} ${item.name} ${script}`} className="block w-full mt-3 rounded-lg bg-surface-2 px-3 py-2 text-sm text-left" onClick={() => playing === index ? stop() : void play(index, false)}>{playing === index ? "Pause" : "Play sample"}</button>
          <audio ref={(el) => { refs.current[index] = el; }} src={item.src} preload="none"
            onPlay={(event) => { claimPlayback(event.currentTarget); setPlaying(index); }}
            onPlaying={() => {
              const key = `${item.id}:${item.src}`;
              if (!played.current.has(key)) { played.current.add(key); track(script === "custom" ? "custom_audio_play" : "sample_play", { model: item.id, voice: item.voice ?? "default", script }); }
              track("comparison_play", { model: item.id, script });
            }}
            onPause={(event) => { if (active.current === index && !event.currentTarget.ended) { sequence.current = false; active.current = null; run.current++; setPlaying(null); } }}
            onEnded={() => { if (active.current === index && sequence.current) void play(index + 1, true); else if (active.current === index) stop(); }}
            onError={() => {
              setErrors((current) => ({ ...current, [item.id]: "This sample is unavailable. Please try another." }));
              if (active.current === index) { if (sequence.current) void play(index + 1, true); else stop(); }
            }} />
        </> : <p className="mt-3 text-sm text-fg-muted">Standardized sample pending</p>}
        {errors[item.id] && <p role="status" className="text-xs text-red-600 dark:text-red-400 mt-2">{errors[item.id]}</p>}
      </div>)}
    </div>
  </div>;
}
