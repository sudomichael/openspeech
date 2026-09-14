import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AudioSequence from "@/components/AudioSequence";
import { comparisons } from "@/lib/comparisons";
import { getModel, getDefaultVoice, scripts } from "@/lib/data";
import { languageNames } from "@/lib/site";
export function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = comparisons.find((c) => c.slug === slug);
  if (!c) return {};
  return {
    title: `${c.title}: listen & compare`,
    description: c.summary,
    alternates: { canonical: `/compare/${slug}` },
    openGraph: {
      title: c.title,
      description: c.summary,
      url: `/compare/${slug}`,
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = comparisons.find((c) => c.slug === slug);
  if (!c) notFound();
  const models = c.ids.map((id) => getModel(id)!);
  const facts = [
    { label: "License", values: models.map((m) => m.license) },
    { label: "Parameters", values: models.map((m) => m.params) },
    {
      label: "Voice cloning",
      values: models.map((m) =>
        m.voice_cloning ? "Supported by the model" : "Preset voices",
      ),
    },
    {
      label: "Languages",
      values: models.map((m) => languageNames(m.languages)),
    },
    {
      label: "This recording",
      values: models.map((m) => m.sample_version ?? getDefaultVoice(m).name),
    },
  ];
  return (
    <>
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-5xl px-5 sm:px-8 py-10">
        <nav aria-label="Breadcrumb" className="text-xs text-fg-muted mb-6">
          <Link href="/directory" className="underline">
            Models
          </Link>{" "}
          /{" "}
          <Link href="/compare" className="underline">
            Compare
          </Link>
        </nav>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight mb-5">
          {c.title}
        </h1>
        <p className="text-lg text-fg-muted leading-relaxed max-w-3xl">
          {c.summary}
        </p>
        <p className="text-xs text-fg-muted mt-4">
          Editorial guidance · Reviewed September 14, 2026 · No universal winner
        </p>
        <div className="grid sm:grid-cols-2 gap-4 my-8">
          {models.map((m, i) => (
            <section
              key={m.id}
              className="rounded-xl border border-border p-5 bg-surface"
            >
              <h2 className="font-semibold text-lg mb-3">
                When to choose {m.name}
              </h2>
              <p className="text-sm leading-relaxed text-fg-muted">
                {i === 0 ? c.left : c.right}
              </p>
              <Link
                href={`/models/${m.id}`}
                className="inline-block mt-4 text-sm underline text-highlight"
              >
                Samples, sources & setup →
              </Link>
            </section>
          ))}
        </div>
        <h2 className="text-2xl font-semibold mb-4">
          Hear the same three scripts
        </h2>
        <p className="text-sm text-fg-muted leading-relaxed mb-6">{c.test}</p>
        {(["neutral", "emotional", "numbers"] as const).map((sid) => (
          <section
            className="my-6 rounded-xl border border-border p-5"
            key={sid}
          >
            <h3 className="font-semibold mb-2">{scripts[sid].label}</h3>
            <p className="text-sm text-fg-muted mb-5">“{scripts[sid].text}”</p>
            <AudioSequence
              script={sid}
              items={models.map((m) => ({
                id: m.id,
                name: m.name,
                voice: getDefaultVoice(m).name,
                src: getDefaultVoice(m).samples[sid],
              }))}
            />
          </section>
        ))}
        <Link
          href={`/compare?ids=${c.ids.join(",")}#your-text`}
          className="inline-block rounded-full bg-fg text-canvas px-5 py-3 text-sm mb-10"
        >
          {c.slug === "kokoro-vs-xtts-v2"
            ? "Try Kokoro with your own text →"
            : "Compare your own text →"}
        </Link>
        <h2 className="text-2xl font-semibold mb-4">Practical differences</h2>
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-4 text-left">Feature</th>
                {models.map((m) => (
                  <th key={m.id} className="p-4 text-left">
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {facts.map((f) => (
                <tr key={f.label} className="border-t border-border">
                  <th className="p-4 text-left font-medium align-top">
                    {f.label}
                  </th>
                  {f.values.map((v, i) => (
                    <td className="p-4 text-fg-muted align-top" key={i}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-fg-muted my-4">
          Code and weight licenses may differ. Follow the primary sources on
          each model page. We do not publish a speed ranking without a
          controlled benchmark.
        </p>
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">
            More listening comparisons
          </h2>
          <div className="flex flex-wrap gap-4">
            {comparisons
              .filter((p) => p.slug !== slug)
              .map((p) => (
                <Link
                  className="text-sm text-highlight underline"
                  key={p.slug}
                  href={`/compare/${p.slug}`}
                >
                  {p.title}
                </Link>
              ))}
          </div>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Models",
                item: "https://www.openspeech.dev/directory",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: c.title,
                item: `https://www.openspeech.dev/compare/${c.slug}`,
              },
            ],
          }),
        }}
      />
    </>
  );
}
