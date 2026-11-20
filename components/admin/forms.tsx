"use client";

import { useId, useState } from "react";
import type { AdminSnapshot, Settings, SiteContent } from "@/lib/types";
import { formatDate } from "./config";
import { Button, EmptyState, ImageField, useAdmin } from "./primitives";

const LABELS: Record<string, string> = {
  heroEyebrow: "Teks kecil di atas judul",
  heroTitle: "Judul utama",
  heroTagline: "Tagline",
  heroHeadline: "Headline",
  heroLede: "Subjudul",
  heroPrimaryLabel: "Tombol utama",
  heroSecondaryLabel: "Tombol kedua",
  heroImage: "Gambar hero",
  heroImageAlt: "Deskripsi gambar hero",
  aboutEyebrow: "Teks kecil Tentang",
  aboutTitle: "Judul Tentang",
  aboutMore: "Teks tombol Selengkapnya",
  aboutImage: "Foto Tentang",
  aboutImageAlt: "Deskripsi foto Tentang",
  introLeftKicker: "Kolom kiri · label",
  introLeftTitle: "Kolom kiri · judul",
  introLeftBody: "Kolom kiri · isi",
  introRightKicker: "Kolom kanan · label",
  introRightTitle: "Kolom kanan · judul",
  introRightBody: "Kolom kanan · isi",
  bio: "Bio singkat",
  bioLong: "Bio panjang",
  workTitle: "Video · judul",
  workLede: "Video · subjudul",
  campaignsTitle: "Campaigns · judul",
  campaignsLede: "Campaigns · subjudul",
  partnersTitle: "Partners · judul",
  partnersLede: "Partners · subjudul",
  statsTitle: "Angka · judul",
  statsLede: "Angka · subjudul",
  skillsTitle: "Skills · judul",
  skillsLede: "Skills · subjudul",
  contactTitle: "Kontak · judul",
  contactHeadline: "Kontak · headline",
  contactLede: "Kontak · subjudul",
  email: "Email",
  phone: "Nomor telepon",
  location: "Lokasi",
  availability: "Ketersediaan",
  xHandle: "Username X",
  xUrl: "Link X",
  tiktokUrl: "Link TikTok",
  instagramUrl: "Link Instagram",
  footerBlurb: "Teks footer",
  pressNote: "Catatan press",
  pulseLede: "Subjudul Pulse",
  metaTitle: "Judul di Google",
  metaDescription: "Deskripsi di Google",
};

function label(key: string) {
  return LABELS[key] || key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}

function SaveBar({ dirty, saving, disabled, text }: { dirty: boolean; saving: boolean; disabled: boolean; text: string }) {
  return (
    <div className="ad-savebar">
      <Button type="submit" variant="primary" loading={saving} disabled={disabled || !dirty}>
        {saving ? "Menyimpan…" : text}
      </Button>
      <span className={dirty ? "ad-dirty" : "muted"}>{dirty ? "Ada perubahan yang belum disimpan" : "Semua sudah tersimpan"}</span>
    </div>
  );
}

const splitList = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

