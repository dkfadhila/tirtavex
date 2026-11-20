import { getSql } from "./db";

const memory = new Map<string, { count: number; reset: number }>();

function memoryLimit(key: string, limit: number, windowMs: number, now: number) {
  const current = memory.get(key);
  if (!current || current.reset <= now) {
    memory.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const sql = getSql();
  if (!sql) return memoryLimit(key, limit, windowMs, now);

  // Pass the timestamp as ISO text with an explicit cast: a raw Date inside the
  // CASE expression is typed as text and the driver refuses to serialize it.
  const reset = new Date(now + windowMs).toISOString();
  try {
    const rows = await sql<{ count: number }[]>`
      INSERT INTO rate_limits (key, count, reset_at)
      VALUES (${key}, 1, ${reset}::timestamptz)
      ON CONFLICT (key) DO UPDATE
      SET
        count = CASE WHEN rate_limits.reset_at <= now() THEN 1 ELSE rate_limits.count + 1 END,
        reset_at = CASE WHEN rate_limits.reset_at <= now() THEN ${reset}::timestamptz ELSE rate_limits.reset_at END
      RETURNING count
    `;
    return Number(rows[0]?.count ?? 1) <= limit;
  } catch (error) {
    // Never turn a storage error into a fake "too many requests": fall back to memory.
    console.error("[rate-limit] database limiter failed, using memory", error instanceof Error ? error.message : error);
    return memoryLimit(key, limit, windowMs, now);
  }
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}
