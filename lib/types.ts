export const CATEGORIES = ["ai-video", "web3", "contest", "collab"] as const;
export type Category = (typeof CATEGORIES)[number];

export const PLACEMENTS = ["winner", "finalist", "top10", "participant"] as const;
export type Placement = (typeof PLACEMENTS)[number];

export type Metrics = {
  impressions: number;
  likes: number;
  reposts: number;
  replies: number;
  bookmarks: number;
  quotes: number;
  updatedAt: string;
};

export type WorkItem = {
  id: string;
  xUrl: string;
  title: string;
  note: string;
  category: Category;
  tags: string[];
  pinned: boolean;
  thumb: {
    src: string;
    blurhash: string;
    dominant: string;
    w: number;
    h: number;
    durationSec: number | null;
  };
  authorName: string;
  authorHandle: string;
  metrics: Metrics;
  postedAt: string;
  addedAt: string;
  status: "live" | "hidden" | "deleted";
  sortOrder: number;
};

export type Collab = {
  id: string;
  name: string;
  type: "brand" | "creator" | "project";
  logo: string;
  summary: string;
  result: string;
  date: string;
  postIds: string[];
  hidden: boolean;
  sortOrder: number;
};

export type Program = {
  id: string;
  name: string;
  role: string;
  start: string;
  end: string;
  status: "active" | "completed";
  highlights: string[];
  postIds: string[];
  impressions: number;
  likes: number;
  hidden: boolean;
  sortOrder: number;
};

export type Ambassador = {
  id: string;
  project: string;
  title: string;
  region: string;
  start: string;
  status: "active" | "past";
  duties: string[];
  postIds: string[];
  hidden: boolean;
  sortOrder: number;
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  year: number;
  client: string;
  date: string;
  industry: string;
  services: string[];
  budget: string;
  aiTech: string;
  overview: string;
  challenge: string;
  approach: string;
  achievements: string[];
  outcome: string;
  scope: string[];
  cover: string;
  accent: string;
  xUrl: string;
  websiteUrl: string;
  reviewQuote: string;
  reviewAuthor: string;
  reviewRole: string;
  reviewStat: string;
  reviewStatLabel: string;
  featured: boolean;
  hidden: boolean;
  sortOrder: number;
};

export type Contest = {
  id: string;
  name: string;
  organizer: string;
  date: string;
  year: number;
  placement: Placement;
  entryPostId: string;
  thumb: string;
  xUrl: string;
  hidden: boolean;
  sortOrder: number;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  sourceUrl: string;
  stat: string;
  statLabel: string;
  resultLine: string;
  hidden: boolean;
  sortOrder: number;
};

export type ProcessStep = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  hidden: boolean;
  sortOrder: number;
};

export type Tool = {
  id: string;
  name: string;
  group: string;
  hidden: boolean;
  sortOrder: number;
};

export type Article = {
  id: string;
  kind: "article" | "link";
  slug: string;
  title: string;
  url: string;
  source: string;
  cover: string;
  coverDominant: string;
  publishedAt: string;
  tags: string[];
  pinned: boolean;
  hidden: boolean;
  excerpt: string;
  body: string;
  sortOrder: number;
};

export type CustomLink = {
  id: string;
  label: string;
  url: string;
  group: string;
  hidden: boolean;
  sortOrder: number;
};

export type LegalPage = {
  slug: "terms" | "privacy";
  title: string;
  eyebrow: string;
  body: string;
  updatedAt: string;
};

export type SocialLink = { label: string; url: string };

export type Settings = {
  heroEyebrow: string;
  heroTitle: string;
  heroHeadline: string;
  heroLede: string;
  heroPrimaryLabel: string;
  heroSecondaryLabel: string;
  introLeftKicker: string;
  introLeftTitle: string;
  introLeftBody: string;
  introRightKicker: string;
  introRightTitle: string;
  introRightBody: string;
  marquee: string[];
  bio: string;
  bioLong: string;
  email: string;
  phone: string;
  location: string;
  availability: string;
  xHandle: string;
  xUrl: string;
  footerBlurb: string;
  contactHeadline: string;
  contactLede: string;
  metaTitle: string;
  metaDescription: string;
  pressNote: string;
  pulseLede: string;
  budgetOptions: string[];
  socials: SocialLink[];
};

export type Stats = {
  impressionsAll: number;
  impressions30d: number;
  likes: number;
  posts: number;
  followers: number;
  bestPostId: string;
  updatedAt: string;
};

export type AgentState = {
  lastHeartbeatAt: string | null;
  message: string;
};

export type SiteContent = {
  settings: Settings;
  stats: Stats;
  agent: AgentState;
  work: WorkItem[];
  collabs: Collab[];
  programs: Program[];
  ambassadors: Ambassador[];
  projects: Project[];
  contests: Contest[];
  testimonials: Testimonial[];
  process: ProcessStep[];
  tools: Tool[];
  articles: Article[];
  links: CustomLink[];
  legal: { terms: LegalPage; privacy: LegalPage };
};

export type Submission = {
  id: string;
  name: string;
  project: string;
  budget: string;
  link: string;
  message: string;
  createdAt: string;
};

export type AdminSnapshot = {
  source: "db" | "seed";
  writable: boolean;
  warning: string;
  content: SiteContent;
  submissions: Submission[];
};

export const RESOURCE_TYPES = [
  "work",
  "collabs",
  "programs",
  "ambassadors",
  "projects",
  "contests",
  "testimonials",
  "process",
  "tools",
  "articles",
  "links",
  "submissions",
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];
