import { buildSeed } from "./seed-data";
import { applyOverrides, OVERRIDE_COLLECTIONS, overridesEnabled, readOverrides, writeOverrides, type Overrides } from "./overrides";
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
