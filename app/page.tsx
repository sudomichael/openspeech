import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ModelGrid from "@/components/ModelGrid";
import { models, scripts } from "@/lib/data";
import { ArrowRight, GithubIcon, SparkIcon } from "@/components/Icons";

const REPO_URL = "https://github.com/sudomichael/openspeech";

export default function Home() {
  const totalVoices = models.reduce((n, m) => n + m.voices.length, 0);

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 grain opacity-40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-canvas pointer-events-none" />
          <div className="mx-auto max-w-7xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 relative">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-fg-muted hover:text-fg border border-border bg-surface rounded-full pl-2 pr-3 py-1 mb-8 group transition-colors"
            >
              <span className="bg-accent-soft text-accent rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                Open Source
              </span>
              <span>Star on GitHub, add a model</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <h1 className="display text-5xl sm:text-6xl md:text-7xl leading-[0.95] max-w-4xl mb-6">
              The open-source TTS{" "}
              <span className="italic text-accent">directory</span>.
            </h1>
            <p className="text-lg sm:text-xl text-fg-muted leading-relaxed max-w-2xl mb-10">
              Every model, every voice, reading the same three scripts. Compare
              open-source TTS side-by-side without downloading anything.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#models"
                className="inline-flex items-center gap-2 bg-fg text-canvas rounded-full px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Browse {models.length} models
                <ArrowRight />
              </a>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border bg-surface hover:bg-surface-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
              >
                <GithubIcon /> Source
              </a>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 sm:gap-12 max-w-2xl">
              <Stat value={models.length.toString()} label="models" />
              <Stat value={totalVoices.toString()} label="voices" />
              <Stat value="3" label="scripts each" />
            </div>
          </div>
        </section>

        {/* Scripts strip */}
        <section className="border-b border-border bg-surface-2/50">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-fg-subtle font-semibold mb-4">
              <SparkIcon className="w-3 h-3 text-accent" />
              The three scripts
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(scripts).map((s) => (
                <div key={s.id} className="flex flex-col gap-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                    {s.label}
                  </div>
                  <div className="display text-lg italic text-fg leading-snug">
                    &ldquo;{s.text}&rdquo;
                  </div>
                  <div className="text-xs text-fg-subtle">{s.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section id="models" className="mx-auto max-w-7xl px-6 py-12 scroll-mt-20">
          <ModelGrid models={models} />
        </section>

        {/* Contribute CTA */}
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="relative overflow-hidden border border-border bg-surface rounded-2xl px-8 py-10 sm:py-12">
            <div className="absolute inset-0 grain opacity-30 pointer-events-none" />
            <div className="relative max-w-2xl">
              <h2 className="display text-3xl sm:text-4xl mb-3">
                Missing a model?{" "}
                <span className="italic text-accent">Add it.</span>
              </h2>
              <p className="text-fg-muted leading-relaxed mb-6">
                OpenSpeech is community-maintained. Adding a model is a single
                PR: edit one JSON file, drop in three audio samples, open the
                pull request. Models must be genuinely open-source.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-accent text-accent-fg rounded-full px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  How to contribute
                  <ArrowRight />
                </a>
                <a
                  href={`${REPO_URL}/issues/new/choose`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-border bg-surface hover:bg-surface-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
                >
                  Suggest a model
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="display text-3xl sm:text-4xl text-fg leading-none mb-1">
        {value}
      </div>
      <div className="text-xs text-fg-subtle uppercase tracking-wider font-semibold">
        {label}
      </div>
    </div>
  );
}
