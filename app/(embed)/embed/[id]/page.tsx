import { notFound } from "next/navigation";
import SamplePlayer from "@/components/SamplePlayer";
import { getModel, models, scripts } from "@/lib/data";
import type { ScriptId } from "@/lib/types";

export const dynamic = "force-static";

export function generateStaticParams() {
  return models.map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = getModel(id);
  return {
    title: model ? `${model.name} — OpenSpeech` : "OpenSpeech",
    robots: "noindex",
  };
}

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = getModel(id);
  if (!model) notFound();

  const voice =
    model.voices.find((v) => v.id === model.default_voice) ?? model.voices[0];
  const scriptIds: ScriptId[] = ["neutral", "emotional", "numbers"];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3 gap-2">
        <a
          href={`https://www.openspeech.dev/models/${model.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-base hover:underline truncate"
        >
          {model.name}
        </a>
        <span className="text-[10px] uppercase tracking-wider text-fg-subtle border border-border rounded px-1.5 py-0.5 flex-shrink-0">
          {model.license}
        </span>
      </div>
      <p className="text-xs text-fg-muted mb-3 line-clamp-2">{model.tagline}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {scriptIds.map((sid) => (
          <SamplePlayer
            key={sid}
            src={voice.samples[sid]}
            label={scripts[sid].label}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] text-fg-subtle">
        <span>Voice: {voice.name}</span>
        <a
          href="https://www.openspeech.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-fg"
        >
          OpenSpeech →
        </a>
      </div>
    </div>
  );
}
