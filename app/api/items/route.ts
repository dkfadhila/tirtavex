import { getContent } from "@/lib/content";
import { json, publicCache } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || "all";
  const sort = url.searchParams.get("sort") || "latest";
  const cursor = Math.max(0, Number(url.searchParams.get("cursor") || "0") || 0);
  const limit = Math.min(24, Math.max(1, Number(url.searchParams.get("limit") || "12") || 12));
  const content = await getContent();
  let items = content.work.filter((item) => category === "all" || item.category === category);
  items = [...items].sort((a, b) => {
    if (sort === "liked") return b.metrics.likes - a.metrics.likes;
    if (sort === "viewed") return b.metrics.impressions - a.metrics.impressions;
    const pinned = Number(b.pinned) - Number(a.pinned);
    if (pinned) return pinned;
    return +new Date(b.postedAt) - +new Date(a.postedAt);
  });
  const slice = items.slice(cursor, cursor + limit);
  return json({ items: slice, nextCursor: cursor + limit < items.length ? cursor + limit : null }, 200, publicCache);
}
