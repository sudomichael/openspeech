import Link from "next/link";
import { ArrowRight } from "@/components/Icons";

export default function HostedCta({ modelName }: { modelName?: string }) {
  return (
    <div className="bg-highlight-soft border border-highlight/25 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-highlight">
          Skip the setup
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold bg-highlight-soft text-highlight rounded px-1.5 py-0.5">
          Coming soon
        </span>
      </div>
      <p className="text-sm text-fg-muted leading-relaxed mb-4">
        {modelName ? `Want ${modelName} without` : "Want these models without"}{" "}
        the CUDA, Docker, and GPU wrangling? OpenSpeech Cloud is launching
        every model in this directory behind one API — metered per minute,
        from $0.10/min.
      </p>
      <Link
        href="/calculator"
        className="inline-flex items-center gap-2 text-sm font-medium bg-fg text-canvas rounded-lg px-4 py-2.5 hover:opacity-90 transition-opacity"
      >
        Estimate your cost
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
