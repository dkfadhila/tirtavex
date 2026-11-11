import {
  bigserial,
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey(),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
});

export const stats = pgTable("stats", {
  id: integer("id").primaryKey(),
  impressionsAll: doublePrecision("impressions_all").notNull().default(0),
  impressions30d: doublePrecision("impressions_30d").notNull().default(0),
  likes: doublePrecision("likes").notNull().default(0),
  posts: doublePrecision("posts").notNull().default(0),
  followers: doublePrecision("followers").notNull().default(0),
  bestPostId: text("best_post_id").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const agentState = pgTable("agent_state", {
  id: integer("id").primaryKey(),
  lastHeartbeatAt: timestamp("last_heartbeat_at", { withTimezone: true }),
  message: text("message").notNull().default(""),
});

export const workItems = pgTable("work_items", {
  id: text("id").primaryKey(),
  xUrl: text("x_url").notNull().unique(),
  title: text("title").notNull(),
  note: text("note").notNull().default(""),
  category: text("category").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull(),
  pinned: boolean("pinned").notNull().default(false),
  thumbSrc: text("thumb_src").notNull().default(""),
  thumbBlurhash: text("thumb_blurhash").notNull().default(""),
  thumbDominant: text("thumb_dominant").notNull().default("#10B981"),
  thumbW: integer("thumb_w").notNull().default(1280),
  thumbH: integer("thumb_h").notNull().default(720),
  durationSec: doublePrecision("duration_sec"),
  authorName: text("author_name").notNull().default(""),
  authorHandle: text("author_handle").notNull().default(""),
  impressions: doublePrecision("impressions").notNull().default(0),
  likes: doublePrecision("likes").notNull().default(0),
  reposts: doublePrecision("reposts").notNull().default(0),
  replies: doublePrecision("replies").notNull().default(0),
  bookmarks: doublePrecision("bookmarks").notNull().default(0),
  quotes: doublePrecision("quotes").notNull().default(0),
  metricsUpdatedAt: timestamp("metrics_updated_at", { withTimezone: true }).notNull(),
  postedAt: timestamp("posted_at", { withTimezone: true }).notNull(),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("live"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const collabs = pgTable("collabs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  logo: text("logo").notNull().default(""),
  summary: text("summary").notNull().default(""),
  result: text("result").notNull().default(""),
  dateLabel: text("date_label").notNull().default(""),
  postIds: jsonb("post_ids").$type<string[]>().notNull(),
  hidden: boolean("hidden").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const programs = pgTable("programs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull().default(""),
  startLabel: text("start_label").notNull().default(""),
  endLabel: text("end_label").notNull().default(""),
  status: text("status").notNull().default("active"),
  highlights: jsonb("highlights").$type<string[]>().notNull(),
  postIds: jsonb("post_ids").$type<string[]>().notNull(),
  impressions: doublePrecision("impressions").notNull().default(0),
  likes: doublePrecision("likes").notNull().default(0),
  hidden: boolean("hidden").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const ambassadors = pgTable("ambassadors", {
  id: text("id").primaryKey(),
  project: text("project").notNull(),
  title: text("title").notNull().default(""),
  region: text("region").notNull().default(""),
  startLabel: text("start_label").notNull().default(""),
  status: text("status").notNull().default("active"),
  duties: jsonb("duties").$type<string[]>().notNull(),
  postIds: jsonb("post_ids").$type<string[]>().notNull(),
  hidden: boolean("hidden").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  client: text("client").notNull().default(""),
  dateLabel: text("date_label").notNull().default(""),
  industry: text("industry").notNull().default(""),
  services: jsonb("services").$type<string[]>().notNull(),
  budget: text("budget").notNull().default(""),
  aiTech: text("ai_tech").notNull().default(""),
  overview: text("overview").notNull().default(""),
  challenge: text("challenge").notNull().default(""),
  approach: text("approach").notNull().default(""),
  achievements: jsonb("achievements").$type<string[]>().notNull(),
  outcome: text("outcome").notNull().default(""),
  scope: jsonb("scope").$type<string[]>().notNull(),
  cover: text("cover").notNull().default(""),
  accent: text("accent").notNull().default("#10B981"),
  xUrl: text("x_url").notNull().default(""),
  websiteUrl: text("website_url").notNull().default(""),
  reviewQuote: text("review_quote").notNull().default(""),
  reviewAuthor: text("review_author").notNull().default(""),
  reviewRole: text("review_role").notNull().default(""),
  reviewStat: text("review_stat").notNull().default(""),
  reviewStatLabel: text("review_stat_label").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  hidden: boolean("hidden").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const contests = pgTable("contests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  organizer: text("organizer").notNull().default(""),
  dateLabel: text("date_label").notNull().default(""),
  year: integer("year").notNull(),
  placement: text("placement").notNull(),
  entryPostId: text("entry_post_id").notNull().default(""),
  thumb: text("thumb").notNull().default(""),
  xUrl: text("x_url").notNull().default(""),
  hidden: boolean("hidden").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const testimonials = pgTable("testimonials", {
  id: text("id").primaryKey(),
  quote: text("quote").notNull(),
  name: text("name").notNull().default(""),
  role: text("role").notNull().default(""),
  sourceUrl: text("source_url").notNull().default(""),
  stat: text("stat").notNull().default(""),
  statLabel: text("stat_label").notNull().default(""),
  resultLine: text("result_line").notNull().default(""),
  hidden: boolean("hidden").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const processSteps = pgTable("process_steps", {
  id: text("id").primaryKey(),
  kicker: text("kicker").notNull().default(""),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  hidden: boolean("hidden").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const tools = pgTable("tools", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  groupName: text("group_name").notNull().default(""),
  hidden: boolean("hidden").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const articles = pgTable("articles", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull().default("article"),
  slug: text("slug").notNull().default(""),
  title: text("title").notNull(),
  url: text("url").notNull().default(""),
  source: text("source").notNull().default(""),
  cover: text("cover").notNull().default(""),
  coverDominant: text("cover_dominant").notNull().default("#10B981"),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
  tags: jsonb("tags").$type<string[]>().notNull(),
  pinned: boolean("pinned").notNull().default(false),
  hidden: boolean("hidden").notNull().default(false),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const links = pgTable("links", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  groupName: text("group_name").notNull().default("footer"),
  hidden: boolean("hidden").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const legalPages = pgTable("legal_pages", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  eyebrow: text("eyebrow").notNull().default(""),
  body: text("body").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const submissions = pgTable("submissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  project: text("project").notNull().default(""),
  budget: text("budget").notNull().default(""),
  link: text("link").notNull().default(""),
  message: text("message").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const events = pgTable("events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  type: text("type").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  props: jsonb("props").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const schemaMigrations = pgTable("schema_migrations", {
  id: text("id").primaryKey(),
  appliedAt: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow(),
});