export function SettingsForm({ settings, disabled, onSave }: { settings: Settings; disabled: boolean; onSave: (data: Settings) => Promise<boolean> }) {
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(JSON.stringify(settings));
  const [saving, setSaving] = useState(false);
  const uid = useId();
  const dirty = JSON.stringify(draft) !== saved;
  const GROUPS: { title: string; keys: (keyof Settings)[] }[] = [
    { title: "Halaman depan", keys: ["heroEyebrow", "heroTitle", "heroTagline", "heroHeadline", "heroLede", "heroPrimaryLabel", "heroSecondaryLabel", "heroImage", "heroImageAlt"] },
    { title: "Tentang", keys: ["aboutEyebrow", "aboutTitle", "aboutMore", "aboutImage", "aboutImageAlt", "introLeftKicker", "introLeftTitle", "introLeftBody", "introRightKicker", "introRightTitle", "introRightBody", "bio", "bioLong"] },
    { title: "Judul tiap bagian", keys: ["workTitle", "workLede", "campaignsTitle", "campaignsLede", "partnersTitle", "partnersLede", "statsTitle", "statsLede", "skillsTitle", "skillsLede"] },
    { title: "Kontak & sosial media", keys: ["contactTitle", "contactHeadline", "contactLede", "email", "phone", "location", "availability", "xHandle", "xUrl", "tiktokUrl", "instagramUrl", "footerBlurb", "pressNote", "pulseLede"] },
    { title: "SEO (tampilan di Google)", keys: ["metaTitle", "metaDescription"] },
  ];
  return (
    <form
      className="ad-page"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        const ok = await onSave(draft);
        setSaving(false);
        if (ok) setSaved(JSON.stringify(draft));
      }}
    >
      <header className="ad-page-head">
        <div>
          <h1>Teks & pengaturan</h1>
          <p className="muted">Semua tulisan di situs. Ubah, lalu klik Simpan.</p>
        </div>
      </header>
      {GROUPS.map((group) => (
        <fieldset key={group.title} className="ad-card ad-group">
          <legend>{group.title}</legend>
          <div className="ad-grid-2">
            {group.keys.map((key) => {
              const value = String(draft[key] ?? "");
              const id = `${uid}-${key}`;
              if (key === "heroImage" || key === "aboutImage") {
                return (
                  <div key={key} className="ad-field span-2">
                    <span className="ad-label">{label(key)}</span>
                    <ImageField value={value} disabled={disabled} onChange={(url) => setDraft({ ...draft, [key]: url })} />
                  </div>
                );
              }
              const long = value.length > 56 || ["bioLong", "metaDescription", "contactLede", "bio"].includes(key) || key.endsWith("Alt");
              return (
                <div key={key} className={`ad-field ${long ? "span-2" : ""}`}>
                  <label htmlFor={id}>{label(key)}</label>
                  {long ? (
                    <textarea id={id} value={value} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
                  ) : (
                    <input id={id} value={value} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}
      <fieldset className="ad-card ad-group">
        <legend>Daftar</legend>
        <div className="ad-grid-2">
          <div className="ad-field span-2">
            <label htmlFor={`${uid}-genres`}>Genre (pisahkan dengan koma)</label>
            <input id={`${uid}-genres`} defaultValue={draft.genres.join(", ")} onChange={(event) => setDraft({ ...draft, genres: splitList(event.target.value) })} />
          </div>
          <div className="ad-field span-2">
            <label htmlFor={`${uid}-marquee`}>Kata berjalan / marquee (pisahkan dengan koma)</label>
            <input id={`${uid}-marquee`} defaultValue={draft.marquee.join(", ")} onChange={(event) => setDraft({ ...draft, marquee: splitList(event.target.value) })} />
          </div>
          <div className="ad-field span-2">
            <label htmlFor={`${uid}-budget`}>Pilihan budget di form kontak (pisahkan dengan koma)</label>
            <input id={`${uid}-budget`} defaultValue={draft.budgetOptions.join(", ")} onChange={(event) => setDraft({ ...draft, budgetOptions: splitList(event.target.value) })} />
          </div>
        </div>
        <div className="ad-field">
          <span className="ad-label">Sosial media</span>
          {draft.socials.map((item, index) => (
            <div key={index} className="ad-social-row">
              <input
                aria-label={`Nama sosial media ${index + 1}`}
                placeholder="Nama"
                value={item.label}
                onChange={(event) => {
                  const socials = [...draft.socials];
                  socials[index] = { ...item, label: event.target.value };
                  setDraft({ ...draft, socials });
                }}
              />
              <input
                aria-label={`Link sosial media ${index + 1}`}
                placeholder="https://…"
                value={item.url}
                onChange={(event) => {
                  const socials = [...draft.socials];
                  socials[index] = { ...item, url: event.target.value };
                  setDraft({ ...draft, socials });
                }}
              />
              <Button small variant="danger" onClick={() => setDraft({ ...draft, socials: draft.socials.filter((_, i) => i !== index) })}>Hapus</Button>
            </div>
          ))}
          <div>
            <Button small onClick={() => setDraft({ ...draft, socials: [...draft.socials, { label: "", url: "https://" }] })}>Tambah sosial media</Button>
          </div>
        </div>
      </fieldset>
      <SaveBar dirty={dirty} saving={saving} disabled={disabled} text="Simpan pengaturan" />
    </form>
  );
}

export function LegalForm({
  content,
  disabled,
  onSave,
}: {
  content: SiteContent;
  disabled: boolean;
  onSave: (slug: "terms" | "privacy", data: { title: string; eyebrow: string; body: string }) => Promise<boolean>;
}) {
  const [savingSlug, setSavingSlug] = useState("");
  const names = { terms: "Syarat & ketentuan", privacy: "Kebijakan privasi" } as const;
  return (
    <section className="ad-page">
      <header className="ad-page-head">
        <div>
          <h1>Legal</h1>
          <p className="muted">Halaman syarat & ketentuan dan kebijakan privasi.</p>
        </div>
      </header>
      {(["terms", "privacy"] as const).map((slug) => {
        const page = content.legal[slug];
        return (
          <form
            key={slug}
            className="ad-card ad-stack"
            onSubmit={async (event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              setSavingSlug(slug);
              await onSave(slug, { title: String(data.get("title") || ""), eyebrow: String(data.get("eyebrow") || ""), body: String(data.get("body") || "") });
              setSavingSlug("");
            }}
          >
            <h2 className="ad-card-title">{names[slug]}</h2>
            <div className="ad-field">
              <label htmlFor={`${slug}-title`}>Judul</label>
              <input id={`${slug}-title`} name="title" defaultValue={page.title} />
            </div>
            <div className="ad-field">
              <label htmlFor={`${slug}-eyebrow`}>Teks kecil di atas judul</label>
              <input id={`${slug}-eyebrow`} name="eyebrow" defaultValue={page.eyebrow} />
            </div>
            <div className="ad-field">
              <label htmlFor={`${slug}-body`}>Isi</label>
              <textarea id={`${slug}-body`} name="body" defaultValue={page.body} className="tall" />
            </div>
            <div>
              <Button type="submit" variant="primary" loading={savingSlug === slug} disabled={disabled}>Simpan {names[slug].toLowerCase()}</Button>
            </div>
          </form>
        );
      })}
    </section>
  );
}

export function StatsForm({ stats, disabled, onSave }: { stats: SiteContent["stats"]; disabled: boolean; onSave: (data: SiteContent["stats"]) => Promise<boolean> }) {
  const [draft, setDraft] = useState(stats);
  const [saved, setSaved] = useState(JSON.stringify(stats));
  const [saving, setSaving] = useState(false);
  const uid = useId();
  const dirty = JSON.stringify(draft) !== saved;

  function setPlatform(index: number, key: "impressions" | "followers" | "videos" | "handle" | "label" | "url", value: string) {
    const platforms = draft.platforms.map((row, i) => {
      if (i !== index) return row;
      if (key === "impressions" || key === "followers" || key === "videos") return { ...row, [key]: Number(value) || 0 };
      return { ...row, [key]: value };
    });
    setDraft({ ...draft, platforms });
  }

  const legacy: { key: "impressionsAll" | "impressions30d" | "likes" | "posts" | "followers" | "engagement" | "videos"; label: string }[] = [
    { key: "impressionsAll", label: "Total views (semua waktu)" },
    { key: "impressions30d", label: "Views 30 hari terakhir" },
    { key: "likes", label: "Total likes" },
    { key: "posts", label: "Jumlah postingan" },
    { key: "followers", label: "Followers" },
    { key: "engagement", label: "Engagement" },
    { key: "videos", label: "Jumlah video" },
  ];

  return (
    <form
      className="ad-page"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        const ok = await onSave(draft);
        setSaving(false);
        if (ok) setSaved(JSON.stringify(draft));
      }}
    >
      <header className="ad-page-head">
        <div>
          <h1>Angka engagement</h1>
          <p className="muted">Followers X diperbarui otomatis dari profil. Sisanya diisi manual di sini.</p>
        </div>
      </header>
      {draft.platforms.map((row, index) =>
        row.platform === "overall" ? null : (
          <fieldset key={row.platform} className="ad-card ad-group">
            <legend>{row.label || row.platform}</legend>
            <div className="ad-grid-3">
              {(
                [
                  ["label", "Nama", "text"],
                  ["handle", "Username", "text"],
                  ["url", "Link profil", "text"],
                  ["impressions", "Views", "number"],
                  ["followers", "Followers", "number"],
                  ["videos", "Jumlah video", "number"],
                ] as const
              ).map(([key, text, type]) => (
                <div key={key} className="ad-field">
                  <label htmlFor={`${uid}-${index}-${key}`}>{text}</label>
                  <input
                    id={`${uid}-${index}-${key}`}
                    type={type}
                    inputMode={type === "number" ? "numeric" : undefined}
                    value={row[key]}
                    onChange={(event) => setPlatform(index, key, event.target.value)}
                  />
                </div>
              ))}
            </div>
          </fieldset>
        ),
      )}
      <details className="ad-card ad-details">
        <summary>Angka total lama</summary>
        <div className="ad-grid-3">
          {legacy.map(({ key, label: text }) => (
            <div key={key} className="ad-field">
              <label htmlFor={`${uid}-${key}`}>{text}</label>
              <input id={`${uid}-${key}`} type="number" inputMode="numeric" value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: Number(event.target.value) })} />
            </div>
          ))}
          <div className="ad-field">
            <label htmlFor={`${uid}-best`}>ID postingan terbaik</label>
            <input id={`${uid}-best`} value={draft.bestPostId} onChange={(event) => setDraft({ ...draft, bestPostId: event.target.value })} />
          </div>
        </div>
      </details>
      <SaveBar dirty={dirty} saving={saving} disabled={disabled} text="Simpan angka" />
    </form>
  );
}

export function Inbox({ items, disabled, onDelete }: { items: AdminSnapshot["submissions"]; disabled: boolean; onDelete: (id: string) => Promise<boolean> }) {
  const { ask } = useAdmin();
  const [pending, setPending] = useState("");
  return (
    <section className="ad-page">
      <header className="ad-page-head">
        <div>
          <h1>Kotak masuk</h1>
          <p className="muted">Pesan dari form kontak di situs.</p>
        </div>
      </header>
      {items.length === 0 ? <EmptyState title="Belum ada pesan" hint="Pesan dari calon klien akan muncul di sini." /> : null}
      <ul className="ad-list">
        {items.map((item) => {
          const record = item as unknown as Record<string, unknown>;
          const date = formatDate(record.createdAt);
          const link = String(item.link || "");
          return (
            <li key={item.id} className="ad-card ad-stack">
              <div className="ad-row between">
                <p className="ad-card-title">{item.name} · {item.project}</p>
                {date ? <span className="muted">{date}</span> : null}
              </div>
              <p className="muted">
                {item.budget}
                {link ? (
                  <>
                    {" · "}
                    {/^https?:\/\//i.test(link) ? <a href={link} target="_blank" rel="noopener noreferrer">{link}</a> : link}
                  </>
                ) : null}
              </p>
              <p className="ad-message">{item.message}</p>
              <div>
                <Button
                  small
                  variant="danger"
                  loading={pending === item.id}
                  disabled={disabled}
                  onClick={async () => {
                    const ok = await ask({ title: "Hapus pesan ini?", body: "Pesan hilang permanen dari kotak masuk.", confirmLabel: "Hapus", danger: true });
                    if (!ok) return;
                    setPending(item.id);
                    await onDelete(item.id);
                    setPending("");
                  }}
                >
                  Hapus
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
