import { trackEvent } from "@/lib/repository";
import { cleanText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { name?: string; id?: string } | null;
  const name = cleanText(body?.name, 60);
  if (name) {
    await trackEvent(name, { id: cleanText(body?.id, 80) }).catch(() => undefined);
  }
  return new Response(null, { status: 204 });
}
