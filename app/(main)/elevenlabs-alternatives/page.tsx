import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HostedCta from "@/components/HostedCta";
import { ArrowRight } from "@/components/Icons";
import { getModel } from "@/lib/data";
import { languageNames } from "@/lib/site";
import type { Model } from "@/lib/types";

export const metadata: Metadata = {
  title: "12 open-source ElevenLabs alternatives, compared (2026)",
  description:
    "The best open-source ElevenLabs alternatives — Chatterbox, GPT-SoVITS, Kokoro, XTTS v2, Sesame CSM and more. Listen to standardized voice samples, compare specs, and self-host or use a hosted API.",
  alternates: { canonical: "/elevenlabs-alternatives" },
  openGraph: {
    title: "12 open-source ElevenLabs alternatives, compared (2026)",
    description:
      "Voice cloning, streaming, and long-form open-source TTS — with real, standardized voice samples for every model.",
    url: "/elevenlabs-alternatives",
  },
  twitter: {
    card: "summary_large_image",
    title: "12 open-source ElevenLabs alternatives, compared (2026)",
    description:
      "Voice cloning, streaming, and long-form open-source TTS — with real, standardized voice samples for every model.",
  },
};

type Pick = { id: string; bestFor: string; blurb: string };

const PICKS: Pick[] = [
  {
    id: "chatterbox",
    bestFor: "Best overall alternative",
    blurb:
      "Resemble AI's MIT-licensed model is the closest like-for-like swap: zero-shot voice cloning from seconds of audio, an emotion-exaggeration dial ElevenLabs doesn't have, and blind-test results where listeners frequently prefer it over commercial systems.",
  },
  {
    id: "kokoro-82m",
    bestFor: "Best on a budget",
    blurb:
      "At 82M parameters Kokoro tops quality-per-dollar charts. No cloning, but its preset voices are clean and consistent — and it's small enough to run almost anywhere.",
  },
  {
    id: "xtts-v2",
    bestFor: "Best multilingual cloning",
    blurb:
      "The community classic: clone a voice from ~6 seconds and speak it in 17 languages, including cross-language cloning. Mind the Coqui Public Model License if you use it commercially.",
  },
  {
    id: "f5-tts",
    bestFor: "Best one-shot cloning",
    blurb:
      "A single short reference clip is enough. F5-TTS's flow-matching design makes cloning fast, stable, and surprisingly faithful — a favorite for dubbing and narration pipelines.",
  },
  {
    id: "gpt-sovits",
    bestFor: "Best few-shot cloning",
    blurb:
      "The biggest community in open voice cloning. Zero-shot works from seconds of audio, but give it one minute of a voice and its few-shot training produces clones with fidelity zero-shot models can't match.",
  },
  {
    id: "sesame-csm-1b",
    bestFor: "Best for voice assistants",
    blurb:
      "The open model behind Sesame's viral 'Maya' demo. It conditions speech on conversation context, so replies carry the hesitations and tone shifts of a real back-and-forth.",
  },
  {
    id: "orpheus-tts",
    bestFor: "Best for conversation",
    blurb:
      "Built on Llama 3B, Orpheus nails conversational intonation and supports inline emotive tags — <laugh>, <sigh> — plus low-latency streaming for voice agents.",
  },
  {
    id: "cosyvoice2",
    bestFor: "Best for real-time agents",
    blurb:
      "Alibaba's streaming model answers in ~150ms with quality nearly identical to offline synthesis, with instruction control over emotion and dialect. The pick for interactive voice.",
  },
  {
    id: "vibevoice",
    bestFor: "Best for long-form",
    blurb:
      "Microsoft's VibeVoice generates up to ~90 minutes of continuous audio with up to four speakers in one pass — podcast-scale output no commercial API matches today.",
  },
  {
    id: "dia",
    bestFor: "Best for dialogue",
    blurb:
      "Write a screenplay with [S1]/[S2] tags and Dia performs the whole scene — two voices, laughs, coughs and all — in a single generation.",
  },
  {
    id: "higgs-audio-v2",
    bestFor: "Best expressiveness",
    blurb:
      "Boson AI's LLM-based model wins most emotion benchmarks against leading commercial systems and handles multi-speaker dialogue and even humming.",
  },
  {
    id: "bark",
    bestFor: "Best for creative audio",
    blurb:
      "Suno's Bark goes beyond speech: laughter, music, sound effects and nonverbal chaos from inline cues. Less control, more character.",
  },
];

