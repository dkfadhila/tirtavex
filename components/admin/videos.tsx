"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EditorDrawer } from "./editor";
import { TWEET_CORE, blankFor, compact, isCampaignWork, isHiddenItem, labelOf, readPath, thumbUrl } from "./config";
import type { Row } from "./config";
import { Button, EmptyState, useAdmin } from "./primitives";

type Filter = "all" | "generation" | "motion" | "campaign" | "hidden";
type Sort = "newest" | "views" | "order";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "generation", label: "AI Generated" },
  { value: "motion", label: "Motion Design" },
  { value: "campaign", label: "Campaign" },
  { value: "hidden", label: "Disembunyikan" },
];

function matches(item: Row, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "hidden") return isHiddenItem(item);
  if (filter === "campaign") return isCampaignWork(item);
  return String(item.lane || "generation") === filter;
}

function views(item: Row) {
  return Number(readPath(item, "metrics.impressions")) || 0;
}

function addedTime(item: Row) {
  const t = Date.parse(String(item.addedAt || item.postedAt || ""));
  return Number.isNaN(t) ? 0 : t;
}

export function Videos({
  items,
  disabled,
  highlightId,
  onHighlightDone,
  onRefreshMetrics,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
}: {
  items: Row[];
  disabled: boolean;
  highlightId: string;
  onHighlightDone: () => void;
  onRefreshMetrics: (id?: string) => Promise<boolean>;
  onCreate: (data: Row) => Promise<boolean>;
  onUpdate: (id: string, data: Row) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onReorder: (ids: string[]) => Promise<boolean>;
}) {
  const { ask } = useAdmin();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [refreshing, setRefreshing] = useState("");
  const [pending, setPending] = useState("");
  const [flash, setFlash] = useState("");

  const [seenHighlight, setSeenHighlight] = useState("");
  if (highlightId && highlightId !== seenHighlight) {
    setSeenHighlight(highlightId);
    setFilter("all");
    setQuery("");
  }

  useEffect(() => {
    if (!highlightId) return;
    const timer = setTimeout(() => {
      const node = document.getElementById(`video-${highlightId}`);
      if (node) {
        node.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
        setFlash(highlightId);
        node.focus({ preventScroll: true });
      }
      onHighlightDone();
    }, 80);
    return () => clearTimeout(timer);
  }, [highlightId, onHighlightDone]);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(""), 3200);
    return () => clearTimeout(timer);
  }, [flash]);

  const counts = useMemo(() => {
    const result: Record<Filter, number> = { all: items.length, generation: 0, motion: 0, campaign: 0, hidden: 0 };
    for (const item of items) {
      for (const f of FILTERS) if (f.value !== "all" && matches(item, f.value)) result[f.value]++;
    }
    return result;
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter((item) => {
      if (!matches(item, filter)) return false;
      if (!q) return true;
      const tags = readPath(item, "tags");
      const hay = `${labelOf(item)} ${String(item.note || "")} ${String(item.xUrl || "")} ${Array.isArray(tags) ? tags.join(" ") : ""}`;
      return hay.toLowerCase().includes(q);
    });
    if (sort === "newest") return [...list].sort((a, b) => addedTime(b) - addedTime(a));
    if (sort === "views") return [...list].sort((a, b) => views(b) - views(a));
    return list;
  }, [items, filter, query, sort]);

  const canReorder = sort === "order" && filter === "all" && !query.trim();

  function move(id: string, direction: -1 | 1) {
    const ids = items.map((item) => String(item.id));
    const index = ids.indexOf(id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= ids.length) return;
    [ids[index], ids[next]] = [ids[next], ids[index]];
    void onReorder(ids);
  }

  async function run(id: string, task: () => Promise<boolean>) {
    setPending(id);
    await task();
    setPending("");
  }

  return (
    <section className="ad-page">
      <header className="ad-page-head">
        <div>
          <h1>Video · The Cut</h1>
          <p className="muted">Semua video yang tampil di situs.</p>
        </div>
        <div className="ad-row">
          <Link href="/admin/add" className="ad-btn primary">Tambah video</Link>
        </div>
      </header>

      <div className="ad-toolbar wrap">
        <input
          type="search"
          aria-label="Cari video"
          placeholder="Cari judul, caption, atau tag…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="ad-select-wrap">
          <label htmlFor="video-sort" className="sr-only">Urutkan</label>
          <select id="video-sort" value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
            <option value="newest">Terbaru</option>
            <option value="views">Views terbanyak</option>
            <option value="order">Urutan di situs</option>
          </select>
        </div>
      </div>

      <div className="ad-chips" role="group" aria-label="Filter video">
        {FILTERS.map((f) => (
          <button key={f.value} type="button" aria-pressed={filter === f.value} className={`ad-chip ${filter === f.value ? "on" : ""}`} onClick={() => setFilter(f.value)}>
            {f.label} <span>{counts[f.value]}</span>
          </button>
        ))}
      </div>

      <div className="ad-toolbar">
        <p className="muted" aria-live="polite">{visible.length} dari {items.length} video</p>
        <div className="ad-row">
          <Button small disabled={disabled} onClick={() => setEditing(structuredClone(blankFor("work", TWEET_CORE)))}>Tambah manual</Button>
          <Button
            small
            loading={refreshing === "all"}
            disabled={disabled}
            onClick={async () => {
              setRefreshing("all");
              await onRefreshMetrics();
              setRefreshing("");
            }}
          >
            Refresh views
          </Button>
        </div>
      </div>
      {sort === "order" && !canReorder ? <p className="ad-hint">Panah urutan aktif kalau filter &ldquo;Semua&rdquo; dan kolom cari kosong.</p> : null}

      {editing ? (
        <EditorDrawer
          key={String(editing.id || "new")}
          fields={TWEET_CORE}
          initial={editing}
          disabled={disabled}
          onClose={() => setEditing(null)}
          onSave={(value) => (value.id ? onUpdate(String(value.id), value) : onCreate(value))}
        />
      ) : null}

      <ul className="ad-video-grid">
        {visible.map((item) => {
          const id = String(item.id);
          const thumb = thumbUrl(item);
          const status = String(item.status || "live");
          const hidden = status !== "live";
          const xUrl = String(item.xUrl || "");
          const lane = String(item.lane || "generation");
          const busy = pending === id;
          const index = items.findIndex((row) => String(row.id) === id);
          return (
            <li key={id} id={`video-${id}`} tabIndex={-1} className={`ad-video ${flash === id ? "flash" : ""} ${hidden ? "is-hidden" : ""}`}>
              <div className="ad-video-media">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" loading="lazy" />
                ) : (
                  <span className="ad-media-empty">Tanpa thumbnail</span>
                )}
                <div className="ad-badges over">
                  <span className="ad-badge solid">{lane === "motion" ? "Motion Design" : "AI Generated"}</span>
                  {isCampaignWork(item) ? <span className="ad-badge solid">Campaign</span> : null}
                  {item.pinned ? <span className="ad-badge accent">Dipin</span> : null}
                  {hidden ? <span className="ad-badge warn">Disembunyikan</span> : null}
                </div>
              </div>
              <div className="ad-video-body">
                <p className="ad-video-title">{labelOf(item)}</p>
                <p className="muted">{compact(views(item))} views · {compact(readPath(item, "metrics.likes"))} likes</p>
                <div className="ad-actions">
                  <Button small variant="primary" disabled={disabled} onClick={() => setEditing(structuredClone(item))}>Edit</Button>
                  <Button
                    small
                    disabled={disabled || busy}
                    onClick={() => void run(id, () => onUpdate(id, { ...item, status: hidden ? "live" : "hidden" }))}
                  >
                    {hidden ? "Tampilkan" : "Sembunyikan"}
                  </Button>
                  <Button small disabled={disabled || busy} onClick={() => void run(id, () => onUpdate(id, { ...item, pinned: !item.pinned }))}>
                    {item.pinned ? "Lepas pin" : "Pin"}
                  </Button>
                  {xUrl.includes("/status/") ? (
                    <a className="ad-btn sm" href={xUrl} target="_blank" rel="noopener noreferrer">Buka di X ↗</a>
                  ) : null}
                  <Button
                    small
                    variant="danger"
                    disabled={disabled || busy}
                    onClick={async () => {
                      const ok = await ask({
                        title: `Hapus “${labelOf(item)}”?`,
                        body: "Video ini hilang dari situs dan tidak bisa dikembalikan. Kalau cuma mau menyembunyikan, pakai tombol Sembunyikan.",
                        confirmLabel: "Hapus",
                        danger: true,
                      });
                      if (ok) void run(id, () => onDelete(id));
                    }}
                  >
                    Hapus
                  </Button>
                </div>
                {canReorder ? (
                  <div className="ad-actions">
                    <Button small aria-label="Naikkan" disabled={disabled || index === 0} onClick={() => move(id, -1)}>↑ Naik</Button>
                    <Button small aria-label="Turunkan" disabled={disabled || index === items.length - 1} onClick={() => move(id, 1)}>↓ Turun</Button>
                  </div>
                ) : null}
                {xUrl.includes("/status/") ? (
                  <Button
                    small
                    variant="ghost"
                    loading={refreshing === id}
                    disabled={disabled}
                    onClick={async () => {
                      setRefreshing(id);
                      await onRefreshMetrics(id);
                      setRefreshing("");
                    }}
                  >
                    Perbarui views video ini
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      {visible.length === 0 ? (
        items.length === 0 ? (
          <EmptyState
            title="Belum ada video"
            hint="Tempel link X dan videomu langsung tampil di situs."
            action={<Link href="/admin/add" className="ad-btn primary">Tambah video</Link>}
          />
        ) : (
          <EmptyState title="Tidak ada video yang cocok" hint="Coba ganti filter atau kata kunci pencarian." />
        )
      ) : null}
    </section>
  );
}
