import { json, requireBearer, run } from "@/lib/api";
import { databaseUrl } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { addArticleFromAgent, addWorkByX, beat, markWorkDeleted, saveStats, updateMetricsBatch } from "@/lib/repository";

export const dynamic = "force-dynamic";

const actions = new Set(["items", "articles", "metrics", "deleted", "heartbeat", "stats"]);

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  const denied = requireBearer(request, "AGENT_API_KEY", "AGENT_API_KEY is not configured");
  if (denied) return denied;
  const { action } = await context.params;
  if (!actions.has(action)) return json({ error: "Unknown agent action" }, 404);
  const allowed = await rateLimit(`agent:${clientIp(request)}`, 120, 60_000).catch(() => true);
  if (!allowed) return json({ error: "Too many requests" }, 429);
  if (!databaseUrl()) return json({ error: "DATABASE_URL is not configured" }, 503);
  const body = await request.json().catch(() => null);
  return run(async () => {
    if (action === "items") return addWorkByX(body);
    if (action === "articles") return addArticleFromAgent(body);
    if (action === "metrics") return updateMetricsBatch(body);
    if (action === "deleted") return markWorkDeleted(body);
    if (action === "heartbeat") return beat(body);
    return saveStats(body);
  });
}
