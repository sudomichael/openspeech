import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ModelCard from "@/components/ModelCard";
import { models } from "@/lib/data";

export const metadata = {
  title: "New open TTS models and recent releases",
  description: "Recently added open-source and open-weight text-to-speech releases, with version-specific samples, source links, setup notes, and license details.",
  alternates: { canonical: "/new-models" },
};
export default function NewModelsPage() {
  const recent = models.filter((m) => m.added_at).sort((a,b) => (b.added_at ?? "").localeCompare(a.added_at ?? "") || (b.release_date ?? "").localeCompare(a.release_date ?? ""));
  return <><Navbar /><main className="mx-auto w-full max-w-7xl px-6 py-12">
    <h1 className="text-4xl font-semibold mb-4">New to OpenSpeech</h1>
    <p className="text-lg text-fg-muted max-w-3xl mb-3">Recent TTS releases and models newly added to the directory. Compare versions, check the license, and find the setup that fits your project.</p>
    <p className="text-sm text-fg-muted mb-8">Added dates describe this directory, not the original release date. Source details were reviewed on the dates shown. New recordings are labeled separately from older checkpoints.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{recent.map((model) => <ModelCard key={model.id} model={model} />)}</div>
    <p className="mt-10 text-sm text-fg-muted">Looking for a specific language or hardware requirement? <Link href="/directory" className="text-highlight underline">Filter the full directory</Link>.</p>
  </main><Footer /></>;
}
