import { buildSeed } from "./seed-data";
import { applyOverrides, OVERRIDE_COLLECTIONS, overridesEnabled, readOverrides, writeOverrides, type Overrides } from "./overrides";
import { getMetricsProvider } from "./metrics";
import { safeXUrl } from "./safe-url";
import { compactNumber } from "./format";
import type { SiteContent } from "./types";

/** Edits the JSON overrides file used when no Postgres database is attached. */

function httpError(message: string) {
  const error = new Error(message) as Error & { status?: number };
  error.status = 400;
  return error;
}

function newId(type: string) {
  const prefix: Record<string, string> = {
    work: "work",
    contests: "contest",
    projects: "project",
    articles: "article",
    ambassadors: "ambassador",
    tools: "tool",
    links: "link",
    collabs: "collab",
    programs: "program",
    testimonials: "quote",
    process: "step",
  };
  return `${prefix[type] || type}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export async function mutateOverrides(body: unknown) {
  const raw = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const op = typeof raw.op === "string" ? raw.op : "";
  const overrides: Overrides = await readOverrides({ fresh: true });
  const effective: SiteContent = applyOverrides(buildSeed(), overrides);
  overrides.collections = overrides.collections || {};

  if (op === "settings") {
    const data = (raw.data && typeof raw.data === "object" ? raw.data : {}) as Record<string, unknown>;
    overrides.settings = { ...(overrides.settings || {}), ...data };
    await writeOverrides(overrides);
    return { settings: overrides.settings };
  }
  if (op === "stats") {
    const data = (raw.data && typeof raw.data === "object" ? raw.data : {}) as Record<string, unknown>;
    overrides.stats = { ...data };
    await writeOverrides(overrides);
    return { stats: overrides.stats };
  }
  if (op === "legal") {
    const slug = raw.slug === "privacy" ? "privacy" : "terms";
    const data = (raw.data && typeof raw.data === "object" ? raw.data : {}) as Record<string, unknown>;
    overrides.legal = { ...(overrides.legal || {}), [slug]: { ...(overrides.legal?.[slug] || {}), ...data } };
    await writeOverrides(overrides);
    return { legal: overrides.legal[slug] };
  }

  const type = typeof raw.type === "string" ? raw.type : "";
  if (!(OVERRIDE_COLLECTIONS as readonly string[]).includes(type)) throw httpError("Unknown content type");
  const list = [...((effective as unknown as Record<string, unknown[]>)[type] || [])] as Record<string, unknown>[];

  if (op === "create") {
    const data = (raw.data && typeof raw.data === "object" ? raw.data : {}) as Record<string, unknown>;
    const item: Record<string, unknown> = { ...data, id: newId(type), sortOrder: list.length, hidden: Boolean(data.hidden) };
    if (type === "work") {
      item.addedAt = new Date().toISOString();
      item.postedAt = item.postedAt || new Date().toISOString();
      item.status = item.status || "live";
      list.unshift(item);
      list.forEach((entry, index) => {
        entry.sortOrder = index;
      });
    } else {
      list.push(item);
    }
  } else if (op === "update") {
    const id = typeof raw.id === "string" ? raw.id : "";
    const index = list.findIndex((entry) => String(entry.id) === id);
    if (index < 0) throw httpError("Not found");
    const data = (raw.data && typeof raw.data === "object" ? raw.data : {}) as Record<string, unknown>;
    list[index] = { ...list[index], ...data, id };
  } else if (op === "delete") {
    const id = typeof raw.id === "string" ? raw.id : "";
    const next = list.filter((entry) => String(entry.id) !== id);
    if (next.length === list.length) throw httpError("Not found");
    list.length = 0;
    list.push(...next);
  } else if (op === "reorder") {
    if (!Array.isArray(raw.ids) || raw.ids.some((id) => typeof id !== "string")) throw httpError("ids must be a string array");
    const order = raw.ids as string[];
    list.sort((a, b) => order.indexOf(String(a.id)) - order.indexOf(String(b.id)));
    list.forEach((entry, index) => {
      entry.sortOrder = index;
    });
  } else {
    throw httpError("Unknown operation");
  }

  overrides.collections[type] = list;
  await writeOverrides(overrides);
  return { type, count: list.length };
}

export function overridesWritable() {
  return overridesEnabled();
}

export async function refreshMetricsOverrides(options: { id?: string; limit?: number } = {}) {
  const overrides: Overrides = await readOverrides({ fresh: true });
  const effective: SiteContent = applyOverrides(buildSeed(), overrides);
  const workList = [...(effective.work || [])];
  const contestList = [...(effective.contests || [])];

  const provider = getMetricsProvider();
  if (provider.name === "manual") {
    throw httpError("METRICS_PROVIDER=manual cannot fetch remote metrics");
  }

  let targets = workList;
  if (options.id) {
    targets = workList.filter((w) => String(w.id) === options.id);
    if (!targets.length) throw httpError("Work item not found");
  } else {
    const limit = options.limit && options.limit > 0 ? options.limit : 25;
    targets = workList.slice(0, limit);
  }

  let updatedCount = 0;
  const now = new Date().toISOString();

  // Run concurrently in small batches of 6
  const BATCH_SIZE = 6;
  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (item) => {
        const xUrl = typeof item.xUrl === "string" ? safeXUrl(item.xUrl) : null;
        if (!xUrl) return;
        try {
          const fetched = await provider.fetchPost(xUrl);
          item.metrics = {
            impressions: fetched.metrics.impressions,
            likes: fetched.metrics.likes,
            reposts: fetched.metrics.reposts,
            replies: fetched.metrics.replies,
            bookmarks: fetched.metrics.bookmarks,
            quotes: fetched.metrics.quotes,
            updatedAt: now,
          };
          if (!item.videoUrl && fetched.videoUrl) {
            item.videoUrl = fetched.videoUrl;
          }
          if ((!item.thumb?.src || item.thumb.src.startsWith("http")) && fetched.thumbSrc) {
            item.thumb = {
              ...item.thumb,
              src: fetched.thumbSrc,
              w: fetched.thumbWidth || item.thumb?.w || 1280,
              h: fetched.thumbHeight || item.thumb?.h || 720,
              durationSec: Math.round(fetched.durationSec || item.thumb?.durationSec || 0),
            };
          }
          // Update matching contests
          for (const c of contestList) {
            if (c.entryPostId === item.id || c.xUrl === item.xUrl || c.link === item.xUrl) {
              c.result = `Published · ${compactNumber(fetched.metrics.impressions)} views`;
            }
          }
          updatedCount++;
        } catch (e) {
          console.warn("[metrics-refresh] failed for", item.id, item.xUrl, e instanceof Error ? e.message : e);
        }
      })
    );
  }

  overrides.collections = overrides.collections || {};
  overrides.collections.work = workList;
  overrides.collections.contests = contestList;
  await writeOverrides(overrides);

  return { updatedCount, totalTargets: targets.length };
}
