"use client";

import { useMemo, useState } from "react";
import { PROVIDERS, formatUsd, type Provider } from "@/lib/pricing";

type Granularity = "day" | "month";

const CATEGORY_LABELS: Record<Provider["category"], string> = {
  openspeech: "OpenSpeech Cloud",
  closed: "Closed-source",
  "hosted-oss": "OSS on Replicate",
  "self-hosted": "Self-hosted OSS",
};

const CATEGORY_DOT: Record<Provider["category"], string> = {
  openspeech: "bg-highlight",
  closed: "bg-rose-500",
  "hosted-oss": "bg-violet-500",
  "self-hosted": "bg-emerald-500",
};

const CATEGORY_BAR: Record<Provider["category"], string> = {
  openspeech: "bg-highlight",
  closed: "bg-rose-500/80",
  "hosted-oss": "bg-violet-500/80",
  "self-hosted": "bg-emerald-500/80",
};

// We rank cheapest/most-expensive using only models that are actually shippable
// today. OpenSpeech Cloud is teaser pricing — exclude it from headline numbers
// until it goes live.
const VISIBLE_FOR_RANKING = PROVIDERS.filter((p) => !p.comingSoon);

export default function Calculator() {
  const [minutes, setMinutes] = useState(60);
  const [granularity, setGranularity] = useState<Granularity>("day");

  const minutesPerMonth = granularity === "day" ? minutes * 30 : minutes;

  const grouped = useMemo(() => {
    const groups: Record<Provider["category"], Provider[]> = {
      openspeech: [],
      closed: [],
      "hosted-oss": [],
      "self-hosted": [],
    };
    for (const p of PROVIDERS) groups[p.category].push(p);
    return groups;
  }, []);

  const cheapest = useMemo(
    () => [...VISIBLE_FOR_RANKING].sort((a, b) => a.perMinUsd - b.perMinUsd)[0],
    []
  );
  const mostExpensive = useMemo(
    () => [...VISIBLE_FOR_RANKING].sort((a, b) => b.perMinUsd - a.perMinUsd)[0],
    []
  );

  return (
    <div>
      {/* Input controls */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-8">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle mb-3">
          Your usage
        </div>
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-fg-muted mb-1.5">
              Minutes of audio per {granularity}
            </label>
            <input
              type="number"
              min={0}
              value={minutes}
              onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value || "0", 10)))}
              className="w-full bg-canvas border border-border rounded-md px-3 py-2 text-2xl font-mono focus:outline-none focus:border-fg"
            />
          </div>
          <div className="inline-flex border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setGranularity("day")}
              className={`px-3 py-2 text-xs ${
                granularity === "day"
                  ? "bg-fg text-canvas"
                  : "bg-surface text-fg-muted hover:bg-surface-2"
              }`}
            >
              per day
            </button>
            <button
              onClick={() => setGranularity("month")}
              className={`px-3 py-2 text-xs ${
                granularity === "month"
                  ? "bg-fg text-canvas"
                  : "bg-surface text-fg-muted hover:bg-surface-2"
              }`}
            >
              per month
            </button>
          </div>
        </div>
        <div className="mt-3 text-xs text-fg-subtle">
          That&rsquo;s{" "}
          <span className="font-semibold text-fg-muted">
            {minutesPerMonth.toLocaleString()} minutes
          </span>{" "}
          per month. About {Math.round(minutesPerMonth / 60).toLocaleString()}{" "}
          hours.
        </div>
      </div>

      {/* Headline numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Headline
          label="Cheapest option"
          name={cheapest.name}
          amount={cheapest.perMinUsd * minutesPerMonth}
          accent="text-emerald-600 dark:text-emerald-400"
        />
        <Headline
          label="Most expensive"
          name={mostExpensive.name}
          amount={mostExpensive.perMinUsd * minutesPerMonth}
          accent="text-rose-600 dark:text-rose-400"
        />
      </div>

      {/* Comparison table */}
      <div className="space-y-8">
        {(["openspeech", "closed", "hosted-oss", "self-hosted"] as const).map((cat) => (
          <section key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${CATEGORY_DOT[cat]}`} />
              <h2 className="font-semibold text-sm">{CATEGORY_LABELS[cat]}</h2>
            </div>
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              {grouped[cat].map((p, i) => {
                const monthly = p.perMinUsd * minutesPerMonth;
                const ratio =
                  monthly /
                  Math.max(mostExpensive.perMinUsd * minutesPerMonth, 0.0001);
                return (
                  <div
                    key={p.id}
                    className={`p-4 ${
                      i < grouped[cat].length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{p.name}</span>
                        {p.comingSoon && (
                          <span className="text-[10px] uppercase tracking-wider font-semibold bg-highlight-soft text-highlight rounded px-1.5 py-0.5">
                            Coming soon
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-lg">
                        {formatUsd(monthly)}
                        <span className="text-xs text-fg-subtle font-sans ml-1">/mo</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-fg-subtle mb-2">
                      {p.notes} ·{" "}
                      <span className="font-mono">
                        {formatUsd(p.perMinUsd)}/min
                      </span>
                    </div>
                    <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className={CATEGORY_BAR[cat]}
                        style={{
                          width: `${Math.max(ratio * 100, 1)}%`,
                          height: "100%",
                        }}
                      />
                    </div>
                    {p.waitlistUrl && (
                      <a
                        href={p.waitlistUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-highlight hover:underline"
                      >
                        Join the waitlist →
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Headline({
  label,
  name,
  amount,
  accent,
}: {
  label: string;
  name: string;
  amount: number;
  accent: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-lg p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle mb-1.5">
        {label}
      </div>
      <div className={`display text-3xl ${accent} mb-1`}>{formatUsd(amount)}/mo</div>
      <div className="text-xs text-fg-muted">{name}</div>
    </div>
  );
}
