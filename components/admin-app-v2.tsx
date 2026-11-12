"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { AdminSnapshot, Settings, SiteContent } from "@/lib/types";

const NAV: { href: string; label: string; group: string }[] = [
  { href: "", label: "Overview", group: "Home" },
  { href: "work", label: "Tweets · The Cut", group: "Content" },
  { href: "contests", label: "Campaigns", group: "Content" },
  { href: "projects", label: "Projects", group: "Content" },
  { href: "articles", label: "Journal", group: "Content" },
  { href: "ambassadors", label: "Partners", group: "Content" },
  { href: "tools", label: "Skills · Tools · AI", group: "Content" },
  { href: "stats", label: "Engagement", group: "Numbers" },
  { href: "collabs", label: "Collabs", group: "Numbers" },
  { href: "programs", label: "Programs", group: "Numbers" },
  { href: "testimonials", label: "Reviews", group: "Numbers" },
  { href: "process", label: "Process", group: "Site" },
  { href: "links", label: "Links", group: "Site" },
  { href: "settings", label: "Copy & settings", group: "Site" },
  { href: "legal", label: "Legal", group: "Site" },
  { href: "submissions", label: "Inbox", group: "Site" },
];

type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox" | "comma" | "lines" | "select" | "image";
  options?: string[];
  optionLabels?: Record<string, string>;
  group?: string;
  help?: string;
  wide?: boolean;
};

const TWEET_CORE: Field[] = [
  { key: "title", label: "Title", type: "text", group: "Basics", wide: true },
  { key: "xUrl", label: "X post URL", type: "text", group: "Basics", wide: true, help: "Paste the status link when editing an existing post." },
  { key: "note", label: "Caption / note", type: "textarea", group: "Basics", wide: true },
  { key: "lane", label: "Showcase", type: "select", group: "Basics", options: ["generation", "motion"], optionLabels: { generation: "AI video generation", motion: "Motion design" } },
  { key: "category", label: "Legacy category", type: "select", group: "Basics", options: ["ai-video", "web3", "contest", "collab"] },
  { key: "tags", label: "Tags", type: "comma", group: "Basics", wide: true },
  { key: "thumb.src", label: "Thumbnail", type: "image", group: "Media", wide: true },
  { key: "videoUrl", label: "Video URL (mp4)", type: "text", group: "Media", wide: true },
  { key: "thumb.durationSec", label: "Duration (sec)", type: "number", group: "Media" },
  { key: "thumb.dominant", label: "Accent color", type: "text", group: "Media" },
  { key: "metrics.impressions", label: "Impressions", type: "number", group: "Numbers" },
  { key: "metrics.likes", label: "Likes", type: "number", group: "Numbers" },
  { key: "metrics.reposts", label: "Reposts", type: "number", group: "Numbers" },
  { key: "metrics.replies", label: "Replies", type: "number", group: "Numbers" },
  { key: "metrics.bookmarks", label: "Bookmarks", type: "number", group: "Numbers" },
  { key: "metrics.quotes", label: "Quotes", type: "number", group: "Numbers" },
  { key: "postedAt", label: "Posted at", type: "text", group: "Meta" },
  { key: "status", label: "Visibility", type: "select", group: "Meta", options: ["live", "hidden", "deleted"], optionLabels: { live: "Live on site", hidden: "Hidden", deleted: "Deleted" } },
  { key: "pinned", label: "Pin to top", type: "checkbox", group: "Meta" },
];

