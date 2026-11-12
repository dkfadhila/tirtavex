import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, getSql } from "./db";
import { mapArticle, mapProject, mapStats, mapWork, mergeSettings, normalizePlatforms, toIso } from "./map";
import type { FetchedPost } from "./metrics";
import { getMetricsProvider } from "./metrics";
import { buildSeed } from "./seed-data";
import {
  agentState,
  ambassadors,
  articles,
  collabs,
  contests,
  analyticsEvents,
  events,
  legalPages,
  links,
  processSteps,
  programs,
  projects,
  siteSettings,
  stats,
  submissions,
  testimonials,
  tools,
  workItems,
} from "./schema";
import { cleanBlock, cleanLines, cleanText } from "./sanitize";
import { safeColor, safeHttpUrl, safeXUrl } from "./safe-url";
import { slugify } from "./format";
import type {
  Ambassador,
  Article,
  Collab,
  Contest,
  CustomLink,
  ProcessStep,
  Program,
  Project,
  ResourceType,
  SiteContent,
  Stats,
  Testimonial,
  Tool,
  WorkItem,
} from "./types";
import { CATEGORIES, LANES, PARTNER_ROLES, PLACEMENTS, RESOURCE_TYPES } from "./types";
import type { PlatformStat } from "./types";

export class HttpError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function dbOrThrow() {
  const db = getDb();
  if (!db) throw new HttpError("DATABASE_URL is not configured", 503);
  return db;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function nid(prefix: string) {
  return `${prefix}_${randomUUID().slice(0, 10)}`;
}

function num(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function choice<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function parsePlacement(value: unknown): Contest["placement"] {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return (PLACEMENTS as readonly string[]).includes(trimmed) ? (trimmed as Contest["placement"]) : "";
}

function mediaRef(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("..")) return trimmed;
  return safeHttpUrl(trimmed) ?? fallback;
}

function dateOr(value: unknown, fallback: string) {
  if (typeof value === "string" && !Number.isNaN(new Date(value).getTime())) return new Date(value).toISOString();
  return fallback;
}

async function emit(type: string, payload: unknown) {
  const db = dbOrThrow();
  await db.insert(events).values({ type, payload: JSON.parse(JSON.stringify(payload ?? {})) });
}

function isResource(value: string): value is ResourceType {
  return (RESOURCE_TYPES as readonly string[]).includes(value);
}

function parseWork(input: unknown, existing?: WorkItem): Omit<WorkItem, "id" | "sortOrder"> & { id?: string; sortOrder?: number } {
  const raw = record(input);
  const thumb = { ...existing?.thumb, ...record(raw.thumb) };
  const metrics = { ...existing?.metrics, ...record(raw.metrics) };
  const xUrl = safeXUrl(typeof raw.xUrl === "string" ? raw.xUrl : existing?.xUrl);
  if (!xUrl) throw new HttpError("Work needs an https://x.com or twitter.com URL");
  const title = cleanText(raw.title ?? existing?.title, 180);
  if (!title) throw new HttpError("Title is required");
  const now = new Date().toISOString();
  return {
    id: existing?.id,
    xUrl,
    title,
    note: cleanText(raw.note ?? existing?.note ?? "", 280),
    category: choice(raw.category ?? existing?.category, CATEGORIES, "ai-video"),
    lane: choice(raw.lane ?? existing?.lane, LANES, "generation"),
    videoUrl: safeHttpUrl(typeof raw.videoUrl === "string" ? raw.videoUrl : existing?.videoUrl) ?? "",
    placeholder: Boolean(raw.placeholder ?? existing?.placeholder ?? false),
    tags: cleanLines(raw.tags ?? existing?.tags ?? [], 12),
    pinned: Boolean(raw.pinned ?? existing?.pinned ?? false),
    thumb: {
      src: safeHttpUrl(typeof thumb.src === "string" ? thumb.src : "") ?? "",
      blurhash: cleanText(typeof thumb.blurhash === "string" ? thumb.blurhash : "", 80),
      dominant: safeColor(typeof thumb.dominant === "string" ? thumb.dominant : existing?.thumb.dominant),
      w: Math.round(num(thumb.w, existing?.thumb.w ?? 1280)),
      h: Math.round(num(thumb.h, existing?.thumb.h ?? 720)),
      durationSec: thumb.durationSec == null ? (existing?.thumb.durationSec ?? null) : num(thumb.durationSec),
    },
    authorName: cleanText(raw.authorName ?? existing?.authorName ?? "", 80),
    authorHandle: cleanText(raw.authorHandle ?? existing?.authorHandle ?? "", 40).replace(/^@/, ""),
    metrics: {
      impressions: num(metrics.impressions, existing?.metrics.impressions ?? 0),
      likes: num(metrics.likes, existing?.metrics.likes ?? 0),
      reposts: num(metrics.reposts, existing?.metrics.reposts ?? 0),
      replies: num(metrics.replies, existing?.metrics.replies ?? 0),
      bookmarks: num(metrics.bookmarks, existing?.metrics.bookmarks ?? 0),
      quotes: num(metrics.quotes, existing?.metrics.quotes ?? 0),
      updatedAt: dateOr(metrics.updatedAt, existing?.metrics.updatedAt ?? now),
    },
    postedAt: dateOr(raw.postedAt, existing?.postedAt ?? now),
    addedAt: existing?.addedAt ?? now,
    status: choice(raw.status ?? existing?.status, ["live", "hidden", "deleted"] as const, "live"),
    sortOrder: existing?.sortOrder,
  };
}

function workRow(item: WorkItem) {
  return {
    id: item.id,
    xUrl: item.xUrl,
    title: item.title,
    note: item.note,
    category: item.category,
    lane: item.lane,
    videoUrl: item.videoUrl,
    placeholder: item.placeholder,
    tags: item.tags,
    pinned: item.pinned,
    thumbSrc: item.thumb.src,
    thumbBlurhash: item.thumb.blurhash,
    thumbDominant: item.thumb.dominant,
    thumbW: item.thumb.w || 1280,
    thumbH: item.thumb.h || 720,
    durationSec: item.thumb.durationSec,
    authorName: item.authorName,
    authorHandle: item.authorHandle,
    impressions: item.metrics.impressions,
    likes: item.metrics.likes,
    reposts: item.metrics.reposts,
    replies: item.metrics.replies,
    bookmarks: item.metrics.bookmarks,
    quotes: item.metrics.quotes,
    metricsUpdatedAt: new Date(item.metrics.updatedAt),
    postedAt: new Date(item.postedAt),
    addedAt: new Date(item.addedAt),
    status: item.status,
    sortOrder: item.sortOrder,
  };
}

async function nextOrder(ids: { sortOrder: number }[]) {
  return ids.reduce((max, row) => Math.max(max, row.sortOrder), -1) + 1;
}

async function capPins(kind: "work" | "articles", keepId: string) {
  const db = dbOrThrow();
  if (kind === "work") {
    const rows = await db.select().from(workItems).where(eq(workItems.pinned, true));
    const extras = rows.filter((row) => row.id !== keepId).sort((a, b) => b.sortOrder - a.sortOrder);
    for (const extra of extras.slice(2)) {
      await db.update(workItems).set({ pinned: false }).where(eq(workItems.id, extra.id));
    }
    return;
  }
  const rows = await db.select().from(articles).where(eq(articles.pinned, true));
  const extras = rows.filter((row) => row.id !== keepId).sort((a, b) => b.sortOrder - a.sortOrder);
  for (const extra of extras.slice(2)) {
    await db.update(articles).set({ pinned: false }).where(eq(articles.id, extra.id));
  }
}

async function uniqueProjectSlug(base: string, currentId?: string) {
  const db = dbOrThrow();
  const root = slugify(base);
  let slug = root;
  let n = 2;
  while (n < 50) {
    const found = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, slug)).limit(1);
    if (!found[0] || found[0].id === currentId) return slug;
    slug = `${root}-${n++}`;
  }
  return `${root}-${randomUUID().slice(0, 4)}`;
}

