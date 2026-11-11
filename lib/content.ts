import { cache } from "react";
import { asc, eq, gt } from "drizzle-orm";
import { databaseUrl, getDb } from "./db";
import {
  mapAgent,
  mapAmbassador,
  mapArticle,
  mapCollab,
  mapContest,
  mapLegal,
  mapLink,
  mapProcess,
  mapProgram,
  mapProject,
  mapStats,
  mapSubmission,
  mapTestimonial,
  mapTool,
  mapWork,
  mergeSettings,
} from "./map";
import { buildSeed, emptyContent } from "./seed-data";
import {
  agentState,
  ambassadors,
  articles,
  collabs,
  contests,
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
import type { AdminSnapshot, SiteContent, Submission } from "./types";
import { isExampleHost, isPlaceholderEmail, isPlaceholderStatusUrl } from "./safe-url";
import { stills } from "./stills";
import { visibleText } from "./visible";

const PANELS = stills().panels;

function cleanString(value: string, key?: string) {
  if (key && (key === "src" || key.endsWith("Url") || key.endsWith("At") || key === "slug" || key === "id" || key === "xUrl" || key === "logo" || key === "cover")) {
    return value;
  }
  if (!value.includes("{{")) return value;
  return visibleText(value) ?? "";
}

function cleanValue(value: unknown, key?: string): unknown {
  if (typeof value === "string") return cleanString(value, key);
  if (Array.isArray(value)) return value.map((item) => cleanValue(item)).filter((item) => item !== "");
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [childKey, child] of Object.entries(value)) next[childKey] = cleanValue(child, childKey);
    return next;
  }
  return value;
}

