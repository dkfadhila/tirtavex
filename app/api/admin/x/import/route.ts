import { rejectUnlessJson, requireAdmin, run } from "@/lib/api";
import { getAdminSnapshot } from "@/lib/content";
import { databaseUrl } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { json } from "@/lib/api";
import { mutateOverrides, overridesWritable } from "@/lib/overrides-mutate";
import { addWorkByX, previewX } from "@/lib/repository";

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
    if (databaseUrl()) {
      const result = await addWorkByX(body);
      const snapshot = await getAdminSnapshot();
      return { ...result, snapshot };
    }
    if (!overridesWritable()) throw new Error("Storage is not connected. Nothing was saved.");
    const raw = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
    const url = typeof raw.xUrl === "string" ? raw.xUrl : typeof raw.url === "string" ? raw.url : "";
    const preview = await previewX(url);
    await mutateOverrides({
      op: "create",
      type: "work",
      data: {
        title: preview.title || preview.text.slice(0, 80),
        xUrl: preview.xUrl,
        note: preview.text.slice(0, 220),
        lane: raw.lane || "generation",
        category: raw.category || "ai-video",
        tags: Array.isArray(raw.tags) ? raw.tags : [],
        pinned: Boolean(raw.pinned),
        placeholder: false,
        status: "live",
        authorName: preview.authorName || "Tirta",
        authorHandle: preview.authorHandle || "tirtaVEX",
        thumb: {
          src: preview.thumbSrc || "",
          blurhash: "",
          dominant: "#10B981",
          w: preview.thumbWidth || 1280,
          h: preview.thumbHeight || 720,
          durationSec: Math.round(preview.durationSec || 0),
        },
        videoUrl: preview.videoUrl || "",
        metrics: { ...preview.metrics, updatedAt: new Date().toISOString() },
        postedAt: preview.postedAt || new Date().toISOString(),
      },
    });
    const snapshot = await getAdminSnapshot();
    return { created: true, snapshot };
  });
}
