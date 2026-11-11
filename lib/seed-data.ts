import type {
  Article,
  LegalPage,
  Settings,
  SiteContent,
  WorkItem,
} from "./types";

const TERMS_BODY = `## 1. Who this covers

These terms cover the public portfolio of Tirta (@TirtaVEX). By using the site you agree to them.

## 2. The work you see

Cards link out to posts on X. We do not host the videos. Metrics are mirrored from a public source or typed in by the owner and can lag or disappear if a post is deleted.

## 3. Collab briefs

If you send a brief, you give us permission to reply about that project. Do not include secrets, seed phrases, or private keys. We store the form so the owner can read it.

## 4. Acceptable use

Do not misuse the site, probe the admin, or send automated traffic at the forms. The agent API is private and not licensed for reuse.

## 5. No warranty

The site is provided as is. Placeholder names, budgets, and totals are not offers. A live number can be wrong; the post on X is the source of truth.

## 6. Changes

We may update these terms. The date on this page is the latest edit stored in the database.
`;

const PRIVACY_BODY = `## 1. What we collect

- A collab brief: name, project, budget range, a link, and an optional note.
- Technical logs a host such as Vercel keeps (IP address, user agent) to run and protect the site.
- Anonymous product events (which card was opened, which filter changed) if analytics is on.
- Admin session cookies if you are the owner. Visitors do not get an account.

## 2. What we do not collect

We do not ask visitors to connect a wallet, and we do not sell personal information. Payment data is not processed on this site.

## 3. How long briefs stay

Briefs stay in the database until the owner deletes them. Ask via the contact page if you want one removed.

## 4. Cookies

The public site does not set a tracking cookie. The admin session cookie is httpOnly, used only to keep the owner signed in.

## 5. Processors

The site may be hosted on Vercel, with Postgres (Neon or similar) and optional Vercel Blob for images. Outbound links go to X and to addresses the owner publishes.

## 6. Contact

Privacy questions go through the contact page. We may update this policy; the date below is the stored edit time.
`;

function metrics(now: string, impressions: number, likes: number, reposts: number, replies: number, bookmarks = 0, quotes = 0) {
  return { impressions, likes, reposts, replies, bookmarks, quotes, updatedAt: now };
}

function work(partial: Omit<WorkItem, "authorName" | "authorHandle" | "thumb"> & {
  thumb?: Partial<WorkItem["thumb"]>;
  authorName?: string;
  authorHandle?: string;
}): WorkItem {
  return {
    authorName: partial.authorName ?? "Tirta",
    authorHandle: partial.authorHandle ?? "TirtaVEX",
    ...partial,
    thumb: {
      src: "",
      blurhash: "",
      dominant: "#10B981",
      w: 1280,
      h: 720,
      durationSec: 15,
      ...partial.thumb,
    },
  };
}

