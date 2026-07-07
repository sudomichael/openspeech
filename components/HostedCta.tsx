import { ArrowRight } from "@/components/Icons";
import { CLOUD_URL } from "@/lib/site";

export default function HostedCta({ modelName }: { modelName?: string }) {
  return (
    <div className="bg-highlight-soft border border-highlight/25 rounded-xl p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-highlight mb-2">
        Skip the setup
      </div>
      <p className="text-sm text-fg-muted leading-relaxed mb-4">
        {modelName ? `Want ${modelName} without` : "Want these models without"}{" "}
        the CUDA, Docker, and GPU wrangling? OpenSpeech Cloud runs every model
        in this directory behind one API — metered per minute, from $0.10/min.
      </p>
      <a
        href={CLOUD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium bg-fg text-canvas rounded-lg px-4 py-2.5 hover:opacity-90 transition-opacity"
      >
        Get hosted access
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