async function uniqueArticleSlug(base: string, currentId?: string) {
  const db = dbOrThrow();
  const root = slugify(base);
  let slug = root;
  let n = 2;
  while (n < 50) {
    const found = await db.select({ id: articles.id }).from(articles).where(eq(articles.slug, slug)).limit(1);
    if (!found[0] || found[0].id === currentId) return slug;
    slug = `${root}-${n++}`;
  }
  return `${root}-${randomUUID().slice(0, 4)}`;
}

function parseCollab(input: unknown, existing?: Collab): Collab {
  const raw = record(input);
  const name = cleanText(raw.name ?? existing?.name, 120);
  if (!name) throw new HttpError("Name is required");
  return {
    id: existing?.id ?? nid("collab"),
    name,
    type: choice(raw.type ?? existing?.type, ["brand", "creator", "project"] as const, "brand"),
    logo: safeHttpUrl(typeof raw.logo === "string" ? raw.logo : existing?.logo) ?? "",
    summary: cleanBlock(raw.summary ?? existing?.summary ?? "", 600),
    result: cleanText(raw.result ?? existing?.result ?? "", 300),
    date: cleanText(raw.date ?? existing?.date ?? "", 40),
    postIds: cleanLines(raw.postIds ?? existing?.postIds ?? [], 20),
    hidden: Boolean(raw.hidden ?? existing?.hidden ?? false),
    sortOrder: existing?.sortOrder ?? 0,
  };
}

function parseProgram(input: unknown, existing?: Program): Program {
  const raw = record(input);
  const name = cleanText(raw.name ?? existing?.name, 140);
  if (!name) throw new HttpError("Name is required");
  return {
    id: existing?.id ?? nid("program"),
    name,
    role: cleanText(raw.role ?? existing?.role ?? "", 80),
    start: cleanText(raw.start ?? existing?.start ?? "", 40),
    end: cleanText(raw.end ?? existing?.end ?? "", 40),
    status: choice(raw.status ?? existing?.status, ["active", "completed"] as const, "active"),
    highlights: cleanLines(raw.highlights ?? existing?.highlights ?? [], 12),
    postIds: cleanLines(raw.postIds ?? existing?.postIds ?? [], 20),
    impressions: num(raw.impressions, existing?.impressions ?? 0),
    likes: num(raw.likes, existing?.likes ?? 0),
    hidden: Boolean(raw.hidden ?? existing?.hidden ?? false),
    sortOrder: existing?.sortOrder ?? 0,
  };
}

function parseAmbassador(input: unknown, existing?: Ambassador): Ambassador {
  const raw = record(input);
  const project = cleanText(raw.project ?? existing?.project, 140);
  if (!project) throw new HttpError("Project is required");
  return {
    id: existing?.id ?? nid("amb"),
    project,
    url: safeHttpUrl(typeof raw.url === "string" ? raw.url : existing?.url) ?? "",
    title: cleanText(raw.title ?? existing?.title ?? "", 80),
    region: cleanText(raw.region ?? existing?.region ?? "", 80),
    start: cleanText(raw.start ?? existing?.start ?? "", 40),
    status: choice(raw.status ?? existing?.status, ["active", "past"] as const, "active"),
    duties: cleanLines(raw.duties ?? existing?.duties ?? [], 12),
    postIds: cleanLines(raw.postIds ?? existing?.postIds ?? [], 20),
    logo: mediaRef(raw.logo, existing?.logo ?? ""),
    summary: cleanBlock(raw.summary ?? existing?.summary ?? "", 400),
    roleType: choice(raw.roleType ?? existing?.roleType, PARTNER_ROLES, "ambassador"),
    placeholder: Boolean(raw.placeholder ?? existing?.placeholder ?? false),
    hidden: Boolean(raw.hidden ?? existing?.hidden ?? false),
    sortOrder: existing?.sortOrder ?? 0,
  };
}

async function parseProject(input: unknown, existing?: Project): Promise<Project> {
  const raw = record(input);
  const name = cleanText(raw.name ?? existing?.name, 140);
  if (!name) throw new HttpError("Name is required");
  const slug = await uniqueProjectSlug(cleanText(raw.slug || name, 80), existing?.id);
  const xUrl = typeof raw.xUrl === "string" && raw.xUrl.trim() ? safeXUrl(raw.xUrl) : "";
  if (typeof raw.xUrl === "string" && raw.xUrl.trim() && !xUrl) throw new HttpError("Project xUrl must be an X or Twitter URL");
  return {
    id: existing?.id ?? nid("project"),
    slug,
    name,
    year: Math.round(num(raw.year, existing?.year ?? new Date().getUTCFullYear())),
    client: cleanText(raw.client ?? existing?.client ?? "", 120),
    date: cleanText(raw.date ?? existing?.date ?? "", 40),
    industry: cleanText(raw.industry ?? existing?.industry ?? "", 80),
    services: cleanLines(raw.services ?? existing?.services ?? [], 8),
    budget: cleanText(raw.budget ?? existing?.budget ?? "", 80),
    aiTech: cleanText(raw.aiTech ?? existing?.aiTech ?? "", 120),
    overview: cleanBlock(raw.overview ?? existing?.overview ?? "", 1200),
    challenge: cleanBlock(raw.challenge ?? existing?.challenge ?? "", 1200),
    approach: cleanBlock(raw.approach ?? existing?.approach ?? "", 1200),
    achievements: cleanLines(raw.achievements ?? existing?.achievements ?? [], 12),
    outcome: cleanText(raw.outcome ?? existing?.outcome ?? "", 300),
    scope: cleanLines(raw.scope ?? existing?.scope ?? [], 8),
    cover: safeHttpUrl(typeof raw.cover === "string" ? raw.cover : existing?.cover) ?? "",
    accent: safeColor(typeof raw.accent === "string" ? raw.accent : existing?.accent),
    xUrl: xUrl || "",
    websiteUrl: safeHttpUrl(typeof raw.websiteUrl === "string" ? raw.websiteUrl : existing?.websiteUrl) ?? "",
    reviewQuote: cleanText(raw.reviewQuote ?? existing?.reviewQuote ?? "", 400),
    reviewAuthor: cleanText(raw.reviewAuthor ?? existing?.reviewAuthor ?? "", 80),
    reviewRole: cleanText(raw.reviewRole ?? existing?.reviewRole ?? "", 80),
    reviewStat: cleanText(raw.reviewStat ?? existing?.reviewStat ?? "", 20),
    reviewStatLabel: cleanText(raw.reviewStatLabel ?? existing?.reviewStatLabel ?? "", 60),
    featured: Boolean(raw.featured ?? existing?.featured ?? false),
    hidden: Boolean(raw.hidden ?? existing?.hidden ?? false),
    sortOrder: existing?.sortOrder ?? 0,
  };
}

