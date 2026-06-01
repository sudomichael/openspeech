"use client";

import Link from "next/link";
import type { Model } from "@/lib/types";
import { useCompare } from "./CompareProvider";

type Props = {
  current: Model;
  similar: Model[];
};

export default function CompareWith({ current, similar }: Props) {
  const compare = useCompare();
  if (similar.length === 0) return null;

  const compareIds = [current.id, ...similar.slice(0, 2).map((m) => m.id)].join(",");

  return (
    <div className="border border-border bg-surface-2/50 rounded-xl p-5">
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <h3 className="font-semibold text-sm">Compare with similar</h3>
        <Link
          href={`/compare?ids=${compareIds}`}
          className="text-xs text-accent hover:underline"
        >
          Compare all →
        </Link>
      </div>
      <div className="space-y-2">
        {similar.slice(0, 3).map((m) => (
          <button
            key={m.id}
            onClick={() => {
              if (!compare.isSelected(current.id)) compare.toggle(current.id);
              if (!compare.isSelected(m.id)) compare.toggle(m.id);
            }}
            className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-surface border border-border hover:border-border-strong text-sm transition-colors"
          >
            <span className="truncate">{m.name}</span>
            <span className="text-[11px] text-fg-subtle whitespace-nowrap">
              {m.params}
            </span>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-fg-subtle mt-3">
        Click any model to add it to the comparison bar.
      </p>
    </div>
  );
}
