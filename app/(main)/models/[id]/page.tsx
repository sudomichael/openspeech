import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SamplePlayer from "@/components/SamplePlayer";
import ShareButton from "@/components/ShareButton";
import CompareWith from "@/components/CompareWith";
import EmbedButton from "@/components/EmbedButton";
import InstallSnippet from "@/components/InstallSnippet";
import { GENERATION_MODELS } from "@/lib/generation-models";
import HostedCta from "@/components/HostedCta";
import { ArrowRight, GithubIcon } from "@/components/Icons";
import { getModel, getDefaultVoice, hasSamples, models, scripts } from "@/lib/data";
import { languageNames } from "@/lib/site";
import type { Model, ScriptId, Voice } from "@/lib/types";

const REPO_URL = "https://github.com/sudomichael/openspeech";

export function generateStaticParams() {
  return models.map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const model = getModel(id);
  if (!model) return {};
  const sampleCount = model.voices.filter((v) => v.samples.neutral).length;
  const title = `${model.name} — voice samples, specs & how to run it`;
  const description = `${model.tagline}. ${
    sampleCount > 0
      ? `Listen to ${model.name} voice samples, `
      : `${model.name} specs, `
  }compare it against ${
    models.length - 1
  } other open-source TTS models, and see VRAM, license, and language support.`;
  return {
    title,
    description,
    alternates: { canonical: `/models/${model.id}` },
    openGraph: { title, description, url: `/models/${model.id}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

function buildFaq(model: Model) {
  return [
    {
      q: `Do I need a GPU to run ${model.name}?`,
      a:
        model.vram_gb === 0
          ? `${model.name} supports CPU inference. Speed depends on your processor, runtime, and text.`
          : model.vram_gb === null ? "We have not verified a hardware requirement for this release. Follow the official setup instructions."
          : `The directory lists roughly ${model.vram_gb} GB of VRAM as a historical estimate. Check the model documentation for your checkpoint and runtime.`,
    },
    {
      q: `Can ${model.name} clone voices?`,
      a: model.voice_cloning
        ? `Yes — ${model.name} supports voice cloning from reference audio.`
        : `No — ${model.name} uses preset voices. Browse the voice-cloning category for models that clone from reference audio.`,
    },
    {
      q: `What license is ${model.name} released under?`,
      a: `${model.name} is released under the ${model.license} license. Always check the repository for the exact terms — some models license code and weights separately.`,
    },
    {
      q: `What languages does ${model.name} support?`,
      a: `${model.name} supports ${languageNames(model.languages)}.`,
    },
    {
      q: `Is there a hosted ${model.name} API?`,
      a: GENERATION_MODELS.some(m => m.id === model.id) ? `Yes. OpenSpeech Cloud offers ${model.name} in its free English preset-voice studio and beta API, subject to generation limits. See the Cloud documentation for current availability.` : `OpenSpeech Cloud is accepting production-access interest for ${model.name}, but this model is not hosted in the beta. Use the official repository for current deployment options.`,
    },
  ];
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

function findSimilar(current: (typeof models)[number], all: typeof models) {
  return all
    .filter((m) => m.id !== current.id)
    .filter((m) => m.voices.some((v) => v.samples.neutral))
    .map((m) => {
      let score = 0;
      if (m.category === current.category) score += 3;
      if (m.voice_cloning === current.voice_cloning) score += 1;
      if (m.streaming === current.streaming) score += 1;
      const sharedLangs = m.languages.filter((l) => current.languages.includes(l)).length;
      score += Math.min(sharedLangs, 3) * 0.5;
      return { m, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.m);
}

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
  const similar = findSimilar(model, models);
  const defaultVoice = getDefaultVoice(model);
  const newer = model.newer_model_id ? getModel(model.newer_model_id) : undefined;
  const modelPath = `/models/${model.id}`;
  const faq = buildFaq(model);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: model.name,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Linux, macOS, Windows",
        description: model.about ?? model.tagline,
        license: model.repo_url,
        url: `https://www.openspeech.dev/models/${model.id}`,
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

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
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-xs uppercase tracking-wider text-fg-subtle font-semibold">
                  {model.category}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <ShareButton url={modelPath} />
                <EmbedButton modelId={model.id} />
              </div>
            </div>
            <div className="flex flex-wrap items-baseline gap-4 mb-4">
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
                {model.name}
              </h1>
              <span className="text-xs uppercase tracking-wider text-fg-muted border border-border rounded-full px-3 py-1">
                {model.license}
              </span>
            </div>
            <p className="text-lg text-fg-muted leading-relaxed max-w-3xl">
              {model.tagline}
            </p>
            {model.about && (
              <p className="text-sm text-fg-muted leading-relaxed max-w-3xl mt-4">
                {model.about}
              </p>
            )}
          </div>

          {newer && <p className="mb-6 rounded-xl border border-highlight/30 bg-highlight-soft p-4 text-sm">Looking for the newer release? <Link href={`/models/${newer.id}`} className="font-medium underline">See {newer.name} →</Link> These recordings remain labeled with their original version.</p>}
          <section className="mb-10 grid gap-5 md:grid-cols-2 rounded-xl border border-border bg-surface p-5">
            <div>
              <h2 className="text-lg font-semibold mb-3">Hear {model.name}</h2>
              {hasSamples(model) ? <div className="flex flex-wrap gap-2">{scriptIds.map((sid) => <SamplePlayer key={sid} src={defaultVoice.samples[sid]} label={scripts[sid].label} />)}</div> : <p className="text-sm text-fg-muted">Standardized samples are pending for this release. See the official sources below for the author’s demo.</p>}
              <p className="text-xs text-fg-muted mt-3">{model.sample_version ?? `${model.name} · ${defaultVoice.name}`} · Same three scripts across the directory.</p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <a href="#install" className="text-highlight underline">Run it yourself</a>
                {GENERATION_MODELS.some((m) => m.id === model.id) && <Link href={`/compare?ids=${model.id}#your-text`} className="text-highlight underline">Try your own text</Link>}
              </div>
            </div>
            <div className="text-sm space-y-3">
              <p><strong>Best for: </strong>{model.best_for ?? model.editorial?.good_for ?? model.tagline}</p>
              <p><strong>Before you choose: </strong>{model.limitations ?? "Compare the samples with your own use case. Check the linked documentation for code, weight, and voice license terms."}</p>
              {model.hardware_notes && <p className="text-fg-muted">{model.hardware_notes}</p>}
              <p className="text-xs text-fg-muted">{model.reviewed_at ? `Details reviewed ${model.reviewed_at}` : "Details awaiting a fresh review"}. Hardware figures are estimates unless a benchmark is linked.</p>
            </div>
          </section>
          <div className="mb-10"><CompareWith current={model} similar={similar} /></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 min-w-0">
              {hasSamples(model) ? (
                <>
                  {/* Voices */}
                  <div className="flex items-baseline justify-between mb-5">
                    <h2 className="text-xl font-semibold tracking-tight">Voices</h2>
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
                                id={`voice-${voice.id}`}
                                className="bg-surface border border-border rounded-xl p-4 hover:border-border-strong transition-colors scroll-mt-20"
                              >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="font-medium text-sm truncate">
                                        {voice.name}
                                      </span>
                                      {voice.id === model.default_voice && (
                                        <span className="text-[9px] uppercase tracking-wider text-highlight bg-highlight-soft rounded px-1.5 py-0.5 font-semibold">
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
                                  <ShareButton
                                    url={`${modelPath}?voice=${voice.id}`}
                                    label=""
                                    className="opacity-0 group-hover:opacity-100"
                                  />
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {scriptIds.map((sid) => (
                                    <SamplePlayer
                                      key={sid}
                                      src={voice.samples[sid]}
                                      label={scripts[sid].label}
                                      variant="compact"
                                      autoplayKey={`${voice.id}:${sid}`}
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
                  <h2 className="text-xl font-semibold tracking-tight mb-4">The scripts</h2>
                  <div className="flex flex-col gap-3 mb-12">
                    {scriptIds.map((sid) => (
                      <div
                        key={sid}
                        className="border-l-2 border-highlight pl-4 py-1"
                      >
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-highlight mb-1">
                          {scripts[sid].label}
                        </div>
                        <div className="display text-lg italic leading-snug">
                          &ldquo;{scripts[sid].text}&rdquo;
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="border border-border bg-surface rounded-xl p-6 mb-12">
                  <h2 className="text-xl font-semibold tracking-tight mb-3">
                    No samples yet
                  </h2>
                  <p className="text-sm text-fg-muted leading-relaxed mb-5">
                    Every model in this directory is read against the same
                    three scripts so voices can be compared honestly — {model.name}&rsquo;s
                    samples just haven&rsquo;t been generated yet.
                  </p>
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                  >
                    Contribute samples on GitHub →
                  </a>
                </div>
              )}

              {/* Install */}
              <h2 id="install" className="text-xl font-semibold tracking-tight mb-4 scroll-mt-24">Run {model.name}</h2>
              <InstallSnippet code={model.install} model={model.id} />
              {model.quickstart && <><h3 className="text-base font-semibold mb-3">First audio example</h3><p className="text-sm text-fg-muted mb-3">Based on the author’s API. Install the documented dependencies and choose a compatible Python environment first.</p><InstallSnippet code={model.quickstart} model={model.id} /></>}
              <div className="mb-10 text-sm"><h3 className="font-semibold mb-2">Sources &amp; setup details</h3><ul className="space-y-2">{(model.sources ?? [{ label: "Official repository", url: model.repo_url }]).map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-highlight underline">{source.label} ↗</a></li>)}</ul></div>

              {/* FAQ */}
              <h2 className="text-xl font-semibold tracking-tight mb-5">
                {model.name} FAQ
              </h2>
              <div className="flex flex-col gap-5">
                {faq.map((item) => (
                  <div key={item.q}>
                    <h3 className="font-medium text-sm mb-1">{item.q}</h3>
                    <p className="text-sm text-fg-muted leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-20 self-start space-y-6">
              <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                <Spec label="Parameters" value={model.params} mono />
                <Spec
                  label="VRAM"
                  value={model.vram_gb === 0 ? "CPU supported" : model.vram_gb === null ? "Not verified" : `~${model.vram_gb} GB (estimate)`}
                />
                <Spec
                  label="Realtime"
                  value={model.realtime_factor === null ? "Not benchmarked here" : `${model.realtime_factor}× (historical estimate)`}
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

              <HostedCta modelName={model.name} modelId={model.id} />



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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VoiceAnchorScroll />
    </>
  );
}

function VoiceAnchorScroll() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var params = new URLSearchParams(window.location.search);
              var v = params.get('voice');
              if (v) {
                requestAnimationFrame(function() {
                  var el = document.getElementById('voice-' + v);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
              }
            } catch (e) {}
          })();
        `,
      }}
    />
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