function parseContest(input: unknown, existing?: Contest): Contest {
  const raw = record(input);
  const name = cleanText(raw.name ?? existing?.name, 140);
  if (!name) throw new HttpError("Name is required");
  const xUrl = typeof raw.xUrl === "string" && raw.xUrl.trim() ? safeXUrl(raw.xUrl) : "";
  if (typeof raw.xUrl === "string" && raw.xUrl.trim() && !xUrl) throw new HttpError("Contest link must be an X or Twitter URL");
  return {
    id: existing?.id ?? nid("contest"),
    name,
    organizer: cleanText(raw.organizer ?? existing?.organizer ?? "", 120),
    date: cleanText(raw.date ?? existing?.date ?? "", 40),
    year: Math.round(num(raw.year, existing?.year ?? new Date().getUTCFullYear())),
    placement: parsePlacement(raw.placement ?? existing?.placement),
    result: cleanText(raw.result ?? existing?.result ?? "", 160),
    link: safeHttpUrl(typeof raw.link === "string" ? raw.link : existing?.link) ?? "",
    entryPostId: cleanText(raw.entryPostId ?? existing?.entryPostId ?? "", 40),
    thumb: safeHttpUrl(typeof raw.thumb === "string" ? raw.thumb : existing?.thumb) ?? "",
    xUrl: xUrl || "",
    placeholder: Boolean(raw.placeholder ?? existing?.placeholder ?? false),
    hidden: Boolean(raw.hidden ?? existing?.hidden ?? false),
    sortOrder: existing?.sortOrder ?? 0,
  };
}

function parseTestimonial(input: unknown, existing?: Testimonial): Testimonial {
  const raw = record(input);
  const quote = cleanText(raw.quote ?? existing?.quote, 500);
  if (!quote) throw new HttpError("Quote is required");
  return {
    id: existing?.id ?? nid("quote"),
    quote,
    name: cleanText(raw.name ?? existing?.name ?? "", 80),
    role: cleanText(raw.role ?? existing?.role ?? "", 120),
    sourceUrl: safeXUrl(typeof raw.sourceUrl === "string" ? raw.sourceUrl : existing?.sourceUrl) ?? safeHttpUrl(typeof raw.sourceUrl === "string" ? raw.sourceUrl : existing?.sourceUrl) ?? "",
    stat: cleanText(raw.stat ?? existing?.stat ?? "", 20),
    statLabel: cleanText(raw.statLabel ?? existing?.statLabel ?? "", 40),
    resultLine: cleanText(raw.resultLine ?? existing?.resultLine ?? "", 180),
    hidden: Boolean(raw.hidden ?? existing?.hidden ?? false),
    sortOrder: existing?.sortOrder ?? 0,
  };
}

function parseProcess(input: unknown, existing?: ProcessStep): ProcessStep {
  const raw = record(input);
  const title = cleanText(raw.title ?? existing?.title, 80);
  if (!title) throw new HttpError("Title is required");
  return {
    id: existing?.id ?? nid("step"),
    kicker: cleanText(raw.kicker ?? existing?.kicker ?? "", 40),
    title,
    body: cleanText(raw.body ?? existing?.body ?? "", 400),
    hidden: Boolean(raw.hidden ?? existing?.hidden ?? false),
    sortOrder: existing?.sortOrder ?? 0,
  };
}

function parseTool(input: unknown, existing?: Tool): Tool {
  const raw = record(input);
  const name = cleanText(raw.name ?? existing?.name, 80);
  if (!name) throw new HttpError("Name is required");
  return {
    id: existing?.id ?? nid("tool"),
    name,
    group: cleanText(raw.group ?? existing?.group ?? "", 40),
    kind: choice(raw.kind ?? existing?.kind, ["skill", "tool"] as const, "tool"),
    icon: cleanText(raw.icon ?? existing?.icon ?? "", 200),
    note: cleanText(raw.note ?? existing?.note ?? "", 240),
    hidden: Boolean(raw.hidden ?? existing?.hidden ?? false),
    sortOrder: existing?.sortOrder ?? 0,
  };
}

async function parseArticle(input: unknown, existing?: Article): Promise<Article> {
  const raw = record(input);
  const title = cleanText(raw.title ?? existing?.title, 180);
  if (!title) throw new HttpError("Title is required");
  const kind = choice(raw.kind ?? existing?.kind, ["article", "link"] as const, "article");
  const url = safeHttpUrl(typeof raw.url === "string" ? raw.url : existing?.url) ?? "";
  if (kind === "link" && !url) throw new HttpError("Links need an http(s) URL");
  const slug = kind === "link" ? "" : await uniqueArticleSlug(cleanText((typeof raw.slug === "string" && raw.slug) || title, 80), existing?.id);
  return {
    id: existing?.id ?? nid("article"),
    kind,
    slug,
    title,
    url,
    source: cleanText(raw.source ?? existing?.source ?? "", 80),
    cover: safeHttpUrl(typeof raw.cover === "string" ? raw.cover : existing?.cover) ?? "",
    coverDominant: safeColor(typeof raw.coverDominant === "string" ? raw.coverDominant : existing?.coverDominant),
    publishedAt: dateOr(raw.publishedAt, existing?.publishedAt ?? new Date().toISOString()),
    tags: cleanLines(raw.tags ?? existing?.tags ?? [], 12),
    pinned: Boolean(raw.pinned ?? existing?.pinned ?? false),
    hidden: Boolean(raw.hidden ?? existing?.hidden ?? false),
    excerpt: cleanText(raw.excerpt ?? existing?.excerpt ?? "", 300),
    body: cleanBlock(raw.body ?? existing?.body ?? "", 20000),
    sortOrder: existing?.sortOrder ?? 0,
  };
}

function parseLink(input: unknown, existing?: CustomLink): CustomLink {
  const raw = record(input);
  const label = cleanText(raw.label ?? existing?.label, 80);
  const url = safeHttpUrl(typeof raw.url === "string" ? raw.url : existing?.url);
  if (!label || !url) throw new HttpError("Label and http(s) URL are required");
  return {
    id: existing?.id ?? nid("link"),
    label,
    url,
    group: cleanText(raw.group ?? existing?.group ?? "footer", 40),
    hidden: Boolean(raw.hidden ?? existing?.hidden ?? false),
    sortOrder: existing?.sortOrder ?? 0,
  };
}

async function saveWork(item: WorkItem, isNew: boolean) {
  const db = dbOrThrow();
  const duplicate = await db.select({ id: workItems.id }).from(workItems).where(eq(workItems.xUrl, item.xUrl)).limit(1);
  if (duplicate[0] && duplicate[0].id !== item.id) throw new HttpError("A work item with that X URL already exists", 409);
  if (isNew) await db.insert(workItems).values(workRow(item));
  else await db.update(workItems).set(workRow(item)).where(eq(workItems.id, item.id));
  if (item.pinned) await capPins("work", item.id);
  await emit(isNew ? "item.created" : "item.updated", item.status === "live" ? item : { id: item.id, status: item.status });
  if (item.status !== "live") await emit("item.removed", { id: item.id });
  return item;
}

export async function mutate(body: unknown) {
  const raw = record(body);
  const op = typeof raw.op === "string" ? raw.op : "";
  if (op === "settings") return { settings: await saveSettings(raw.data) };
  if (op === "legal") return { legal: await saveLegal(raw.slug, raw.data) };
  if (op === "stats") return { stats: await saveStats(raw.data) };
  const type = typeof raw.type === "string" ? raw.type : "";
  if (!isResource(type)) throw new HttpError("Unknown content type");
  if (op === "create") return { item: await createResource(type, raw.data) };
  if (op === "update") {
    if (typeof raw.id !== "string") throw new HttpError("Missing id");
    return { item: await updateResource(type, raw.id, raw.data) };
  }
  if (op === "delete") {
    if (typeof raw.id !== "string") throw new HttpError("Missing id");
    await deleteResource(type, raw.id);
    return { deleted: raw.id };
  }
  if (op === "reorder") {
    if (!Array.isArray(raw.ids) || raw.ids.some((id) => typeof id !== "string")) throw new HttpError("ids must be a string array");
    await reorder(type, raw.ids as string[]);
    return { reordered: true };
  }
  throw new HttpError("Unknown operation");
}

