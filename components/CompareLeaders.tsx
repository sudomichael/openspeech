"use client";

import Link from "next/link";
import type { Model } from "@/lib/types";
import { useCompare } from "./CompareProvider";
import { ArrowRight } from "./Icons";

type Props = { models: Model[] };

export default function CompareLeaders({ models }: Props) {
  const compare = useCompare();
  const ids = models.map((m) => m.id);
  const allSelected = ids.every((id) => compare.isSelected(id));

  const selectAll = () => {
    for (const id of ids) {
      if (!compare.isSelected(id)) compare.toggle(id);
    }
  };

  const compareHref = `/compare?ids=${ids.join(",")}`;

  return (
    <div className="relative overflow-hidden border border-border bg-surface rounded-xl p-6 sm:p-8">
      <div className="absolute inset-0 grain opacity-30 pointer-events-none" />
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-highlight mb-1.5">
            Side-by-side
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
            Hear the leaders back-to-back
          </h2>
          <p className="text-fg-muted leading-relaxed max-w-xl">
            Same three scripts, three top models, one screen. The fastest way
            to decide what you actually want.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {models.map((m) => (
              <span
                key={m.id}
                className="text-xs bg-surface-2 border border-border rounded-full px-2.5 py-1"
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0">
          <Link
            href={compareHref}
            className="inline-flex items-center justify-center gap-2 bg-accent text-accent-fg rounded-full px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Compare these three
            <ArrowRight />
          </Link>
          {!allSelected && (
            <button
              onClick={selectAll}
              className="inline-flex items-center justify-center gap-2 text-sm text-fg-muted hover:text-fg px-4 py-2 transition-colors"
            >
              Add all to compare bar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
