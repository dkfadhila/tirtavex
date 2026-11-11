import { rejectUnlessJson, requireAdmin, run } from "@/lib/api";
import { getAdminSnapshot } from "@/lib/content";
import { mutate } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const type = rejectUnlessJson(request);
  if (type) return type;
  const body = await request.json().catch(() => null);
  return run(async () => {
    const result = await mutate(body);
    const snapshot = await getAdminSnapshot();
    return { ok: true, result, snapshot };
  });
}