const FAQ = [
  {
    q: "What is the best open-source alternative to ElevenLabs?",
    a: "For most people it's Chatterbox — MIT-licensed, zero-shot voice cloning, and quality that holds up in blind tests against commercial systems. For pure narration on small hardware, Kokoro is hard to beat. For multilingual cloning, XTTS v2 or F5-TTS.",
  },
  {
    q: "Is there a free ElevenLabs alternative?",
    a: "Every model on this page is open source and free to self-host if you have the GPU and the patience. You can listen to standardized samples for each one right here before you pick.",
  },
  {
    q: "Can open-source TTS clone voices like ElevenLabs?",
    a: "Yes. Chatterbox, GPT-SoVITS, XTTS v2, F5-TTS, OpenVoice v2 and others clone from a few seconds of reference audio. Quality is competitive — and unlike a closed API, you can inspect exactly how your voice data is used.",
  },
  {
    q: "What's the catch with self-hosting these models?",
    a: "Setup and hardware. Each model has its own Python environment, weights, and quirks, and most want a CUDA GPU. If you'd rather skip that, OpenSpeech Cloud offers prepaid studio and API access to verified Replicate models, including open models and premium providers. Check its current hosted catalog and per-model prices.",
  },
  {
    q: "How do I compare these models fairly?",
    a: "Every model in this directory reads the same three scripts — neutral, emotional, and numbers — so you're comparing voices, not cherry-picked demos. You can also pit them head-to-head in the Arena.",
  },
];

export default function Page() {
  const picks = PICKS.map((p) => ({ ...p, model: getModel(p.id)! })).filter(
    (p) => p.model
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: "Open-source ElevenLabs alternatives",
        itemListElement: picks.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.model.name,
          url: `/models/${p.model.id}`,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((item) => ({
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
          {/* Hero */}
          <div className="border-b border-border pb-10 mb-10 max-w-3xl">
            <span className="inline-block text-xs text-fg-muted border border-border rounded-full px-3 py-1 mb-5">
              Updated for 2026
            </span>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              Open-source ElevenLabs alternatives, compared.
            </h1>
            <p className="text-lg text-fg-muted leading-relaxed">
              Twelve open models that clone voices, stream in real time, and
              read long-form — every one with standardized voice samples so
              you can hear the difference before you commit. Self-host them
              free, or use them hosted.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 min-w-0">
              {/* Why switch */}
              <h2 className="text-xl font-semibold tracking-tight mb-4">
                Why people look for an alternative
              </h2>
              <p className="text-fg-muted text-sm leading-relaxed mb-8 max-w-2xl">
                ElevenLabs makes excellent voices, but the model is a
                subscription: you buy a monthly credit allowance, and what you
                don&rsquo;t use expires. Open-source TTS has closed most of
                the quality gap — the models below are the proof, and you can
                listen for yourself.
              </p>

              {/* The list */}
              <h2 className="text-xl font-semibold tracking-tight mb-5">
                The 12 best open-source alternatives
              </h2>
              <div className="flex flex-col gap-4">
                {picks.map((p, i) => (
                  <AlternativeCard
                    key={p.id}
                    pick={p}
                    model={p.model}
                    index={i}
                  />
                ))}
              </div>

              {/* FAQ */}
              <h2 className="text-xl font-semibold tracking-tight mt-12 mb-5">
                ElevenLabs alternatives FAQ
              </h2>
              <div className="flex flex-col gap-5">
                {FAQ.map((item) => (
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
              <HostedCta />
              <div className="bg-surface border border-border rounded-xl p-5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle mb-2">
                  Can&rsquo;t decide?
                </div>
                <p className="text-sm text-fg-muted leading-relaxed mb-4">
                  Blind-test the voices head-to-head and let your ears pick.
                </p>
                <Link
                  href="/arena"
                  className="inline-flex items-center gap-2 text-sm font-medium text-fg hover:text-highlight transition-colors"
                >
                  Open the Arena
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
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
    </>
  );
}

function AlternativeCard({
  pick,
  model,
  index,
}: {
  pick: Pick;
  model: Model;
  index: number;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
        <span className="text-fg-subtle text-sm font-mono">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-base font-semibold tracking-tight">
          {model.name}
        </h3>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-highlight bg-highlight-soft rounded-full px-2 py-0.5">
          {pick.bestFor}
        </span>
      </div>
      <p className="text-sm text-fg-muted leading-relaxed mb-3">
        {pick.blurb}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-subtle">
        <span>{model.license}</span>
        <span>{languageNames(model.languages)}</span>
        <span>{model.voice_cloning ? "Voice cloning" : "Preset voices"}</span>
        <Link
          href={`/models/${model.id}`}
          className="text-fg-muted hover:text-fg transition-colors inline-flex items-center gap-1"
        >
          Samples &amp; specs
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
