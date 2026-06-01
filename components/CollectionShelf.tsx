"use client";

import type { Model } from "@/lib/types";
import ModelCard from "./ModelCard";
import { useCompare } from "./CompareProvider";

type Props = {
  label: string;
  description: string;
  models: Model[];
};

export default function CollectionShelf({ label, description, models }: Props) {
  const compare = useCompare();
  if (models.length === 0) return null;

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{label}</h2>
          <p className="text-sm text-fg-muted mt-0.5">{description}</p>
        </div>
        <span className="text-xs text-fg-subtle">{models.length} models</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {models.map((m) => (
          <ModelCard
            key={m.id}
            model={m}
            selectable
            selected={compare.isSelected(m.id)}
            onToggleSelect={() => compare.toggle(m.id)}
          />
        ))}
      </div>
    </section>
  );
}
