import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

// Support both the native Upstash env names and Vercel's "KV_" branding
// (Vercel Marketplace integration injects KV_REST_API_URL / KV_REST_API_TOKEN).
function getCreds(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

export function getRedis(): Redis | null {
  if (_redis) return _redis;
  const creds = getCreds();
  if (!creds) return null;
  _redis = new Redis(creds);
  return _redis;
}

export function isVotingEnabled(): boolean {
  return getCreds() !== null;
}
