import { json, run } from "@/lib/api";
import { databaseUrl } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { saveSubmission } from "@/lib/repository";
import { cleanText } from "@/lib/sanitize";
import { safeHttpUrl } from "@/lib/safe-url";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const allowed = await rateLimit(`contact:${clientIp(request)}`, 5, 60 * 60 * 1000).catch(() => true);
  if (!allowed) return json({ error: "Too many briefs. Try again later." }, 429);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: "Invalid JSON" }, 400);
  if (typeof body.website === "string" && body.website.trim()) return json({ ok: true });
  const name = cleanText(body.name, 80);
  const project = cleanText(body.project, 160);
  if (!name || !project) return json({ error: "Name and project are required." }, 400);
  const linkRaw = cleanText(body.link, 300);
  const link = linkRaw ? safeHttpUrl(linkRaw) : "";
  if (linkRaw && !link) return json({ error: "Link must be an http(s) URL." }, 400);
  if (!databaseUrl()) return json({ error: "Briefs are stored once a database is connected. Email instead for now." }, 503);
  return run(async () => {
    const saved = await saveSubmission({
      name,
      project,
      budget: cleanText(body.budget, 80),
      link: link || "",
      message: cleanText(body.message, 2000),
    });
    const hook = process.env.CONTACT_WEBHOOK_URL;
    if (hook && safeHttpUrl(hook)) {
      await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, project, budget: cleanText(body.budget, 80), link, message: cleanText(body.message, 2000) }),
        signal: AbortSignal.timeout(4000),
      }).catch(() => undefined);
    }
    return { ok: true, id: saved.id };
  });
}