async function createResource(type: ResourceType, data: unknown) {
  const db = dbOrThrow();
  if (type === "work") {
    const parsed = parseWork(data);
    const orders = await db.select({ sortOrder: workItems.sortOrder }).from(workItems);
    const item: WorkItem = { ...parsed, id: nid("work"), sortOrder: await nextOrder(orders), addedAt: new Date().toISOString() };
    return saveWork(item, true);
  }
  if (type === "collabs") return insertCollab(parseCollab(data));
  if (type === "programs") return insertProgram(parseProgram(data));
  if (type === "ambassadors") return insertAmbassador(parseAmbassador(data));
  if (type === "projects") return insertProject(await parseProject(data));
  if (type === "contests") return insertContest(parseContest(data));
  if (type === "testimonials") return insertQuote(parseTestimonial(data));
  if (type === "process") return insertProcess(parseProcess(data));
  if (type === "tools") return insertTool(parseTool(data));
  if (type === "articles") return insertArticle(await parseArticle(data));
  if (type === "links") return insertLink(parseLink(data));
  throw new HttpError("This collection is read-only here");
}

async function updateResource(type: ResourceType, id: string, data: unknown) {
  const db = dbOrThrow();
  if (type === "work") {
    const rows = await db.select().from(workItems).where(eq(workItems.id, id)).limit(1);
    if (!rows[0]) throw new HttpError("Not found", 404);
    const parsed = parseWork(data, mapWork(rows[0]));
    return saveWork({ ...parsed, id, sortOrder: rows[0].sortOrder }, false);
  }
  if (type === "collabs") return updateCollab(id, data);
  if (type === "programs") return updateProgram(id, data);
  if (type === "ambassadors") return updateAmbassador(id, data);
  if (type === "projects") return updateProject(id, data);
  if (type === "contests") return updateContest(id, data);
  if (type === "testimonials") return updateQuote(id, data);
  if (type === "process") return updateProcess(id, data);
  if (type === "tools") return updateTool(id, data);
  if (type === "articles") return updateArticle(id, data);
  if (type === "links") return updateLink(id, data);
  throw new HttpError("Submissions cannot be edited");
}

async function deleteResource(type: ResourceType, id: string) {
  const db = dbOrThrow();
  if (type === "work") {
    await db.delete(workItems).where(eq(workItems.id, id));
    await emit("item.removed", { id });
    return;
  }
  if (type === "collabs") await db.delete(collabs).where(eq(collabs.id, id));
  else if (type === "programs") await db.delete(programs).where(eq(programs.id, id));
  else if (type === "ambassadors") await db.delete(ambassadors).where(eq(ambassadors.id, id));
  else if (type === "projects") await db.delete(projects).where(eq(projects.id, id));
  else if (type === "contests") await db.delete(contests).where(eq(contests.id, id));
  else if (type === "testimonials") await db.delete(testimonials).where(eq(testimonials.id, id));
  else if (type === "process") await db.delete(processSteps).where(eq(processSteps.id, id));
  else if (type === "tools") await db.delete(tools).where(eq(tools.id, id));
  else if (type === "articles") await db.delete(articles).where(eq(articles.id, id));
  else if (type === "links") await db.delete(links).where(eq(links.id, id));
  else if (type === "submissions") {
    await db.delete(submissions).where(eq(submissions.id, id));
    return;
  }
  await emit("content.refresh", { type });
}

async function reorder(type: ResourceType, ids: string[]) {
  const db = dbOrThrow();
  await db.transaction(async (tx) => {
    for (let index = 0; index < ids.length; index += 1) {
      const id = ids[index];
      if (type === "work") await tx.update(workItems).set({ sortOrder: index }).where(eq(workItems.id, id));
      if (type === "collabs") await tx.update(collabs).set({ sortOrder: index }).where(eq(collabs.id, id));
      if (type === "programs") await tx.update(programs).set({ sortOrder: index }).where(eq(programs.id, id));
      if (type === "ambassadors") await tx.update(ambassadors).set({ sortOrder: index }).where(eq(ambassadors.id, id));
      if (type === "projects") await tx.update(projects).set({ sortOrder: index }).where(eq(projects.id, id));
      if (type === "contests") await tx.update(contests).set({ sortOrder: index }).where(eq(contests.id, id));
      if (type === "testimonials") await tx.update(testimonials).set({ sortOrder: index }).where(eq(testimonials.id, id));
      if (type === "process") await tx.update(processSteps).set({ sortOrder: index }).where(eq(processSteps.id, id));
      if (type === "tools") await tx.update(tools).set({ sortOrder: index }).where(eq(tools.id, id));
      if (type === "articles") await tx.update(articles).set({ sortOrder: index }).where(eq(articles.id, id));
      if (type === "links") await tx.update(links).set({ sortOrder: index }).where(eq(links.id, id));
    }
  });
  await emit("content.refresh", { type });
}

async function insertCollab(item: Collab) {
  const db = dbOrThrow();
  const orders = await db.select({ sortOrder: collabs.sortOrder }).from(collabs);
  item.sortOrder = await nextOrder(orders);
  await db.insert(collabs).values({
    id: item.id,
    name: item.name,
    type: item.type,
    logo: item.logo,
    summary: item.summary,
    result: item.result,
    dateLabel: item.date,
    postIds: item.postIds,
    hidden: item.hidden,
    sortOrder: item.sortOrder,
  });
  await emit("content.refresh", { type: "collabs" });
  return item;
}
async function updateCollab(id: string, data: unknown) {
  const db = dbOrThrow();
  const rows = await db.select().from(collabs).where(eq(collabs.id, id)).limit(1);
  if (!rows[0]) throw new HttpError("Not found", 404);
  const current: Collab = { id, name: rows[0].name, type: rows[0].type as Collab["type"], logo: rows[0].logo, summary: rows[0].summary, result: rows[0].result, date: rows[0].dateLabel, postIds: rows[0].postIds ?? [], hidden: rows[0].hidden, sortOrder: rows[0].sortOrder };
  const item = parseCollab(data, current);
  await db.update(collabs).set({ name: item.name, type: item.type, logo: item.logo, summary: item.summary, result: item.result, dateLabel: item.date, postIds: item.postIds, hidden: item.hidden }).where(eq(collabs.id, id));
  await emit("content.refresh", { type: "collabs" });
  return item;
}
async function insertProgram(item: Program) {
  const db = dbOrThrow();
  item.sortOrder = await nextOrder(await db.select({ sortOrder: programs.sortOrder }).from(programs));
  await db.insert(programs).values({ id: item.id, name: item.name, role: item.role, startLabel: item.start, endLabel: item.end, status: item.status, highlights: item.highlights, postIds: item.postIds, impressions: item.impressions, likes: item.likes, hidden: item.hidden, sortOrder: item.sortOrder });
  await emit("content.refresh", { type: "programs" });
  return item;
}
async function updateProgram(id: string, data: unknown) {
  const db = dbOrThrow();
  const rows = await db.select().from(programs).where(eq(programs.id, id)).limit(1);
  if (!rows[0]) throw new HttpError("Not found", 404);
  const current: Program = { id, name: rows[0].name, role: rows[0].role, start: rows[0].startLabel, end: rows[0].endLabel, status: rows[0].status as Program["status"], highlights: rows[0].highlights ?? [], postIds: rows[0].postIds ?? [], impressions: rows[0].impressions, likes: rows[0].likes, hidden: rows[0].hidden, sortOrder: rows[0].sortOrder };
  const item = parseProgram(data, current);
  await db.update(programs).set({ name: item.name, role: item.role, startLabel: item.start, endLabel: item.end, status: item.status, highlights: item.highlights, postIds: item.postIds, impressions: item.impressions, likes: item.likes, hidden: item.hidden }).where(eq(programs.id, id));
  await emit("content.refresh", { type: "programs" });
  return item;
}
async function insertAmbassador(item: Ambassador) {
  const db = dbOrThrow();
  item.sortOrder = await nextOrder(await db.select({ sortOrder: ambassadors.sortOrder }).from(ambassadors));
  await db.insert(ambassadors).values({ id: item.id, project: item.project, url: item.url, title: item.title, region: item.region, startLabel: item.start, status: item.status, duties: item.duties, postIds: item.postIds, logo: item.logo, summary: item.summary, roleType: item.roleType, placeholder: item.placeholder, hidden: item.hidden, sortOrder: item.sortOrder });
  await emit("content.refresh", { type: "ambassadors" });
  return item;
}
async function updateAmbassador(id: string, data: unknown) {
  const db = dbOrThrow();
  const rows = await db.select().from(ambassadors).where(eq(ambassadors.id, id)).limit(1);
  if (!rows[0]) throw new HttpError("Not found", 404);
  const current: Ambassador = { id, project: rows[0].project, url: rows[0].url ?? "", title: rows[0].title, region: rows[0].region, start: rows[0].startLabel, status: rows[0].status as Ambassador["status"], duties: rows[0].duties ?? [], postIds: rows[0].postIds ?? [], logo: rows[0].logo ?? "", summary: rows[0].summary ?? "", roleType: choice(rows[0].roleType, PARTNER_ROLES, "ambassador"), placeholder: Boolean(rows[0].placeholder), hidden: rows[0].hidden, sortOrder: rows[0].sortOrder };
  const item = parseAmbassador(data, current);
  await db.update(ambassadors).set({ project: item.project, url: item.url, title: item.title, region: item.region, startLabel: item.start, status: item.status, duties: item.duties, postIds: item.postIds, logo: item.logo, summary: item.summary, roleType: item.roleType, placeholder: item.placeholder, hidden: item.hidden }).where(eq(ambassadors.id, id));
  await emit("content.refresh", { type: "ambassadors" });
  return item;
}