const FIELDS: Record<string, Field[]> = {
  work: TWEET_CORE,
  articles: [
    { key: "title", label: "Title", type: "text", group: "Basics", wide: true },
    { key: "kind", label: "Kind", type: "select", group: "Basics", options: ["article", "link"] },
    { key: "slug", label: "Slug", type: "text", group: "Basics" },
    { key: "url", label: "External URL", type: "text", group: "Basics", wide: true },
    { key: "source", label: "Source", type: "text", group: "Basics" },
    { key: "excerpt", label: "Excerpt", type: "textarea", group: "Copy", wide: true },
    { key: "body", label: "Body (markdown)", type: "textarea", group: "Copy", wide: true },
    { key: "cover", label: "Cover image", type: "image", group: "Media", wide: true },
    { key: "coverDominant", label: "Cover color", type: "text", group: "Media" },
    { key: "publishedAt", label: "Date", type: "text", group: "Meta" },
    { key: "tags", label: "Tags", type: "comma", group: "Meta", wide: true },
    { key: "pinned", label: "Pin to top", type: "checkbox", group: "Meta" },
    { key: "hidden", label: "Hidden", type: "checkbox", group: "Meta" },
  ],
  links: [
    { key: "label", label: "Label", type: "text", group: "Basics" },
    { key: "url", label: "URL", type: "text", group: "Basics", wide: true },
    { key: "group", label: "Where it shows", type: "select", group: "Basics", options: ["footer", "journal", "social"] },
    { key: "hidden", label: "Hidden", type: "checkbox", group: "Meta" },
  ],
  projects: [
    { key: "name", label: "Name", type: "text", group: "Basics", wide: true },
    { key: "slug", label: "Slug", type: "text", group: "Basics" },
    { key: "year", label: "Year", type: "number", group: "Basics" },
    { key: "client", label: "Client", type: "text", group: "Basics" },
    { key: "date", label: "Date", type: "text", group: "Basics" },
    { key: "industry", label: "Industry", type: "text", group: "Basics" },
    { key: "services", label: "Services", type: "comma", group: "Basics", wide: true },
    { key: "scope", label: "Scope", type: "comma", group: "Basics", wide: true },
    { key: "budget", label: "Budget", type: "text", group: "Basics" },
    { key: "aiTech", label: "Stack", type: "text", group: "Basics" },
    { key: "overview", label: "Overview", type: "textarea", group: "Copy", wide: true },
    { key: "challenge", label: "Challenge", type: "textarea", group: "Copy", wide: true },
    { key: "approach", label: "Approach", type: "textarea", group: "Copy", wide: true },
    { key: "achievements", label: "Achievements", type: "lines", group: "Copy", wide: true },
    { key: "outcome", label: "Outcome", type: "text", group: "Copy", wide: true },
    { key: "cover", label: "Cover image", type: "image", group: "Media", wide: true },
    { key: "accent", label: "Accent color", type: "text", group: "Media" },
    { key: "xUrl", label: "X URL", type: "text", group: "Links", wide: true },
    { key: "websiteUrl", label: "Website", type: "text", group: "Links", wide: true },
    { key: "reviewQuote", label: "Review", type: "textarea", group: "Review", wide: true },
    { key: "reviewAuthor", label: "Review author", type: "text", group: "Review" },
    { key: "reviewRole", label: "Review role", type: "text", group: "Review" },
    { key: "reviewStat", label: "Stat", type: "text", group: "Review" },
    { key: "reviewStatLabel", label: "Stat label", type: "text", group: "Review" },
    { key: "featured", label: "Featured", type: "checkbox", group: "Meta" },
    { key: "hidden", label: "Hidden", type: "checkbox", group: "Meta" },
  ],
  collabs: [
    { key: "name", label: "Name", type: "text", group: "Basics" },
    { key: "type", label: "Type", type: "select", group: "Basics", options: ["brand", "creator", "project"] },
    { key: "logo", label: "Logo", type: "image", group: "Media", wide: true },
    { key: "date", label: "Date", type: "text", group: "Basics" },
    { key: "summary", label: "Summary", type: "textarea", group: "Copy", wide: true },
    { key: "result", label: "Result", type: "textarea", group: "Copy", wide: true },
    { key: "postIds", label: "Linked tweets", type: "comma", group: "Meta", wide: true },
    { key: "hidden", label: "Hidden", type: "checkbox", group: "Meta" },
  ],
  programs: [
    { key: "name", label: "Name", type: "text", group: "Basics" },
    { key: "role", label: "Role", type: "text", group: "Basics" },
    { key: "start", label: "Start", type: "text", group: "Basics" },
    { key: "end", label: "End", type: "text", group: "Basics" },
    { key: "status", label: "Status", type: "select", group: "Basics", options: ["active", "completed"] },
    { key: "highlights", label: "Highlights", type: "lines", group: "Copy", wide: true },
    { key: "postIds", label: "Linked tweets", type: "comma", group: "Meta", wide: true },
    { key: "impressions", label: "Impressions", type: "number", group: "Numbers" },
    { key: "likes", label: "Likes", type: "number", group: "Numbers" },
    { key: "hidden", label: "Hidden", type: "checkbox", group: "Meta" },
  ],
  ambassadors: [
    { key: "project", label: "Partner name", type: "text", group: "Basics" },
    { key: "url", label: "X / website URL", type: "text", group: "Basics", wide: true },
    { key: "roleType", label: "Role", type: "select", group: "Basics", options: ["ambassador", "creator-partner", "collaboration-partner"], optionLabels: { ambassador: "Ambassador", "creator-partner": "Creator Partner", "collaboration-partner": "Collaboration Partner" } },
    { key: "title", label: "Title", type: "text", group: "Basics" },
    { key: "region", label: "Region", type: "text", group: "Basics" },
    { key: "start", label: "Start", type: "text", group: "Basics" },
    { key: "summary", label: "Short description", type: "textarea", group: "Copy", wide: true },
    { key: "duties", label: "Duties", type: "lines", group: "Copy", wide: true },
    { key: "logo", label: "Logo", type: "image", group: "Media", wide: true },
    { key: "status", label: "Status", type: "select", group: "Meta", options: ["active", "past"] },
    { key: "postIds", label: "Linked tweets", type: "comma", group: "Meta", wide: true },
    { key: "hidden", label: "Hidden", type: "checkbox", group: "Meta" },
  ],
  contests: [
    { key: "name", label: "Title", type: "text", group: "Basics", wide: true },
    { key: "organizer", label: "Campaign / organizer", type: "text", group: "Basics" },
    { key: "link", label: "Entry link", type: "text", group: "Basics", wide: true },
    { key: "xUrl", label: "X post URL", type: "text", group: "Basics", wide: true },
    { key: "date", label: "Date", type: "text", group: "Basics" },
    { key: "year", label: "Year", type: "number", group: "Basics" },
    { key: "placement", label: "Placement", type: "select", group: "Basics", options: ["", "winner", "finalist", "top10", "participant"], optionLabels: { "": "No result yet", winner: "Winner", finalist: "Finalist", top10: "Top 10", participant: "Participant" } },
    { key: "result", label: "Result note", type: "text", group: "Basics", wide: true },
    { key: "thumb", label: "Thumbnail", type: "image", group: "Media", wide: true },
    { key: "entryPostId", label: "Linked tweet id", type: "text", group: "Meta", wide: true },
    { key: "hidden", label: "Hidden", type: "checkbox", group: "Meta" },
  ],
  testimonials: [
    { key: "quote", label: "Quote", type: "textarea", group: "Basics", wide: true },
    { key: "name", label: "Name", type: "text", group: "Basics" },
    { key: "role", label: "Role", type: "text", group: "Basics" },
    { key: "sourceUrl", label: "Source URL", type: "text", group: "Basics", wide: true },
    { key: "stat", label: "Stat", type: "text", group: "Numbers" },
    { key: "statLabel", label: "Stat label", type: "text", group: "Numbers" },
    { key: "resultLine", label: "Result", type: "text", group: "Numbers", wide: true },
    { key: "hidden", label: "Hidden", type: "checkbox", group: "Meta" },
  ],
  process: [
    { key: "kicker", label: "Kicker", type: "text", group: "Basics" },
    { key: "title", label: "Title", type: "text", group: "Basics" },
    { key: "body", label: "Body", type: "textarea", group: "Basics", wide: true },
    { key: "hidden", label: "Hidden", type: "checkbox", group: "Meta" },
  ],
  tools: [
    { key: "name", label: "Name", type: "text", group: "Basics" },
    { key: "kind", label: "Kind", type: "select", group: "Basics", options: ["skill", "tool", "ai"], optionLabels: { skill: "Skill", tool: "Tool", ai: "AI" } },
    { key: "group", label: "Group / model list", type: "text", group: "Basics", wide: true, help: "For AI rows this text is the model list shown on the card." },
    { key: "icon", label: "Icon key or logo URL", type: "text", group: "Media" },
    { key: "note", label: "Note", type: "textarea", group: "Copy", wide: true },
    { key: "hidden", label: "Hidden", type: "checkbox", group: "Meta" },
  ],
};