export function buildSeed(now = new Date()): SiteContent {
  const iso = now.toISOString();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();

  const settings: Settings = {
    heroEyebrow: "AI video × Web3",
    heroTitle: "Tirta",
    heroHeadline: "AI video and Web3 stories that people actually watch.",
    heroLede: "Every post. Every number. Always current. Thumbnails here, the film on X.",
    heroPrimaryLabel: "See the work",
    heroSecondaryLabel: "Collab with me",
    introLeftKicker: "Visual stories",
    introLeftTitle: "Proof, not a sizzle reel.",
    introLeftBody:
      "Each card is a real post. Click it and you land on X, where the cut, the replies, and the count still live.",
    introRightKicker: "Why Tirta",
    introRightTitle: "Skip the stale deck.",
    introRightBody:
      "Protocols and brands get a director who ships AI video with a paper trail: impressions, likes, and the people who stayed to the last frame.",
    marquee: ["AI video", "Web3", "Motion", "Campaigns", "Contests", "Collabs", "Short form", "Launch films"],
    bio: "Tirta (@TirtaVEX) directs AI video for Web3 teams that need films people finish.",
    bioLong:
      "Tirta works where a protocol launch needs a picture people remember. The practice is small on purpose: one director, a short tool list, and an agent that keeps the numbers honest.\n\nThe films stay on X. This site keeps the thumbnail and, once the agent is connected, the public counts.",
    email: "",
    phone: "",
    location: "",
    availability: "",
    xHandle: "TirtaVEX",
    xUrl: "https://x.com/TirtaVEX",
    footerBlurb: "AI video and Web3 stories, kept in sync with the posts themselves.",
    contactHeadline: "Let’s make something people replay.",
    contactLede: "Tell me the protocol, the product, or the strange idea. I read every brief.",
    metaTitle: "Tirta · AI video and Web3",
    metaDescription:
      "Living portfolio of Tirta (@TirtaVEX). AI video, Web3 campaigns, collabs, programs, and contests — every card opens the original post.",
    pressNote: "Short bio and handle for Tirta. Final portraits ship separately.",
    pulseLede: "",
    budgetOptions: ["Not sure yet"],
    socials: [{ label: "X", url: "https://x.com/TirtaVEX" }],
  };

  const items: WorkItem[] = [
    work({
      id: "work_01",
      xUrl: "https://x.com/TirtaVEX/status/1000000000000000001",
      title: "{{neon_bazaar}} launch film",
      note: "Pinned cut. The one-line note Tirta writes for the three cards that lead the grid.",
      category: "ai-video",
      tags: ["launch", "15s", "{{campaign}}"],
      pinned: true,
      thumb: { dominant: "#10B981", durationSec: 15 },
      metrics: metrics(iso, 2400000, 18400, 2100, 640, 900, 220),
      postedAt: daysAgo(2),
      addedAt: iso,
      status: "live",
      sortOrder: 0,
    }),
    work({
      id: "work_02",
      xUrl: "https://x.com/TirtaVEX/status/1000000000000000002",
      title: "{{mint_protocol}} explainer",
      note: "",
      category: "web3",
      tags: ["explainer", "thread"],
      pinned: true,
      thumb: { dominant: "#0F766E", durationSec: 42 },
      metrics: metrics(iso, 980000, 7600, 840, 310, 400, 90),
      postedAt: daysAgo(9),
      addedAt: daysAgo(9),
      status: "live",
      sortOrder: 1,
    }),
    work({
      id: "work_03",
      xUrl: "https://x.com/TirtaVEX/status/1000000000000000003",
      title: "Contest entry · {{glass_award}}",
      note: "Finalist cut. Medal lives in Contests.",
      category: "contest",
      tags: ["finalist", "ai-video"],
      pinned: true,
      thumb: { dominant: "#047857", durationSec: 20 },
      metrics: metrics(iso, 1560000, 22100, 3400, 880, 1200, 410),
      postedAt: daysAgo(20),
      addedAt: daysAgo(20),
      status: "live",
      sortOrder: 2,
    }),
    work({
      id: "work_04",
      xUrl: "https://x.com/TirtaVEX/status/1000000000000000004",
      title: "Collab with {{lumen_dao}}",
      note: "",
      category: "collab",
      tags: ["collab", "dao"],
      pinned: false,
      thumb: { dominant: "#34D399", durationSec: 12 },
      metrics: metrics(iso, 640000, 4100, 510, 190),
      postedAt: daysAgo(30),
      addedAt: daysAgo(28),
      status: "live",
      sortOrder: 3,
    }),
    work({
      id: "work_05",
      xUrl: "https://x.com/TirtaVEX/status/1000000000000000005",
      title: "{{archive_drop}} teaser",
      note: "",
      category: "ai-video",
      tags: ["teaser"],
      pinned: false,
      thumb: { dominant: "#065F46", durationSec: 8 },
      metrics: metrics(iso, 410000, 2900, 260, 140),
      postedAt: daysAgo(40),
      addedAt: daysAgo(40),
      status: "live",
      sortOrder: 4,
    }),
    work({
      id: "work_06",
      xUrl: "https://x.com/TirtaVEX/status/1000000000000000006",
      title: "Onchain recap · week {{nn}}",
      note: "",
      category: "web3",
      tags: ["recap"],
      pinned: false,
      thumb: { dominant: "#059669", durationSec: 55 },
      metrics: metrics(iso, 220000, 1800, 190, 96),
      postedAt: daysAgo(48),
      addedAt: daysAgo(48),
      status: "live",
      sortOrder: 5,
    }),
    work({
      id: "work_07",
      xUrl: "https://x.com/TirtaVEX/status/1000000000000000007",
      title: "{{partner_brand}} product loop",
      note: "",
      category: "collab",
      tags: ["product", "loop"],
      pinned: false,
      thumb: { dominant: "#10B981", durationSec: 6 },
      metrics: metrics(iso, 880000, 6400, 700, 240),
      postedAt: daysAgo(60),
      addedAt: daysAgo(55),
      status: "live",
      sortOrder: 6,
    }),
    work({
      id: "work_08",
      xUrl: "https://x.com/TirtaVEX/status/1000000000000000008",
      title: "Winner’s cut · {{open_contest}}",
      note: "",
      category: "contest",
      tags: ["winner"],
      pinned: false,
      thumb: { dominant: "#0F766E", durationSec: 18 },
      metrics: metrics(iso, 3100000, 40200, 6100, 1500, 2200, 800),
      postedAt: daysAgo(75),
      addedAt: daysAgo(70),
      status: "live",
      sortOrder: 7,
    }),
  ];

  const workStills = ["/media/work-1.webp", "/media/work-2.webp", "/media/work-3.webp", "/media/work-4.webp", "/media/work-5.webp", "/media/work-6.webp"];
  items.forEach((item, index) => {
    item.thumb.src = workStills[index % workStills.length];
    item.thumb.w = 1600;
    item.thumb.h = 1000;
  });

  const articles: Article[] = [
    {
      id: "article_01",
      kind: "article",
      slug: "how-i-cut-an-ai-film",
      title: "How I cut an AI film before lunch",
      url: "",
      source: "Journal",
      cover: "",
      coverDominant: "#10B981",
      publishedAt: daysAgo(4),
      tags: ["process", "ai-video"],
      pinned: true,
      hidden: false,
      excerpt: "A field note on keeping a 15-second launch film honest when the model wants to invent a second logo.",
      body: `### Start with the post, not the prompt

The cut has to survive on X. I write the first line of the post before I open a generator. If the sentence is dull, the film will be too.

### Generate wide, edit narrow

The generator explores. The edit assembles. I keep one gesture, one light, one claim. Everything else is a deleted take.

### Publish where the number is real

The portfolio only stores a thumbnail. The file people argue about stays on X, which is the point.`,
      sortOrder: 0,
    },
    {
      id: "article_02",
      kind: "article",
      slug: "reading-impressions",
      title: "Reading impressions without lying",
      url: "",
      source: "Journal",
      cover: "",
      coverDominant: "#047857",
      publishedAt: daysAgo(12),
      tags: ["metrics"],
      pinned: false,
      hidden: false,
      excerpt: "Views are not taste. Here is the small set of numbers I actually show a partner.",
      body: `### The set

Impressions, likes, reposts, replies, bookmarks. Quotes when the provider has them. If a source cannot see impressions, the card says so by going quiet rather than inventing a total.

### Freshness

Pinned posts should move within a minute when the agent is awake. Everything else can wait a quarter hour. A stale dot is more useful than a fake tick.`,
      sortOrder: 1,
    },
    {
      id: "article_03",
      kind: "article",
      slug: "web3-launch-checklist",
      title: "A launch checklist for protocol films",
      url: "",
      source: "Journal",
      cover: "",
      coverDominant: "#0F766E",
      publishedAt: daysAgo(21),
      tags: ["web3", "campaign"],
      pinned: false,
      hidden: false,
      excerpt: "What I ask a founder before a token, a chain, or a marketplace gets a film.",
      body: `### Questions

Who is the viewer who is not already in the Discord? What must be true in the frame at second three? Which post is the source of truth when the landing page changes?

### Deliverables

One hero film, three cutdowns, and a still that can live without type. The case study page is the record. The post is the work.`,
      sortOrder: 2,
    },
    {
      id: "article_04",
      kind: "article",
      slug: "thumbnails-are-posters",
      title: "Thumbnails are posters",
      url: "",
      source: "Journal",
      cover: "",
      coverDominant: "#065F46",
      publishedAt: daysAgo(33),
      tags: ["craft"],
      pinned: false,
      hidden: false,
      excerpt: "A note on why this site refuses to press play.",
      body: `The thumbnail is a poster. Pressing play inside a portfolio steals the post’s replies and splits the count. I would rather send you to X.`,
      sortOrder: 3,
    },
    {
      id: "article_05",
      kind: "link",
      slug: "",
      title: "{{guest_essay}} on short-form for protocols",
      url: "https://example.com/guest-essay",
      source: "{{magazine}}",
      cover: "",
      coverDominant: "#34D399",
      publishedAt: daysAgo(15),
      tags: ["link", "press"],
      pinned: false,
      hidden: false,
      excerpt: "An outside link. The journal keeps the title, the source, and the date.",
      body: "",
      sortOrder: 4,
    },
    {
      id: "article_06",
      kind: "link",
      slug: "",
      title: "Interview · {{podcast_name}}",
      url: "https://example.com/interview",
      source: "{{podcast_name}}",
      cover: "",
      coverDominant: "#059669",
      publishedAt: daysAgo(45),
      tags: ["link", "audio"],
      pinned: false,
      hidden: false,
      excerpt: "A conversation about contests, ambassadors, and cutting without a crew.",
      body: "",
      sortOrder: 5,
    },
  ];

  const legal = (slug: "terms" | "privacy", title: string, body: string): LegalPage => ({
    slug,
    title,
    eyebrow: slug === "terms" ? "The agreement" : "Your information",
    body,
    updatedAt: iso,
  });

  return {
    settings,
    stats: {
      impressionsAll: 0,
      impressions30d: 0,
      likes: 0,
      posts: 0,
      followers: 0,
      bestPostId: "",
      updatedAt: iso,
    },
    agent: { lastHeartbeatAt: null, message: "" },
    work: items,
    collabs: [
      {
        id: "collab_01",
        name: "{{aurora_labs}}",
        type: "brand",
        logo: "",
        summary: "A launch film and three cutdowns for a consumer wallet that needed to look inevitable.",
        result: "{{impressions}} views on the hero post, with the cutdown reused by their ambassadors.",
        date: "2026",
        postIds: ["work_01", "work_07"],
        hidden: false,
        sortOrder: 0,
      },
      {
        id: "collab_02",
        name: "{{mint_protocol}}",
        type: "project",
        logo: "",
        summary: "Explainer for a mint that had more mechanics than minutes.",
        result: "One 42-second film replaced a six-page thread.",
        date: "2026",
        postIds: ["work_02"],
        hidden: false,
        sortOrder: 1,
      },
      {
        id: "collab_03",
        name: "{{lumen_dao}}",
        type: "project",
        logo: "",
        summary: "Season film for a contributor DAO. Faces stayed off camera; the work did not.",
        result: "Shared by {{repost_count}} member accounts in the first day.",
        date: "2025",
        postIds: ["work_04"],
        hidden: false,
        sortOrder: 2,
      },
      {
        id: "collab_04",
        name: "{{partner_brand}}",
        type: "brand",
        logo: "",
        summary: "Product loop for a hardware drop. Six seconds, one gesture, no voiceover.",
        result: "Loop ran on their launch post and in the partner program.",
        date: "2025",
        postIds: ["work_07"],
        hidden: false,
        sortOrder: 3,
      },
      {
        id: "collab_05",
        name: "{{creator_name}}",
        type: "creator",
        logo: "",
        summary: "A trade: their audience, Tirta’s edit. Both posts stayed on our own accounts.",
        result: "Two films, one shared still, no joint account.",
        date: "2025",
        postIds: ["work_05"],
        hidden: false,
        sortOrder: 4,
      },
      {
        id: "collab_06",
        name: "{{archive_house}}",
        type: "brand",
        logo: "",
        summary: "Title sequence for a digital archive that wanted to feel like a room, not a grid.",
        result: "Teaser plus a still set. Case study lives under Projects.",
        date: "2026",
        postIds: ["work_05"],
        hidden: false,
        sortOrder: 5,
      },
    ],
    programs: [
      {
        id: "program_01",
        name: "{{content_partner_program}}",
        role: "Video partner",
        start: "Jan 2026",
        end: "",
        status: "active",
        highlights: ["{{n}} films shipped", "Hero post pinned by the program", "Cutdowns reused by regional leads"],
        postIds: ["work_01", "work_02"],
        impressions: 3380000,
        likes: 26000,
        hidden: false,
        sortOrder: 0,
      },
      {
        id: "program_02",
        name: "{{creator_cohort}}",
        role: "Cohort filmmaker",
        start: "Mar 2025",
        end: "Dec 2025",
        status: "completed",
        highlights: ["Weekly recap format", "Office hours for other cohort editors"],
        postIds: ["work_06"],
        impressions: 220000,
        likes: 1800,
        hidden: false,
        sortOrder: 1,
      },
      {
        id: "program_03",
        name: "{{ecosystem_studio}}",
        role: "Studio seat",
        start: "Jun 2025",
        end: "",
        status: "active",
        highlights: ["Launch support for two protocols", "Shared thumbnail system"],
        postIds: ["work_04", "work_07"],
        impressions: 1520000,
        likes: 10500,
        hidden: false,
        sortOrder: 2,
      },
    ],
    ambassadors: [
      {
        id: "amb_01",
        project: "{{chain_name}}",
        title: "Creative ambassador",
        region: "{{region}}",
        start: "Feb 2026",
        status: "active",
        duties: ["One film a month", "Office hours", "Contest jury when asked"],
        postIds: ["work_02", "work_06"],
        hidden: false,
        sortOrder: 0,
      },
      {
        id: "amb_02",
        project: "{{wallet_name}}",
        title: "Launch ambassador",
        region: "Global",
        start: "Aug 2025",
        status: "active",
        duties: ["Launch week coverage", "Product loops", "Reply to creator questions"],
        postIds: ["work_01", "work_07"],
        hidden: false,
        sortOrder: 1,
      },
      {
        id: "amb_03",
        project: "{{archive_house}}",
        title: "Seasonal ambassador",
        region: "{{city}}",
        start: "Jan 2025",
        status: "past",
        duties: ["Title sequence", "Three still studies"],
        postIds: ["work_05"],
        hidden: false,
        sortOrder: 2,
      },
    ],
    projects: [
      {
        id: "project_01",
        slug: "neon-bazaar",
        name: "AI short film",
        year: 2026,
        client: "{{aurora_labs}}",
        date: "Jan 28, 2026",
        industry: "Consumer crypto",
        services: ["AI video", "Campaign"],
        budget: "{{budget_mid}}",
        aiTech: "{{tool_1}} · {{tool_2}}",
        overview: "A marketplace needed a film that felt like walking into a lit room, not a token diagram. We made one gesture do the explaining.",
        challenge: "The product had four features and nine seconds of attention. A voiceover would have sounded like a pitch.",
        approach: "We locked a single camera move, generated the room, and cut to the post’s first sentence. Type stayed off the picture.",
        achievements: ["Hero film plus three cutdowns", "Thumbnail system the partner program still uses", "Post became the best-performing launch asset that week"],
        outcome: "2.4M impressions on the hero post.",
        scope: ["AI video", "Campaign"],
        cover: "/media/work-1.webp",
        accent: "#10B981",
        xUrl: "https://x.com/TirtaVEX/status/1000000000000000001",
        websiteUrl: "https://example.com/neon-bazaar",
        reviewQuote: "It looked like we had a crew. We had a director and a deadline.",
        reviewAuthor: "{{client_lead}}",
        reviewRole: "Marketing, {{aurora_labs}}",
        reviewStat: "3×",
        reviewStatLabel: "Faster than their last shoot",
        featured: true,
        hidden: false,
        sortOrder: 0,
      },
      {
        id: "project_02",
        slug: "mint-protocol",
        name: "Web3 launch",
        year: 2026,
        client: "{{mint_protocol}}",
        date: "Nov 02, 2025",
        industry: "Protocol",
        services: ["Explainer", "Web3"],
        budget: "{{budget_low}}",
        aiTech: "{{tool_1}}",
        overview: "A mint flow that engineers loved and everyone else abandoned. The film is the version you can finish.",
        challenge: "Every stakeholder wanted their screen in the cut.",
        approach: "We storyboarded the feeling of a successful mint, then let one UI beat stand in for the rest.",
        achievements: ["42-second explainer", "Still set for the docs", "Thread reduced to four posts"],
        outcome: "980K impressions. Docs linked the post instead of a loom.",
        scope: ["Web3", "AI video"],
        cover: "/media/work-2.webp",
        accent: "#0F766E",
        xUrl: "https://x.com/TirtaVEX/status/1000000000000000002",
        websiteUrl: "",
        reviewQuote: "People finally understood the mint without a call.",
        reviewAuthor: "{{founder_name}}",
        reviewRole: "Founder",
        reviewStat: "45%",
        reviewStatLabel: "More replies than the written thread",
        featured: true,
        hidden: false,
        sortOrder: 1,
      },
      {
        id: "project_03",
        slug: "lumen-season",
        name: "Creator brand kit",
        year: 2025,
        client: "{{lumen_dao}}",
        date: "Aug 14, 2025",
        industry: "DAO",
        services: ["Campaign", "Short form"],
        budget: "{{budget_mid}}",
        aiTech: "{{tool_2}}",
        overview: "A contributor DAO wanted a season film that members would actually repost on their own accounts.",
        challenge: "No faces, no office, no shared mascot.",
        approach: "Light, tools, and the work itself. The film is a desk at night and the sound of a render finishing.",
        achievements: ["Season film", "Member cutdowns", "Caption system"],
        outcome: "Reposted across the contributor graph in a day.",
        scope: ["Collab", "AI video"],
        cover: "/media/work-3.webp",
        accent: "#34D399",
        xUrl: "https://x.com/TirtaVEX/status/1000000000000000004",
        websiteUrl: "",
        reviewQuote: "It felt like us, which is rare for something we didn’t shoot.",
        reviewAuthor: "{{steward_name}}",
        reviewRole: "Steward",
        reviewStat: "60%",
        reviewStatLabel: "Less production time",
        featured: false,
        hidden: false,
        sortOrder: 2,
      },
      {
        id: "project_04",
        slug: "archive-drop",
        name: "Kinetic reel",
        year: 2026,
        client: "{{archive_house}}",
        date: "Feb 02, 2026",
        industry: "Culture",
        services: ["Title", "Stills"],
        budget: "{{budget_high}}",
        aiTech: "{{tool_1}} · edit",
        overview: "A title sequence for a digital archive. The room is the interface.",
        challenge: "The collection is real. The pictures of it could not look like stock futures.",
        approach: "We studied their catalog metadata and built shots from objects they already had, then graded everything toward paper and emerald glass.",
        achievements: ["Title sequence", "Teaser post", "Three still studies"],
        outcome: "Teaser carried the announcement. The sequence opened the drop.",
        scope: ["AI video", "Campaign"],
        cover: "/media/work-4.webp",
        accent: "#065F46",
        xUrl: "https://x.com/TirtaVEX/status/1000000000000000005",
        websiteUrl: "https://example.com/archive",
        reviewQuote: "Quiet, specific, and finished on time.",
        reviewAuthor: "{{curator_name}}",
        reviewRole: "Curator",
        reviewStat: "8s",
        reviewStatLabel: "Teaser people watched twice",
        featured: true,
        hidden: false,
        sortOrder: 3,
      },
      {
        id: "project_05",
        slug: "open-contest",
        name: "Onchain lattice",
        year: 2025,
        client: "{{contest_organizer}}",
        date: "May 19, 2025",
        industry: "Contest",
        services: ["AI video"],
        budget: "Prize · {{prize}}",
        aiTech: "{{tool_1}}",
        overview: "The winning entry. A short film about a city that renders itself one block at a time.",
        challenge: "The brief was one word and a weekend.",
        approach: "Commit to a rule — each shot adds exactly one object — and never break it.",
        achievements: ["Winner", "Featured by the organizer", "Still used in their recap"],
        outcome: "3.1M impressions. The entry post is the case study.",
        scope: ["Contest", "AI video"],
        cover: "/media/work-5.webp",
        accent: "#047857",
        xUrl: "https://x.com/TirtaVEX/status/1000000000000000008",
        websiteUrl: "",
        reviewQuote: "The rule made it memorable. The craft made it win.",
        reviewAuthor: "{{judge_name}}",
        reviewRole: "Judge",
        reviewStat: "1st",
        reviewStatLabel: "Placement",
        featured: false,
        hidden: false,
        sortOrder: 4,
      },
      {
        id: "project_06",
        slug: "week-notes",
        name: "Creator collab",
        year: 2026,
        client: "Self-initiated",
        date: "Mar 03, 2026",
        industry: "Editorial",
        services: ["Recap", "Web3"],
        budget: "—",
        aiTech: "Edit only",
        overview: "A recurring onchain recap. Small on purpose, so the format can survive a busy week.",
        challenge: "News expires. The format cannot.",
        approach: "Same length, same cold open, new facts. The portfolio keeps one example.",
        achievements: ["Format other creators borrowed", "Cohort teaching piece"],
        outcome: "A repeatable 55-second structure.",
        scope: ["Web3", "Thread"],
        cover: "/media/work-6.webp",
        accent: "#059669",
        xUrl: "https://x.com/TirtaVEX/status/1000000000000000006",
        websiteUrl: "",
        reviewQuote: "I can tell which week it is without reading the caption.",
        reviewAuthor: "{{peer_creator}}",
        reviewRole: "Creator",
        reviewStat: "55s",
        reviewStatLabel: "Fixed length",
        featured: false,
        hidden: false,
        sortOrder: 5,
      },
    ],
    contests: [
      {
        id: "contest_01",
        name: "{{open_contest}}",
        organizer: "{{contest_organizer}}",
        date: "May 2025",
        year: 2025,
        placement: "winner",
        entryPostId: "work_08",
        thumb: "",
        xUrl: "https://x.com/TirtaVEX/status/1000000000000000008",
        hidden: false,
        sortOrder: 0,
      },
      {
        id: "contest_02",
        name: "{{glass_award}}",
        organizer: "{{award_body}}",
        date: "Jan 2026",
        year: 2026,
        placement: "finalist",
        entryPostId: "work_03",
        thumb: "",
        xUrl: "https://x.com/TirtaVEX/status/1000000000000000003",
        hidden: false,
        sortOrder: 1,
      },
      {
        id: "contest_03",
        name: "{{short_form_open}}",
        organizer: "{{festival_name}}",
        date: "Sep 2025",
        year: 2025,
        placement: "top10",
        entryPostId: "work_05",
        thumb: "",
        xUrl: "https://x.com/TirtaVEX/status/1000000000000000005",
        hidden: false,
        sortOrder: 2,
      },
      {
        id: "contest_04",
        name: "{{protocol_jam}}",
        organizer: "{{chain_name}}",
        date: "Nov 2025",
        year: 2025,
        placement: "participant",
        entryPostId: "work_02",
        thumb: "",
        xUrl: "https://x.com/TirtaVEX/status/1000000000000000002",
        hidden: false,
        sortOrder: 3,
      },
    ],
    testimonials: [
      {
        id: "quote_01",
        quote: "Beautiful visuals, delivered before the launch thread even drafted itself.",
        name: "{{client_lead}}",
        role: "{{aurora_labs}} · {{city}}",
        sourceUrl: "https://x.com/TirtaVEX/status/1000000000000000001",
        stat: "3×",
        statLabel: "Faster",
        resultLine: "Delivered {{asset_count}} campaign assets in record time.",
        hidden: false,
        sortOrder: 0,
      },
      {
        id: "quote_02",
        quote: "The film did what the landing page couldn’t. People stayed.",
        name: "{{founder_name}}",
        role: "{{mint_protocol}}",
        sourceUrl: "https://x.com/TirtaVEX/status/1000000000000000002",
        stat: "45%",
        statLabel: "More replies",
        resultLine: "Social replies climbed after the explainer went up.",
        hidden: false,
        sortOrder: 1,
      },
      {
        id: "quote_03",
        quote: "Stunning, specific, and early. We stopped planning a shoot.",
        name: "{{steward_name}}",
        role: "{{lumen_dao}}",
        sourceUrl: "https://x.com/TirtaVEX/status/1000000000000000004",
        stat: "60%",
        statLabel: "Less production",
        resultLine: "Creative production time dropped against the previous season.",
        hidden: false,
        sortOrder: 2,
      },
    ],
    process: [
      { id: "step_01", kicker: "Discovery", title: "Idea", body: "Read the product until one sentence is worth a film. If it isn’t, we don’t generate yet.", hidden: false, sortOrder: 0 },
      { id: "step_02", kicker: "Direction", title: "Generate", body: "Explore widely, then keep the takes that obey the sentence.", hidden: false, sortOrder: 1 },
      { id: "step_03", kicker: "Production", title: "Edit", body: "Cut for a thumb stopping on a phone. Sound, type, and length get decided here.", hidden: false, sortOrder: 2 },
      { id: "step_04", kicker: "Delivery", title: "Publish", body: "The post goes live on X. The agent mirrors the thumbnail and the numbers back here.", hidden: false, sortOrder: 3 },
    ],
    tools: [
      { id: "tool_01", name: "{{tool_1}}", group: "Generate", hidden: false, sortOrder: 0 },
      { id: "tool_02", name: "{{tool_2}}", group: "Generate", hidden: false, sortOrder: 1 },
      { id: "tool_03", name: "{{editor}}", group: "Edit", hidden: false, sortOrder: 2 },
      { id: "tool_04", name: "{{grade}}", group: "Edit", hidden: false, sortOrder: 3 },
      { id: "tool_05", name: "{{audio_tool}}", group: "Sound", hidden: false, sortOrder: 4 },
      { id: "tool_06", name: "X", group: "Publish", hidden: false, sortOrder: 5 },
      { id: "tool_07", name: "{{stills_tool}}", group: "Stills", hidden: false, sortOrder: 6 },
      { id: "tool_08", name: "{{captions_tool}}", group: "Publish", hidden: false, sortOrder: 7 },
    ],
    articles,
    links: [
      { id: "link_01", label: "X · @TirtaVEX", url: "https://x.com/TirtaVEX", group: "social", hidden: false, sortOrder: 0 },
      { id: "link_02", label: "{{press_page}}", url: "https://example.com/press", group: "footer", hidden: false, sortOrder: 1 },
      { id: "link_03", label: "{{rate_card}}", url: "https://example.com/rate-card", group: "footer", hidden: false, sortOrder: 2 },
      { id: "link_04", label: "{{newsletter}}", url: "https://example.com/letters", group: "journal", hidden: false, sortOrder: 3 },
    ],
    legal: {
      terms: legal("terms", "Terms", TERMS_BODY),
      privacy: legal("privacy", "Privacy Policy", PRIVACY_BODY),
    },
  };
}

export function emptyContent(): SiteContent {
  const seed = buildSeed();
  return {
    ...seed,
    work: [],
    collabs: [],
    programs: [],
    ambassadors: [],
    projects: [],
    contests: [],
    testimonials: [],
    process: [],
    tools: [],
    articles: [],
    links: [],
    stats: { ...seed.stats, impressionsAll: 0, impressions30d: 0, likes: 0, posts: 0, followers: 0, bestPostId: "" },
    agent: { lastHeartbeatAt: null, message: "" },
  };
}