function projectValues(item: Project) {
  return {
    id: item.id, slug: item.slug, name: item.name, year: item.year, client: item.client, dateLabel: item.date, industry: item.industry, services: item.services, budget: item.budget, aiTech: item.aiTech, overview: item.overview, challenge: item.challenge, approach: item.approach, achievements: item.achievements, outcome: item.outcome, scope: item.scope, cover: item.cover, accent: item.accent, xUrl: item.xUrl, websiteUrl: item.websiteUrl, reviewQuote: item.reviewQuote, reviewAuthor: item.reviewAuthor, reviewRole: item.reviewRole, reviewStat: item.reviewStat, reviewStatLabel: item.reviewStatLabel, featured: item.featured, hidden: item.hidden, sortOrder: item.sortOrder,
  };
}
async function insertProject(item: Project) {
  const db = dbOrThrow();
  item.sortOrder = await nextOrder(await db.select({ sortOrder: projects.sortOrder }).from(projects));
  await db.insert(projects).values(projectValues(item));
  await emit("content.refresh", { type: "projects" });
  return item;
}
async function updateProject(id: string, data: unknown) {
  const db = dbOrThrow();
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!rows[0]) throw new HttpError("Not found", 404);
  const item = await parseProject(data, mapProject(rows[0]));
  item.id = id;
  item.sortOrder = rows[0].sortOrder;
  await db.update(projects).set(projectValues(item)).where(eq(projects.id, id));
  await emit("content.refresh", { type: "projects" });
  return item;
}
async function insertContest(item: Contest) {
  const db = dbOrThrow();
  item.sortOrder = await nextOrder(await db.select({ sortOrder: contests.sortOrder }).from(contests));
  await db.insert(contests).values({ id: item.id, name: item.name, organizer: item.organizer, dateLabel: item.date, year: item.year, placement: item.placement, result: item.result, link: item.link, entryPostId: item.entryPostId, thumb: item.thumb, xUrl: item.xUrl, placeholder: item.placeholder, hidden: item.hidden, sortOrder: item.sortOrder });
  await emit("content.refresh", { type: "contests" });
  return item;
}
async function updateContest(id: string, data: unknown) {
  const db = dbOrThrow();
  const rows = await db.select().from(contests).where(eq(contests.id, id)).limit(1);
  if (!rows[0]) throw new HttpError("Not found", 404);
  const current: Contest = { id, name: rows[0].name, organizer: rows[0].organizer, date: rows[0].dateLabel, year: rows[0].year, placement: parsePlacement(rows[0].placement), result: rows[0].result ?? "", link: rows[0].link ?? "", entryPostId: rows[0].entryPostId, thumb: rows[0].thumb, xUrl: rows[0].xUrl, placeholder: Boolean(rows[0].placeholder), hidden: rows[0].hidden, sortOrder: rows[0].sortOrder };
  const item = parseContest(data, current);
  await db.update(contests).set({ name: item.name, organizer: item.organizer, dateLabel: item.date, year: item.year, placement: item.placement, result: item.result, link: item.link, entryPostId: item.entryPostId, thumb: item.thumb, xUrl: item.xUrl, placeholder: item.placeholder, hidden: item.hidden }).where(eq(contests.id, id));
  await emit("content.refresh", { type: "contests" });
  return item;
}
async function insertQuote(item: Testimonial) {
  const db = dbOrThrow();
  item.sortOrder = await nextOrder(await db.select({ sortOrder: testimonials.sortOrder }).from(testimonials));
  await db.insert(testimonials).values(item);
  await emit("content.refresh", { type: "testimonials" });
  return item;
}
async function updateQuote(id: string, data: unknown) {
  const db = dbOrThrow();
  const rows = await db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1);
  if (!rows[0]) throw new HttpError("Not found", 404);
  const item = parseTestimonial(data, { ...rows[0], hidden: rows[0].hidden, sortOrder: rows[0].sortOrder });
  await db.update(testimonials).set(item).where(eq(testimonials.id, id));
  await emit("content.refresh", { type: "testimonials" });
  return item;
}
async function insertProcess(item: ProcessStep) {
  const db = dbOrThrow();
  item.sortOrder = await nextOrder(await db.select({ sortOrder: processSteps.sortOrder }).from(processSteps));
  await db.insert(processSteps).values(item);
  await emit("content.refresh", { type: "process" });
  return item;
}
async function updateProcess(id: string, data: unknown) {
  const db = dbOrThrow();
  const rows = await db.select().from(processSteps).where(eq(processSteps.id, id)).limit(1);
  if (!rows[0]) throw new HttpError("Not found", 404);
  const item = parseProcess(data, rows[0]);
  await db.update(processSteps).set(item).where(eq(processSteps.id, id));
  await emit("content.refresh", { type: "process" });
  return item;
}
async function insertTool(item: Tool) {
  const db = dbOrThrow();
  item.sortOrder = await nextOrder(await db.select({ sortOrder: tools.sortOrder }).from(tools));
  await db.insert(tools).values({ id: item.id, name: item.name, groupName: item.group, kind: item.kind, icon: item.icon, note: item.note, hidden: item.hidden, sortOrder: item.sortOrder });
  await emit("content.refresh", { type: "tools" });
  return item;
}
async function updateTool(id: string, data: unknown) {
  const db = dbOrThrow();
  const rows = await db.select().from(tools).where(eq(tools.id, id)).limit(1);
  if (!rows[0]) throw new HttpError("Not found", 404);
  const item = parseTool(data, { id, name: rows[0].name, group: rows[0].groupName, kind: rows[0].kind === "skill" ? "skill" : "tool", icon: rows[0].icon ?? "", note: rows[0].note ?? "", hidden: rows[0].hidden, sortOrder: rows[0].sortOrder });
  await db.update(tools).set({ name: item.name, groupName: item.group, kind: item.kind, icon: item.icon, note: item.note, hidden: item.hidden }).where(eq(tools.id, id));
  await emit("content.refresh", { type: "tools" });
  return item;
}

