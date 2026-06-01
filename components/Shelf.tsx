"use client";

import { useRef } from "react";
import type { Model } from "@/lib/types";
import ModelCard from "./ModelCard";
import { useCompare } from "./CompareProvider";
import { ArrowRight } from "./Icons";

type Props = {
  label: string;
  description: string;
  models: Model[];
};

export default function Shelf({ label, description, models }: Props) {
  const compare = useCompare();
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (models.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="relative">
      <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="display text-2xl sm:text-3xl tracking-tight">{label}</h2>
          <p className="text-sm text-fg-muted mt-0.5">{description}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full border border-border hover:border-border-strong hover:bg-surface-2 flex items-center justify-center text-fg-muted hover:text-fg transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full border border-border hover:border-border-strong hover:bg-surface-2 flex items-center justify-center text-fg-muted hover:text-fg transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-thin"
        style={{ scrollbarWidth: "thin" }}
      >
        {models.map((m) => (
          <div
            key={m.id}
            className="snap-start flex-shrink-0 w-[320px] sm:w-[360px]"
          >
            <ModelCard
              model={m}
              selectable
              selected={compare.isSelected(m.id)}
              onToggleSelect={() => compare.toggle(m.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
