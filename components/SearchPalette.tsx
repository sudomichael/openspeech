"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { models } from "@/lib/data";
import type { Model } from "@/lib/types";

type Result = {
  model: Model;
  score: number;
  matchedOn: string[];
};

function fuzzyScore(query: string, target: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 50;
  // subsequence match
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length ? 20 : 0;
}

function searchModels(query: string): Result[] {
  if (!query.trim()) {
    return models.slice(0, 8).map((m) => ({ model: m, score: 0, matchedOn: [] }));
  }
  const results: Result[] = [];
  for (const m of models) {
    let score = 0;
    const matchedOn: string[] = [];

    const nameScore = fuzzyScore(query, m.name);
    if (nameScore > 0) {
      score += nameScore * 2;
      matchedOn.push("name");
    }
    const taglineScore = fuzzyScore(query, m.tagline);
    if (taglineScore > 0) {
      score += taglineScore * 0.5;
      matchedOn.push("description");
    }
    const catScore = fuzzyScore(query, m.category);
    if (catScore > 0) {
      score += catScore * 0.7;
      matchedOn.push(m.category);
    }
    for (const lang of m.languages) {
      if (fuzzyScore(query, lang) >= 50) {
        score += 30;
        matchedOn.push(lang);
        break;
      }
    }
    if (fuzzyScore(query, m.license) >= 50) {
      score += 25;
      matchedOn.push(m.license);
    }
    for (const v of m.voices) {
      if (fuzzyScore(query, v.name) >= 50) {
        score += 20;
        matchedOn.push(`voice: ${v.name}`);
        break;
      }
    }

    if (score > 0) {
      results.push({ model: m, score, matchedOn });
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

export default function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !open && (e.target as HTMLElement)?.tagName !== "INPUT" && (e.target as HTMLElement)?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setActiveIdx(0);
    } else {
      setQuery("");
    }
  }, [open]);

  const results = useMemo(() => searchModels(query), [query]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[activeIdx];
      if (r) {
        window.location.href = `/models/${r.model.id}`;
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-4 py-3 flex items-center gap-3">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-fg-subtle">
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3 3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search models, languages, features…"
            className="flex-1 bg-transparent outline-none text-sm text-fg placeholder:text-fg-subtle"
          />
          <kbd className="text-[10px] font-mono text-fg-subtle bg-surface-2 border border-border rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto py-1">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-sm text-fg-subtle text-center">
              No matches.
            </div>
          ) : (
            results.map((r, idx) => (
              <Link
                key={r.model.id}
                href={`/models/${r.model.id}`}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 ${
                  idx === activeIdx ? "bg-surface-2" : ""
                } hover:bg-surface-2`}
                onMouseEnter={() => setActiveIdx(idx)}
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-sm truncate">{r.model.name}</span>
                  <span className="text-[11px] text-fg-subtle truncate">
                    {r.model.tagline}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {r.matchedOn.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-accent-soft text-accent rounded px-1.5 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="border-t border-border px-4 py-2 flex items-center justify-between text-[10px] text-fg-subtle">
          <span>↑↓ navigate · Enter to open</span>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  );
}
