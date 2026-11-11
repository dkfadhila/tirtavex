import { json } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { trackEvent } from "@/lib/repository";
import { cleanText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

const NAMES = new Set(["work_card_click", "filter_change", "contact_click", "collab_form_submit", "outbound_x_click"]);

export async function POST(request: Request) {
  const allowed = await rateLimit(`ev:${clientIp(request)}`, 60, 60_000).catch(() => false);
  if (!allowed) return json({ error: "Too many requests" }, 429);
  const body = (await request.json().catch(() => null)) as { name?: string; id?: string } | null;
  const name = cleanText(body?.name, 40);
  if (name && NAMES.has(name)) {
    await trackEvent(name, { id: cleanText(body?.id, 80) }).catch(() => undefined);
  }
  return new Response(null, { status: 204 });
}
