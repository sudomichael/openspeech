import { Redis } from "@upstash/redis";

// Uses the Cloud app's existing waitlist database, separate from directory votes.
export function getWaitlistRedis() {
  const url = process.env.WAITLIST_REDIS_REST_URL;
  const token = process.env.WAITLIST_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}
