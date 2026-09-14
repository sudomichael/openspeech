import Link from "next/link";
import WaitlistForm from "./WaitlistForm";
import TrackedLink from "./TrackedLink";
import { CLOUD_URL, CLOUD_PRICING } from "@/lib/site";

export default function HostedCta({ modelName, modelId }: { modelName?: string; modelId?: string }) {
  return <div className="bg-highlight-soft border border-highlight/25 rounded-xl p-5">
    <p className="text-xs font-semibold uppercase tracking-wider text-highlight mb-2">Skip the setup · Coming soon</p>
    <h2 className="text-lg font-semibold mb-2">{modelName ? `Host ${modelName} with us` : "OpenSpeech Cloud"}</h2>
    <p className="text-sm text-fg-muted mb-4">Join the waitlist for hosted open models. Planned pricing starts at ${CLOUD_PRICING[0].perMinUsd.toFixed(2)}/min; availability will vary by model.</p>
    <WaitlistForm model={modelId} />
    <TrackedLink href={`${CLOUD_URL}?utm_source=directory&utm_medium=referral${modelId ? `&model=${encodeURIComponent(modelId)}` : ""}`} model={modelId} className="block mt-3 text-xs text-highlight underline">Cloud launch details →</TrackedLink>
    <Link href="/calculator" className="inline-block mt-3 text-xs text-fg-muted underline">Estimate your cost</Link>
  </div>;
}
