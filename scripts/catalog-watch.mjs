/** Weekly discovery: primary-source metadata only; never relabel existing audio. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const models = JSON.parse(await readFile('data/models.json', 'utf8'));
const authors = ['ResembleAI', 'Qwen', 'FunAudioLLM', 'fishaudio', 'kyutai', 'microsoft', 'OpenMOSS-Team', 'mistralai', 'bosonai', 'nari-labs', 'HumeAI', 'k2-fsa', 'hexgrad', 'canopylabs', 'maya-research', 'Soul-AILab'];
const headers = process.env.HF_TOKEN ? { Authorization: `Bearer ${process.env.HF_TOKEN}` } : {};
const failures = [];
async function get(url) {
  try { const r = await fetch(url, { headers, signal: AbortSignal.timeout(20000) }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return await r.json(); }
  catch (error) { failures.push({ url, error: error.message }); return null; }
}
const fetched = [];
for (const author of authors) {
  const rows = await get(`https://huggingface.co/api/models?author=${author}&sort=lastModified&direction=-1&limit=40&full=true`);
  if (Array.isArray(rows)) fetched.push(...rows.filter((m) => m.pipeline_tag === 'text-to-speech' || m.tags?.includes('text-to-speech')));
}
// Also discover publishers outside the watch list, with popularity as a review aid.
const trending = await get('https://huggingface.co/api/models?pipeline_tag=text-to-speech&sort=trendingScore&direction=-1&limit=50&full=true');
if (Array.isArray(trending)) fetched.push(...trending);
const known = new Set(models.map((m) => m.hf_url?.replace('https://huggingface.co/', '')).filter(Boolean));
const candidates = [...new Map(fetched.map((m) => [m.id, m])).values()].filter((m) => !known.has(m.id)).map((m) => ({
  id: m.id, url: `https://huggingface.co/${m.id}`, updated: m.lastModified ?? m.last_modified ?? null,
  downloads: m.downloads ?? 0, likes: m.likes ?? 0, license: m.cardData?.license ?? m.tags?.find((t) => t.startsWith('license:'))?.slice(8) ?? 'Needs review',
})).sort((a,b) => b.likes - a.likes).slice(0,60);
const snapshot = {};
for (const model of models) {
  const match = model.repo_url.match(/^https:\/\/github.com\/([^/]+\/[^/#]+)/);
  if (!match) continue;
  const repo = match[1];
  if (snapshot[repo]) continue;
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}/readme`, { headers: { Accept: 'application/vnd.github.raw+json', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) }, signal: AbortSignal.timeout(20000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    snapshot[repo] = createHash('sha256').update(await r.text()).digest('hex');
  } catch (error) { failures.push({ url: model.repo_url, error: error.message }); }
}
let previous = {};
try { previous = JSON.parse(await readFile('data/catalog-source-snapshot.json','utf8')); } catch {}
const changed = Object.keys(snapshot).filter((repo) => previous[repo] && previous[repo] !== snapshot[repo]);
const today = new Date().toISOString().slice(0,10);
const stale = models.filter((m) => !m.reviewed_at || Date.now() - Date.parse(m.reviewed_at) > 90 * 86400000);
const missing = models.filter((m) => !m.voices.some((v) => Object.values(v.samples).some(Boolean)));
await mkdir('docs', { recursive: true });
await writeFile('data/catalog-source-snapshot.json', JSON.stringify({ ...previous, ...snapshot }, null, 2)+'\n');
await writeFile('data/catalog-candidates.json', JSON.stringify({ checked_at: today, candidates, changed_repositories: changed, failures }, null, 2)+'\n');
const safe = (s) => String(s).replace(/[\n\r|<>]/g,' ');
await writeFile('docs/catalog-review.md', `# Catalog review — ${today}\n\nAutomated discovery from Hugging Face and official repository READMEs. Candidates are not endorsements or verified new releases; forks and quantizations need manual review. No existing sample or editorial ranking was changed.\n\n## Candidate models\n\n| Model | Likes | Downloads | Declared license |\n| --- | ---: | ---: | --- |\n${candidates.map((m)=>`| [${safe(m.id)}](${m.url}) | ${m.likes} | ${m.downloads} | ${safe(m.license)} |`).join('\n')}\n\n## Changed source documentation\n\n${changed.map((r)=>`- https://github.com/${r}`).join('\n') || 'No changes against the previous snapshot.'}\n\n## Details due for review\n\n${stale.map((m)=>`- ${m.name}: ${m.reviewed_at ?? 'no review date recorded'}`).join('\n')}\n\n## Missing standardized samples\n\n${missing.map((m)=>`- ${m.name}`).join('\n')}\n\n## Fetch failures\n\n${failures.map((f)=>`- ${f.url}: ${f.error}`).join('\n') || 'None.'}\n\n## Review and publish\n\n1. Verify publisher, release/checkpoint, code and weight licenses against the original model card.\n2. Add a distinct entry for a new release; record sources and actual review date. Never reuse older audio as a new model sample.\n3. Add setup, strengths, limitations, and explicit unknowns for unverified measurements.\n4. Generate the three scripts where a suitable licensed provider is available; otherwise label samples pending.\n5. Run npm run check:catalog, npm test, npm run lint, and npm run build.\n6. Merge the reviewed catalog change and deploy.\n`);
console.log(JSON.stringify({ candidates: candidates.length, changed: changed.length, stale: stale.length, failures: failures.length }));
if (!fetched.length) process.exitCode = 1;
