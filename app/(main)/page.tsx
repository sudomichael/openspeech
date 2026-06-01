import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RecommendationCard from "@/components/RecommendationCard";
import CompareLeaders from "@/components/CompareLeaders";
import Shelf from "@/components/Shelf";
import { models, scripts } from "@/lib/data";
import { COLLECTIONS } from "@/lib/collections";
import { getRecommendations } from "@/lib/recommendations";
import { ArrowRight, GithubIcon, SparkIcon } from "@/components/Icons";

const REPO_URL = "https://github.com/sudomichael/openspeech";

export default function Home() {
  const totalVoices = models.reduce((n, m) => n + m.voices.length, 0);
  const recs = getRecommendations();

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full">
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 grain opacity-40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-canvas pointer-events-none" />
          <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 sm:pt-20 sm:pb-12 relative">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-fg-muted hover:text-fg border border-border bg-surface rounded-full pl-2 pr-3 py-1 mb-7 group transition-colors"
            >
              <span className="bg-accent-soft text-accent rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                Open Source
              </span>
              <span>Star on GitHub, add a model</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] max-w-4xl mb-5">
              Which open-source TTS{" "}
              should I try?
            </h1>
            <p className="text-lg sm:text-xl text-fg-muted leading-relaxed max-w-2xl">
              Start with the three picks below. Hear them. Pick one. We&rsquo;ll
              get into the rest later.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pt-10 sm:pt-14">
          <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Start here
            </h2>
            <Link
              href="/arena"
              className="text-xs text-fg-muted hover:text-fg inline-flex items-center gap-1"
            >
              Picks updated by community votes
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {recs.map((m) => (
              <RecommendationCard key={m.id} model={m} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 mb-16">
          <CompareLeaders models={recs} />
        </section>

        <section className="border-y border-border bg-surface-2/40">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-fg-subtle font-semibold mb-4">
              <SparkIcon className="w-3 h-3 text-accent" />
              The three scripts (every voice reads these)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(scripts).map((s) => (
                <div key={s.id} className="flex flex-col gap-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-highlight">
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

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-highlight mb-2">
              Browse by need
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
              Not sure what you need yet?
            </h2>
            <p className="text-fg-muted leading-relaxed">
              Each shelf below is hand-curated. Scroll horizontally to see all
              picks. Add anything to the comparison bar to hear them side-by-side.
            </p>
          </div>
          <div className="flex flex-col gap-14">
            {COLLECTIONS.map((c) => (
              <Shelf
                key={c.id}
                label={c.label}
                description={c.description}
                models={c.filter(models)}
              />
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-surface-2/30">
          <div className="mx-auto max-w-7xl px-6 py-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
                  Want the full directory?
                </h2>
                <p className="text-fg-muted leading-relaxed max-w-xl">
                  All {models.length} models with full filters and sort.{" "}
                  {totalVoices} voices total. For when you&rsquo;re ready to do
                  your own research.
                </p>
              </div>
              <Link
                href="/directory"
                className="inline-flex items-center gap-2 bg-fg text-canvas rounded-full px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity flex-shrink-0"
              >
                Browse all {models.length} models
                <ArrowRight />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="relative overflow-hidden border border-border bg-surface rounded-xl px-8 py-10 sm:py-12">
            <div className="absolute inset-0 grain opacity-30 pointer-events-none" />
            <div className="relative max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
                Missing a model?{" "}
                Add it.
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
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-border bg-surface hover:bg-surface-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
                >
                  <GithubIcon /> Source
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
