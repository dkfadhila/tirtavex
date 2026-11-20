/**
 * X (pbs.twimg.com) serves resized WebP copies of post media and video posters
 * via `?format=webp&name=<size>`. The originals can be 4K JPEGs (100–800 KB);
 * `small` (680w) is ~70% lighter; `900x900` and `medium` (1200w) cover larger and retina cards.
 */
const RESIZABLE = /^\/(media|amplify_video_thumb|ext_tw_video_thumb|tweet_video_thumb)\//;

export type TwimgSize = "small" | "900x900" | "medium" | "large";

function parse(src: string) {
  try {
    const url = new URL(src);
    if (url.hostname !== "pbs.twimg.com" || !RESIZABLE.test(url.pathname)) return null;
    return url;
  } catch {
    return null;
  }
}

export function twimg(src: string, size: TwimgSize = "small") {
  const url = parse(src);
  if (!url) return src;
  url.search = "";
  url.searchParams.set("format", "webp");
  url.searchParams.set("name", size);
  return url.toString();
}

export function twimgSrcSet(src: string) {
  if (!parse(src)) return undefined;
  return `${twimg(src, "small")} 680w, ${twimg(src, "900x900")} 900w, ${twimg(src, "medium")} 1200w`;
}
