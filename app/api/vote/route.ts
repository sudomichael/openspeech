import { NextResponse } from "next/server";
import { getRedis, isVotingEnabled } from "@/lib/redis";
import { STARTING_ELO, updateElo } from "@/lib/elo";
import { models } from "@/lib/data";

export const runtime = "nodejs";

const VALID_SCRIPTS = new Set(["neutral", "emotional", "numbers"]);
const VOTE_COOLDOWN_SECS = 3;

function ratingKey(modelId: string) {
  return `rating:${modelId}`;
}
function votesKey(modelId: string) {
  return `votes:${modelId}`;
}

async function getRating(redis: ReturnType<typeof getRedis>, id: string): Promise<number> {
  if (!redis) return STARTING_ELO;
  const v = await redis.get<number>(ratingKey(id));
  return typeof v === "number" ? v : STARTING_ELO;
}

export async function POST(req: Request) {
  if (!isVotingEnabled()) {
    return NextResponse.json({ error: "Voting not configured" }, { status: 503 });
  }
  let body: { winner?: string; loser?: string; script?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { winner, loser, script } = body;
  if (!winner || !loser || winner === loser) {
    return NextResponse.json({ error: "Invalid pair" }, { status: 400 });
  }
  if (!models.find((m) => m.id === winner) || !models.find((m) => m.id === loser)) {
    return NextResponse.json({ error: "Unknown model" }, { status: 400 });
  }
  if (script && !VALID_SCRIPTS.has(script)) {
    return NextResponse.json({ error: "Invalid script" }, { status: 400 });
  }

  const redis = getRedis()!;
  // Rate limit per IP via Upstash.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";
  const rateKey = `vote-rl:${ip}`;
  const rateOk = await redis.set(rateKey, "1", { nx: true, ex: VOTE_COOLDOWN_SECS });
  if (!rateOk) {
    return NextResponse.json({ error: "Too fast — vote again in a few seconds" }, { status: 429 });
  }

  const [winnerR, loserR] = await Promise.all([
    getRating(redis, winner),
    getRating(redis, loser),
  ]);
  const [newWinner, newLoser] = updateElo(winnerR, loserR);

  await Promise.all([
    redis.set(ratingKey(winner), newWinner),
    redis.set(ratingKey(loser), newLoser),
    redis.incr(votesKey(winner)),
    redis.incr(votesKey(loser)),
    redis.incr("votes:total"),
  ]);

  return NextResponse.json({
    winner: { id: winner, rating: newWinner },
    loser: { id: loser, rating: newLoser },
  });
}

export async function GET() {
  if (!isVotingEnabled()) {
    return NextResponse.json({ enabled: false, ratings: [] });
  }
  const redis = getRedis()!;
  const ids = models.map((m) => m.id);
  const [ratings, votes, total] = await Promise.all([
    redis.mget<(number | null)[]>(...ids.map(ratingKey)),
    redis.mget<(number | null)[]>(...ids.map(votesKey)),
    redis.get<number>("votes:total"),
  ]);
  const out = ids.map((id, i) => ({
    id,
    rating: ratings[i] ?? STARTING_ELO,
    votes: votes[i] ?? 0,
  }));
  return NextResponse.json({
    enabled: true,
    totalVotes: total ?? 0,
    ratings: out,
  });
}
