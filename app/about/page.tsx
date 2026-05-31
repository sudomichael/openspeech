import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, GithubIcon } from "@/components/Icons";

const REPO_URL = "https://github.com/sudomichael/openspeech";

export default function About() {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-2xl">
            <h1 className="display text-5xl sm:text-6xl tracking-tight mb-6">
              About <span className="italic text-accent">OpenSpeech</span>
            </h1>
            <div className="text-lg text-fg-muted leading-relaxed space-y-5">
              <p>
                ElevenLabs is expensive. Open-source TTS has caught up — but the
                models are scattered across GitHub, Hugging Face, and a dozen
                comparison blog posts. Finding one and actually <em>hearing</em>{" "}
                it usually means cloning a repo, fighting CUDA, and praying the
                weights still download.
              </p>
              <p>OpenSpeech is an experiment to fix that:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-base">
                <li>Every voice reads the same three scripts.</li>
                <li>Specs, license, and install in one place.</li>
                <li>Filter by license, VRAM, language, capability.</li>
                <li>Add a model with one PR.</li>
              </ul>
              <p>
                Models curated from{" "}
                <a
                  href="https://github.com/wildminder/awesome-ai-voice"
                  className="underline hover:text-fg"
                >
                  awesome-ai-voice
                </a>
                . Samples generated via Replicate. Not affiliated with any model
                author.
              </p>
            </div>

            <div className="mt-10 border-t border-border pt-10">
              <h2 className="display text-2xl mb-4">The three scripts</h2>
              <div className="text-sm text-fg-muted space-y-2">
                <p>
                  <span className="font-semibold text-fg">Neutral</span> —
                  baseline naturalness with no tricky words.
                </p>
                <p>
                  <span className="font-semibold text-fg">Emotional</span> —
                  tests prosody and expressiveness.
                </p>
                <p>
                  <span className="font-semibold text-fg">Numbers &amp; Dates</span>{" "}
                  — the common failure mode for every TTS model.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent text-accent-fg rounded-full px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Contribute
                <ArrowRight />
              </a>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border bg-surface hover:bg-surface-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
              >
                <GithubIcon /> GitHub
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
