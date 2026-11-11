import { json, requireBearer, run } from "@/lib/api";
import { databaseUrl } from "@/lib/db";
import { refreshLiveMetrics } from "@/lib/repository";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const denied = requireBearer(request, "CRON_SECRET");
  if (denied) return denied;
  if (!databaseUrl()) return json({ ok: true, skipped: "no-database" });
  return run(async () => ({ ok: true, ...(await refreshLiveMetrics()) }));
}