function articleValues(item: Article) {
  return { id: item.id, kind: item.kind, slug: item.slug, title: item.title, url: item.url, source: item.source, cover: item.cover, coverDominant: item.coverDominant, publishedAt: new Date(item.publishedAt), tags: item.tags, pinned: item.pinned, hidden: item.hidden, excerpt: item.excerpt, body: item.body, sortOrder: item.sortOrder };
}
async function insertArticle(item: Article) {
  const db = dbOrThrow();
  if (item.url) {
    const dup = await db.select({ id: articles.id }).from(articles).where(eq(articles.url, item.url)).limit(1);
    if (dup[0]) throw new HttpError("An article or link with that URL already exists", 409);
  }
  item.sortOrder = await nextOrder(await db.select({ sortOrder: articles.sortOrder }).from(articles));
  await db.insert(articles).values(articleValues(item));
  if (item.pinned) await capPins("articles", item.id);
  await emit("content.refresh", { type: "articles" });
  return item;
}
async function updateArticle(id: string, data: unknown) {
  const db = dbOrThrow();
  const rows = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!rows[0]) throw new HttpError("Not found", 404);
  const item = await parseArticle(data, mapArticle(rows[0]));
  item.id = id;
  item.sortOrder = rows[0].sortOrder;
  await db.update(articles).set(articleValues(item)).where(eq(articles.id, id));
  if (item.pinned) await capPins("articles", id);
  await emit("content.refresh", { type: "articles" });
  return item;
}
async function insertLink(item: CustomLink) {
  const db = dbOrThrow();
  item.sortOrder = await nextOrder(await db.select({ sortOrder: links.sortOrder }).from(links));
  await db.insert(links).values({ id: item.id, label: item.label, url: item.url, groupName: item.group, hidden: item.hidden, sortOrder: item.sortOrder });
  await emit("content.refresh", { type: "links" });
  return item;
}
async function updateLink(id: string, data: unknown) {
  const db = dbOrThrow();
  const rows = await db.select().from(links).where(eq(links.id, id)).limit(1);
  if (!rows[0]) throw new HttpError("Not found", 404);
  const item = parseLink(data, { id, label: rows[0].label, url: rows[0].url, group: rows[0].groupName, hidden: rows[0].hidden, sortOrder: rows[0].sortOrder });
  await db.update(links).set({ label: item.label, url: item.url, groupName: item.group, hidden: item.hidden }).where(eq(links.id, id));
  await emit("content.refresh", { type: "links" });
  return item;
}

export async function saveSettings(data: unknown) {
  const db = dbOrThrow();
  const settings = mergeSettings(data);
  settings.heroTitle = cleanText(settings.heroTitle, 40) || "Tirta";
  settings.email = cleanText(settings.email, 120);
  settings.xUrl = safeXUrl(settings.xUrl) ?? "https://x.com/TirtaVEX";
  settings.xHandle = cleanText(settings.xHandle, 40).replace(/^@/, "") || "TirtaVEX";
  settings.socials = settings.socials.flatMap((item) => {
    const url = safeHttpUrl(item.url);
    const label = cleanText(item.label, 40);
    return url && label ? [{ label, url }] : [];
  });
  settings.bio = cleanText(settings.bio, 600);
  settings.bioLong = cleanBlock(settings.bioLong, 4000);
  settings.introLeftBody = cleanBlock(settings.introLeftBody, 600);
  settings.introRightBody = cleanBlock(settings.introRightBody, 600);
  settings.contactLede = cleanText(settings.contactLede, 400);
  settings.footerBlurb = cleanText(settings.footerBlurb, 240);
  settings.pressNote = cleanText(settings.pressNote, 400);
  settings.pulseLede = cleanText(settings.pulseLede, 240);
  settings.heroHeadline = cleanText(settings.heroHeadline, 200);
  settings.heroLede = cleanText(settings.heroLede, 400);
  settings.heroTagline = cleanText(settings.heroTagline, 180);
  settings.aboutEyebrow = cleanText(settings.aboutEyebrow, 80);
  settings.aboutTitle = cleanText(settings.aboutTitle, 80);
  settings.aboutMore = cleanBlock(settings.aboutMore, 2000);
  settings.workTitle = cleanText(settings.workTitle, 80);
  settings.workLede = cleanText(settings.workLede, 400);
  settings.campaignsTitle = cleanText(settings.campaignsTitle, 80);
  settings.campaignsLede = cleanText(settings.campaignsLede, 400);
  settings.partnersTitle = cleanText(settings.partnersTitle, 80);
  settings.partnersLede = cleanText(settings.partnersLede, 400);
  settings.statsTitle = cleanText(settings.statsTitle, 80);
  settings.statsLede = cleanText(settings.statsLede, 400);
  settings.skillsTitle = cleanText(settings.skillsTitle, 80);
  settings.skillsLede = cleanText(settings.skillsLede, 400);
  settings.contactTitle = cleanText(settings.contactTitle, 80);
  settings.genres = cleanLines(settings.genres, 16).map((item) => cleanText(item, 40)).filter(Boolean);
  settings.tiktokUrl = safeHttpUrl(settings.tiktokUrl) ?? "";
  settings.instagramUrl = safeHttpUrl(settings.instagramUrl) ?? "";
  settings.heroImage = mediaRef(settings.heroImage, "/media/hero.webp");
  settings.aboutImage = mediaRef(settings.aboutImage, "/media/about.webp");
  settings.heroImageAlt = cleanText(settings.heroImageAlt, 180);
  settings.aboutImageAlt = cleanText(settings.aboutImageAlt, 180);
  settings.metaTitle = cleanText(settings.metaTitle, 80);
  settings.metaDescription = cleanText(settings.metaDescription, 200);
  await db.insert(siteSettings).values({ id: 1, data: settings }).onConflictDoUpdate({ target: siteSettings.id, set: { data: settings } });
  await emit("content.refresh", { type: "settings" });
  return settings;
}

export async function saveLegal(slug: unknown, data: unknown) {
  if (slug !== "terms" && slug !== "privacy") throw new HttpError("Legal slug must be terms or privacy");
  const raw = record(data);
  const db = dbOrThrow();
  const page = {
    slug,
    title: cleanText(raw.title, 80) || (slug === "terms" ? "Terms" : "Privacy Policy"),
    eyebrow: cleanText(raw.eyebrow, 80),
    body: cleanBlock(raw.body, 20000),
    updatedAt: new Date(),
  };
  await db.insert(legalPages).values(page).onConflictDoUpdate({ target: legalPages.slug, set: { title: page.title, eyebrow: page.eyebrow, body: page.body, updatedAt: page.updatedAt } });
  await emit("content.refresh", { type: "legal" });
  return { ...page, updatedAt: page.updatedAt.toISOString() };
}

