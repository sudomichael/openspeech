import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Arena from "@/components/Arena";
import Leaderboard from "@/components/Leaderboard";
import { models } from "@/lib/data";
import { isVotingEnabled } from "@/lib/redis";

export const metadata = {
  title: "Arena — OpenSpeech",
  description:
    "Blind A/B test open-source TTS models. Vote on which voice sounds better, drive a community Elo leaderboard.",
};

export const dynamic = "force-dynamic";

export default function ArenaPage() {
  const enabled = isVotingEnabled();
  const sampledModels = models.filter((m) =>
    m.voices.some((v) => v.samples.neutral)
  );

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-20">
          <h1 className="display text-5xl sm:text-6xl tracking-tight mb-4">
            The <span className="italic text-accent">arena</span>.
          </h1>
          <p className="text-lg text-fg-muted leading-relaxed max-w-2xl mb-10">
            Two random voices, same script. You pick which sounds better. Over
            time, the community ranks every OSS TTS model by ear.
          </p>

          {!enabled ? (
            <div className="border border-dashed border-border rounded-xl p-8 text-center">
              <p className="text-fg-muted mb-2">Voting is temporarily offline.</p>
              <p className="text-xs text-fg-subtle">
                Backend (Upstash Redis) isn&rsquo;t configured yet. Check back soon.
              </p>
            </div>
          ) : (
            <>
              <Arena models={sampledModels} />
              <div className="mt-16">
                <h2 className="display text-3xl mb-4">Leaderboard</h2>
                <Leaderboard />
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
