import { twimg } from "@/lib/twimg";

export type Row = Record<string, unknown>;

export type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox" | "comma" | "lines" | "select" | "image";
  options?: string[];
  optionLabels?: Record<string, string>;
  group?: string;
  help?: string;
  wide?: boolean;
};

export const TWEET_CORE: Field[] = [
  { key: "title", label: "Judul", type: "text", group: "Dasar", wide: true },
  { key: "xUrl", label: "Link post X", type: "text", group: "Dasar", wide: true, help: "Link status X dari video ini." },
  { key: "note", label: "Caption", type: "textarea", group: "Dasar", wide: true },
  { key: "lane", label: "Tampil di", type: "select", group: "Dasar", options: ["generation", "motion"], optionLabels: { generation: "AI Generated", motion: "Motion Design" } },
  { key: "category", label: "Kategori lama", type: "select", group: "Dasar", options: ["ai-video", "web3", "contest", "collab"] },
  { key: "tags", label: "Tag", type: "comma", group: "Dasar", wide: true },
  { key: "thumb.src", label: "Poster / thumbnail", type: "image", group: "Media", wide: true },
  { key: "videoUrl", label: "Link video (mp4)", type: "text", group: "Media", wide: true },
  { key: "thumb.durationSec", label: "Durasi (detik)", type: "number", group: "Media" },
  { key: "thumb.dominant", label: "Warna aksen", type: "text", group: "Media" },
  { key: "metrics.impressions", label: "Views", type: "number", group: "Angka" },
  { key: "metrics.likes", label: "Likes", type: "number", group: "Angka" },
  { key: "metrics.reposts", label: "Repost", type: "number", group: "Angka" },
  { key: "metrics.replies", label: "Balasan", type: "number", group: "Angka" },
  { key: "metrics.bookmarks", label: "Bookmark", type: "number", group: "Angka" },
  { key: "metrics.quotes", label: "Quote", type: "number", group: "Angka" },
  { key: "postedAt", label: "Tanggal posting", type: "text", group: "Pengaturan" },
  { key: "status", label: "Status tampil", type: "select", group: "Pengaturan", options: ["live", "hidden", "deleted"], optionLabels: { live: "Tampil di situs", hidden: "Disembunyikan", deleted: "Dihapus" } },
  { key: "pinned", label: "Pin di atas", type: "checkbox", group: "Pengaturan" },
];

