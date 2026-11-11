import { cleanText } from "./sanitize";
import { safeXUrl, xStatusId } from "./safe-url";

export type FetchedPost = {
  text: string;
  authorName: string;
  authorHandle: string;
  thumbSrc: string | null;
  durationSec: number | null;
  postedAt: string | null;
  metrics: {
    impressions: number;
    likes: number;
    reposts: number;
    replies: number;
    bookmarks: number;
    quotes: number;
  };
};

export interface MetricsProvider {
  readonly name: string;
  fetchPost(xUrl: string): Promise<FetchedPost>;
}

function num(value: unknown): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function durationOf(value: unknown): number | null {
  const n = num(value);
  if (!n) return null;
  const seconds = n > 1000 ? n / 1000 : n;
  return Math.round(seconds * 10) / 10;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function thumbFrom(tweet: Record<string, unknown>): { src: string | null; durationSec: number | null } {
  const media = asRecord(tweet.media);
  const all = Array.isArray(media?.all) ? media.all : [];
  const first = asRecord(all[0]);
  if (first) {
    const src = [first.thumbnail_url, first.preview_url, first.url].find((item) => typeof item === "string") as
      | string
      | undefined;
    return { src: src ?? null, durationSec: durationOf(first.duration ?? first.duration_millis) };
  }
  const extended = Array.isArray(tweet.media_extended) ? tweet.media_extended : [];
  const ext = asRecord(extended[0]);
  if (ext) {
    const src = [ext.thumbnail_url, ext.url].find((item) => typeof item === "string") as string | undefined;
    return { src: src ?? null, durationSec: durationOf(ext.duration_millis ?? ext.duration) };
  }
  const urls = Array.isArray(tweet.mediaURLs) ? tweet.mediaURLs.find((item) => typeof item === "string") : null;
  return { src: typeof urls === "string" ? urls : null, durationSec: null };
}

function postedAtOf(tweet: Record<string, unknown>): string | null {
  const raw = tweet.created_at ?? tweet.date ?? tweet.created_timestamp;
  if (typeof raw === "number") {
    const date = new Date(raw > 10_000_000_000 ? raw : raw * 1000);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (typeof raw === "string") {
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}

export function mapTweet(tweet: Record<string, unknown>): FetchedPost {
  const author = asRecord(tweet.author);
  const thumb = thumbFrom(tweet);
  return {
    text: cleanText(tweet.text ?? tweet.raw_text ?? "", 2000),
    authorName: cleanText(author?.name ?? tweet.user_name ?? "", 80),
    authorHandle: cleanText(author?.screen_name ?? tweet.user_screen_name ?? "", 40).replace(/^@/, ""),
    thumbSrc: thumb.src,
    durationSec: thumb.durationSec,
    postedAt: postedAtOf(tweet),
    metrics: {
      impressions: num(tweet.views ?? tweet.impressions ?? tweet.view_count),
      likes: num(tweet.likes ?? tweet.favorite_count),
      reposts: num(tweet.retweets ?? tweet.reposts ?? tweet.retweet_count),
      replies: num(tweet.replies ?? tweet.reply_count),
      bookmarks: num(tweet.bookmarks ?? tweet.bookmark_count),
      quotes: num(tweet.quotes ?? tweet.quote_count),
    },
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: { accept: "application/json", "user-agent": "TirtaVEXPortfolio/1.0" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Provider responded ${response.status}`);
  return response.json();
}

async function fromOEmbed(xUrl: string): Promise<FetchedPost> {
  const endpoint = `https://publish.twitter.com/oembed?omit_script=1&url=${encodeURIComponent(xUrl)}`;
  const json = asRecord(await fetchJson(endpoint));
  if (!json) throw new Error("oEmbed returned nothing");
  const html = typeof json.html === "string" ? json.html : "";
  const text = cleanText(html.replace(/<br\s*\/?>/gi, "\n"), 2000);
  return {
    text,
    authorName: cleanText(json.author_name ?? "", 80),
    authorHandle: "",
    thumbSrc: null,
    durationSec: null,
    postedAt: null,
    metrics: { impressions: 0, likes: 0, reposts: 0, replies: 0, bookmarks: 0, quotes: 0 },
  };
}

export const fxTwitterProvider: MetricsProvider = {
  name: "fxtwitter",
  async fetchPost(xUrl: string) {
    const safe = safeXUrl(xUrl);
    const id = xStatusId(safe);
    if (!safe || !id) throw new Error("Only x.com or twitter.com status URLs can be fetched");
    const endpoints = [`https://api.fxtwitter.com/status/${id}`, `https://api.vxtwitter.com/Twitter/status/${id}`];
    let lastError = "Metrics provider failed";
    for (const endpoint of endpoints) {
      try {
        const json = asRecord(await fetchJson(endpoint));
        const tweet = asRecord(json?.tweet) ?? json;
        if (!tweet || typeof tweet.text !== "string" && typeof tweet.raw_text !== "string") {
          lastError = "Provider payload had no post text";
          continue;
        }
        return mapTweet(tweet);
      } catch (error) {
        lastError = error instanceof Error ? error.message : lastError;
      }
    }
    try {
      return await fromOEmbed(safe);
    } catch {
      throw new Error(lastError);
    }
  },
};

export const manualProvider: MetricsProvider = {
  name: "manual",
  async fetchPost() {
    throw new Error("METRICS_PROVIDER=manual does not call a remote source");
  },
};

export function getMetricsProvider(): MetricsProvider {
  return (process.env.METRICS_PROVIDER || "fxtwitter").toLowerCase() === "manual" ? manualProvider : fxTwitterProvider;
}