const TITLES: Record<string, string> = {
  work: "Tweets on the site",
  contests: "Campaigns",
  ambassadors: "Partners",
  tools: "Skills · Tools · AI",
  articles: "Journal",
  projects: "Projects",
  links: "Links",
  collabs: "Collabs",
  programs: "Programs",
  testimonials: "Reviews",
  process: "Process",
};

function readPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object") return (current as Record<string, unknown>)[key];
    return undefined;
  }, source);
}

function writePath(source: Record<string, unknown>, path: string, value: unknown) {
  const next = structuredClone(source);
  const parts = path.split(".");
  let cursor = next;
  for (const key of parts.slice(0, -1)) {
    if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
  return next;
}

function labelOf(item: Record<string, unknown>) {
  return String(item.title || item.name || item.project || item.quote || item.label || item.id || "Item");
}

function compact(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function thumbOf(item: Record<string, unknown>) {
  const src = readPath(item, "thumb.src") ?? readPath(item, "thumb");
  return typeof src === "string" && src.startsWith("http") ? src : "";
}

export function AdminApp({ initial }: { initial: AdminSnapshot }) {
  const pathname = usePathname();
  const router = useRouter();
  const section = pathname.split("/").filter(Boolean)[1] || "";
  const [snap, setSnap] = useState(initial);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(body: unknown, okMessage = "Saved") {
    if (!snap.writable) {
      setError("Saving is off until a database is connected.");
      return false;
    }
    setBusy(true);
    setError("");
    const response = await fetch("/api/admin/mutate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await response.json().catch(() => ({}))) as { error?: string; snapshot?: AdminSnapshot };
    setBusy(false);
    if (!response.ok || !json.snapshot) {
      setError(json.error || "Save failed");
      return false;
    }
    setSnap(json.snapshot);
    setToast(okMessage);
    setTimeout(() => setToast(""), 2200);
    return true;
  }

  const groups = useMemo(() => {
    const map = new Map<string, typeof NAV>();
    for (const entry of NAV) map.set(entry.group, [...(map.get(entry.group) || []), entry]);
    return [...map.entries()];
  }, []);

  const disabled = !snap.writable || busy;

  return (
    <div className="admin">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="admin-nav md:sticky md:top-4 md:self-start">
          <p className="font-display text-2xl text-forest">Tirta admin</p>
          <p className="mt-1 text-xs muted">{snap.writable ? "Connected · edits save live" : "Read only"}</p>
          <nav className="mt-4 flex gap-2 overflow-x-auto md:grid md:gap-4">
            {groups.map(([group, entries]) => (
              <div key={group} className="min-w-max md:min-w-0">
                <p className="hidden px-1 text-[11px] uppercase tracking-[0.18em] muted md:block">{group}</p>
                <div className="mt-1 flex gap-2 md:grid">
                  {entries.map(({ href, label }) => {
                    const active = section === href;
                    return (
                      <Link
                        key={href || "home"}
                        href={href ? `/admin/${href}` : "/admin"}
                        className={`whitespace-nowrap rounded-pill px-3 py-2 text-sm ${active ? "bg-emerald-700 text-white" : "bg-white"}`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/" className="underline">View site</Link>
            <button
              className="underline"
              onClick={async () => {
                await fetch("/api/admin/logout", { method: "POST" });
                router.push("/admin/login");
                router.refresh();
              }}
            >
              Log out
            </button>
          </div>
        </aside>
        <main className="min-w-0">
          {!snap.writable ? (
            <p className="mb-4 rounded-card border border-amber-300 bg-white p-4 text-sm">
              Read-only mode: no database is attached, so edits cannot be saved yet.
            </p>
          ) : null}
          {snap.warning ? <p className="mb-4 rounded-card bg-white p-4 text-sm">{snap.warning}</p> : null}
          {error ? <p className="mb-4 rounded-card bg-amber/10 p-3 text-sm text-amber">{error}</p> : null}
          {section === "" ? <Overview snap={snap} onOpen={(href) => router.push(href)} /> : null}
          {section === "settings" ? <SettingsForm settings={snap.content.settings} disabled={disabled} onSave={(data) => send({ op: "settings", data }, "Settings saved")} /> : null}
          {section === "legal" ? <LegalForm content={snap.content} disabled={disabled} onSave={(slug, data) => send({ op: "legal", slug, data }, `${slug} saved`)} /> : null}
          {section === "stats" ? <StatsForm stats={snap.content.stats} disabled={disabled} onSave={(data) => send({ op: "stats", data }, "Numbers saved")} /> : null}
          {section === "submissions" ? (
            <Inbox
              items={snap.submissions}
              disabled={disabled}
              onDelete={(id) => {
                if (confirm("Delete this brief?")) void send({ op: "delete", type: "submissions", id }, "Brief deleted");
              }}
            />
          ) : null}
          {section === "work" ? (
            <Tweets
              items={snap.content.work as unknown as Record<string, unknown>[]}
              disabled={disabled}
              onImport={async (url, lane, tags, pinned) => {
                const response = await fetch("/api/admin/x/import", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ xUrl: url, url, lane, tags, pinned }),
                });
                const json = (await response.json().catch(() => ({}))) as { error?: string; snapshot?: AdminSnapshot };
                if (!response.ok) {
                  setError(json.error || "Import failed");
                  return false;
                }
                if (json.snapshot) setSnap(json.snapshot);
                setError("");
                setToast("Tweet added");
                setTimeout(() => setToast(""), 2200);
                return true;
              }}
              onCreate={(data) => send({ op: "create", type: "work", data }, "Tweet added")}
              onUpdate={(id, data) => send({ op: "update", type: "work", id, data }, "Tweet updated")}
              onDelete={(id) => send({ op: "delete", type: "work", id }, "Tweet deleted")}
              onReorder={(ids) => send({ op: "reorder", type: "work", ids }, "Order saved")}
            />
          ) : null}
          {section !== "work" && FIELDS[section] ? (
            <Collection
              type={section}
              title={TITLES[section] || section}
              items={(snap.content[section as keyof SiteContent] as unknown[]).filter((item) => item && typeof item === "object") as Record<string, unknown>[]}
              fields={FIELDS[section]}
              disabled={disabled}
              onCreate={(data) => send({ op: "create", type: section, data }, "Added")}
              onUpdate={(id, data) => send({ op: "update", type: section, id, data }, "Saved")}
              onDelete={(id) => send({ op: "delete", type: section, id }, "Deleted")}
              onReorder={(ids) => send({ op: "reorder", type: section, ids }, "Order saved")}
            />
          ) : null}
        </main>
      </div>
      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-pill bg-emerald-700 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>
      ) : null}
    </div>
  );
}

function Overview({ snap, onOpen }: { snap: AdminSnapshot; onOpen: (href: string) => void }) {
  const cards = [
    ["Tweets", snap.content.work.length, "/admin/work"],
    ["Campaigns", snap.content.contests.length, "/admin/contests"],
    ["Projects", snap.content.projects.length, "/admin/projects"],
    ["Partners", snap.content.ambassadors.length, "/admin/ambassadors"],
    ["Journal", snap.content.articles.length, "/admin/articles"],
    ["Inbox", snap.submissions.length, "/admin/submissions"],
  ] as const;
  return (
    <section>
      <h1 className="font-display text-5xl">Dashboard</h1>
      <p className="mt-2 text-sm muted">Everything on tirtavex.tech is editable here. Open a section, change what you need, hit save.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map(([label, value, href]) => (
          <button key={label} className="rounded-card bg-white p-4 text-left" onClick={() => onOpen(href)}>
            <p className="text-sm muted">{label}</p>
            <p className="font-display text-4xl">{value}</p>
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Link href="/admin/work" className="rounded-card bg-white p-4">
          <p className="font-semibold">Add a tweet</p>
          <p className="mt-1 text-sm muted">Paste an X status link and the thumbnail, caption, and numbers fill themselves in.</p>
        </Link>
        <Link href="/admin/settings" className="rounded-card bg-white p-4">
          <p className="font-semibold">Edit the copy</p>
          <p className="mt-1 text-sm muted">Hero, about, section titles, contact details, and meta description.</p>
        </Link>
      </div>
    </section>
  );
}

function Tweets({
  items,
  disabled,
  onImport,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
}: {
  items: Record<string, unknown>[];
  disabled: boolean;
  onImport: (url: string, lane: string, tags: string[], pinned: boolean) => Promise<boolean>;
  onCreate: (data: Record<string, unknown>) => Promise<boolean>;
  onUpdate: (id: string, data: Record<string, unknown>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onReorder: (ids: string[]) => Promise<boolean>;
}) {
  const [url, setUrl] = useState("");
  const [lane, setLane] = useState("generation");
  const [tags, setTags] = useState("");
  const [pinned, setPinned] = useState(false);
  const [working, setWorking] = useState(false);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const filtered = items.filter((item) => {
    if (!query.trim()) return true;
    const hay = `${labelOf(item)} ${String(readPath(item, "xUrl") || "")} ${(readPath(item, "tags") as string[] | undefined)?.join(" ") || ""}`;
    return hay.toLowerCase().includes(query.toLowerCase());
  });

  function move(index: number, direction: -1 | 1) {
    const ids = items.map((item) => String(item.id));
    const next = index + direction;
    if (next < 0 || next >= ids.length) return;
    [ids[index], ids[next]] = [ids[next], ids[index]];
    void onReorder(ids);
  }

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="font-display text-4xl">{TITLES.work}</h1>
        <p className="mt-1 text-sm muted">Paste a post link to add it. Delete removes it from the site. Hide keeps it but stops showing it.</p>
      </div>

      <div className="rounded-card bg-white p-4">
        <p className="font-semibold">Add a tweet</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_180px_160px]">
          <label className="field">
            <span>X post URL</span>
            <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://x.com/tirtaVEX/status/…" />
          </label>
          <label className="field">
            <span>Showcase</span>
            <select value={lane} onChange={(event) => setLane(event.target.value)}>
              <option value="generation">AI video generation</option>
              <option value="motion">Motion design</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              className="btn w-full"
              disabled={disabled || working || !url.trim()}
              onClick={async () => {
                setWorking(true);
                const ok = await onImport(url.trim(), lane, tags.split(",").map((tag) => tag.trim()).filter(Boolean), pinned);
                setWorking(false);
                if (ok) {
                  setUrl("");
                  setTags("");
                  setPinned(false);
                }
              }}
            >
              {working ? "Adding…" : "Add tweet"}
            </button>
          </div>
          <label className="field md:col-span-2">
            <span>Tags (optional)</span>
            <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Seedance 2.5, 4K" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={pinned} onChange={(event) => setPinned(event.target.checked)} /> Pin to top
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          className="min-w-0 flex-1 rounded-pill border border-[var(--tv-line)] bg-white px-4 py-2 text-sm"
          placeholder="Search tweets"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <p className="text-sm muted">{filtered.length} of {items.length}</p>
        <button className="btn ghost" disabled={disabled} onClick={() => setEditing({})}>Blank entry</button>
      </div>

      {editing ? (
        <Editor
          fields={TWEET_CORE}
          value={editing}
          disabled={disabled}
          onChange={setEditing}
          onCancel={() => setEditing(null)}
          onSave={async () => {
            const ok = editing.id ? await onUpdate(String(editing.id), editing) : await onCreate(editing);
            if (ok) setEditing(null);
          }}
        />
      ) : null}

      <ul className="grid gap-3 md:grid-cols-2">
        {filtered.map((item) => {
          const index = items.indexOf(item);
          const thumb = thumbOf(item);
          const status = String(item.status || "live");
          const hidden = Boolean(item.hidden) || status !== "live";
          return (
            <li key={String(item.id)} className="overflow-hidden rounded-card bg-white">
              <div className="relative aspect-[16/10] bg-[#ece7df]">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                ) : null}
                <span className="absolute left-2 top-2 rounded-pill bg-black/70 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-white">
                  {hidden ? "Hidden" : "Live"}
                </span>
                {item.pinned ? <span className="absolute right-2 top-2 rounded-pill bg-emerald-700 px-2 py-1 text-[11px] text-white">Pinned</span> : null}
                <span className="absolute bottom-2 left-2 rounded-pill bg-black/70 px-2 py-1 text-[11px] text-white">
                  {compact(readPath(item, "metrics.impressions"))} impressions · {compact(readPath(item, "metrics.likes"))} likes
                </span>
              </div>
              <div className="grid gap-2 p-3">
                <p className="font-medium leading-snug">{labelOf(item)}</p>
                <p className="text-xs muted">
                  {(readPath(item, "tags") as string[] | undefined)?.join(" · ") || "No tags"} · {String(readPath(item, "lane") || "generation")}
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <button disabled={disabled} onClick={() => setEditing(structuredClone(item))}>Edit</button>
                  <button
                    disabled={disabled}
                    onClick={() => void onUpdate(String(item.id), { ...item, status: status === "live" ? "hidden" : "live", hidden: status === "live" })}
                  >
                    {status === "live" ? "Hide" : "Show"}
                  </button>
                  <button disabled={disabled} onClick={() => void onUpdate(String(item.id), { ...item, pinned: !item.pinned })}>
                    {item.pinned ? "Unpin" : "Pin"}
                  </button>
                  <button disabled={disabled} onClick={() => move(index, -1)}>↑</button>
                  <button disabled={disabled} onClick={() => move(index, 1)}>↓</button>
                  <button
                    className="text-amber"
                    disabled={disabled}
                    onClick={() => {
                      if (confirm(`Delete “${labelOf(item)}” from the site?`)) void onDelete(String(item.id));
                    }}
                  >
                    Delete
                  </button>
                  {String(readPath(item, "xUrl") || "").includes("/status/") ? (
                    <a href={String(readPath(item, "xUrl"))} target="_blank" rel="noopener noreferrer">X ↗</a>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {filtered.length === 0 ? <p className="text-sm muted">Nothing matches that search.</p> : null}
    </section>
  );
}

function Collection({
  type,
  title,
  items,
  fields,
  disabled,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
}: {
  type: string;
  title: string;
  items: Record<string, unknown>[];
  fields: Field[];
  disabled: boolean;
  onCreate: (data: Record<string, unknown>) => Promise<boolean>;
  onUpdate: (id: string, data: Record<string, unknown>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onReorder: (ids: string[]) => Promise<boolean>;
}) {
  const blank = useMemo(() => {
    const base: Record<string, unknown> = {};
    for (const field of fields) {
      const value = field.type === "checkbox" ? false : field.type === "number" ? 0 : field.type === "comma" || field.type === "lines" ? [] : field.type === "select" ? field.options?.[0] : "";
      const parts = field.key.split(".");
      let cursor = base;
      for (const key of parts.slice(0, -1)) {
        cursor[key] = cursor[key] && typeof cursor[key] === "object" ? cursor[key] : {};
        cursor = cursor[key] as Record<string, unknown>;
      }
      cursor[parts[parts.length - 1]] = value;
    }
    if (type === "work") {
      base.thumb = { ...(base.thumb as object), dominant: "#10B981", w: 1280, h: 720 };
      base.metrics = { ...(base.metrics as object), updatedAt: new Date().toISOString() };
      base.postedAt = new Date().toISOString();
    }
    if (type === "articles") base.publishedAt = new Date().toISOString();
    return base;
  }, [fields, type]);
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [query, setQuery] = useState("");
  const filtered = items.filter((item) => !query.trim() || labelOf(item).toLowerCase().includes(query.toLowerCase()));

  function move(index: number, direction: -1 | 1) {
    const ids = items.map((item) => String(item.id));
    const next = index + direction;
    if (next < 0 || next >= ids.length) return;
    [ids[index], ids[next]] = [ids[next], ids[index]];
    void onReorder(ids);
  }

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl">{title}</h1>
        <button className="btn" disabled={disabled} onClick={() => setDraft(structuredClone(blank))}>Add new</button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="min-w-0 flex-1 rounded-pill border border-[var(--tv-line)] bg-white px-4 py-2 text-sm"
          placeholder={`Search ${title.toLowerCase()}`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <p className="text-sm muted">{filtered.length} of {items.length}</p>
      </div>
      {draft ? (
        <Editor
          fields={fields}
          value={draft}
          disabled={disabled}
          onChange={setDraft}
          onCancel={() => setDraft(null)}
          onSave={async () => {
            const ok = draft.id ? await onUpdate(String(draft.id), draft) : await onCreate(draft);
            if (ok) setDraft(null);
          }}
        />
      ) : null}
      <ul className="grid gap-2">
        {filtered.map((item) => {
          const index = items.indexOf(item);
          const thumb = thumbOf(item);
          const hidden = Boolean(item.hidden) || item.status === "hidden" || item.status === "deleted";
          return (
            <li key={String(item.id)} className="flex flex-wrap items-center gap-3 rounded-card bg-white p-3">
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb} alt="" className="h-12 w-16 rounded object-cover" loading="lazy" />
              ) : null}
              <p className="min-w-0 flex-1 font-medium">{labelOf(item)}</p>
              {item.pinned ? <span className="chip">Pinned</span> : null}
              {hidden ? <span className="chip">Hidden</span> : null}
              <button className="text-sm" disabled={disabled} onClick={() => move(index, -1)} aria-label="Move up">↑</button>
              <button className="text-sm" disabled={disabled} onClick={() => move(index, 1)} aria-label="Move down">↓</button>
              {"pinned" in item ? (
                <button className="text-sm" disabled={disabled} onClick={() => void onUpdate(String(item.id), { ...item, pinned: !item.pinned })}>
                  {item.pinned ? "Unpin" : "Pin"}
                </button>
              ) : null}
              {"hidden" in item ? (
                <button className="text-sm" disabled={disabled} onClick={() => void onUpdate(String(item.id), { ...item, hidden: !item.hidden })}>
                  {item.hidden ? "Show" : "Hide"}
                </button>
              ) : null}
              {"status" in item && (item.status === "live" || item.status === "hidden") ? (
                <button className="text-sm" disabled={disabled} onClick={() => void onUpdate(String(item.id), { ...item, status: item.status === "live" ? "hidden" : "live" })}>
                  {item.status === "live" ? "Hide" : "Show"}
                </button>
              ) : null}
              <button className="text-sm" disabled={disabled} onClick={() => setDraft(structuredClone(item))}>Edit</button>
              <button
                className="text-sm text-amber"
                disabled={disabled}
                onClick={() => {
                  if (confirm(`Delete “${labelOf(item)}”?`)) void onDelete(String(item.id));
                }}
              >
                Delete
              </button>
            </li>
          );
        })}
      </ul>
      {filtered.length === 0 ? <p className="text-sm muted">Nothing here yet.</p> : null}
    </section>
  );
}

function Editor({
  fields,
  value,
  onChange,
  onSave,
  onCancel,
  disabled,
}: {
  fields: Field[];
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  onSave: () => void;
  onCancel: () => void;
  disabled: boolean;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, Field[]>();
    for (const field of fields) {
      const key = field.group || "Details";
      map.set(key, [...(map.get(key) || []), field]);
    }
    return [...map.entries()];
  }, [fields]);
  const preview = typeof readPath(value, "thumb.src") === "string" ? String(readPath(value, "thumb.src")) : "";

  return (
    <form
      className="grid gap-4 rounded-card border border-[var(--tv-line)] bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">{value.id ? `Editing: ${labelOf(value)}` : "New entry"}</p>
        <div className="flex gap-2">
          <button className="btn" disabled={disabled} type="submit">Save</button>
          <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>
        </div>
      </div>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="h-32 w-full rounded object-cover" />
      ) : null}
      {groups.map(([group, groupFields]) => (
        <div key={group} className="grid gap-3">
          <p className="text-[11px] uppercase tracking-[0.18em] muted">{group}</p>
          <div className="grid gap-3 md:grid-cols-2">
            {groupFields.map((field) => {
              const current = readPath(value, field.key);
              const set = (next: unknown) => onChange(writePath(value, field.key, next));
              if (field.type === "checkbox") {
                return (
                  <label key={field.key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={Boolean(current)} onChange={(event) => set(event.target.checked)} />
                    {field.label}
                  </label>
                );
              }
              if (field.type === "select") {
                return (
                  <label key={field.key} className="field">
                    <span>{field.label}</span>
                    <select value={String(current ?? "")} onChange={(event) => set(event.target.value)}>
                      {field.options?.map((option) => (
                        <option key={option || "empty"} value={option}>{field.optionLabels?.[option] || option || "None"}</option>
                      ))}
                    </select>
                  </label>
                );
              }
              const text = Array.isArray(current) ? current.join(field.type === "lines" ? "\n" : ", ") : current == null ? "" : String(current);
              return (
                <label key={field.key} className={`field ${field.wide || field.type === "textarea" || field.type === "lines" ? "md:col-span-2" : ""}`}>
                  <span>{field.label}</span>
                  {field.type === "textarea" || field.type === "lines" ? (
                    <textarea
                      value={text}
                      onChange={(event) => set(field.type === "lines" ? event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) : event.target.value)}
                    />
                  ) : (
                    <input
                      value={text}
                      type={field.type === "number" ? "number" : "text"}
                      onChange={(event) => set(field.type === "number" ? Number(event.target.value) : field.type === "comma" ? event.target.value.split(",").map((part) => part.trim()).filter(Boolean) : event.target.value)}
                    />
                  )}
                  {field.help ? <span className="text-xs muted">{field.help}</span> : null}
                  {field.type === "image" ? <ImageUpload onUrl={(url) => set(url)} /> : null}
                </label>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <button className="btn" disabled={disabled} type="submit">Save changes</button>
        <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function ImageUpload({ onUrl }: { onUrl: (url: string) => void }) {
  const [note, setNote] = useState("");
  return (
    <span className="text-xs">
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const body = new FormData();
          body.set("file", file);
          const response = await fetch("/api/admin/upload", { method: "POST", body });
          const json = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
          if (!response.ok || !json.url) setNote(json.error || "Upload failed. Paste a URL instead.");
          else {
            onUrl(json.url);
            setNote("Uploaded.");
          }
        }}
      />
      {note ? <span className="mt-1 block">{note}</span> : null}
    </span>
  );
}

function SettingsForm({ settings, disabled, onSave }: { settings: Settings; disabled: boolean; onSave: (data: Settings) => void }) {
  const [draft, setDraft] = useState(settings);
  const GROUPS: { title: string; keys: (keyof Settings)[] }[] = [
    { title: "Hero", keys: ["heroEyebrow", "heroTitle", "heroTagline", "heroHeadline", "heroLede", "heroPrimaryLabel", "heroSecondaryLabel", "heroImage", "heroImageAlt"] },
    { title: "About", keys: ["aboutEyebrow", "aboutTitle", "aboutMore", "aboutImage", "aboutImageAlt", "introLeftKicker", "introLeftTitle", "introLeftBody", "introRightKicker", "introRightTitle", "introRightBody", "bio", "bioLong"] },
    { title: "Section titles", keys: ["workTitle", "workLede", "campaignsTitle", "campaignsLede", "partnersTitle", "partnersLede", "statsTitle", "statsLede", "skillsTitle", "skillsLede"] },
    { title: "Contact", keys: ["contactTitle", "contactHeadline", "contactLede", "email", "phone", "location", "availability", "xHandle", "xUrl", "tiktokUrl", "instagramUrl", "footerBlurb", "pressNote", "pulseLede"] },
    { title: "SEO", keys: ["metaTitle", "metaDescription"] },
  ];
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <h1 className="font-display text-4xl">Copy & settings</h1>
      <p className="text-sm muted">Every headline on the site. Long fields get a larger box.</p>
      {GROUPS.map((group) => (
        <div key={group.title} className="grid gap-3 rounded-card bg-white p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] muted">{group.title}</p>
          <div className="grid gap-3 md:grid-cols-2">
            {group.keys.map((key) => {
              const value = String(draft[key] ?? "");
              const long = value.length > 80 || key === "bioLong" || key === "metaDescription" || key === "contactLede" || key === "bio";
              return (
                <label key={key} className={`field ${long ? "md:col-span-2" : ""}`}>
                  <span>{key}</span>
                  {long ? (
                    <textarea value={value} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
                  ) : (
                    <input value={value} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
                  )}
                </label>
              );
            })}
          </div>
        </div>
      ))}
      <div className="grid gap-3 rounded-card bg-white p-4">
        <p className="text-[11px] uppercase tracking-[0.18em] muted">Lists</p>
        <label className="field">
          <span>Genres</span>
          <input value={draft.genres.join(", ")} onChange={(event) => setDraft({ ...draft, genres: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
        </label>
        <label className="field">
          <span>Marquee words</span>
          <input value={draft.marquee.join(", ")} onChange={(event) => setDraft({ ...draft, marquee: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
        </label>
        <label className="field">
          <span>Budget options</span>
          <input value={draft.budgetOptions.join(", ")} onChange={(event) => setDraft({ ...draft, budgetOptions: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
        </label>
        <div className="grid gap-2">
          <p className="text-sm">Socials</p>
          {draft.socials.map((item, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input value={item.label} onChange={(event) => {
                const socials = [...draft.socials];
                socials[index] = { ...item, label: event.target.value };
                setDraft({ ...draft, socials });
              }} />
              <input value={item.url} onChange={(event) => {
                const socials = [...draft.socials];
                socials[index] = { ...item, url: event.target.value };
                setDraft({ ...draft, socials });
              }} />
              <button type="button" className="text-sm text-amber" onClick={() => setDraft({ ...draft, socials: draft.socials.filter((_, i) => i !== index) })}>Remove</button>
            </div>
          ))}
          <button type="button" className="justify-self-start text-sm underline" onClick={() => setDraft({ ...draft, socials: [...draft.socials, { label: "", url: "https://" }] })}>
            Add social
          </button>
        </div>
      </div>
      <button className="btn justify-self-start" disabled={disabled}>Save settings</button>
    </form>
  );
}

function LegalForm({ content, disabled, onSave }: { content: SiteContent; disabled: boolean; onSave: (slug: "terms" | "privacy", data: { title: string; eyebrow: string; body: string }) => void }) {
  return (
    <div className="grid gap-6">
      <h1 className="font-display text-4xl">Legal pages</h1>
      {(["terms", "privacy"] as const).map((slug) => {
        const page = content.legal[slug];
        return (
          <form
            key={slug}
            className="grid gap-3 rounded-card bg-white p-4"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              onSave(slug, { title: String(data.get("title") || ""), eyebrow: String(data.get("eyebrow") || ""), body: String(data.get("body") || "") });
            }}
          >
            <p className="eyebrow">{slug}</p>
            <label className="field"><span>Title</span><input name="title" defaultValue={page.title} /></label>
            <label className="field"><span>Eyebrow</span><input name="eyebrow" defaultValue={page.eyebrow} /></label>
            <label className="field"><span>Body</span><textarea name="body" defaultValue={page.body} className="min-h-64" /></label>
            <button className="btn justify-self-start" disabled={disabled}>Save {slug}</button>
          </form>
        );
      })}
    </div>
  );
}

function StatsForm({ stats, disabled, onSave }: { stats: SiteContent["stats"]; disabled: boolean; onSave: (data: SiteContent["stats"]) => void }) {
  const [draft, setDraft] = useState(stats);
  function setPlatform(index: number, key: "impressions" | "followers" | "videos" | "handle" | "label" | "url", value: string) {
    const platforms = draft.platforms.map((row, i) => {
      if (i !== index) return row;
      if (key === "impressions" || key === "followers" || key === "videos") return { ...row, [key]: Number(value) || 0 };
      return { ...row, [key]: value };
    });
    setDraft({ ...draft, platforms });
  }
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <h1 className="font-display text-4xl">Engagement</h1>
      <p className="text-sm muted">X followers refresh automatically from the profile. Everything else is what you type here.</p>
      {draft.platforms.map((row, index) => row.platform === "overall" ? null : (
        <fieldset key={row.platform} className="grid gap-3 rounded-card bg-white p-4 md:grid-cols-3">
          <legend className="px-1 text-sm">{row.label || row.platform}</legend>
          <label className="field"><span>Label</span><input value={row.label} onChange={(event) => setPlatform(index, "label", event.target.value)} /></label>
          <label className="field"><span>Handle</span><input value={row.handle} onChange={(event) => setPlatform(index, "handle", event.target.value)} /></label>
          <label className="field"><span>Profile URL</span><input value={row.url} onChange={(event) => setPlatform(index, "url", event.target.value)} /></label>
          <label className="field"><span>Impressions</span><input type="number" value={row.impressions} onChange={(event) => setPlatform(index, "impressions", event.target.value)} /></label>
          <label className="field"><span>Followers</span><input type="number" value={row.followers} onChange={(event) => setPlatform(index, "followers", event.target.value)} /></label>
          <label className="field"><span>Videos published</span><input type="number" value={row.videos} onChange={(event) => setPlatform(index, "videos", event.target.value)} /></label>
        </fieldset>
      ))}
      <details className="rounded-card bg-white p-4">
        <summary className="cursor-pointer text-sm">Legacy totals</summary>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {(["impressionsAll", "impressions30d", "likes", "posts", "followers", "engagement", "videos"] as const).map((key) => (
            <label key={key} className="field">
              <span>{key}</span>
              <input type="number" value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: Number(event.target.value) })} />
            </label>
          ))}
          <label className="field">
            <span>Best post id</span>
            <input value={draft.bestPostId} onChange={(event) => setDraft({ ...draft, bestPostId: event.target.value })} />
          </label>
        </div>
      </details>
      <button className="btn justify-self-start" disabled={disabled}>Save numbers</button>
    </form>
  );
}

function Inbox({ items, disabled, onDelete }: { items: AdminSnapshot["submissions"]; disabled: boolean; onDelete: (id: string) => void }) {
  return (
    <section>
      <h1 className="font-display text-4xl">Collab inbox</h1>
      <ul className="mt-4 grid gap-3">
        {items.length === 0 ? <li className="text-sm muted">No briefs yet.</li> : null}
        {items.map((item) => (
          <li key={item.id} className="rounded-card bg-white p-4">
            <p className="font-semibold">{item.name} · {item.project}</p>
            <p className="text-sm muted">{item.budget} · {item.link}</p>
            <p className="mt-2">{item.message}</p>
            <button className="mt-2 text-sm text-amber" disabled={disabled} onClick={() => onDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
