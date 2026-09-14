import { randomUUID } from "node:crypto";
import { getRedis } from "@/lib/redis";
import { GENERATIONS_PER_DAY, validateGeneration, audioOutput } from "@/lib/generation-models";
import { rateLimit, readSmallJson, sameOrigin, visitorKey } from "@/lib/request-guards";

export const maxDuration = 30;
export const runtime = "nodejs";
const API = "https://api.replicate.com/v1/predictions";
type Job = { owner: string; prediction: string; model: string; created: number };
function headers() { return { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`, "Content-Type": "application/json" }; }
function enabled() { return !!process.env.REPLICATE_API_TOKEN && !!getRedis() && process.env.DEMO_ENABLED !== "false"; }
function result(prediction: { status: string; output?: unknown }) {
  const audio = audioOutput(prediction.output);
  if (prediction.status === "succeeded") return audio ? { status: "succeeded", audio } : { status: "failed", error: "The provider did not return playable audio." };
  if (["failed", "canceled", "aborted"].includes(prediction.status)) return { status: "failed", error: "This model could not finish. Try another model or return later." };
  return { status: "processing" };
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Please generate from the OpenSpeech website." }, { status: 403 });
  if (!enabled()) return Response.json({ error: "Live demos are temporarily unavailable. You can still listen to the recorded samples below." }, { status: 503 });
  let input;
  try { input = validateGeneration(await readSmallJson(request)); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 }); }
  const redis = getRedis()!;
  const owner = visitorKey(request);
  const day = new Date().toISOString().slice(0, 10);
  const configuredCap = Number(process.env.DEMO_DAILY_LIMIT ?? 100);
  const cap = Number.isSafeInteger(configuredCap) && configuredCap > 0 ? Math.min(configuredCap, 500) : 100;
  try {
    const allowed = await redis.eval<number[], number>(`local user = tonumber(redis.call('GET', KEYS[1]) or '0'); local total = tonumber(redis.call('GET', KEYS[2]) or '0'); if user >= tonumber(ARGV[1]) then return 1 end; if total >= tonumber(ARGV[2]) then return 2 end; for i=1,2 do redis.call('INCR', KEYS[i]); redis.call('EXPIRE', KEYS[i], 172800); end; return 0`, [`demo:user:${day}:${owner}`, `demo:total:${day}`], [GENERATIONS_PER_DAY, cap]);
    if (allowed) return Response.json({ error: allowed === 1 ? "You’ve used today’s 9 model generations. Try again tomorrow (UTC)." : "Today’s free demo capacity is used up. Please try again tomorrow (UTC)." }, { status: 429 });
    const response = await fetch(API, { method: "POST", headers: { ...headers(), Prefer: "wait=1", "Cancel-After": "180s" }, body: JSON.stringify({ version: input.model.version, input: { ...input.model.input, text: input.text } }), signal: AbortSignal.timeout(15000) });
    if (!response.ok) return Response.json({ error: "The speech provider is busy. Please try again later." }, { status: 502 });
    const prediction = await response.json();
    if (!/^[a-z0-9]+$/i.test(prediction.id)) throw new Error("Invalid prediction");
    const id = randomUUID();
    const job: Job = { owner, prediction: prediction.id, model: input.model.id, created: Date.now() };
    await redis.set(`demo:job:${id}`, job, { ex: 600 });
    return Response.json({ id, ...result(prediction) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Generation is temporarily unavailable. Please try again later." }, { status: 503 }); }
}

export async function GET(request: Request) {
  if (!enabled()) return Response.json({ error: "Live demos are temporarily unavailable." }, { status: 503 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) return Response.json({ error: "Invalid generation." }, { status: 400 });
  try {
    const owner = visitorKey(request);
    if (!await rateLimit(`demo:poll:${owner}`, 180, 60)) return Response.json({ error: "Please wait a minute before retrying." }, { status: 429 });
    const job = await getRedis()!.get<Job>(`demo:job:${id}`);
    if (!job || job.owner !== owner) return Response.json({ error: "This generation has expired. Please try again." }, { status: 404 });
    if (Date.now() - job.created > 210000) return Response.json({ status: "failed", error: "This model took too long. Try another model." });
    const response = await fetch(`${API}/${job.prediction}`, { headers: headers(), cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Provider unavailable");
    return Response.json(result(await response.json()), { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Could not check generation status. Please try again." }, { status: 503 }); }
}
