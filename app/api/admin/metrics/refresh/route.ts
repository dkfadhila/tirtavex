import { requireAdmin, run } from "@/lib/api";
import { getAdminSnapshot } from "@/lib/content";
import { databaseUrl } from "@/lib/db";
import { overridesWritable, refreshMetricsOverrides } from "@/lib/overrides-mutate";
import { refreshLiveMetrics } from "@/lib/repository";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as { id?: string; limit?: number };

  return run(async () => {
    if (databaseUrl()) {
      const res = await refreshLiveMetrics();
      const snapshot = await getAdminSnapshot();
      return { ok: true, updated: res.updated, snapshot };
    }
    if (!overridesWritable()) {
      throw new Error("Storage is not connected. Metrics cannot be saved.");
    }
    const res = await refreshMetricsOverrides({ id: body?.id, limit: body?.limit });
    const snapshot = await getAdminSnapshot();
    return { ok: true, updated: res.updatedCount, total: res.totalTargets, snapshot };
  });
}
