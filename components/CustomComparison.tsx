import Link from "next/link";
import hostedModels from "@/data/hosted-models.json";
import { CLOUD_URL } from "@/lib/site";
export default function CustomComparison({
  initialModels = [],
}: {
  initialModels?: string[];
}) {
  const first = initialModels[0];
  return (
    <section
      id="your-text"
      className="rounded-xl border border-highlight/30 bg-highlight-soft p-5 sm:p-7 my-8"
    >
      <h2 className="text-xl font-semibold">
        Try your own text in the paid studio
      </h2>
      <p className="text-sm text-fg-muted mt-3 leading-relaxed">
        Choose from {hostedModels.length} verified Replicate models. Buy prepaid
        credits, see the price for your script, and generate audio to keep.
        Recorded directory samples remain available to listen to.
      </p>
      <Link
        href={`${CLOUD_URL}/studio${first ? `?model=${encodeURIComponent(first)}` : ""}`}
        className="inline-block mt-5 rounded-full bg-fg text-canvas px-5 py-3 text-sm font-medium"
      >
        Open paid speech studio →
      </Link>
      <Link
        href={`${CLOUD_URL}/pricing`}
        className="inline-block ml-5 mt-5 text-sm underline"
      >
        Model prices
      </Link>
    </section>
  );
}
