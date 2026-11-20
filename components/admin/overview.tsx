"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import type { AdminSnapshot } from "@/lib/types";
import { compact, labelOf, readPath, thumbUrl } from "./config";
import type { Row } from "./config";

function greeting(hour: number) {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

export function Overview({ snap, onShowVideo }: { snap: AdminSnapshot; onShowVideo: (id: string) => void }) {
  const hello = useSyncExternalStore(
    () => () => {},
    () => greeting(new Date().getHours()),
    () => "Halo",
  );

  const work = snap.content.work as unknown as Row[];
  const recent = useMemo(
    () =>
      [...work]
        .sort((a, b) => (Date.parse(String(b.addedAt || b.postedAt || "")) || 0) - (Date.parse(String(a.addedAt || a.postedAt || "")) || 0))
        .slice(0, 5),
    [work],
  );
  const tiles = [
    { label: "Video", value: work.length, href: "/admin/work" },
    { label: "Campaigns", value: snap.content.contests.length, href: "/admin/contests" },
    { label: "Partners", value: snap.content.ambassadors.length, href: "/admin/ambassadors" },
    { label: "Pesan baru", value: snap.submissions.length, href: "/admin/submissions" },
  ];

  return (
    <section className="ad-page">
      <header>
        <h1>{hello}, Tirta</h1>
        <p className="muted">Mau tambah karya baru? Tinggal tempel link dari X.</p>
      </header>

      {!snap.writable ? (
        <div className="ad-alert warn" role="alert">
          <p>
            <b>Mode baca saja.</b> Perubahan belum bisa disimpan karena penyimpanan data belum tersambung.
            {snap.warning ? ` ${snap.warning}` : ""}
          </p>
        </div>
      ) : snap.warning ? (
        <div className="ad-alert warn"><p>{snap.warning}</p></div>
      ) : null}

      <Link href="/admin/add" className="ad-cta">
        <span className="ad-cta-plus" aria-hidden="true">+</span>
        <span>
          <b>Tambah video</b>
          <small>Tempel link X, cek pratinjau, lalu simpan ke situs.</small>
        </span>
      </Link>

      <div className="ad-tiles">
        {tiles.map((tile) => (
          <Link key={tile.label} href={tile.href} className="ad-tile">
            <span className="ad-tile-value">{tile.value}</span>
            <span className="muted">{tile.label}</span>
          </Link>
        ))}
      </div>

      <div className="ad-card ad-stack">
        <div className="ad-row between">
          <h2 className="ad-card-title">Video terakhir ditambahkan</h2>
          <Link href="/admin/work" className="ad-link">Lihat semua</Link>
        </div>
        {recent.length === 0 ? <p className="muted">Belum ada video. Mulai dengan tombol Tambah video di atas.</p> : null}
        <ul className="ad-mini-list">
          {recent.map((item) => {
            const thumb = thumbUrl(item);
            return (
              <li key={String(item.id)}>
                <button type="button" className="ad-mini" onClick={() => onShowVideo(String(item.id))}>
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" loading="lazy" />
                  ) : (
                    <span className="ad-mini-ph" />
                  )}
                  <span className="min-w-0">
                    <span className="ad-mini-title">{labelOf(item)}</span>
                    <span className="muted">{compact(readPath(item, "metrics.impressions"))} views</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