function parsePlatforms(value: unknown, fallback: PlatformStat[]): PlatformStat[] {
  const parsed = normalizePlatforms(value).map((row) => ({
    ...row,
    label: cleanText(row.label, 40) || row.platform,
    handle: cleanText(row.handle, 40).replace(/^@/, ""),
    url: safeHttpUrl(row.url) ?? "",
  }));
  return parsed.length ? parsed : fallback;
}

export async function saveStats(data: unknown) {
  const raw = record(data);
  const db = dbOrThrow();
  const existing = await db.select().from(stats).where(eq(stats.id, 1));
  const current = existing[0] ? mapStats(existing[0]) : buildSeed().stats;
  const next: Stats = {
    impressionsAll: num(raw.impressionsAll, current.impressionsAll),
    impressions30d: num(raw.impressions30d, current.impressions30d),
    likes: num(raw.likes, current.likes),
    posts: num(raw.posts, current.posts),
    followers: num(raw.followers, current.followers),
    engagement: num(raw.engagement, current.engagement),
    videos: num(raw.videos, current.videos),
    placeholder: Boolean(raw.placeholder ?? current.placeholder),
    platforms: parsePlatforms(raw.platforms, current.platforms),
    bestPostId: cleanText(raw.bestPostId ?? current.bestPostId, 40),
    updatedAt: new Date().toISOString(),
  };
  await db.insert(stats).values({ id: 1, ...next, updatedAt: new Date(next.updatedAt) }).onConflictDoUpdate({
    target: stats.id,
    set: {
      impressionsAll: next.impressionsAll,
      impressions30d: next.impressions30d,
      likes: next.likes,
      posts: next.posts,
      followers: next.followers,
      engagement: next.engagement,
      videos: next.videos,
      placeholder: next.placeholder,
      platforms: next.platforms,
      bestPostId: next.bestPostId,
      updatedAt: new Date(next.updatedAt),
    },
  });
  await emit("stats.update", next);
  return next;
}

function suggestTitle(text: string) {
  const line = text.split("\n").map((part) => part.trim()).find(Boolean) ?? "Untitled post";
  return cleanText(line, 140);
}

export async function addWorkByX(input: unknown) {
  const raw = record(input);
  const xUrl = safeXUrl(typeof raw.xUrl === "string" ? raw.xUrl : "");
  if (!xUrl || !/\/status\/\d+/.test(xUrl)) throw new HttpError("xUrl must be a status URL on x.com or twitter.com");
  const db = dbOrThrow();
  const existing = await db.select().from(workItems).where(eq(workItems.xUrl, xUrl)).limit(1);
  if (existing[0]) return { created: false, item: mapWork(existing[0]) };

  const provider = getMetricsProvider();
  let fetched: FetchedPost | null = null;
  if (provider.name !== "manual") {
    try {
      fetched = await provider.fetchPost(xUrl);
    } catch (error) {
      if (!raw.title) throw new HttpError(error instanceof Error ? error.message : "Could not read that post", 502);
    }
  }
  const orders = await db.select({ sortOrder: workItems.sortOrder }).from(workItems);
  const now = new Date().toISOString();
  const item: WorkItem = {
    id: nid("work"),
    xUrl,
    title: cleanText(raw.title, 180) || suggestTitle(fetched?.text ?? ""),
    note: cleanText(raw.note, 280),
    category: choice(raw.category, CATEGORIES, "ai-video"),
    lane: choice(raw.lane, LANES, "generation"),
    videoUrl: safeHttpUrl(typeof raw.videoUrl === "string" ? raw.videoUrl : "") ?? "",
    placeholder: Boolean(raw.placeholder),
    tags: cleanLines(raw.tags ?? [], 12),
    pinned: Boolean(raw.pinned),
    thumb: {
      src: fetched?.thumbSrc && safeHttpUrl(fetched.thumbSrc) ? fetched.thumbSrc : "",
      blurhash: "",
      dominant: "#10B981",
      w: 1280,
      h: 720,
      durationSec: fetched?.durationSec ?? null,
    },
    authorName: fetched?.authorName ?? "",
    authorHandle: fetched?.authorHandle ?? "",
    metrics: {
      impressions: fetched?.metrics.impressions ?? 0,
      likes: fetched?.metrics.likes ?? 0,
      reposts: fetched?.metrics.reposts ?? 0,
      replies: fetched?.metrics.replies ?? 0,
      bookmarks: fetched?.metrics.bookmarks ?? 0,
      quotes: fetched?.metrics.quotes ?? 0,
      updatedAt: now,
    },
    postedAt: fetched?.postedAt ?? now,
    addedAt: now,
    status: choice(raw.status, ["live", "hidden", "deleted"] as const, "live"),
    sortOrder: await nextOrder(orders),
  };
  if (!item.title) throw new HttpError("Could not derive a title. Pass title, or switch METRICS_PROVIDER.", 422);
  await saveWork(item, true);
  return { created: true, item };
}

export async function previewX(url: string) {
  const safe = safeXUrl(url);
  if (!safe) throw new HttpError("Paste a status URL from x.com or twitter.com");
  const provider = getMetricsProvider();
  if (provider.name === "manual") throw new HttpError("METRICS_PROVIDER=manual cannot preview remote posts", 422);
  try {
    const fetched = await provider.fetchPost(safe);
    return { xUrl: safe, ...fetched, title: suggestTitle(fetched.text) };
  } catch (error) {
    console.error("[x] preview failed", error instanceof Error ? error.message : error);
    throw new HttpError("Could not read that post", 502);
  }
}

export async function addArticleFromAgent(input: unknown) {
  const raw = record(input);
  const url = safeHttpUrl(typeof raw.url === "string" ? raw.url : "");
  const db = dbOrThrow();
  if (url) {
    const existing = await db.select().from(articles).where(eq(articles.url, url)).limit(1);
    if (existing[0]) return { created: false, item: mapArticle(existing[0]) };
  }
  const item = await insertArticle(await parseArticle({ ...raw, url: url ?? "", kind: raw.kind ?? (raw.body ? "article" : "link") }));
  return { created: true, item };
}

export async function updateMetricsBatch(input: unknown) {
  const raw = record(input);
  if (!Array.isArray(raw.updates)) throw new HttpError("updates must be an array");
  const db = dbOrThrow();
  const updated: { id: string; xUrl: string; metrics: WorkItem["metrics"] }[] = [];
  const missing: string[] = [];
  const now = new Date();
  for (const entry of raw.updates) {
    const row = record(entry);
    const xUrl = typeof row.xUrl === "string" ? safeXUrl(row.xUrl) : null;
    const id = typeof row.id === "string" ? row.id : "";
    const found = xUrl
      ? (await db.select().from(workItems).where(eq(workItems.xUrl, xUrl)).limit(1))[0]
      : id
        ? (await db.select().from(workItems).where(eq(workItems.id, id)).limit(1))[0]
        : undefined;
    if (!found) {
      missing.push(xUrl || id || "unknown");
      continue;
    }
    const metrics = {
      impressions: num(row.impressions, found.impressions),
      likes: num(row.likes, found.likes),
      reposts: num(row.reposts, found.reposts),
      replies: num(row.replies, found.replies),
      bookmarks: num(row.bookmarks, found.bookmarks),
      quotes: num(row.quotes, found.quotes),
    };
    await db.update(workItems).set({ ...metrics, metricsUpdatedAt: now }).where(eq(workItems.id, found.id));
    updated.push({ id: found.id, xUrl: found.xUrl, metrics: { ...metrics, updatedAt: now.toISOString() } });
  }
  if (updated.length) await emit("metrics.batch", { items: updated });
  return { updated: updated.length, missing };
}

