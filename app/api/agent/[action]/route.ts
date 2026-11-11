import { json, requireBearer, run } from "@/lib/api";
import { databaseUrl } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { addArticleFromAgent, addWorkByX, beat, markWorkDeleted, saveStats, updateMetricsBatch } from "@/lib/repository";

export const dynamic = "force-dynamic";

const actions = new Set(["items", "articles", "metrics", "deleted", "heartbeat", "stats"]);

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  const allowed = await rateLimit(`agent:${clientIp(request)}`, 60, 60_000).catch(() => false);
  if (!allowed) return json({ error: "Too many requests" }, 429);
  const denied = requireBearer(request, "AGENT_API_KEY");
  if (denied) return denied;
  const { action } = await context.params;
  if (!actions.has(action)) return json({ error: "Unknown agent action" }, 404);
  if (!databaseUrl()) {
    console.error("[agent] DATABASE_URL is not configured");
    return json({ error: "Unavailable" }, 503);
  }
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