function byOrder<T extends { sortOrder: number }>(rows: T[]) {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function toPublic(content: SiteContent, options?: { sample?: boolean }): SiteContent {
  const cleaned = cleanValue(content) as SiteContent;
  const visible = <T extends { hidden: boolean; sortOrder: number }>(rows: T[]) =>
    byOrder(rows.filter((row) => !row.hidden));
  const settings = cleaned.settings;
  settings.marquee = settings.marquee.filter(Boolean);
  settings.budgetOptions = settings.budgetOptions.filter(Boolean);
  settings.socials = settings.socials.filter((item) => item.label && item.url && !isExampleHost(item.url));
  if (isPlaceholderEmail(settings.email)) settings.email = "";
  const sample = options?.sample || !databaseUrl();
  const stats = sample
    ? { impressionsAll: 0, impressions30d: 0, likes: 0, posts: 0, followers: 0, bestPostId: "", updatedAt: cleaned.stats.updatedAt }
    : cleaned.stats;
  const agent = sample ? { lastHeartbeatAt: null, message: "" } : cleaned.agent;
  return {
    ...cleaned,
    settings,
    stats,
    agent,
    work: byOrder(
      cleaned.work.filter((item) => item.status === "live" && item.title && !isPlaceholderStatusUrl(item.xUrl)),
    ).map((item, index) => ({
      ...item,
      thumb: { ...item.thumb, src: item.thumb.src || PANELS[index % PANELS.length] },
    })),
    collabs: visible(cleaned.collabs).filter((item) => item.name),
    programs: visible(cleaned.programs).filter((item) => item.name),
    ambassadors: visible(cleaned.ambassadors).filter((item) => item.project),
    projects: visible(cleaned.projects)
      .filter((item) => item.name)
      .map((item, index) => ({
        ...item,
        cover: item.cover || PANELS[index % PANELS.length],
        xUrl: isPlaceholderStatusUrl(item.xUrl) ? "" : item.xUrl,
        websiteUrl: isExampleHost(item.websiteUrl) ? "" : item.websiteUrl,
        reviewQuote: item.reviewAuthor ? item.reviewQuote : "",
        reviewStat: item.reviewAuthor ? item.reviewStat : "",
        reviewStatLabel: item.reviewAuthor ? item.reviewStatLabel : "",
        outcome: /impression|views/i.test(item.outcome) ? "" : item.outcome,
      })),
    contests: visible(cleaned.contests).filter((item) => item.name).map((item) => ({
      ...item,
      xUrl: isPlaceholderStatusUrl(item.xUrl) ? "" : item.xUrl,
    })),
    testimonials: visible(cleaned.testimonials).filter((item) => item.quote && item.name),
    process: visible(cleaned.process).filter((item) => item.title),
    tools: visible(cleaned.tools).filter((item) => item.name),
    articles: visible(cleaned.articles).filter((item) => item.title).map((item) => ({
      ...item,
      url: isExampleHost(item.url) ? "" : item.url,
    })),
    links: visible(cleaned.links).filter((item) => item.label && !isExampleHost(item.url)),
  };
}

export async function loadDatabaseContent(): Promise<SiteContent | null> {
  const db = getDb();
  if (!db) return null;
  const [settingsRows, statsRows, agentRows, workRows, collabRows, programRows, ambassadorRows, projectRows, contestRows, quoteRows, stepRows, toolRows, articleRows, linkRows, legalRows] =
    await Promise.all([
      db.select().from(siteSettings),
      db.select().from(stats),
      db.select().from(agentState),
      db.select().from(workItems).orderBy(asc(workItems.sortOrder)),
      db.select().from(collabs).orderBy(asc(collabs.sortOrder)),
      db.select().from(programs).orderBy(asc(programs.sortOrder)),
      db.select().from(ambassadors).orderBy(asc(ambassadors.sortOrder)),
      db.select().from(projects).orderBy(asc(projects.sortOrder)),
      db.select().from(contests).orderBy(asc(contests.sortOrder)),
      db.select().from(testimonials).orderBy(asc(testimonials.sortOrder)),
      db.select().from(processSteps).orderBy(asc(processSteps.sortOrder)),
      db.select().from(tools).orderBy(asc(tools.sortOrder)),
      db.select().from(articles).orderBy(asc(articles.sortOrder)),
      db.select().from(links).orderBy(asc(links.sortOrder)),
      db.select().from(legalPages),
    ]);

  if (!settingsRows[0]) return null;
  const seed = buildSeed();
  const terms = legalRows.find((row) => row.slug === "terms");
  const privacy = legalRows.find((row) => row.slug === "privacy");
  return {
    settings: mergeSettings(settingsRows[0].data),
    stats: statsRows[0] ? mapStats(statsRows[0]) : seed.stats,
    agent: mapAgent(agentRows[0]),
    work: workRows.map(mapWork),
    collabs: collabRows.map(mapCollab),
    programs: programRows.map(mapProgram),
    ambassadors: ambassadorRows.map(mapAmbassador),
    projects: projectRows.map(mapProject),
    contests: contestRows.map(mapContest),
    testimonials: quoteRows.map(mapTestimonial),
    process: stepRows.map(mapProcess),
    tools: toolRows.map(mapTool),
    articles: articleRows.map(mapArticle),
    links: linkRows.map(mapLink),
    legal: {
      terms: terms ? mapLegal(terms) : seed.legal.terms,
      privacy: privacy ? mapLegal(privacy) : seed.legal.privacy,
    },
  };
}

export const getContent = cache(async (): Promise<SiteContent> => {
  try {
    const loaded = await loadDatabaseContent();
    if (loaded) return toPublic(loaded);
  } catch (error) {
    console.error("[content] database unavailable, using sample layout", error instanceof Error ? error.message : "unknown");
  }
  return toPublic(buildSeed(), { sample: true });
});

export async function listSubmissions(): Promise<Submission[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(submissions).orderBy(asc(submissions.createdAt));
  return rows.map(mapSubmission).reverse();
}

export async function getAdminSnapshot(): Promise<AdminSnapshot> {
  if (!databaseUrl()) {
    return {
      source: "seed",
      writable: false,
      warning: "DATABASE_URL is not set. This is the read-only placeholder portfolio. Connect Postgres to edit.",
      content: buildSeed(),
      submissions: [],
    };
  }
  try {
    const loaded = await loadDatabaseContent();
    const submissionRows = await listSubmissions();
    if (!loaded) {
      return {
        source: "db",
        writable: true,
        warning: "Database is connected but empty. Run npm run db:seed, or add records here.",
        content: emptyContent(),
        submissions: submissionRows,
      };
    }
    return { source: "db", writable: true, warning: "", content: loaded, submissions: submissionRows };
  } catch (error) {
    console.error("[admin] database read failed", error instanceof Error ? error.message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[database]") : "error");
    return {
      source: "seed",
      writable: false,
      warning: "Database could not be read. Showing the sample layout.",
      content: buildSeed(),
      submissions: [],
    };
  }
}

export async function eventsSince(id: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(events).where(gt(events.id, id)).orderBy(asc(events.id)).limit(100);
}

export async function findWorkByUrl(xUrl: string) {
  const db = getDb();
  if (!db) return null;
  const rows = await db.select().from(workItems).where(eq(workItems.xUrl, xUrl)).limit(1);
  return rows[0] ? mapWork(rows[0]) : null;
}
