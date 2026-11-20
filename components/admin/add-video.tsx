"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AdminSnapshot } from "@/lib/types";
import { twimg } from "@/lib/twimg";
import { X_STATUS_RE, compact, formatDate, shortCaption, shortTitle, thumbUrl } from "./config";
import type { Row } from "./config";
import { Button, ImageField, Segmented, TagInput, Toggle, useAdmin } from "./primitives";

type Preview = {
  xUrl: string;
  title?: string;
  text?: string;
  thumbSrc?: string;
  videoUrl?: string;
  durationSec?: number | null;
  postedAt?: string;
  authorName?: string;
  authorHandle?: string;
  metrics?: { impressions?: number; likes?: number };
};

type Phase = "idle" | "loading" | "ready" | "error";

const TITLE_MAX = 180;
const CAPTION_MAX = 280;

function statusId(url: string) {
  return url.match(/\/status\/(\d+)/)?.[1] ?? "";
}

export function AddVideo({
  items,
  disabled,
  onSnapshot,
  onShowExisting,
}: {
  items: Row[];
  disabled: boolean;
  onSnapshot: (snapshot: AdminSnapshot) => void;
  onShowExisting: (id: string) => void;
}) {
  const { notify } = useAdmin();
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [previewError, setPreviewError] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [lane, setLane] = useState<"generation" | "motion">("generation");
  const [tags, setTags] = useState<string[]>([]);
  const [pinned, setPinned] = useState(false);
  const [isCampaign, setIsCampaign] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [campaignLink, setCampaignLink] = useState("");
  const [poster, setPoster] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [duplicateId, setDuplicateId] = useState("");
  const [saved, setSaved] = useState<{ item: Row; campaign: boolean } | null>(null);
  const [playing, setPlaying] = useState(false);
  const seq = useRef(0);
  const lastChecked = useRef("");

  const valid = X_STATUS_RE.test(url.trim());
  const existing = useMemo(() => {
    const id = statusId(preview?.xUrl || url);
    if (!id) return null;
    return items.find((item) => String(item.xUrl || "").includes(`/status/${id}`)) ?? null;
  }, [items, preview, url]);

  const check = useCallback(async (raw: string) => {
    const value = raw.trim();
    if (!X_STATUS_RE.test(value)) return;
    const mine = ++seq.current;
    lastChecked.current = value;
    setPhase("loading");
    setPreviewError("");
    setSaveError("");
    setDuplicateId("");
    try {
      const response = await fetch("/api/admin/x/preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const json = (await response.json().catch(() => ({}))) as Preview & { error?: string };
      if (mine !== seq.current) return;
      if (!response.ok) {
        setPhase("error");
        setPreviewError(json.error || "Link ini belum bisa dibaca. Pastikan postingannya publik.");
        return;
      }
      setPreview(json);
      setTitle(shortTitle(json.text || json.title || "").slice(0, TITLE_MAX));
      setCaption(shortCaption(json.text || ""));
      setPlaying(false);
      setPhase("ready");
    } catch {
      if (mine !== seq.current) return;
      setPhase("error");
      setPreviewError("Gagal menghubungi server. Cek internet lalu coba lagi.");
    }
  }, []);

  // Auto-preview shortly after a valid link is pasted.
  useEffect(() => {
    const value = url.trim();
    if (!X_STATUS_RE.test(value) || value === lastChecked.current) return;
    const timer = setTimeout(() => void check(value), 500);
    return () => clearTimeout(timer);
  }, [url, check]);

  function changeUrl(next: string) {
    setUrl(next);
    if (next.trim() !== lastChecked.current) {
      seq.current++;
      setPreview(null);
      setPhase("idle");
      setPreviewError("");
      setSaveError("");
      setDuplicateId("");
      lastChecked.current = "";
    }
  }

  function reset() {
    seq.current++;
    lastChecked.current = "";
    setUrl("");
    setPhase("idle");
    setPreview(null);
    setPreviewError("");
    setTitle("");
    setCaption("");
    setLane("generation");
    setTags([]);
    setPinned(false);
    setIsCampaign(false);
    setCampaignName("");
    setOrganizer("");
    setCampaignLink("");
    setPoster("");
    setSaveError("");
    setDuplicateId("");
    setSaved(null);
    setPlaying(false);
  }

  async function save() {
    if (!preview) return;
    setSaving(true);
    setSaveError("");
    setDuplicateId("");
    try {
      const response = await fetch("/api/admin/x/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          xUrl: preview.xUrl || url.trim(),
          title: title.trim() || undefined,
          note: caption.trim() || undefined,
          lane,
          tags,
          pinned,
          thumbSrc: poster.trim() || undefined,
          isCampaign,
          campaignName: isCampaign ? campaignName.trim() || undefined : undefined,
          organizer: isCampaign ? organizer.trim() || undefined : undefined,
          campaignLink: isCampaign ? campaignLink.trim() || undefined : undefined,
        }),
      });
      const json = (await response.json().catch(() => ({}))) as { error?: string; item?: Row; snapshot?: AdminSnapshot };
      if (response.status === 409) {
        setSaveError("Video ini sudah ada di situs, jadi tidak disimpan dua kali.");
        setDuplicateId(existing ? String(existing.id) : statusId(preview.xUrl));
        return;
      }
      if (!response.ok) {
        setSaveError(json.error || "Gagal menyimpan. Coba lagi sebentar lagi.");
        return;
      }
      if (json.snapshot) onSnapshot(json.snapshot);
      setSaved({ item: json.item ?? { title, xUrl: preview.xUrl }, campaign: isCampaign });
      notify(isCampaign ? "Tersimpan di Video dan Campaigns" : "Video tersimpan di situs");
    } catch {
      setSaveError("Gagal menghubungi server. Cek internet lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  const posterShown = poster || preview?.thumbSrc || "";
  const heroSrc = posterShown ? twimg(posterShown, "medium") : "";

  if (saved) {
    const item = saved.item;
    const thumb = poster || thumbUrl(item) || (preview?.thumbSrc ? twimg(preview.thumbSrc, "small") : "");
    return (
      <div className="ad-card ad-success" role="status">
        <p className="ad-success-badge">Berhasil disimpan</p>
        <div className="ad-success-body">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" loading="lazy" />
          ) : null}
          <div className="min-w-0">
            <p className="ad-card-title">{String(item.title || title || "Video baru")}</p>
            <p className="muted">
              {saved.campaign ? "Tampil di Video dan Campaigns." : lane === "motion" ? "Tampil di Motion video." : "Tampil di AI video."}
            </p>
          </div>
        </div>
        <div className="ad-row">
          <a className="ad-btn primary" href={saved.campaign ? "/campaigns" : "/work"} target="_blank" rel="noopener noreferrer">
            Lihat di situs ↗
          </a>
          <Button onClick={reset}>Tambah video lain</Button>
          <Button variant="ghost" onClick={() => onShowExisting(String(item.id || ""))}>Lihat di daftar</Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="ad-card ad-add"
      onSubmit={(event) => {
        event.preventDefault();
        if (phase === "ready") void save();
        else void check(url);
      }}
    >
      <div className="ad-field">
        <label htmlFor="add-url" className="ad-label-lg">Tempel link X</label>
        <div className="ad-url-row">
          <input
            id="add-url"
            className="ad-input-lg"
            inputMode="url"
            autoComplete="off"
            autoFocus
            spellCheck={false}
            value={url}
            placeholder="https://x.com/tirtaVEX/status/…"
            aria-invalid={phase === "error" || (url.trim() !== "" && !valid) || undefined}
            aria-describedby="add-url-hint"
            onChange={(event) => changeUrl(event.target.value)}
            onPaste={(event) => {
              const pasted = event.clipboardData.getData("text").trim();
              if (X_STATUS_RE.test(pasted)) {
                event.preventDefault();
                changeUrl(pasted);
              }
            }}
          />
          <Button type="button" loading={phase === "loading"} disabled={!valid || disabled} onClick={() => void check(url)}>
            Cek link
          </Button>
        </div>
        <p id="add-url-hint" className={`ad-hint ${url.trim() && !valid ? "warn" : ""}`}>
          {url.trim() && !valid
            ? "Link belum pas. Contoh: https://x.com/namaakun/status/1234567890"
            : "Salin link postingan video dari X lalu tempel di sini. Pratinjau muncul otomatis."}
        </p>
      </div>

      {phase === "loading" ? (
        <div className="ad-skeleton" aria-busy="true" aria-label="Memuat pratinjau">
          <div className="ad-sk-media" />
          <div className="ad-sk-lines">
            <span /><span /><span />
          </div>
        </div>
      ) : null}

      {phase === "error" ? (
        <p className="ad-alert error" role="alert">{previewError}</p>
      ) : null}

      {phase === "ready" && preview ? (
        <div className="ad-preview">
          <div className="ad-preview-top">
            <div
              className="ad-media"
              onMouseEnter={() => preview.videoUrl && !poster && setPlaying(true)}
              onMouseLeave={() => setPlaying(false)}
            >
              {playing && preview.videoUrl ? (
                <video src={preview.videoUrl} poster={heroSrc || undefined} autoPlay muted loop playsInline controls />
              ) : heroSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroSrc} alt="Thumbnail video" />
              ) : (
                <div className="ad-media-empty">Belum ada thumbnail</div>
              )}
              {preview.videoUrl && !playing ? (
                <button type="button" className="ad-play" aria-label="Putar video tanpa suara" onClick={() => setPlaying(true)}>
                  ▶
                </button>
              ) : null}
            </div>
            <div className="ad-stats">
              <p className="ad-stat"><b>{compact(preview.metrics?.impressions)}</b><span>views</span></p>
              <p className="ad-stat"><b>{compact(preview.metrics?.likes)}</b><span>likes</span></p>
              <p className="ad-stat"><b>{formatDate(preview.postedAt) || "-"}</b><span>diposting</span></p>
              {preview.authorHandle ? <p className="muted">@{preview.authorHandle.replace(/^@/, "")}</p> : null}
              {!preview.videoUrl ? <p className="muted">Postingan ini tidak punya video yang terdeteksi.</p> : null}
            </div>
          </div>

          {existing ? (
            <div className="ad-alert warn" role="alert">
              <p>Video ini sudah ada di situs: &ldquo;{String(existing.title || "tanpa judul")}&rdquo;.</p>
              <Button small onClick={() => onShowExisting(String(existing.id))}>Lihat di daftar</Button>
            </div>
          ) : null}

          <div className="ad-field">
            <label htmlFor="add-title">Judul</label>
            <input id="add-title" value={title} maxLength={TITLE_MAX} onChange={(event) => setTitle(event.target.value)} />
            <p className="ad-hint">Dibuat otomatis dari kalimat pertama. Boleh diubah.</p>
          </div>
          <div className="ad-field">
            <label htmlFor="add-caption">Caption</label>
            <textarea id="add-caption" rows={3} value={caption} maxLength={CAPTION_MAX} onChange={(event) => setCaption(event.target.value)} />
            <p className="ad-hint">{caption.length}/{CAPTION_MAX}</p>
          </div>

          <div className="ad-field">
            <span className="ad-label" id="add-lane">Tampil di</span>
            <Segmented
              label="Tampil di"
              value={lane}
              onChange={setLane}
              options={[
                { value: "generation", label: "AI video" },
                { value: "motion", label: "Motion video" },
              ]}
            />
          </div>

          <div className="ad-field">
            <span className="ad-label">Tag</span>
            <TagInput value={tags} onChange={setTags} placeholder="Ketik lalu tekan Enter atau koma" />
          </div>

          <div className="ad-toggles">
            <Toggle checked={pinned} onChange={setPinned} label="Pin di atas" hint="Video ini muncul paling atas di situs." />
            <Toggle checked={isCampaign} onChange={setIsCampaign} label="Masukkan juga ke Campaigns" hint="Untuk video lomba, fest, atau quest." />
          </div>

          {isCampaign ? (
            <div className="ad-grid-2 ad-subcard">
              <div className="ad-field">
                <label htmlFor="add-camp">Nama campaign</label>
                <input id="add-camp" value={campaignName} placeholder="Kosongkan untuk pakai judul video" onChange={(event) => setCampaignName(event.target.value)} />
              </div>
              <div className="ad-field">
                <label htmlFor="add-org">Penyelenggara</label>
                <input id="add-org" value={organizer} placeholder="Contoh: Renoise AI" onChange={(event) => setOrganizer(event.target.value)} />
              </div>
              <div className="ad-field span-2">
                <label htmlFor="add-link">Link entry (opsional)</label>
                <input id="add-link" inputMode="url" value={campaignLink} placeholder="https://…" onChange={(event) => setCampaignLink(event.target.value)} />
              </div>
            </div>
          ) : null}

          <details className="ad-details" open={Boolean(poster)}>
            <summary>Poster custom (opsional)</summary>
            <p className="ad-hint">Kosongkan untuk memakai thumbnail otomatis dari X.</p>
            <ImageField value={poster} onChange={setPoster} disabled={saving} />
          </details>

          {saveError ? (
            <div className="ad-alert error" role="alert">
              <p>{saveError}</p>
              {duplicateId ? <Button small onClick={() => onShowExisting(duplicateId)}>Lihat video yang sudah ada</Button> : null}
            </div>
          ) : null}

          <div className="ad-sticky-actions">
            <Button type="submit" variant="primary" className="lg" loading={saving} disabled={disabled || !title.trim() || Boolean(existing)}>
              {saving ? "Menyimpan…" : "Simpan ke situs"}
            </Button>
            <Button type="button" variant="ghost" disabled={saving} onClick={reset}>Mulai ulang</Button>
          </div>
        </div>
      ) : null}

      {phase === "idle" && !url.trim() ? (
        <p className="ad-empty-hint">
          Belum ada link. Tempel link X di atas, nanti judul, thumbnail, views, dan likes terisi sendiri.
        </p>
      ) : null}
    </form>
  );
}
