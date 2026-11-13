import { json, requireBearer, run } from "@/lib/api";
import { databaseUrl } from "@/lib/db";
import { overridesWritable, refreshMetricsOverrides } from "@/lib/overrides-mutate";
import { refreshLiveMetrics } from "@/lib/repository";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const denied = requireBearer(request, "CRON_SECRET");
  if (denied) return denied;
  if (databaseUrl()) {
    return run(async () => ({ ok: true, ...(await refreshLiveMetrics()) }));
  }
  if (overridesWritable()) {
    return run(async () => ({ ok: true, ...(await refreshMetricsOverrides({ limit: 20 })) }));
  }
  return json({ ok: true, skipped: "no-storage" });
}
