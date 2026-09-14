import { getWaitlistRedis } from "@/lib/waitlist-redis";
import { getModel } from "@/lib/data";
import { rateLimit, readSmallJson, sameOrigin, visitorKey } from "@/lib/request-guards";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Please join from the OpenSpeech website." }, { status: 403 });
  let body;
  try { body = await readSmallJson(request); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const model = typeof body.model === "string" && getModel(body.model) ? body.model : "all";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  try {
    const redis = getWaitlistRedis();
    if (!redis) throw new Error("Unavailable");
    if (!await rateLimit(`directory:waitlist:limit:${visitorKey(request)}`, 5, 3600)) return Response.json({ error: "Please try again in an hour." }, { status: 429 });
    await redis.eval(`local added = redis.call('SADD', KEYS[1], ARGV[1]); if added == 1 then redis.call('INCR', KEYS[2]); redis.call('HSET', KEYS[3], 'email', ARGV[1], 'joined_at', ARGV[2], 'source', 'directory'); end; redis.call('HSET', KEYS[3], 'model_interest', ARGV[3]); return added`, ["waitlist", "waitlist:total", `waitlist:meta:${email}`], [email, new Date().toISOString(), model]);
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "The waitlist is temporarily unavailable. Please try again shortly." }, { status: 503 }); }
}
