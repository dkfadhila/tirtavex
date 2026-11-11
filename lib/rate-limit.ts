import { getSql } from "./db";

const memory = new Map<string, { count: number; reset: number }>();

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const sql = getSql();
  if (!sql) {
    const current = memory.get(key);
    if (!current || current.reset <= now) {
      memory.set(key, { count: 1, reset: now + windowMs });
      return true;
    }
    if (current.count >= limit) return false;
    current.count += 1;
    return true;
  }

  const reset = new Date(now + windowMs);
  const rows = await sql<{ count: number }[]>`
    INSERT INTO rate_limits (key, count, reset_at)
    VALUES (${key}, 1, ${reset})
    ON CONFLICT (key) DO UPDATE
    SET
      count = CASE WHEN rate_limits.reset_at <= now() THEN 1 ELSE rate_limits.count + 1 END,
      reset_at = CASE WHEN rate_limits.reset_at <= now() THEN ${reset} ELSE rate_limits.reset_at END
    RETURNING count
  `;
  return (rows[0]?.count ?? 1) <= limit;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}
