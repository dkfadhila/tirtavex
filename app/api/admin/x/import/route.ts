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
    const customThumb = typeof raw.thumbSrc === "string" && raw.thumbSrc.trim() ? raw.thumbSrc.trim() : null;
    const isCampaign = Boolean(raw.isCampaign);
    const category = isCampaign ? "contest" : (typeof raw.category === "string" ? raw.category : "ai-video");
    const rawTags = Array.isArray(raw.tags) ? raw.tags : [];
    const tags = isCampaign && !rawTags.includes("Campaign") ? [...rawTags, "Campaign"] : rawTags;

    const workData: Record<string, unknown> = {
      title: (typeof raw.title === "string" && raw.title.trim()) || preview.title || preview.text.slice(0, 80),
      xUrl: preview.xUrl,
      note: (typeof raw.note === "string" && raw.note.trim()) || preview.text.slice(0, 220),
      lane: raw.lane || "generation",
      category,
      tags,
      pinned: Boolean(raw.pinned),
      placeholder: false,
      status: "live",
      authorName: preview.authorName || "Tirta",
      authorHandle: preview.authorHandle || "tirtaVEX",
      thumb: {
        src: customThumb || preview.thumbSrc || "",
        blurhash: "",
        dominant: "#10B981",
        w: preview.thumbWidth || 1280,
        h: preview.thumbHeight || 720,
        durationSec: Math.round(preview.durationSec || 0),
      },
      videoUrl: preview.videoUrl || "",
      metrics: { ...preview.metrics, updatedAt: new Date().toISOString() },
      postedAt: preview.postedAt || new Date().toISOString(),
    };

    const workRes = await mutateOverrides({
      op: "create",
      type: "work",
      data: workData,
    });

    if (isCampaign) {
      await mutateOverrides({
        op: "create",
        type: "contests",
        data: {
          name: (typeof raw.campaignName === "string" && raw.campaignName.trim()) || String(workData.title),
          organizer: (typeof raw.organizer === "string" && raw.organizer.trim()) || "Campaign",
          date: (preview.postedAt || new Date().toISOString()).slice(0, 10),
          year: new Date(preview.postedAt || Date.now()).getFullYear(),
          placement: "",
          result: `Published · ${preview.metrics.impressions || 0} views`,
          link: preview.xUrl,
          entryPostId: (workRes as { id?: string })?.id || "",
          thumb: customThumb || preview.thumbSrc || "",
          xUrl: preview.xUrl,
          placeholder: false,
          hidden: false,
        },
      });
    }

    const snapshot = await getAdminSnapshot();
    return { created: true, snapshot };
  });
}
