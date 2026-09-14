import { writeFile } from "node:fs/promises";
const base = process.env.TEST_BASE_URL ?? "https://www.openspeech.dev";
const xml = await (await fetch(`${base}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) =>
  m[1].replace("https://www.openspeech.dev", base),
);
const rows = [];
let cursor = 0;
async function worker() {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    const response = await fetch(url);
    const html = await response.text();
    const tag = (name) =>
      [...html.matchAll(/<meta\b[^>]*>/g)]
        .map((m) => m[0])
        .find((t) => t.includes(`name="${name}"`));
    const canonical = html.match(
      /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/,
    );
    rows.push({
      url,
      status: response.status,
      title: html.match(/<title>(.*?)<\/title>/s)?.[1],
      description: tag("description")?.match(/content="([^"]*)"/)?.[1],
      canonical: canonical?.[1],
      noindex: !!tag("robots")?.includes("noindex"),
      h1: (html.match(/<h1[\s>]/g) ?? []).length,
      links: [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)]
        .map((m) => m[1].replace(/&amp;/g, "&"))
        .filter((h) => h.startsWith("/") && !h.startsWith("//")),
    });
  }
}
await Promise.all(Array.from({ length: 5 }, worker));
const issues = rows.flatMap((r) =>
  [
    r.status !== 200 && `${r.url}: HTTP ${r.status}`,
    !r.title && `${r.url}: missing title`,
    !r.description && `${r.url}: missing description`,
    r.canonical?.replace(/\/$/, "") !==
      r.url.replace(base, "https://www.openspeech.dev").replace(/\/$/, "") &&
      `${r.url}: wrong canonical ${r.canonical}`,
    r.noindex && `${r.url}: noindex`,
    r.h1 !== 1 && `${r.url}: ${r.h1} H1s`,
  ].filter(Boolean),
);
const report = {
  checkedAt: new Date().toISOString(),
  pages: rows.length,
  issues,
  rows,
};
await writeFile(
  "/tmp/openspeech-seo-crawl.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify({ pages: rows.length, issues }, null, 2));
