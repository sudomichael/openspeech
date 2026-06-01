import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Calculator from "@/components/Calculator";
import { ArrowRight } from "@/components/Icons";

export const metadata = {
  title: "Cost calculator — OpenSpeech",
  description:
    "Estimate the monthly cost of TTS for your usage. Compare ElevenLabs, OpenAI, hosted OSS, and self-hosted options.",
};

export default function CalculatorPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-20">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
            How much will TTS{" "}
            actually cost?
          </h1>
          <p className="text-lg text-fg-muted leading-relaxed max-w-2xl mb-10">
            Same job, different vendors, wildly different price tags. Estimate
            your monthly bill across closed-source, hosted OSS, and self-hosted
            options.
          </p>

          <Calculator />

          <div className="mt-12 text-sm text-fg-muted bg-surface-2/50 border border-border rounded-xl p-5">
            <div className="font-semibold text-fg mb-2">A few honest caveats</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Per-minute estimates assume average English speech (~150 wpm,
                ~900 characters/minute).
              </li>
              <li>
                Self-hosted costs assume reasonable GPU utilization. If your
                fleet sits idle 90% of the time, costs go up proportionally.
              </li>
              <li>
                Vendor prices change. Reviewed mid-2026 — for production
                planning, always confirm with the vendor.
              </li>
              <li>
                Latency, voice library size, voice cloning quality, and SLA are
                NOT priced in. ElevenLabs charges more partly because it does
                things the OSS models don&rsquo;t yet match (5,000+ voices,
                sub-200ms TTFB, enterprise contracts).
              </li>
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"
            >
              ← Browse models
            </a>
            <a
              href="/compare"
              className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"
            >
              Compare voices
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
