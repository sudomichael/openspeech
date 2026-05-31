import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SamplePlayer from "@/components/SamplePlayer";
import { ArrowRight, GithubIcon } from "@/components/Icons";
import { getModel, models, scripts } from "@/lib/data";
import type { ScriptId, Voice } from "@/lib/types";

const REPO_URL = "https://github.com/sudomichael/openspeech";

export function generateStaticParams() {
  return models.map((m) => ({ id: m.id }));
}

const CATEGORY_COLORS: Record<string, string> = {
  flagship: "bg-accent",
  lightweight: "bg-emerald-500",
  "voice-cloning": "bg-violet-500",
  expressive: "bg-amber-500",
  dialogue: "bg-pink-500",
  realtime: "bg-sky-500",
  controllable: "bg-indigo-500",
  "long-form": "bg-orange-500",
  experimental: "bg-zinc-400",
};

export default async function ModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = getModel(id);
  if (!model) notFound();

  const scriptIds: ScriptId[] = ["neutral", "emotional", "numbers"];
  const grouped: Record<string, Voice[]> = { f: [], m: [], n: [] };
  for (const v of model.voices) {
    (grouped[v.gender] ??= []).push(v);
  }
  const groupLabels: Record<string, string> = {
    f: "Female",
    m: "Male",
    n: "Neutral",
  };
  const color = CATEGORY_COLORS[model.category] ?? "bg-zinc-400";

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-7xl px-6 pt-8 pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg mb-8 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            All models
          </Link>

          {/* Header */}
          <div className="border-b border-border pb-10 mb-10">
            <div className="flex items-center gap-2.5 mb-3">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs uppercase tracking-wider text-fg-subtle font-semibold">
                {model.category}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-4 mb-4">
              <h1 className="display text-5xl sm:text-6xl tracking-tight">
                {model.name}
              </h1>
              <span className="text-xs uppercase tracking-wider text-fg-muted border border-border rounded-full px-3 py-1">
                {model.license}
              </span>
            </div>
            <p className="text-lg text-fg-muted leading-relaxed max-w-3xl">
              {model.tagline}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 min-w-0">
              {/* Voices */}
              <div className="flex items-baseline justify-between mb-5">
                <h2 className="display text-2xl">Voices</h2>
                <span className="text-xs text-fg-subtle">
                  {model.voices.length} {model.voices.length === 1 ? "voice" : "voices"}
                </span>
              </div>

              <div className="flex flex-col gap-8 mb-12">
                {(["f", "m", "n"] as const).map((g) => {
                  if (!grouped[g]?.length) return null;
                  return (
                    <div key={g}>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle mb-3">
                        {groupLabels[g]}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {grouped[g].map((voice) => (
                          <div
                            key={voice.id}
                            className="bg-surface border border-border rounded-xl p-4 hover:border-border-strong transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-medium text-sm truncate">
                                    {voice.name}
                                  </span>
                                  {voice.id === model.default_voice && (
                                    <span className="text-[9px] uppercase tracking-wider text-accent bg-accent-soft rounded px-1.5 py-0.5 font-semibold">
                                      default
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-fg-subtle">
                                  {voice.accent !== "unspecified"
                                    ? voice.accent
                                    : "—"}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {scriptIds.map((sid) => (
                                <SamplePlayer
                                  key={sid}
                                  src={voice.samples[sid]}
                                  label={scripts[sid].label}
                                  variant="compact"
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scripts */}
              <h2 className="display text-2xl mb-4">The scripts</h2>
              <div className="flex flex-col gap-3 mb-12">
                {scriptIds.map((sid) => (
                  <div
                    key={sid}
                    className="border-l-2 border-accent pl-4 py-1"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-accent mb-1">
                      {scripts[sid].label}
                    </div>
                    <div className="display text-lg italic leading-snug">
                      &ldquo;{scripts[sid].text}&rdquo;
                    </div>
                  </div>
                ))}
              </div>

              {/* Install */}
              <h2 className="display text-2xl mb-4">Install</h2>
              <pre className="bg-surface-2 border border-border rounded-xl p-4 text-sm font-mono overflow-x-auto">
                {model.install}
              </pre>
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-20 self-start space-y-6">
              <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                <Spec label="Parameters" value={model.params} mono />
                <Spec
                  label="VRAM"
                  value={model.vram_gb === 0 ? "CPU only" : `${model.vram_gb} GB`}
                />
                <Spec
                  label="Realtime"
                  value={`${model.realtime_factor}× (lower = faster)`}
                />
                <Spec
                  label="Voice cloning"
                  value={model.voice_cloning ? "Yes" : "No"}
                />
                <Spec label="Streaming" value={model.streaming ? "Yes" : "No"} />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle mb-2">
                    Languages
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {model.languages.map((l) => (
                      <span
                        key={l}
                        className="text-[11px] bg-surface-2 border border-border rounded px-1.5 py-0.5 font-mono uppercase"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href={model.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between text-sm bg-surface border border-border rounded-lg px-4 py-2.5 hover:border-border-strong transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <GithubIcon /> Source repo
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
                </a>
                {model.hf_url && (
                  <a
                    href={model.hf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between text-sm bg-surface border border-border rounded-lg px-4 py-2.5 hover:border-border-strong transition-colors"
                  >
                    <span>🤗 Hugging Face</span>
                    <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
                  </a>
                )}
                <a
                  href={`${REPO_URL}/edit/main/data/models.json`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between text-sm text-fg-muted hover:text-fg px-4 py-2 transition-colors"
                >
                  <span>Suggest an edit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Spec({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle mb-0.5">
        {label}
      </div>
      <div className={`text-sm ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
