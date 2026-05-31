"use client";

import Link from "next/link";
import { useCompare } from "./CompareProvider";
import { ArrowRight } from "./Icons";
import { models } from "@/lib/data";

export default function CompareBar() {
  const { selected, clear, maxItems, toggle } = useCompare();
  if (selected.length === 0) return null;

  const picked = selected
    .map((id) => models.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => !!m);

  const compareHref = `/compare?ids=${selected.join(",")}`;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)]">
      <div className="bg-fg text-canvas rounded-2xl shadow-2xl px-3 py-2.5 flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs font-medium pl-2">
          <span>{selected.length} / {maxItems}</span>
          <span className="text-canvas/60">selected</span>
        </div>
        <div className="flex items-center gap-1 max-w-[40vw] overflow-x-auto">
          {picked.map((m) => (
            <button
              key={m.id}
              onClick={() => toggle(m.id)}
              className="text-[11px] bg-canvas/10 hover:bg-canvas/20 rounded-full px-2.5 py-1 whitespace-nowrap flex items-center gap-1.5 transition-colors"
            >
              {m.name}
              <span className="text-canvas/60 text-[10px]">×</span>
            </button>
          ))}
        </div>
        <button
          onClick={clear}
          className="text-[11px] text-canvas/60 hover:text-canvas px-2 py-1 transition-colors"
        >
          Clear
        </button>
        <Link
          href={compareHref}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-opacity ${
            selected.length >= 2
              ? "bg-accent text-accent-fg hover:opacity-90"
              : "bg-canvas/10 text-canvas/50 pointer-events-none"
          }`}
          aria-disabled={selected.length < 2}
        >
          Compare
          <ArrowRight />
        </Link>
      </div>
    </div>
  );
}
