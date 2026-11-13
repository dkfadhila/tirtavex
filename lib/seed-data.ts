import videosData from "./videos-data.json";
import type {
  Article,
  Contest,
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

function work(partial: Omit<WorkItem, "authorName" | "authorHandle" | "thumb" | "lane" | "videoUrl" | "placeholder"> & {
  thumb?: Partial<WorkItem["thumb"]>;
  authorName?: string;
  authorHandle?: string;
  lane?: WorkItem["lane"];
  videoUrl?: string;
  placeholder?: boolean;
}): WorkItem {
  const { thumb, authorName, authorHandle, lane, videoUrl, placeholder, ...rest } = partial;
  return {
    authorName: authorName ?? "Tirta",
    authorHandle: authorHandle ?? "tirtavex",
    lane: lane ?? "generation",
    videoUrl: videoUrl ?? "",
    placeholder: placeholder ?? false,
    ...rest,
    thumb: {
      src: "",
      blurhash: "",
      dominant: "#10B981",
      w: 1280,
      h: 720,
      durationSec: null,
      ...thumb,
    },
  };
}

export function buildSeed(now = new Date()): SiteContent {
  const iso = now.toISOString();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();

  const settings: Settings = {
    heroEyebrow: "Meet me",
    heroTitle: "Tirta",
    heroHeadline: "Tirta",
    heroLede: "AI video, cut with a director’s eye.",
    heroPrimaryLabel: "The Cut",
    heroSecondaryLabel: "Contact",
    introLeftKicker: "About",
    introLeftTitle: "Real craft, AI picture.",
    introLeftBody:
      "Years behind the camera, then years of web3 and crypto storytelling. The AI work keeps both.",
    introRightKicker: "Based in",
    introRightTitle: "Indonesia",
    introRightBody: "Videography, cinematography, story directing, and editing came before the models did.",
    marquee: ["Cinematic", "Speed ramping", "Realistic", "Anime", "UGC ads", "Kinetic type", "Motion", "Fashion"],
    bio: "I'm Tirta, an AI video creator from Indonesia.",
    bioLong:
      "I'm Tirta, an AI video creator from Indonesia. Exploring insights, researching ideas, and directing stories across AI, Web3, and emerging creative tech. Creator Partner at AZ8, Cuddler, Wizstar, and Video Rebirth.",
    email: "deckafadhila@gmail.com",
    phone: "",
    location: "Indonesia",
    availability: "",
    xHandle: "tirtavex",
    xUrl: "https://x.com/tirtavex",
    footerBlurb: "AI video and creative tech by Tirta (@tirtavex).",
    contactHeadline: "Contact",
    contactLede: "Email, or a message on X, TikTok, or Instagram.",
    metaTitle: "Tirta · AI video",
    metaDescription:
      "Tirta (@tirtavex) is an AI video creator in Indonesia. Cinematic AI video, campaigns, and creator partnerships.",
    pressNote: "Tirta (@tirtavex), AI video creator based in Indonesia.",
    pulseLede: "Live platform numbers and recent campaign activity across X, TikTok, and Instagram.",
    heroTagline: "AI video, cut with a director’s eye.",
    aboutEyebrow: "Indonesia",
    aboutTitle: "About",
    aboutMore:
      "The genres are cinematic, speed ramping, realistic character work, anime, UGC ads, kinetic typography, motion-design explainers, and fashion editorial. Web3 and crypto content is where the storytelling got sharp. The camera habits came first.",
    workTitle: "The Cut",
    workLede: "AI video generation. Selected cuts published live on X.",
    campaignsTitle: "Campaigns & Quests",
    campaignsLede: "Featured campaign films, creator challenges, and seasonal video drops.",
    partnersTitle: "Partners",
    partnersLede: "Creator partner programs and creative AI collaborations across video studios and model platforms.",
    statsTitle: "Engagement",
    statsLede: "Impressions, followers, and published videos across X, TikTok, and Instagram.",
    skillsTitle: "Skills, Tools & AI",
    skillsLede: "",
    contactTitle: "Contact",
    genres: ["Cinematic", "Speed ramping", "Realistic", "Anime", "UGC ads", "Kinetic typography", "Motion explainers", "Fashion editorial"],
    tiktokUrl: "https://www.tiktok.com/@0xtirta",
    instagramUrl: "https://www.instagram.com/0xtirta",
    heroImage: "/media/hero.webp",
    aboutImage: "/media/about.webp",
    heroImageAlt: "Tirta in a white and green jacket and sunglasses, against a blue sky",
    aboutImageAlt: "Illustrated portrait of Tirta with glasses, emerald crystals, and a castle behind",
    budgetOptions: ["Not sure yet"],
    socials: [
      { label: "X", url: "https://x.com/tirtavex" },
      { label: "TikTok", url: "https://www.tiktok.com/@0xtirta" },
      { label: "Instagram", url: "https://www.instagram.com/0xtirta" },
    ],
  };

  const items: WorkItem[] = (videosData.work as WorkItem[]).map((item) => work(item));

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
      title: "Short-form visual pacing for AI launch campaigns",
      url: "https://x.com/tirtavex",
      source: "Field Note",
      cover: "",
      coverDominant: "#34D399",
      publishedAt: daysAgo(15),
      tags: ["link", "press"],
      pinned: false,
      hidden: false,
      excerpt: "Notes on keeping frame rhythm tight across generative video cuts.",
      body: "",
      sortOrder: 4,
    },
    {
      id: "article_06",
      kind: "link",
      slug: "",
      title: "Creator Workflow Notes · AI Video & Motion Direction",
      url: "https://x.com/tirtavex",
      source: "Creator Talk",
      cover: "",
      coverDominant: "#059669",
      publishedAt: daysAgo(45),
      tags: ["link", "audio"],
      pinned: false,
      hidden: false,
      excerpt: "A breakdown of multi-model generation, sound sync, and cutting solo.",
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
      impressionsAll: 578819,
      impressions30d: 578819,
      likes: 5954,
      posts: 3180,
      followers: 4321,
      engagement: 82,
      videos: 143,
      placeholder: false,
      bestPostId: "work_097",
      updatedAt: "2026-11-12T00:00:00.000Z",
      platforms: [
        { platform: "overall", label: "Overall", handle: "", url: "", impressions: 578819, followers: 4321, videos: 143, engagement: 82, likes: 5954, placeholder: false },
        { platform: "x", label: "X", handle: "tirtavex", url: "https://x.com/tirtavex", impressions: 572936, followers: 1079, videos: 117, engagement: 74, likes: 79, placeholder: false },
        { platform: "tiktok", label: "TikTok", handle: "0xtirta", url: "https://www.tiktok.com/@0xtirta", impressions: 1800, followers: 2320, videos: 10, engagement: 80, likes: 5769, placeholder: false },
        { platform: "instagram", label: "Instagram", handle: "0xtirta", url: "https://www.instagram.com/0xtirta", impressions: 4083, followers: 922, videos: 16, engagement: 88, likes: 106, placeholder: false },
      ],
    },
    agent: { lastHeartbeatAt: null, message: "" },
    work: items,
    collabs: [
      {
        id: "collab_01",
        name: "Orbit Studio",
        type: "brand",
        logo: "",
        summary: "A launch film and three cutdowns for a consumer wallet that needed to look inevitable.",
        result: "180K views on the hero post, with the cutdown reused by partner creators.",
        date: "2026",
        postIds: ["work_01", "work_07"],
        hidden: false,
        sortOrder: 0,
      },
      {
        id: "collab_02",
        name: "Verge Protocol",
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
        name: "Lumen Collective",
        type: "project",
        logo: "",
        summary: "Season film for a contributor collective. Faces stayed off camera; the work did not.",
        result: "Shared by 42 member accounts in the first day.",
        date: "2025",
        postIds: ["work_04"],
        hidden: false,
        sortOrder: 2,
      },
      {
        id: "collab_04",
        name: "Kinetix Hardware",
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
        name: "Aether Visuals",
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
        name: "Frame Archive",
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
        name: "AZ8 Creator Partner Program",
        role: "Video partner",
        start: "Jan 2026",
        end: "",
        status: "active",
        highlights: ["8 films shipped", "Hero post pinned by the program", "Cutdowns reused by regional leads"],
        postIds: ["work_01", "work_02"],
        impressions: 0,
        likes: 0,
        hidden: false,
        sortOrder: 0,
      },
      {
        id: "program_02",
        name: "Cuddler Creator Cohort",
        role: "Cohort filmmaker",
        start: "Mar 2025",
        end: "Dec 2025",
        status: "completed",
        highlights: ["Weekly recap format", "Office hours for other cohort editors"],
        postIds: ["work_06"],
        impressions: 0,
        likes: 0,
        hidden: false,
        sortOrder: 1,
      },
      {
        id: "program_03",
        name: "Video Rebirth Studio Seat",
        role: "Studio seat",
        start: "Jun 2025",
        end: "",
        status: "active",
        highlights: ["BACH production tests", "Shared visual continuity pipeline"],
        postIds: ["work_04", "work_07"],
        impressions: 0,
        likes: 0,
        hidden: false,
        sortOrder: 2,
      },
    ],
    ambassadors: [
      {
        id: "amb_01",
        project: "AZ8",
        url: "https://x.com/AZ8official_JP",
        title: "Creator Partner",
        region: "Global",
        start: "2026",
        status: "active",
        duties: ["AI video production", "Creative campaign distribution", "Model benchmarking"],
        postIds: ["work_01", "work_02"],
        logo: "/media/partners/az8.png",
        summary: "AI-era story brand delivering original AI films, visual worlds, and creative model showcases.",
        roleType: "creator-partner",
        placeholder: false,
        hidden: false,
        sortOrder: 0,
      },
      {
        id: "amb_02",
        project: "Cuddler",
        url: "https://x.com/CuddlerAI",
        title: "Creator Partner",
        region: "Global",
        start: "2026",
        status: "active",
        duties: ["AI character storytelling", "Creative format exploration"],
        postIds: ["work_03"],
        logo: "/media/partners/cuddler.png",
        summary: "Interactive AI story and video studio turning single concepts into multi-scene cinematic episodes.",
        roleType: "creator-partner",
        placeholder: false,
        hidden: false,
        sortOrder: 1,
      },
      {
        id: "amb_03",
        project: "Wizstar",
        url: "https://x.com/WizstarAI",
        title: "Creator Partner",
        region: "Global",
        start: "2026",
        status: "active",
        duties: ["Motion design", "Creative technology workflow sharing"],
        postIds: ["work_06", "work_07"],
        logo: "/media/partners/wizstar.png",
        summary: "AI video creation system built for modern storytelling, stylized motion templates, and kinetic shorts.",
        roleType: "creator-partner",
        placeholder: false,
        hidden: false,
        sortOrder: 2,
      },
      {
        id: "amb_04",
        project: "Video Rebirth",
        url: "https://x.com/video_rebirth",
        title: "Creator Partner",
        region: "Global",
        start: "2026",
        status: "active",
        duties: ["BACH video engine production", "Character & scene continuity"],
        postIds: [],
        logo: "/media/partners/video-rebirth.png",
        summary: "Producing commercial-ready AI video with BACH, Video Rebirth's flagship engine built specifically for professional production.",
        roleType: "creator-partner",
        placeholder: false,
        hidden: false,
        sortOrder: 3,
      },
    ],
    projects: [
      {
        id: "project_01",
        slug: "neon-bazaar",
        name: "AI short film",
        year: 2026,
        client: "Orbit Studio",
        date: "Jan 28, 2026",
        industry: "Consumer crypto",
        services: ["AI video", "Campaign"],
        budget: "Mid tier",
        aiTech: "Seedance 2.5 · ElevenLabs",
        overview: "A marketplace needed a film that felt like walking into a lit room, not a token diagram. We made one gesture do the explaining.",
        challenge: "The product had four features and nine seconds of attention. A voiceover would have sounded like a pitch.",
        approach: "We locked a single camera move, generated the room, and cut to the post’s first sentence. Type stayed off the picture.",
        achievements: ["Hero film plus three cutdowns", "Thumbnail system the partner program still uses", "Post became the best-performing launch asset that week"],
        outcome: "Strong completion rate across launch posts.",
        scope: ["AI video", "Campaign"],
        cover: "https://pbs.twimg.com/amplify_video_thumb/2120218474647855104/img/N7G5pxVj-L3CFPml.jpg",
        accent: "#10B981",
        xUrl: "https://x.com/tirtaVEX/status/2120219611107152272",
        websiteUrl: "",
        reviewQuote: "It looked like we had a crew. We had a director and a deadline.",
        reviewAuthor: "Alex Mercer",
        reviewRole: "Marketing, Orbit Studio",
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
        client: "Verge Protocol",
        date: "Nov 02, 2025",
        industry: "Protocol",
        services: ["Explainer", "Web3"],
        budget: "Launch sprint",
        aiTech: "Seedance 2.5 · Remotion",
        overview: "A mint flow that engineers loved and everyone else abandoned. The film is the version you can finish.",
        challenge: "Every stakeholder wanted their screen in the cut.",
        approach: "We storyboarded the feeling of a successful mint, then let one UI beat stand in for the rest.",
        achievements: ["42-second explainer", "Still set for the docs", "Thread reduced to four posts"],
        outcome: "Docs linked the film instead of a static loom.",
        scope: ["Web3", "AI video"],
        cover: "https://pbs.twimg.com/amplify_video_thumb/2120244587453390848/img/TcQxR3fOcFF0_1ED.jpg",
        accent: "#0F766E",
        xUrl: "https://x.com/tirtaVEX/status/2120245255522201850",
        websiteUrl: "",
        reviewQuote: "People finally understood the mint without a call.",
        reviewAuthor: "Kenji Sato",
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
        client: "Lumen Collective",
        date: "Aug 14, 2025",
        industry: "Community",
        services: ["Campaign", "Short form"],
        budget: "Mid tier",
        aiTech: "Seedream 5.5 · BACH",
        overview: "A contributor collective wanted a season film that members would actually repost on their own accounts.",
        challenge: "No faces, no office, no shared mascot.",
        approach: "Light, tools, and the work itself. The film is a desk at night and the sound of a render finishing.",
        achievements: ["Season film", "Member cutdowns", "Caption system"],
        outcome: "Reposted across the contributor graph in a day.",
        scope: ["Collab", "AI video"],
        cover: "https://pbs.twimg.com/amplify_video_thumb/2117832360607830016/img/04Im4cRzzNDsuspF.jpg",
        accent: "#34D399",
        xUrl: "https://x.com/tirtaVEX/status/2120420203230318765",
        websiteUrl: "",
        reviewQuote: "It felt like us, which is rare for something we didn’t shoot.",
        reviewAuthor: "Maya Lin",
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
        client: "Frame Archive",
        date: "Feb 02, 2026",
        industry: "Culture",
        services: ["Title", "Stills"],
        budget: "Full campaign",
        aiTech: "BACH · Kinetic Edit",
        overview: "A title sequence for a digital archive. The room is the interface.",
        challenge: "The collection is real. The pictures of it could not look like stock futures.",
        approach: "We studied their catalog metadata and built shots from objects they already had, then graded everything toward paper and emerald glass.",
        achievements: ["Title sequence", "Teaser post", "Three still studies"],
        outcome: "Teaser carried the announcement. The sequence opened the drop.",
        scope: ["AI video", "Campaign"],
        cover: "https://pbs.twimg.com/amplify_video_thumb/2117225532068966400/img/BrQD0-rZnMQOPitL.jpg",
        accent: "#065F46",
        xUrl: "https://x.com/tirtaVEX/status/2119857052034249132",
        websiteUrl: "",
        reviewQuote: "Quiet, specific, and finished on time.",
        reviewAuthor: "Rina Vance",
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
        client: "Creative Tech Sprint",
        date: "May 19, 2025",
        industry: "Contest",
        services: ["AI video"],
        budget: "Featured showcase",
        aiTech: "Seedance 2.5 · Omni 1.2",
        overview: "A short film about a city that renders itself one block at a time.",
        challenge: "The brief was one word and a weekend.",
        approach: "Commit to a rule — each shot adds exactly one object — and never break it.",
        achievements: ["Featured cut", "Shared by the organizer", "Still used in the recap"],
        outcome: "The entry post became the visual reference for the sprint.",
        scope: ["Contest", "AI video"],
        cover: "https://pbs.twimg.com/amplify_video_thumb/2119710768816078849/img/Clao-vlnjdN0nrg5.jpg",
        accent: "#047857",
        xUrl: "https://x.com/tirtaVEX/status/2119885715857424820",
        websiteUrl: "",
        reviewQuote: "The rule made it memorable. The craft made it stand out.",
        reviewAuthor: "Daniel Cho",
        reviewRole: "Judge",
        reviewStat: "Top",
        reviewStatLabel: "Showcase pick",
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
        cover: "https://pbs.twimg.com/amplify_video_thumb/2119339464766218241/img/H_iIns1F72VgVj2G.jpg",
        accent: "#059669",
        xUrl: "https://x.com/tirtaVEX/status/2119860784792785159",
        websiteUrl: "",
        reviewQuote: "I can tell which week it is without reading the caption.",
        reviewAuthor: "Nadia Hart",
        reviewRole: "Creator",
        reviewStat: "55s",
        reviewStatLabel: "Fixed length",
        featured: false,
        hidden: false,
        sortOrder: 5,
      },
    ],
    contests: videosData.contests as Contest[],
    testimonials: [
      {
        id: "quote_01",
        quote: "Beautiful visuals, delivered before the launch thread even drafted itself.",
        name: "Alex Mercer",
        role: "Orbit Studio · Singapore",
        sourceUrl: "https://x.com/tirtaVEX/status/2120219611107152272",
        stat: "3×",
        statLabel: "Faster",
        resultLine: "Delivered four campaign assets ahead of launch.",
        hidden: false,
        sortOrder: 0,
      },
      {
        id: "quote_02",
        quote: "The film did what the landing page couldn’t. People stayed.",
        name: "Kenji Sato",
        role: "Verge Protocol",
        sourceUrl: "https://x.com/tirtaVEX/status/2120245255522201850",
        stat: "45%",
        statLabel: "More replies",
        resultLine: "Social replies climbed after the explainer went up.",
        hidden: false,
        sortOrder: 1,
      },
      {
        id: "quote_03",
        quote: "Stunning, specific, and early. We stopped planning a shoot.",
        name: "Maya Lin",
        role: "Lumen Collective",
        sourceUrl: "https://x.com/tirtaVEX/status/2120420203230318765",
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
      { id: "skill_01", name: "Videography", group: "Craft", kind: "skill", icon: "camera", note: "Years of real-world camera work, before any model was involved.", hidden: false, sortOrder: 0 },
      { id: "skill_02", name: "Cinematography", group: "Craft", kind: "skill", icon: "lens", note: "Light, lens, and a frame that already knows the cut.", hidden: false, sortOrder: 1 },
      { id: "skill_03", name: "Story directing", group: "Craft", kind: "skill", icon: "clapper", note: "Every shot has an intention. The prompt is not the story.", hidden: false, sortOrder: 2 },
      { id: "skill_04", name: "Video editing", group: "Craft", kind: "skill", icon: "cut", note: "Rhythm, speed ramps, and beat-synced cuts.", hidden: false, sortOrder: 3 },
      { id: "skill_05", name: "Kinetic type", group: "Craft", kind: "skill", icon: "type", note: "Scribbled, layered captions that move with the edit.", hidden: false, sortOrder: 4 },
      { id: "skill_06", name: "Pre-publish drafting", group: "Workflow", kind: "skill", icon: "layout", note: "Hook framing, pacing review, and draft cuts before anything ships live.", hidden: false, sortOrder: 5 },
      { id: "tool_01", name: "DaVinci Resolve", group: "Edit & Color", kind: "tool", icon: "cut", note: "Timeline assembly, grading, and audio finishing.", hidden: false, sortOrder: 6 },
      { id: "tool_02", name: "CapCut", group: "Short-form Edit", kind: "tool", icon: "play", note: "Fast kinetic pacing, captions, and vertical cutdowns.", hidden: false, sortOrder: 7 },
      { id: "tool_03", name: "Remotion", group: "Code Motion", kind: "tool", icon: "code", note: "Programmatic motion graphics and data-driven edits.", hidden: false, sortOrder: 8 },
      { id: "tool_04", name: "HyperFrames", group: "Motion Engine", kind: "tool", icon: "clapper", note: "Code-driven animated scenes and composited sequences.", hidden: false, sortOrder: 9 },
      { id: "tool_05", name: "Canva", group: "Layout & Stills", kind: "tool", icon: "layout", note: "Thumbnails, campaign frames, and editorial layouts.", hidden: false, sortOrder: 10 },
      { id: "tool_06", name: "ElevenLabs", group: "Sound & Voice", kind: "tool", icon: "audio", note: "SFX V3, foley, and voice pacing.", hidden: false, sortOrder: 11 },
      { id: "ai_01", name: "ChatGPT", group: "Ideation & Script", kind: "ai", icon: "spark", note: "Concept stress-testing, angles, and narrative structure.", hidden: false, sortOrder: 12 },
      { id: "ai_02", name: "Claude", group: "Direction & Code", kind: "ai", icon: "code", note: "Long-form story arcs, agent workflows, and Remotion/HyperFrames builds.", hidden: false, sortOrder: 13 },
      { id: "ai_03", name: "Grok", group: "X Research & Assets", kind: "ai", icon: "spark", note: "Real-time trend reads, Grok Imagine stills, and bot pipelines.", hidden: false, sortOrder: 14 },
      { id: "ai_04", name: "Video Gen", group: "SD 2.5, Kling 4.0, MiniMax H3, Omni 1.2, Wan 3.0, Flux 3", kind: "ai", icon: "play", note: "SD 2.5, Kling 4.0, MiniMax H3, Omni 1.2, Wan 3.0, and Flux 3.", hidden: false, sortOrder: 15 },
      { id: "ai_05", name: "Image Gen", group: "GPT Sunburst Sunflare 2.6, Seedream 5.5, Midjourney V8.2, Nano Banana 2.1", kind: "ai", icon: "image", note: "GPT Sunburst Sunflare 2.6, Seedream 5.5, Midjourney V8.2, and Nano Banana 2.1.", hidden: false, sortOrder: 16 },
    ],
    articles,
    links: [
      { id: "link_01", label: "X · @tirtavex", url: "https://x.com/tirtavex", group: "social", hidden: false, sortOrder: 0 },
      { id: "link_05", label: "TikTok · @0xtirta", url: "https://www.tiktok.com/@0xtirta", group: "social", hidden: false, sortOrder: 4 },
      { id: "link_06", label: "Instagram · @0xtirta", url: "https://www.instagram.com/0xtirta", group: "social", hidden: false, sortOrder: 5 },
      { id: "link_02", label: "Press Kit & Media", url: "https://x.com/tirtavex", group: "footer", hidden: false, sortOrder: 1 },
      { id: "link_03", label: "Collaboration Brief", url: "https://tirtavex.tech/contact", group: "footer", hidden: false, sortOrder: 2 },
      { id: "link_04", label: "Studio Notes on X", url: "https://x.com/tirtavex", group: "journal", hidden: false, sortOrder: 3 },
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
