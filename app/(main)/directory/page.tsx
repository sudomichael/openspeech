import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ModelGrid from "@/components/ModelGrid";
import { models } from "@/lib/data";

export const metadata = {
  title: "Full directory — OpenSpeech",
  description:
    "Every open-source text-to-speech model in OpenSpeech. Filter by license, VRAM, language, and capability.",
};

export default function DirectoryPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-20">
          <h1 className="display text-5xl sm:text-6xl tracking-tight mb-3">
            The full <span className="italic text-accent">directory</span>.
          </h1>
          <p className="text-lg text-fg-muted leading-relaxed max-w-2xl mb-10">
            Every model. Filter by license, VRAM, language, capability. Tap the
            checkbox on any card to add it to the comparison bar.
          </p>
          <ModelGrid models={models} />
        </div>
      </main>
      <Footer />
    </>
  );
}