export const FIELDS: Record<string, Field[]> = {
  work: TWEET_CORE,
  articles: [
    { key: "title", label: "Judul", type: "text", group: "Dasar", wide: true },
    { key: "kind", label: "Jenis", type: "select", group: "Dasar", options: ["article", "link"], optionLabels: { article: "Artikel", link: "Link luar" } },
    { key: "slug", label: "Slug (alamat URL)", type: "text", group: "Dasar" },
    { key: "url", label: "Link luar", type: "text", group: "Dasar", wide: true },
    { key: "source", label: "Sumber", type: "text", group: "Dasar" },
    { key: "excerpt", label: "Ringkasan", type: "textarea", group: "Teks", wide: true },
    { key: "body", label: "Isi (markdown)", type: "textarea", group: "Teks", wide: true },
    { key: "cover", label: "Gambar sampul", type: "image", group: "Media", wide: true },
    { key: "coverDominant", label: "Warna sampul", type: "text", group: "Media" },
    { key: "publishedAt", label: "Tanggal", type: "text", group: "Pengaturan" },
    { key: "tags", label: "Tag", type: "comma", group: "Pengaturan", wide: true },
    { key: "pinned", label: "Pin di atas", type: "checkbox", group: "Pengaturan" },
    { key: "hidden", label: "Sembunyikan dari situs", type: "checkbox", group: "Pengaturan" },
  ],
  links: [
    { key: "label", label: "Label", type: "text", group: "Dasar" },
    { key: "url", label: "Link", type: "text", group: "Dasar", wide: true },
    { key: "group", label: "Tampil di", type: "select", group: "Dasar", options: ["footer", "journal", "social"], optionLabels: { footer: "Footer", journal: "Journal", social: "Sosial media" } },
    { key: "hidden", label: "Sembunyikan dari situs", type: "checkbox", group: "Pengaturan" },
  ],
  projects: [
    { key: "name", label: "Nama", type: "text", group: "Dasar", wide: true },
    { key: "slug", label: "Slug (alamat URL)", type: "text", group: "Dasar" },
    { key: "year", label: "Tahun", type: "number", group: "Dasar" },
    { key: "client", label: "Klien", type: "text", group: "Dasar" },
    { key: "date", label: "Tanggal", type: "text", group: "Dasar" },
    { key: "industry", label: "Industri", type: "text", group: "Dasar" },
    { key: "services", label: "Layanan", type: "comma", group: "Dasar", wide: true },
    { key: "scope", label: "Cakupan", type: "comma", group: "Dasar", wide: true },
    { key: "budget", label: "Budget", type: "text", group: "Dasar" },
    { key: "aiTech", label: "Teknologi", type: "text", group: "Dasar" },
    { key: "overview", label: "Gambaran umum", type: "textarea", group: "Teks", wide: true },
    { key: "challenge", label: "Tantangan", type: "textarea", group: "Teks", wide: true },
    { key: "approach", label: "Pendekatan", type: "textarea", group: "Teks", wide: true },
    { key: "achievements", label: "Pencapaian", type: "lines", group: "Teks", wide: true },
    { key: "outcome", label: "Hasil akhir", type: "text", group: "Teks", wide: true },
    { key: "cover", label: "Gambar sampul", type: "image", group: "Media", wide: true },
    { key: "accent", label: "Warna aksen", type: "text", group: "Media" },
    { key: "xUrl", label: "Link X", type: "text", group: "Link", wide: true },
    { key: "websiteUrl", label: "Website", type: "text", group: "Link", wide: true },
    { key: "reviewQuote", label: "Ulasan", type: "textarea", group: "Ulasan", wide: true },
    { key: "reviewAuthor", label: "Nama pemberi ulasan", type: "text", group: "Ulasan" },
    { key: "reviewRole", label: "Jabatan pemberi ulasan", type: "text", group: "Ulasan" },
    { key: "reviewStat", label: "Angka unggulan", type: "text", group: "Ulasan" },
    { key: "reviewStatLabel", label: "Keterangan angka", type: "text", group: "Ulasan" },
    { key: "featured", label: "Unggulan", type: "checkbox", group: "Pengaturan" },
    { key: "hidden", label: "Sembunyikan dari situs", type: "checkbox", group: "Pengaturan" },
  ],
  collabs: [
    { key: "name", label: "Nama", type: "text", group: "Dasar" },
    { key: "type", label: "Tipe", type: "select", group: "Dasar", options: ["brand", "creator", "project"], optionLabels: { brand: "Brand", creator: "Kreator", project: "Proyek" } },
    { key: "logo", label: "Logo", type: "image", group: "Media", wide: true },
    { key: "date", label: "Tanggal", type: "text", group: "Dasar" },
    { key: "summary", label: "Ringkasan", type: "textarea", group: "Teks", wide: true },
    { key: "result", label: "Hasil", type: "textarea", group: "Teks", wide: true },
    { key: "postIds", label: "ID video terkait", type: "comma", group: "Pengaturan", wide: true },
    { key: "hidden", label: "Sembunyikan dari situs", type: "checkbox", group: "Pengaturan" },
  ],
  programs: [
    { key: "name", label: "Nama", type: "text", group: "Dasar" },
    { key: "role", label: "Peran", type: "text", group: "Dasar" },
    { key: "start", label: "Mulai", type: "text", group: "Dasar" },
    { key: "end", label: "Selesai", type: "text", group: "Dasar" },
    { key: "status", label: "Status", type: "select", group: "Dasar", options: ["active", "completed"], optionLabels: { active: "Berjalan", completed: "Selesai" } },
    { key: "highlights", label: "Poin penting", type: "lines", group: "Teks", wide: true },
    { key: "postIds", label: "ID video terkait", type: "comma", group: "Pengaturan", wide: true },
    { key: "impressions", label: "Views", type: "number", group: "Angka" },
    { key: "likes", label: "Likes", type: "number", group: "Angka" },
    { key: "hidden", label: "Sembunyikan dari situs", type: "checkbox", group: "Pengaturan" },
  ],
  ambassadors: [
    { key: "project", label: "Nama partner", type: "text", group: "Dasar" },
    { key: "url", label: "Link X / website", type: "text", group: "Dasar", wide: true },
    { key: "roleType", label: "Peran", type: "select", group: "Dasar", options: ["ambassador", "creator-partner", "collaboration-partner"], optionLabels: { ambassador: "Ambassador", "creator-partner": "Creator Partner", "collaboration-partner": "Collaboration Partner" } },
    { key: "title", label: "Judul", type: "text", group: "Dasar" },
    { key: "region", label: "Wilayah", type: "text", group: "Dasar" },
    { key: "start", label: "Mulai", type: "text", group: "Dasar" },
    { key: "summary", label: "Deskripsi singkat", type: "textarea", group: "Teks", wide: true },
    { key: "duties", label: "Tugas", type: "lines", group: "Teks", wide: true },
    { key: "logo", label: "Logo", type: "image", group: "Media", wide: true },
    { key: "status", label: "Status", type: "select", group: "Pengaturan", options: ["active", "past"], optionLabels: { active: "Aktif", past: "Sudah lewat" } },
    { key: "postIds", label: "ID video terkait", type: "comma", group: "Pengaturan", wide: true },
    { key: "hidden", label: "Sembunyikan dari situs", type: "checkbox", group: "Pengaturan" },
  ],
  contests: [
    { key: "name", label: "Judul", type: "text", group: "Dasar", wide: true },
    { key: "organizer", label: "Penyelenggara", type: "text", group: "Dasar" },
    { key: "link", label: "Link entry", type: "text", group: "Dasar", wide: true },
    { key: "xUrl", label: "Link post X", type: "text", group: "Dasar", wide: true },
    { key: "date", label: "Tanggal", type: "text", group: "Dasar" },
    { key: "year", label: "Tahun", type: "number", group: "Dasar" },
    { key: "placement", label: "Hasil lomba", type: "select", group: "Dasar", options: ["", "winner", "finalist", "top10", "participant"], optionLabels: { "": "Belum ada hasil", winner: "Juara", finalist: "Finalis", top10: "Top 10", participant: "Peserta" } },
    { key: "result", label: "Catatan hasil", type: "text", group: "Dasar", wide: true },
    { key: "thumb", label: "Poster / thumbnail", type: "image", group: "Media", wide: true },
    { key: "entryPostId", label: "ID video terkait", type: "text", group: "Pengaturan", wide: true },
    { key: "hidden", label: "Sembunyikan dari situs", type: "checkbox", group: "Pengaturan" },
  ],
  testimonials: [
    { key: "quote", label: "Kutipan", type: "textarea", group: "Dasar", wide: true },
    { key: "name", label: "Nama", type: "text", group: "Dasar" },
    { key: "role", label: "Peran", type: "text", group: "Dasar" },
    { key: "sourceUrl", label: "Link sumber", type: "text", group: "Dasar", wide: true },
    { key: "stat", label: "Angka unggulan", type: "text", group: "Angka" },
    { key: "statLabel", label: "Keterangan angka", type: "text", group: "Angka" },
    { key: "resultLine", label: "Hasil", type: "text", group: "Angka", wide: true },
    { key: "hidden", label: "Sembunyikan dari situs", type: "checkbox", group: "Pengaturan" },
  ],
  process: [
    { key: "kicker", label: "Label kecil", type: "text", group: "Dasar" },
    { key: "title", label: "Judul", type: "text", group: "Dasar" },
    { key: "body", label: "Isi", type: "textarea", group: "Dasar", wide: true },
    { key: "hidden", label: "Sembunyikan dari situs", type: "checkbox", group: "Pengaturan" },
  ],
  tools: [
    { key: "name", label: "Nama", type: "text", group: "Dasar" },
    { key: "kind", label: "Jenis", type: "select", group: "Dasar", options: ["skill", "tool", "ai"], optionLabels: { skill: "Skill", tool: "Tool", ai: "AI" } },
    { key: "group", label: "Grup / daftar model", type: "text", group: "Dasar", wide: true, help: "Untuk baris AI, isi dengan daftar model yang tampil di kartu." },
    { key: "icon", label: "Ikon atau URL logo", type: "text", group: "Media" },
    { key: "note", label: "Catatan", type: "textarea", group: "Teks", wide: true },
    { key: "hidden", label: "Sembunyikan dari situs", type: "checkbox", group: "Pengaturan" },
  ],
};

