import { json, rejectUnlessJson, requireAdmin, run } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { previewX } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const type = rejectUnlessJson(request);
  if (type) return type;
  const allowed = await rateLimit(`xpreview:${clientIp(request)}`, 20, 60_000).catch(() => false);
  if (!allowed) return json({ error: "Too many previews." }, 429);
  const body = (await request.json().catch(() => null)) as { url?: string } | null;
  return run(() => previewX(body?.url ?? ""));
}
