"use client";

import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "./Icons";
import { track, sampleProperties } from "@/lib/analytics";
import { claimPlayback } from "@/lib/audio-bus";

type Props = {
  src: string | null;
  label: string;
  variant?: "default" | "compact";
  autoplayKey?: string;
};

export default function SamplePlayer(props: Props) {
  return <Player key={props.src ?? "missing"} {...props} />;
}

function Player({
  src,
  label,
  variant = "default",
  autoplayKey,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const triggered = useRef(false);
  const logged = useRef(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const update = () => {
      if (a.duration) setProgress(a.currentTime / a.duration);
    };
    a.addEventListener("timeupdate", update);
    return () => a.removeEventListener("timeupdate", update);
  }, [src]);

  useEffect(() => {
    if (!autoplayKey || !src || triggered.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("play") === autoplayKey) {
      triggered.current = true;
      const a = audioRef.current;
      if (a) {
        a.play().catch(() => {
          // Browser blocked autoplay (no user gesture). Silent fail.
        });
      }
    }
  }, [autoplayKey, src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.pause();
    else {
      setError(false);
      setLoading(true);
      a.play().catch(() => { setLoading(false); setPlaying(false); setError(true); });
    }
  };

  if (!src) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border border-dashed border-border px-3 ${
          variant === "compact" ? "h-7 text-[11px]" : "h-8 text-xs"
        } text-fg-subtle cursor-not-allowed`}
        title="Sample not generated yet"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-fg-subtle/40" />
        {label}
      </span>
    );
  }

  const isCompact = variant === "compact";
  const sizeClass = isCompact ? "h-7 text-[11px] pr-3 pl-1" : "h-8 text-xs pr-3.5 pl-1";
  const iconSize = isCompact ? "w-5 h-5" : "w-6 h-6";

  return (
    <button
      onClick={toggle}
      aria-label={`${playing ? "Pause" : "Play"} ${label}`}
      title={error ? "Playback failed. Click to retry." : undefined}
      className={`group inline-flex items-center gap-2 rounded-full border ${sizeClass} relative overflow-hidden transition-colors ${
        playing || loading
          ? "border-accent bg-accent-soft text-fg"
          : "border-border hover:border-border-strong bg-surface hover:bg-surface-2 text-fg"
      }`}
    >
      <span
        className="absolute left-0 top-0 bottom-0 bg-accent/10 transition-[width] duration-100"
        style={{ width: `${progress * 100}%` }}
        aria-hidden
      />
      <span
        className={`relative ${iconSize} rounded-full flex items-center justify-center transition-colors ${
          playing || loading ? "bg-accent text-accent-fg" : "bg-fg/5 text-fg group-hover:bg-fg/10"
        } ${loading && !playing ? "animate-pulse" : ""}`}
      >
        {playing ? <PauseIcon className="w-3 h-3" /> : <PlayIcon className="w-3 h-3" />}
      </span>
      <span className="relative font-medium tracking-tight">{error ? `${label} · Retry` : label}</span>
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => {
          if (audioRef.current) claimPlayback(audioRef.current);
          setPlaying(true);
        }}
        onPlaying={() => {
          setLoading(false); setError(false);
          if (!logged.current) { logged.current = true; track("sample_play", sampleProperties(src)); }
        }}
        onError={() => { setPlaying(false); setLoading(false); setError(true); }}
        onPause={() => {
          setPlaying(false);
          setLoading(false);
        }}
        onEnded={() => {
          setPlaying(false);
          setLoading(false);
          setProgress(0);
        }}
      />
    </button>
  );
}
