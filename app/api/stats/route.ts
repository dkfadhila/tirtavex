import { getContent } from "@/lib/content";
import { json, publicCache } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getContent();
  const best = content.work.find((item) => item.id === content.stats.bestPostId) ?? null;
  return json({ ...content.stats, bestPost: best ? { id: best.id, title: best.title, xUrl: best.xUrl, impressions: best.metrics.impressions } : null, agent: content.agent }, 200, publicCache);
}