export async function markWorkDeleted(input: unknown) {
  const raw = record(input);
  const db = dbOrThrow();
  const xUrl = typeof raw.xUrl === "string" ? safeXUrl(raw.xUrl) : null;
  const id = typeof raw.id === "string" ? raw.id : "";
  const found = xUrl
    ? (await db.select().from(workItems).where(eq(workItems.xUrl, xUrl)).limit(1))[0]
    : id
      ? (await db.select().from(workItems).where(eq(workItems.id, id)).limit(1))[0]
      : undefined;
  if (!found) throw new HttpError("Work item not found", 404);
  await db.update(workItems).set({ status: "deleted" }).where(eq(workItems.id, found.id));
  await emit("item.removed", { id: found.id, xUrl: found.xUrl });
  return { id: found.id, status: "deleted" as const };
}

export async function beat(input: unknown) {
  const raw = record(input);
  const db = dbOrThrow();
  const message = cleanText(raw.message ?? "ok", 180);
  const at = new Date();
  await db.insert(agentState).values({ id: 1, lastHeartbeatAt: at, message }).onConflictDoUpdate({
    target: agentState.id,
    set: { lastHeartbeatAt: at, message },
  });
  const payload = { lastHeartbeatAt: at.toISOString(), message };
  await emit("agent.heartbeat", payload);
  return payload;
}

export async function refreshLiveMetrics() {
  const provider = getMetricsProvider();
  if (provider.name === "manual") return { updated: 0, failed: [], skipped: "manual" as const };
  const db = dbOrThrow();
  const rows = await db.select().from(workItems);
  const live = rows
    .filter((row) => row.status === "live")
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.postedAt.getTime() - a.postedAt.getTime());
  const started = Date.now();
  const updated: { id: string; xUrl: string; metrics: WorkItem["metrics"] }[] = [];
  const failed: string[] = [];
  for (const row of live) {
    if (Date.now() - started > 40_000) break;
    try {
      const fetched = await provider.fetchPost(row.xUrl);
      const at = new Date();
      const metrics = { ...fetched.metrics, metricsUpdatedAt: at };
      await db.update(workItems).set({
        impressions: metrics.impressions,
        likes: metrics.likes,
        reposts: metrics.reposts,
        replies: metrics.replies,
        bookmarks: metrics.bookmarks,
        quotes: metrics.quotes,
        metricsUpdatedAt: at,
        thumbSrc: row.thumbSrc || fetched.thumbSrc || "",
        durationSec: row.durationSec ?? fetched.durationSec,
      }).where(eq(workItems.id, row.id));
      updated.push({
        id: row.id,
        xUrl: row.xUrl,
        metrics: { ...fetched.metrics, updatedAt: at.toISOString() },
      });
    } catch {
      failed.push(row.id);
    }
  }
  if (updated.length) await emit("metrics.batch", { items: updated });
  return { updated: updated.length, failed, skipped: null };
}

export async function saveSubmission(input: { name: string; project: string; budget: string; link: string; message: string }) {
  const db = dbOrThrow();
  const id = nid("brief");
  const createdAt = new Date();
  await db.insert(submissions).values({ id, ...input, createdAt });
  return { id, createdAt: createdAt.toISOString() };
}

export async function trackEvent(name: string, props: Record<string, unknown>) {
  const db = getDb();
  if (!db) return;
  await db.insert(analyticsEvents).values({ name: cleanText(name, 60) || "event", props });
}

export async function replaceWithSeed(content: SiteContent = buildSeed()) {
  const sqlClient = getSql();
  if (!sqlClient) throw new HttpError("DATABASE_URL is not configured", 503);
  await sqlClient`TRUNCATE TABLE
    work_items, collabs, programs, ambassadors, projects, contests, testimonials,
    process_steps, tools, articles, links, legal_pages, submissions, site_settings, stats, agent_state, events
    RESTART IDENTITY CASCADE`;
  const db = dbOrThrow();
  await db.insert(siteSettings).values({ id: 1, data: content.settings });
  await db.insert(stats).values({
    id: 1,
    impressionsAll: content.stats.impressionsAll,
    impressions30d: content.stats.impressions30d,
    likes: content.stats.likes,
    posts: content.stats.posts,
    followers: content.stats.followers,
    engagement: content.stats.engagement,
    videos: content.stats.videos,
    placeholder: content.stats.placeholder,
    platforms: content.stats.platforms,
    bestPostId: content.stats.bestPostId,
    updatedAt: new Date(content.stats.updatedAt),
  });
  await db.insert(agentState).values({
    id: 1,
    lastHeartbeatAt: content.agent.lastHeartbeatAt ? new Date(content.agent.lastHeartbeatAt) : null,
    message: content.agent.message,
  });
  if (content.work.length) await db.insert(workItems).values(content.work.map(workRow));
  if (content.collabs.length) {
    await db.insert(collabs).values(
      content.collabs.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        logo: item.logo,
        summary: item.summary,
        result: item.result,
        dateLabel: item.date,
        postIds: item.postIds,
        hidden: item.hidden,
        sortOrder: item.sortOrder,
      })),
    );
  }
  if (content.programs.length) {
    await db.insert(programs).values(content.programs.map((item) => ({ id: item.id, name: item.name, role: item.role, startLabel: item.start, endLabel: item.end, status: item.status, highlights: item.highlights, postIds: item.postIds, impressions: item.impressions, likes: item.likes, hidden: item.hidden, sortOrder: item.sortOrder })));
  }
  if (content.ambassadors.length) {
    await db.insert(ambassadors).values(content.ambassadors.map((item) => ({ id: item.id, project: item.project, url: item.url, title: item.title, region: item.region, startLabel: item.start, status: item.status, duties: item.duties, postIds: item.postIds, logo: item.logo, summary: item.summary, roleType: item.roleType, placeholder: item.placeholder, hidden: item.hidden, sortOrder: item.sortOrder })));
  }
  if (content.projects.length) await db.insert(projects).values(content.projects.map(projectValues));
  if (content.contests.length) {
    await db.insert(contests).values(content.contests.map((item) => ({ id: item.id, name: item.name, organizer: item.organizer, dateLabel: item.date, year: item.year, placement: item.placement, result: item.result, link: item.link, entryPostId: item.entryPostId, thumb: item.thumb, xUrl: item.xUrl, placeholder: item.placeholder, hidden: item.hidden, sortOrder: item.sortOrder })));
  }
  if (content.testimonials.length) await db.insert(testimonials).values(content.testimonials);
  if (content.process.length) await db.insert(processSteps).values(content.process);
  if (content.tools.length) await db.insert(tools).values(content.tools.map((item) => ({ id: item.id, name: item.name, groupName: item.group, kind: item.kind, icon: item.icon, note: item.note, hidden: item.hidden, sortOrder: item.sortOrder })));
  if (content.articles.length) await db.insert(articles).values(content.articles.map(articleValues));
  if (content.links.length) await db.insert(links).values(content.links.map((item) => ({ id: item.id, label: item.label, url: item.url, groupName: item.group, hidden: item.hidden, sortOrder: item.sortOrder })));
  await db.insert(legalPages).values([
    { ...content.legal.terms, updatedAt: new Date(content.legal.terms.updatedAt) },
    { ...content.legal.privacy, updatedAt: new Date(content.legal.privacy.updatedAt) },
  ]);
  return { ok: true, at: toIso(new Date()) };
}

export async function readStats() {
  const db = dbOrThrow();
  const rows = await db.select().from(stats).where(eq(stats.id, 1));
  return rows[0] ? mapStats(rows[0]) : null;
}
