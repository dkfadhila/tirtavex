import { getContent } from "@/lib/content";
import { getLiveXProfile } from "@/lib/social";
import { json, publicCache } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getContent();
  const best = content.work.find((item) => item.id === content.stats.bestPostId) ?? null;

  const xRow = content.stats.platforms.find((row) => row.platform === "x");
  const live = xRow ? await getLiveXProfile(xRow.handle || "tirtaVEX") : null;

  const platforms = live
    ? content.stats.platforms.map((row) =>
        row.platform === "x"
          ? {
              ...row,
              followers: live.followers,
              videos: live.posts,
              likes: live.likes,
              placeholder: false,
            }
          : row,
      )
    : content.stats.platforms;

  return json(
    {
      ...content.stats,
      platforms,
      live,
      bestPost: best
        ? {
            id: best.id,
            title: best.title,
            xUrl: best.xUrl,
            impressions: best.metrics.impressions,
          }
        : null,
      agent: content.agent,
    },
    200,
    publicCache,
  );
}
