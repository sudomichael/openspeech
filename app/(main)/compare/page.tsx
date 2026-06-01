import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompareView from "@/components/CompareView";
import { models } from "@/lib/data";
import { ArrowRight } from "@/components/Icons";

export const metadata = {
  title: "Compare voices — OpenSpeech",
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const idList = (ids ?? "").split(",").filter(Boolean);
  const picked = idList
    .map((id) => models.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => !!m);

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

          {picked.length < 2 ? (
            <div className="border border-dashed border-border rounded-xl p-10 text-center">
              <p className="text-fg-muted mb-4">
                Pick 2 or more models to compare. Open the{" "}
                <Link href="/" className="text-accent underline hover:no-underline">
                  directory
                </Link>{" "}
                and check the box on each card.
              </p>
              {picked.length === 1 && (
                <p className="text-xs text-fg-subtle">
                  Currently selected: {picked[0].name}
                </p>
              )}
            </div>
          ) : (
            <CompareView models={picked} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
