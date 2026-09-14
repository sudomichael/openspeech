import Link from "next/link";
import WaitlistForm from "./WaitlistForm";
import TrackedLink from "./TrackedLink";
import { CLOUD_URL } from "@/lib/site";
import GENERATION_MODELS from "@/data/hosted-models.json";
export default function HostedCta({
  modelName,
  modelId,
}: {
  modelName?: string;
  modelId?: string;
}) {
  const available = GENERATION_MODELS.some((m) => m.id === modelId);
  return (
    <div className="bg-highlight-soft border border-highlight/25 rounded-xl p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-highlight mb-2">
        OpenSpeech Cloud · Paid studio
      </p>
      <h2 className="text-lg font-semibold mb-2">
        {available
          ? `Create speech with ${modelName}`
          : "Find your voice in the studio"}
      </h2>
      <p className="text-sm text-fg-muted mb-4">
        {available
          ? "Use prepaid credits to turn your English script into speech. See the price before generating, then listen and download."
          : `${GENERATION_MODELS.length} verified open and premium models are available through Replicate. This model is not currently hosted in Cloud.`}
      </p>
      <TrackedLink
        href={`${CLOUD_URL}/studio?utm_source=directory&utm_medium=referral${available ? `&model=${encodeURIComponent(modelId!)}` : ""}`}
        model={modelId}
        className="inline-flex rounded-full bg-fg text-canvas px-4 py-2.5 text-sm font-medium"
      >
        Open the speech studio →
      </TrackedLink>
      <p className="text-xs text-fg-muted mt-3">
        Prepaid credits from $5 · No free generation allowance · Model-specific
        limits.
      </p>
      <div className="border-t border-highlight/20 mt-5 pt-4">
        <p className="text-sm font-medium mb-3">
          {modelName && !available
            ? `Want hosted ${modelName}?`
            : "Need higher limits?"}
        </p>
        <WaitlistForm model={modelId} />
      </div>
      <Link
        href="/calculator"
        className="inline-block mt-3 text-xs text-fg-muted underline"
      >
        Compare other hosting costs
      </Link>
    </div>
  );
}