export const TITLES: Record<string, string> = {
  work: "Video · The Cut",
  contests: "Campaigns",
  ambassadors: "Partners",
  tools: "Skills · Tools · AI",
  articles: "Journal",
  projects: "Projects",
  links: "Link",
  collabs: "Collabs",
  programs: "Programs",
  testimonials: "Reviews",
  process: "Process",
};

export function readPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object") return (current as Record<string, unknown>)[key];
    return undefined;
  }, source);
}

export function writePath(source: Record<string, unknown>, path: string, value: unknown) {
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

export function labelOf(item: Record<string, unknown>) {
  return String(item.title || item.name || item.project || item.quote || item.label || item.id || "Tanpa judul");
}

export function compact(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function thumbOf(item: Record<string, unknown>) {
  const src = readPath(item, "thumb.src") ?? readPath(item, "thumb");
  return typeof src === "string" && (src.startsWith("http") || src.startsWith("/")) ? src : "";
}
/** Thumbnail URL sized for admin lists. */
export function thumbUrl(item: Record<string, unknown>) {
  const src = thumbOf(item);
  return src ? twimg(src, "small") : "";
}

export function isCampaignWork(item: Record<string, unknown>) {
  const tags = readPath(item, "tags");
  return item.category === "contest" || (Array.isArray(tags) && tags.includes("Campaign"));
}

export function isHiddenItem(item: Record<string, unknown>) {
  return Boolean(item.hidden) || (typeof item.status === "string" && (item.status === "hidden" || item.status === "deleted"));
}

/** Short, clean title from tweet text: first line / sentence, no URLs or hashtags, max ~70 chars. */
export function shortTitle(text: string, max = 70) {
  const cleaned = text
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/(^|\s)#[\p{L}\p{N}_]+/gu, " ")
    .replace(/[ \t]+/g, " ");
  const lines = cleaned.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  let first = lines[0] || "";
  const sentence = first.match(/^(.+?[.!?])(\s|$)/);
  if (sentence && sentence[1].length >= 12) first = sentence[1].replace(/[.!?]+$/, "");
  if (first.length > max) {
    const cut = first.slice(0, max);
    const space = cut.lastIndexOf(" ");
    first = `${(space > 30 ? cut.slice(0, space) : cut).trim()}…`;
  }
  return first.trim();
}

/** Caption from tweet text: URLs removed, whitespace tidy, max ~260 chars. */
export function shortCaption(text: string, max = 260) {
  const cleaned = text.replace(/https?:\/\/\S+/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (cleaned.length <= max) return cleaned;
  const cut = cleaned.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > 180 ? cut.slice(0, space) : cut).trim()}…`;
}

export const X_STATUS_RE = /^https?:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com\/[^/\s]+\/status\/\d+/i;

export function formatDate(value: unknown) {
  const d = new Date(String(value ?? ""));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function blankFor(type: string, fields: Field[]) {
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
}
