"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Model, ScriptId, Voice } from "@/lib/types";
import { scripts } from "@/lib/data";
import { PauseIcon, PlayIcon } from "./Icons";

const SCRIPT_IDS: ScriptId[] = ["neutral", "emotional", "numbers"];

type Picked = { model: Model; voice: Voice };

export default function CompareView({ models }: { models: Model[] }) {
  // Per-model selected voice (defaults to model.default_voice).
  const [voiceIds, setVoiceIds] = useState<Record<string, string>>(() =>
    Object.fromEntries(models.map((m) => [m.id, m.default_voice]))
  );

  const picked: Picked[] = useMemo(
    () =>
      models.map((model) => ({
        model,
        voice:
          model.voices.find((v) => v.id === voiceIds[model.id]) ??
          model.voices[0],
      })),
    [models, voiceIds]
  );

  return (
    <div className="flex flex-col gap-12">
      {SCRIPT_IDS.map((sid) => (
        <ScriptRow
          key={sid}
          scriptId={sid}
          picked={picked}
          onVoiceChange={(modelId, voiceId) =>
            setVoiceIds((prev) => ({ ...prev, [modelId]: voiceId }))
          }
        />
      ))}
    </div>
  );
}

function ScriptRow({
  scriptId,
  picked,
  onVoiceChange,
}: {
  scriptId: ScriptId;
  picked: Picked[];
  onVoiceChange: (modelId: string, voiceId: string) => void;
}) {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [autoplayAll, setAutoplayAll] = useState(false);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  // Reset refs to match picked length.
  audioRefs.current = audioRefs.current.slice(0, picked.length);

  const playAll = () => {
    setAutoplayAll(true);
    setPlayingIdx(0);
    audioRefs.current[0]?.play();
  };

  const stop = () => {
    audioRefs.current.forEach((a) => a?.pause());
    setAutoplayAll(false);
    setPlayingIdx(null);
  };

  useEffect(() => {
    return () => {
      audioRefs.current.forEach((a) => a?.pause());
    };
  }, []);

  const handleEnded = (idx: number) => {
    if (autoplayAll && idx + 1 < picked.length) {
      setPlayingIdx(idx + 1);
      audioRefs.current[idx + 1]?.play();
    } else {
      setAutoplayAll(false);
      setPlayingIdx(null);
    }
  };

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent mb-1">
            {scripts[scriptId].label}
          </div>
          <div className="display text-xl italic max-w-3xl">
            &ldquo;{scripts[scriptId].text}&rdquo;
          </div>
        </div>
        <button
          onClick={playingIdx !== null ? stop : playAll}
          className="inline-flex items-center gap-2 bg-fg text-canvas rounded-full px-4 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
        >
          {playingIdx !== null ? (
            <>
              <PauseIcon /> Stop
            </>
          ) : (
            <>
              <PlayIcon /> Play all
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {picked.map(({ model, voice }, idx) => {
          const src = voice.samples[scriptId];
          const isPlaying = playingIdx === idx;
          return (
            <div
              key={model.id}
              className={`bg-surface border rounded-xl p-4 transition-all ${
                isPlaying ? "border-accent shadow-[0_0_0_2px_var(--accent-soft)]" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <Link
                  href={`/models/${model.id}`}
                  className="font-medium text-sm hover:underline truncate"
                >
                  {model.name}
                </Link>
                {model.voices.length > 1 ? (
                  <select
                    value={voice.id}
                    onChange={(e) => onVoiceChange(model.id, e.target.value)}
                    className="text-[11px] bg-surface-2 border border-border rounded px-1.5 py-0.5 hover:border-border-strong focus:outline-none focus:border-accent transition-colors max-w-[55%]"
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

              {src ? (
                <button
                  onClick={() => {
                    const a = audioRefs.current[idx];
                    if (!a) return;
                    if (isPlaying) a.pause();
                    else {
                      audioRefs.current.forEach((other, i) => {
                        if (i !== idx) other?.pause();
                      });
                      setPlayingIdx(idx);
                      a.play();
                    }
                  }}
                  className={`w-full inline-flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isPlaying
                      ? "bg-accent text-accent-fg"
                      : "bg-surface-2 hover:bg-border text-fg"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      isPlaying ? "bg-accent-fg/20" : "bg-fg/5"
                    }`}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </span>
                  <span className="font-medium">
                    {isPlaying ? "Playing" : "Play"}
                  </span>
                </button>
              ) : (
                <div className="text-xs text-fg-subtle italic px-3 py-2">
                  No sample available
                </div>
              )}

              <audio
                ref={(el) => {
                  audioRefs.current[idx] = el;
                }}
                src={src ?? undefined}
                preload="none"
                onPlay={() => setPlayingIdx(idx)}
                onPause={() => {
                  setPlayingIdx((cur) => (cur === idx ? null : cur));
                }}
                onEnded={() => handleEnded(idx)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
