import type {
  Ambassador,
  Article,
  Collab,
  Contest,
  CustomLink,
  Lane,
  LegalPage,
  PartnerRole,
  PlatformStat,
  ProcessStep,
  Program,
  Project,
  Settings,
  Stats,
  Submission,
  Testimonial,
  Tool,
  WorkItem,
} from "./types";
import { LANES, PARTNER_ROLES, PLATFORMS } from "./types";
import { buildSeed } from "./seed-data";
import { safeColor } from "./safe-url";
import type {
  agentState,
  ambassadors,
  articles,
  collabs,
  contests,
  legalPages,
  links,
  processSteps,
  programs,
  projects,
  stats,
  submissions,
  testimonials,
  tools,
  workItems,
} from "./schema";

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function toIso(value: Date | string | null | undefined): string {
  if (!value) return new Date(0).toISOString();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
}

export function mergeSettings(data: unknown): Settings {
  const defaults = buildSeed().settings;
  if (!data || typeof data !== "object") return defaults;
  const record = data as Partial<Settings>;
  return {
    ...defaults,
    ...record,
    marquee: strings(record.marquee).length ? strings(record.marquee) : defaults.marquee,
    genres: strings(record.genres).length ? strings(record.genres) : defaults.genres,
    budgetOptions: strings(record.budgetOptions).length ? strings(record.budgetOptions) : defaults.budgetOptions,
    socials: Array.isArray(record.socials)
      ? record.socials.flatMap((item) => {
          if (!item || typeof item !== "object") return [];
          const label = "label" in item && typeof item.label === "string" ? item.label : "";
          const url = "url" in item && typeof item.url === "string" ? item.url : "";
          return label && url ? [{ label, url }] : [];
        })
      : defaults.socials,
  };
}

export function mapWork(row: typeof workItems.$inferSelect): WorkItem {
  return {
    id: row.id,
    xUrl: row.xUrl,
    title: row.title,
    note: row.note,
    category: row.category as WorkItem["category"],
    lane: normalizeLane(row.lane),
    videoUrl: row.videoUrl ?? "",
    placeholder: Boolean(row.placeholder),
    tags: strings(row.tags),
    pinned: row.pinned,
    thumb: {
      src: row.thumbSrc,
      blurhash: row.thumbBlurhash,
      dominant: safeColor(row.thumbDominant),
      w: row.thumbW,
      h: row.thumbH,
      durationSec: row.durationSec,
    },
    authorName: row.authorName,
    authorHandle: row.authorHandle,
    metrics: {
      impressions: row.impressions,
      likes: row.likes,
      reposts: row.reposts,
      replies: row.replies,
      bookmarks: row.bookmarks,
      quotes: row.quotes,
      updatedAt: toIso(row.metricsUpdatedAt),
    },
    postedAt: toIso(row.postedAt),
    addedAt: toIso(row.addedAt),
    status: row.status as WorkItem["status"],
    sortOrder: row.sortOrder,
  };
}

export function mapCollab(row: typeof collabs.$inferSelect): Collab {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Collab["type"],
    logo: row.logo,
    summary: row.summary,
    result: row.result,
    date: row.dateLabel,
    postIds: strings(row.postIds),
    hidden: row.hidden,
    sortOrder: row.sortOrder,
  };
}

export function mapProgram(row: typeof programs.$inferSelect): Program {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    start: row.startLabel,
    end: row.endLabel,
    status: row.status as Program["status"],
    highlights: strings(row.highlights),
    postIds: strings(row.postIds),
    impressions: row.impressions,
    likes: row.likes,
    hidden: row.hidden,
    sortOrder: row.sortOrder,
  };
}

export function mapAmbassador(row: typeof ambassadors.$inferSelect): Ambassador {
  return {
    id: row.id,
    project: row.project,
    url: row.url ?? "",
    title: row.title,
    region: row.region,
    start: row.startLabel,
    status: row.status as Ambassador["status"],
    duties: strings(row.duties),
    postIds: strings(row.postIds),
    logo: row.logo ?? "",
    summary: row.summary ?? "",
    roleType: normalizeRole(row.roleType),
    placeholder: Boolean(row.placeholder),
    hidden: row.hidden,
    sortOrder: row.sortOrder,
  };
}

export function mapProject(row: typeof projects.$inferSelect): Project {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    year: row.year,
    client: row.client,
    date: row.dateLabel,
    industry: row.industry,
    services: strings(row.services),
    budget: row.budget,
    aiTech: row.aiTech,
    overview: row.overview,
    challenge: row.challenge,
    approach: row.approach,
    achievements: strings(row.achievements),
    outcome: row.outcome,
    scope: strings(row.scope),
    cover: row.cover,
    accent: safeColor(row.accent),
    xUrl: row.xUrl,
    websiteUrl: row.websiteUrl,
    reviewQuote: row.reviewQuote,
    reviewAuthor: row.reviewAuthor,
    reviewRole: row.reviewRole,
    reviewStat: row.reviewStat,
    reviewStatLabel: row.reviewStatLabel,
    featured: row.featured,
    hidden: row.hidden,
    sortOrder: row.sortOrder,
  };
}

