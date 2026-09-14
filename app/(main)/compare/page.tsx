import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomComparison from "@/components/CustomComparison";
import CompareView from "@/components/CompareView";
import { models } from "@/lib/data";
import { ArrowRight } from "@/components/Icons";

export const metadata = {
  title: "Compare voices",
  alternates: { canonical: "/compare" },
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const idList = Array.from(new Set((ids ?? "").split(",").filter(Boolean))).slice(0, 5);
  const picked = idList
    .map((id) => models.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => !!m);

  const RANK_ORDER: Record<string, number> = { gold: 0, silver: 1, bronze: 2 };
  const defaultPicks = models
    .filter((m) => m.editorial?.rank)
    .sort(
      (a, b) =>
        RANK_ORDER[a.editorial?.rank ?? ""] - RANK_ORDER[b.editorial?.rank ?? ""]
    );

  const usingDefault = picked.length < 2;
  const toShow = usingDefault ? defaultPicks : picked;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-7xl px-6 pt-8 pb-24">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg mb-6 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            All models
          </Link>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
            Side-by-side
          </h1>
          <p className="text-fg-muted max-w-2xl mb-10">
            Same scripts, every voice — back to back. Click play under any
            script to hear all selected models in sequence.
          </p>

          {usingDefault && (
            <p className="text-sm text-fg-muted mb-6">
              Showing our top three picks — check the box on any directory
              card to build your own. See the{" "}
              <Link href="/directory" className="text-accent underline hover:no-underline">
                directory
              </Link>
              .
            </p>
          )}
          <CustomComparison />
          <CompareView models={toShow} />
        </div>
      </main>
      <Footer />
    </>
  );
}
