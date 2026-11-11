import { rejectUnlessJson, requireAdmin, run } from "@/lib/api";
import { getAdminSnapshot } from "@/lib/content";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { json } from "@/lib/api";
import { addWorkByX } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const type = rejectUnlessJson(request);
  if (type) return type;
  const allowed = await rateLimit(`ximport:${clientIp(request)}`, 20, 60_000).catch(() => false);
  if (!allowed) return json({ error: "Too many imports." }, 429);
  const body = await request.json().catch(() => null);
  return run(async () => {
    const result = await addWorkByX(body);
    const snapshot = await getAdminSnapshot();
    return { ...result, snapshot };
  });
}
