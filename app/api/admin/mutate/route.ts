import { rejectUnlessJson, requireAdmin, run } from "@/lib/api";
import { getAdminSnapshot } from "@/lib/content";
import { databaseUrl } from "@/lib/db";
import { mutateOverrides, overridesWritable } from "@/lib/overrides-mutate";
import { mutate } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const type = rejectUnlessJson(request);
  if (type) return type;
  const body = await request.json().catch(() => null);
  return run(async () => {
    const result = databaseUrl() ? await mutate(body) : overridesWritable() ? await mutateOverrides(body) : null;
    if (!result) throw new Error("Storage is not connected. Nothing was saved.");
    const snapshot = await getAdminSnapshot();
    return { ok: true, result, snapshot };
  });
}
