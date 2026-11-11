"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { AdminSnapshot, Settings, SiteContent } from "@/lib/types";

const NAV = [
  ["", "Overview"],
  ["settings", "Settings"],
  ["work", "Work"],
  ["articles", "Journal"],
  ["links", "Links"],
  ["projects", "Projects"],
  ["collabs", "Collabs"],
  ["programs", "Programs"],
  ["ambassadors", "Ambassadors"],
  ["contests", "Contests"],
  ["testimonials", "Reviews"],
  ["process", "Process"],
  ["tools", "Toolkit"],
  ["legal", "Legal"],
  ["stats", "Stats"],
  ["submissions", "Inbox"],
] as const;

type Field = { key: string; label: string; type: "text" | "textarea" | "number" | "checkbox" | "comma" | "lines" | "select" | "image"; options?: string[] };

const FIELDS: Record<string, Field[]> = {
  work: [
    { key: "title", label: "Title", type: "text" },
    { key: "xUrl", label: "X URL", type: "text" },
    { key: "note", label: "Note", type: "textarea" },
    { key: "category", label: "Category", type: "select", options: ["ai-video", "web3", "contest", "collab"] },
    { key: "tags", label: "Tags", type: "comma" },
    { key: "status", label: "Visibility", type: "select", options: ["live", "hidden", "deleted"] },
    { key: "pinned", label: "Pinned", type: "checkbox" },
    { key: "thumb.src", label: "Thumbnail URL", type: "image" },
    { key: "thumb.dominant", label: "Dominant color", type: "text" },
    { key: "thumb.durationSec", label: "Duration (sec)", type: "number" },
    { key: "postedAt", label: "Posted at", type: "text" },
    { key: "authorName", label: "Author", type: "text" },
    { key: "authorHandle", label: "Handle", type: "text" },
    { key: "metrics.impressions", label: "Impressions", type: "number" },
    { key: "metrics.likes", label: "Likes", type: "number" },
    { key: "metrics.reposts", label: "Reposts", type: "number" },
    { key: "metrics.replies", label: "Replies", type: "number" },
    { key: "metrics.bookmarks", label: "Bookmarks", type: "number" },
    { key: "metrics.quotes", label: "Quotes", type: "number" },
  ],
  articles: [
    { key: "title", label: "Title", type: "text" },
    { key: "kind", label: "Kind", type: "select", options: ["article", "link"] },
    { key: "slug", label: "Slug", type: "text" },
    { key: "url", label: "URL", type: "text" },
    { key: "source", label: "Source", type: "text" },
    { key: "excerpt", label: "Excerpt", type: "textarea" },
    { key: "body", label: "Body (markdown)", type: "textarea" },
    { key: "cover", label: "Cover URL", type: "image" },
    { key: "coverDominant", label: "Cover color", type: "text" },
    { key: "publishedAt", label: "Date", type: "text" },
    { key: "tags", label: "Tags", type: "comma" },
    { key: "pinned", label: "Pinned", type: "checkbox" },
    { key: "hidden", label: "Hidden", type: "checkbox" },
  ],
  links: [
    { key: "label", label: "Label", type: "text" },
    { key: "url", label: "URL", type: "text" },
    { key: "group", label: "Group", type: "select", options: ["footer", "journal", "social"] },
    { key: "hidden", label: "Hidden", type: "checkbox" },
  ],
  projects: [
    { key: "name", label: "Name", type: "text" },
    { key: "slug", label: "Slug", type: "text" },
    { key: "year", label: "Year", type: "number" },
    { key: "client", label: "Client", type: "text" },
    { key: "date", label: "Date", type: "text" },
    { key: "industry", label: "Industry", type: "text" },
    { key: "services", label: "Services", type: "comma" },
    { key: "scope", label: "Scope", type: "comma" },
    { key: "budget", label: "Budget", type: "text" },
    { key: "aiTech", label: "Stack", type: "text" },
    { key: "overview", label: "Overview", type: "textarea" },
    { key: "challenge", label: "Challenge", type: "textarea" },
    { key: "approach", label: "Approach", type: "textarea" },
    { key: "achievements", label: "Achievements", type: "lines" },
    { key: "outcome", label: "Outcome", type: "text" },
    { key: "cover", label: "Cover URL", type: "image" },
    { key: "accent", label: "Accent", type: "text" },
    { key: "xUrl", label: "X URL", type: "text" },
    { key: "websiteUrl", label: "Website", type: "text" },
    { key: "reviewQuote", label: "Review", type: "textarea" },
    { key: "reviewAuthor", label: "Review author", type: "text" },
    { key: "reviewRole", label: "Review role", type: "text" },
    { key: "reviewStat", label: "Stat", type: "text" },
    { key: "reviewStatLabel", label: "Stat label", type: "text" },
    { key: "featured", label: "Featured", type: "checkbox" },
    { key: "hidden", label: "Hidden", type: "checkbox" },
  ],
  collabs: [
    { key: "name", label: "Name", type: "text" },
    { key: "type", label: "Type", type: "select", options: ["brand", "creator", "project"] },
    { key: "logo", label: "Logo URL", type: "image" },
    { key: "date", label: "Date", type: "text" },
    { key: "summary", label: "Summary", type: "textarea" },
    { key: "result", label: "Result", type: "textarea" },
    { key: "postIds", label: "Work ids", type: "comma" },
    { key: "hidden", label: "Hidden", type: "checkbox" },
  ],
  programs: [
    { key: "name", label: "Name", type: "text" },
    { key: "role", label: "Role", type: "text" },
    { key: "start", label: "Start", type: "text" },
    { key: "end", label: "End", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["active", "completed"] },
    { key: "highlights", label: "Highlights", type: "lines" },
    { key: "postIds", label: "Work ids", type: "comma" },
    { key: "impressions", label: "Impressions", type: "number" },
    { key: "likes", label: "Likes", type: "number" },
    { key: "hidden", label: "Hidden", type: "checkbox" },
  ],
  ambassadors: [
    { key: "project", label: "Project", type: "text" },
    { key: "title", label: "Title", type: "text" },
    { key: "region", label: "Region", type: "text" },
    { key: "start", label: "Start", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["active", "past"] },
    { key: "duties", label: "Duties", type: "lines" },
    { key: "postIds", label: "Work ids", type: "comma" },
    { key: "hidden", label: "Hidden", type: "checkbox" },
  ],
  contests: [
    { key: "name", label: "Name", type: "text" },
    { key: "organizer", label: "Organizer", type: "text" },
    { key: "date", label: "Date", type: "text" },
    { key: "year", label: "Year", type: "number" },
    { key: "placement", label: "Placement", type: "select", options: ["winner", "finalist", "top10", "participant"] },
    { key: "entryPostId", label: "Work id", type: "text" },
    { key: "xUrl", label: "X URL", type: "text" },
    { key: "thumb", label: "Thumb URL", type: "image" },
    { key: "hidden", label: "Hidden", type: "checkbox" },
  ],
  testimonials: [
    { key: "quote", label: "Quote", type: "textarea" },
    { key: "name", label: "Name", type: "text" },
    { key: "role", label: "Role", type: "text" },
    { key: "sourceUrl", label: "Source URL", type: "text" },
    { key: "stat", label: "Stat", type: "text" },
    { key: "statLabel", label: "Stat label", type: "text" },
    { key: "resultLine", label: "Result", type: "text" },
    { key: "hidden", label: "Hidden", type: "checkbox" },
  ],
  process: [
    { key: "kicker", label: "Kicker", type: "text" },
    { key: "title", label: "Title", type: "text" },
    { key: "body", label: "Body", type: "textarea" },
    { key: "hidden", label: "Hidden", type: "checkbox" },
  ],
  tools: [
    { key: "name", label: "Name", type: "text" },
    { key: "group", label: "Group", type: "text" },
    { key: "hidden", label: "Hidden", type: "checkbox" },
  ],
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

export function AdminApp({ initial }: { initial: AdminSnapshot }) {
  const pathname = usePathname();
  const router = useRouter();
  const section = pathname.split("/").filter(Boolean)[1] || "";
  const [snap, setSnap] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(body: unknown) {
    if (!snap.writable) return;
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
      return;
    }
    setSnap(json.snapshot);
  }

  return (
    <div className="admin">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[200px_1fr]">
        <aside className="admin-nav md:sticky md:top-4 md:self-start">
          <p className="font-display text-2xl text-forest">Tirta admin</p>
          <nav className="mt-4 flex gap-2 overflow-x-auto md:grid">
            {NAV.map(([href, label]) => {
              const active = section === href;
              return (
                <Link key={href || "home"} href={href ? `/admin/${href}` : "/admin"} className={`rounded-pill px-3 py-2 text-sm whitespace-nowrap ${active ? "bg-emerald-700 text-white" : "bg-white"}`}>
                  {label}
                </Link>
              );
            })}
          </nav>
          <button
            className="mt-4 text-sm underline"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              router.push("/admin/login");
              router.refresh();
            }}
          >
            Log out
          </button>
        </aside>
        <main className="min-w-0">
          {snap.warning ? <p className="mb-4 rounded-card bg-white p-4 text-sm">{snap.warning}</p> : null}
          {error ? <p className="mb-4 text-sm text-amber">{error}</p> : null}
          {section === "" ? <Overview snap={snap} /> : null}
          {section === "settings" ? <SettingsForm settings={snap.content.settings} disabled={!snap.writable || busy} onSave={(data) => send({ op: "settings", data })} /> : null}
          {section === "legal" ? <LegalForm content={snap.content} disabled={!snap.writable || busy} onSave={(slug, data) => send({ op: "legal", slug, data })} /> : null}
          {section === "stats" ? (
            <StatsForm
              stats={snap.content.stats}
              disabled={!snap.writable || busy}
              onSave={(data) => send({ op: "stats", data })}
            />
          ) : null}
          {section === "submissions" ? (
            <Inbox
              items={snap.submissions}
              disabled={!snap.writable || busy}
              onDelete={(id) => send({ op: "delete", type: "submissions", id })}
            />
          ) : null}
          {section === "work" ? <XImport disabled={!snap.writable || busy} onDone={(snapshot) => setSnap(snapshot)} /> : null}
          {FIELDS[section] ? (
            <Collection
              type={section}
              items={(snap.content[section as keyof SiteContent] as unknown[]).filter((item) => item && typeof item === "object") as Record<string, unknown>[]}
              fields={FIELDS[section]}
              disabled={!snap.writable || busy}
              onCreate={(data) => send({ op: "create", type: section, data })}
              onUpdate={(id, data) => send({ op: "update", type: section, id, data })}
              onDelete={(id) => send({ op: "delete", type: section, id })}
              onReorder={(ids) => send({ op: "reorder", type: section, ids })}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}

function Overview({ snap }: { snap: AdminSnapshot }) {
  const counts = [
    ["Work", snap.content.work.length],
    ["Projects", snap.content.projects.length],
    ["Journal", snap.content.articles.length],
    ["Inbox", snap.submissions.length],
  ];
  return (
    <section>
      <h1 className="font-display text-5xl">Dashboard</h1>
      <p className="mt-2 text-sm muted">Source: {snap.source}. {snap.writable ? "Edits save to Postgres." : "Read only."}</p>
      <p className="mt-2 text-sm">Agent: {snap.content.agent.lastHeartbeatAt ? new Date(snap.content.agent.lastHeartbeatAt).toLocaleString() : "no heartbeat"} — {snap.content.agent.message}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {counts.map(([label, value]) => (
          <article key={String(label)} className="rounded-card bg-white p-4">
            <p className="text-sm muted">{label}</p>
            <p className="font-display text-4xl">{value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Collection({
  type,
  items,
  fields,
  disabled,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
}: {
  type: string;
  items: Record<string, unknown>[];
  fields: Field[];
  disabled: boolean;
  onCreate: (data: Record<string, unknown>) => void;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onReorder: (ids: string[]) => void;
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
  const [mode, setMode] = useState<"create" | "edit">("create");

  function move(index: number, direction: -1 | 1) {
    const ids = items.map((item) => String(item.id));
    const next = index + direction;
    if (next < 0 || next >= ids.length) return;
    [ids[index], ids[next]] = [ids[next], ids[index]];
    onReorder(ids);
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-4xl capitalize">{type}</h1>
        <button className="btn" disabled={disabled} onClick={() => { setDraft(structuredClone(blank)); setMode("create"); }}>
          New
        </button>
      </div>
      {draft ? (
        <Editor
          fields={fields}
          value={draft}
          disabled={disabled}
          onChange={setDraft}
          onCancel={() => setDraft(null)}
          onSave={() => {
            if (mode === "create") onCreate(draft);
            else onUpdate(String(draft.id), draft);
            setDraft(null);
          }}
        />
      ) : null}
      <ul className="mt-4 grid gap-2">
        {items.map((item, index) => (
          <li key={String(item.id)} className="rounded-card bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="min-w-0 flex-1 font-medium">{labelOf(item)}</p>
              {"pinned" in item && item.pinned ? <span className="chip">Pinned</span> : null}
              {item.hidden || item.status === "hidden" || item.status === "deleted" ? <span className="chip">Hidden</span> : null}
              <button className="text-sm" disabled={disabled} onClick={() => move(index, -1)} aria-label="Move up">Up</button>
              <button className="text-sm" disabled={disabled} onClick={() => move(index, 1)} aria-label="Move down">Down</button>
              {"pinned" in item ? (
                <button className="text-sm" disabled={disabled} onClick={() => onUpdate(String(item.id), { ...item, pinned: !item.pinned })}>
                  {item.pinned ? "Unpin" : "Pin"}
                </button>
              ) : null}
              {"hidden" in item ? (
                <button className="text-sm" disabled={disabled} onClick={() => onUpdate(String(item.id), { ...item, hidden: !item.hidden })}>
                  {item.hidden ? "Show" : "Hide"}
                </button>
              ) : null}
              {"status" in item ? (
                <button className="text-sm" disabled={disabled} onClick={() => onUpdate(String(item.id), { ...item, status: item.status === "live" ? "hidden" : "live" })}>
                  {item.status === "live" ? "Hide" : "Show"}
                </button>
              ) : null}
              <button className="text-sm" disabled={disabled} onClick={() => { setDraft(structuredClone(item)); setMode("edit"); }}>Edit</button>
              <button className="text-sm text-amber" disabled={disabled} onClick={() => onDelete(String(item.id))}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
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
  return (
    <form
      className="mt-4 grid gap-3 rounded-card bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      {fields.map((field) => {
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
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          );
        }
        const text = Array.isArray(current) ? current.join(field.type === "lines" ? "\n" : ", ") : current == null ? "" : String(current);
        return (
          <label key={field.key} className="field">
            <span>{field.label}</span>
            {field.type === "textarea" || field.type === "lines" ? (
              <textarea value={text} onChange={(event) => set(field.type === "lines" ? event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) : event.target.value)} />
            ) : (
              <input
                value={text}
                type={field.type === "number" ? "number" : "text"}
                onChange={(event) => set(field.type === "number" ? Number(event.target.value) : field.type === "comma" ? event.target.value.split(",").map((part) => part.trim()).filter(Boolean) : event.target.value)}
              />
            )}
            {field.type === "image" ? <ImageUpload onUrl={(url) => set(url)} /> : null}
          </label>
        );
      })}
      <div className="flex gap-2">
        <button className="btn" disabled={disabled} type="submit">Save</button>
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

function XImport({ disabled, onDone }: { disabled: boolean; onDone: (snapshot: AdminSnapshot) => void }) {
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("ai-video");
  const [tags, setTags] = useState("");
  const [pinned, setPinned] = useState(false);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  async function run(path: string) {
    setError("");
    const response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ xUrl: url, url, category, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean), pinned }),
    });
    const json = (await response.json().catch(() => ({}))) as { error?: string; title?: string; text?: string; snapshot?: AdminSnapshot };
    if (!response.ok) {
      setError(json.error || "Request failed");
      return json;
    }
    return json;
  }

  return (
    <section className="rounded-card bg-white p-4">
      <h1 className="font-display text-4xl">Add from an X link</h1>
      <p className="mt-1 text-sm muted">Paste a status URL. The server fills text, author, thumbnail, duration, and public metrics.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="field md:col-span-2">
          <span>Status URL</span>
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://x.com/TirtaVEX/status/…" />
        </label>
        <label className="field">
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {["ai-video", "web3", "contest", "collab"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Tags</span>
          <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="launch, 15s" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={pinned} onChange={(event) => setPinned(event.target.checked)} /> Pin it
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="btn ghost"
          disabled={disabled}
          onClick={async () => {
            const json = await run("/api/admin/x/preview");
            if (json.title || json.text) setPreview(`${json.title ?? ""}\n${json.text ?? ""}`.trim());
          }}
        >
          Preview
        </button>
        <button
          className="btn"
          disabled={disabled}
          onClick={async () => {
            const json = await run("/api/admin/x/import");
            if (json.snapshot) onDone(json.snapshot);
            setPreview("");
            setUrl("");
          }}
        >
          Save to portfolio
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-amber">{error}</p> : null}
      {preview ? <pre className="mt-3 whitespace-pre-wrap text-sm">{preview}</pre> : null}
    </section>
  );
}

function SettingsForm({ settings, disabled, onSave }: { settings: Settings; disabled: boolean; onSave: (data: Settings) => void }) {
  const [draft, setDraft] = useState(settings);
  const keys: (keyof Settings)[] = ["heroEyebrow", "heroTitle", "heroHeadline", "heroLede", "heroPrimaryLabel", "heroSecondaryLabel", "introLeftKicker", "introLeftTitle", "introLeftBody", "introRightKicker", "introRightTitle", "introRightBody", "bio", "bioLong", "email", "phone", "location", "availability", "xHandle", "xUrl", "footerBlurb", "contactHeadline", "contactLede", "metaTitle", "metaDescription", "pressNote", "pulseLede"];
  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <h1 className="font-display text-4xl">Site settings</h1>
      {keys.map((key) => (
        <label key={key} className="field">
          <span>{key}</span>
          {String(draft[key]).length > 80 || key === "bioLong" ? (
            <textarea value={String(draft[key] ?? "")} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
          ) : (
            <input value={String(draft[key] ?? "")} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
          )}
        </label>
      ))}
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
          <div key={index} className="grid grid-cols-2 gap-2">
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
          </div>
        ))}
        <button type="button" className="text-sm underline" onClick={() => setDraft({ ...draft, socials: [...draft.socials, { label: "", url: "https://" }] })}>
          Add social
        </button>
      </div>
      <button className="btn" disabled={disabled}>Save settings</button>
    </form>
  );
}

function LegalForm({ content, disabled, onSave }: { content: SiteContent; disabled: boolean; onSave: (slug: "terms" | "privacy", data: { title: string; eyebrow: string; body: string }) => void }) {
  return (
    <div className="grid gap-8">
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
            <button className="btn" disabled={disabled}>Save {slug}</button>
          </form>
        );
      })}
    </div>
  );
}

function StatsForm({ stats, disabled, onSave }: { stats: SiteContent["stats"]; disabled: boolean; onSave: (data: SiteContent["stats"]) => void }) {
  const [draft, setDraft] = useState(stats);
  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <h1 className="font-display text-4xl">Live totals</h1>
      {(["impressionsAll", "impressions30d", "likes", "posts", "followers"] as const).map((key) => (
        <label key={key} className="field">
          <span>{key}</span>
          <input type="number" value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: Number(event.target.value) })} />
        </label>
      ))}
      <label className="field">
        <span>Best post id</span>
        <input value={draft.bestPostId} onChange={(event) => setDraft({ ...draft, bestPostId: event.target.value })} />
      </label>
      <button className="btn" disabled={disabled}>Save stats</button>
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
            <button className="mt-2 text-sm underline" disabled={disabled} onClick={() => onDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
