"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { models } from "@/lib/data";

type RatingRow = { id: string; rating: number; votes: number };

export default function Leaderboard() {
  const [data, setData] = useState<RatingRow[] | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    fetch("/api/vote")
      .then((r) => r.json())
      .then((d) => {
        if (d.enabled) {
          setData(d.ratings);
          setTotalVotes(d.totalVotes);
        }
      })
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="border border-border rounded-xl p-6 text-sm text-fg-subtle text-center">
        Loading leaderboard…
      </div>
    );
  }

  const sorted = [...data]
    .filter((r) => models.find((m) => m.id === r.id))
    .sort((a, b) => b.rating - a.rating);

  return (
    <div>
      <p className="text-sm text-fg-muted mb-4">
        {totalVotes.toLocaleString()} total votes ·{" "}
        <span className="text-fg-subtle">starting Elo: 1000</span>
      </p>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {sorted.map((row, idx) => {
          const model = models.find((m) => m.id === row.id);
          if (!model) return null;
          return (
            <Link
              key={row.id}
              href={`/models/${model.id}`}
              className={`flex items-center gap-4 px-4 py-3 hover:bg-surface-2 transition-colors ${
                idx < sorted.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="font-mono text-sm text-fg-subtle w-6">
                {idx + 1}
              </span>
              <span className="flex-1 font-medium text-sm truncate">
                {model.name}
              </span>
              <span className="text-xs text-fg-subtle font-mono">
                {row.votes} votes
              </span>
              <span className="font-mono font-semibold text-sm w-14 text-right">
                {Math.round(row.rating)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