export function mapContest(row: typeof contests.$inferSelect): Contest {
  return {
    id: row.id,
    name: row.name,
    organizer: row.organizer,
    date: row.dateLabel,
    year: row.year,
    placement: row.placement === "winner" || row.placement === "finalist" || row.placement === "top10" || row.placement === "participant" ? row.placement : "",
    result: row.result ?? "",
    link: row.link ?? "",
    entryPostId: row.entryPostId,
    thumb: row.thumb,
    xUrl: row.xUrl,
    placeholder: Boolean(row.placeholder),
    hidden: row.hidden,
    sortOrder: row.sortOrder,
  };
}

export function mapTestimonial(row: typeof testimonials.$inferSelect): Testimonial {
  return {
    id: row.id,
    quote: row.quote,
    name: row.name,
    role: row.role,
    sourceUrl: row.sourceUrl,
    stat: row.stat,
    statLabel: row.statLabel,
    resultLine: row.resultLine,
    hidden: row.hidden,
    sortOrder: row.sortOrder,
  };
}

export function mapProcess(row: typeof processSteps.$inferSelect): ProcessStep {
  return {
    id: row.id,
    kicker: row.kicker,
    title: row.title,
    body: row.body,
    hidden: row.hidden,
    sortOrder: row.sortOrder,
  };
}

export function mapTool(row: typeof tools.$inferSelect): Tool {
  return {
    id: row.id,
    name: row.name,
    group: row.groupName,
    kind: row.kind === "skill" ? "skill" : row.kind === "ai" ? "ai" : "tool",
    icon: row.icon ?? "",
    note: row.note ?? "",
    hidden: row.hidden,
    sortOrder: row.sortOrder,
  };
}

export function mapArticle(row: typeof articles.$inferSelect): Article {
  return {
    id: row.id,
    kind: row.kind === "link" ? "link" : "article",
    slug: row.slug,
    title: row.title,
    url: row.url,
    source: row.source,
    cover: row.cover,
    coverDominant: safeColor(row.coverDominant),
    publishedAt: toIso(row.publishedAt),
    tags: strings(row.tags),
    pinned: row.pinned,
    hidden: row.hidden,
    excerpt: row.excerpt,
    body: row.body,
    sortOrder: row.sortOrder,
  };
}

export function mapLink(row: typeof links.$inferSelect): CustomLink {
  return {
    id: row.id,
    label: row.label,
    url: row.url,
    group: row.groupName,
    hidden: row.hidden,
    sortOrder: row.sortOrder,
  };
}

export function mapLegal(row: typeof legalPages.$inferSelect): LegalPage {
  return {
    slug: row.slug === "privacy" ? "privacy" : "terms",
    title: row.title,
    eyebrow: row.eyebrow,
    body: row.body,
    updatedAt: toIso(row.updatedAt),
  };
}

export function mapStats(row: typeof stats.$inferSelect): Stats {
  return {
    impressionsAll: row.impressionsAll,
    impressions30d: row.impressions30d,
    likes: row.likes,
    posts: row.posts,
    followers: row.followers,
    engagement: row.engagement ?? 0,
    videos: row.videos ?? 0,
    placeholder: row.placeholder ?? true,
    platforms: normalizePlatforms(row.platforms),
    bestPostId: row.bestPostId,
    updatedAt: toIso(row.updatedAt),
  };
}

function normalizeLane(value: string | null | undefined): Lane {
  return (LANES as readonly string[]).includes(value ?? "") ? (value as Lane) : "generation";
}

function normalizeRole(value: string | null | undefined): PartnerRole {
  return (PARTNER_ROLES as readonly string[]).includes(value ?? "") ? (value as PartnerRole) : "ambassador";
}

export function normalizePlatforms(value: unknown): PlatformStat[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Partial<PlatformStat>;
    if (typeof row.platform !== "string" || !(PLATFORMS as readonly string[]).includes(row.platform)) return [];
    return [{
      platform: row.platform,
      label: typeof row.label === "string" ? row.label : row.platform,
      handle: typeof row.handle === "string" ? row.handle : "",
      url: typeof row.url === "string" ? row.url : "",
      impressions: numberOrZero(row.impressions),
      followers: numberOrZero(row.followers),
      videos: numberOrZero(row.videos),
      engagement: numberOrZero(row.engagement),
      likes: numberOrZero(row.likes),
      placeholder: Boolean(row.placeholder),
    }];
  });
}

function numberOrZero(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

export function mapAgent(row: typeof agentState.$inferSelect | undefined) {
  return {
    lastHeartbeatAt: row?.lastHeartbeatAt ? toIso(row.lastHeartbeatAt) : null,
    message: row?.message ?? "",
  };
}

export function mapSubmission(row: typeof submissions.$inferSelect): Submission {
  return {
    id: row.id,
    name: row.name,
    project: row.project,
    budget: row.budget,
    link: row.link,
    message: row.message,
    createdAt: toIso(row.createdAt),
  };
}
