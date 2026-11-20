"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AdminSnapshot, SiteContent } from "@/lib/types";
import { AddVideo } from "./admin/add-video";
import { FIELDS, TITLES } from "./admin/config";
import type { Row } from "./admin/config";
import { Collection } from "./admin/editor";
import { Inbox, LegalForm, SettingsForm, StatsForm } from "./admin/forms";
import { Overview } from "./admin/overview";
import { AdminContext, EmptyState, useConfirmState } from "./admin/primitives";
import type { AskOptions } from "./admin/primitives";
import { Videos } from "./admin/videos";

const MORE: { href: string; label: string }[] = [
  { href: "projects", label: "Projects" },
  { href: "articles", label: "Journal" },
  { href: "tools", label: "Skills · Tools · AI" },
  { href: "collabs", label: "Collabs" },
  { href: "programs", label: "Programs" },
  { href: "testimonials", label: "Reviews" },
  { href: "process", label: "Process" },
  { href: "links", label: "Link" },
];

const SETTINGS: { href: string; label: string }[] = [
  { href: "settings", label: "Teks & pengaturan" },
  { href: "stats", label: "Angka engagement" },
  { href: "legal", label: "Legal" },
];

const SPECIAL = new Set(["", "add", "settings", "legal", "stats", "submissions"]);

type Toast = { id: number; message: string; kind: "ok" | "error" };

export function AdminApp({ initial }: { initial: AdminSnapshot }) {
  const pathname = usePathname();
  const router = useRouter();
  const section = pathname.split("/").filter(Boolean)[1] || "";
  const [snap, setSnap] = useState(initial);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreToggled, setMoreOpen] = useState(false);
  const moreOpen = moreToggled || MORE.some((entry) => entry.href === section);
  const [highlightId, setHighlightId] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastSeq = useRef(0);
  const { ask, dialog } = useConfirmState();

  const notify = useCallback((message: string, kind: "ok" | "error" = "ok") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: ++toastSeq.current, message, kind });
    toastTimer.current = setTimeout(() => setToast(null), kind === "error" ? 5000 : 2600);
  }, []);
  const clearError = useCallback(() => setError(""), []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  async function send(body: unknown, okMessage = "Tersimpan") {
    if (!snap.writable) {
      const message = "Belum bisa menyimpan: penyimpanan data belum tersambung.";
      setError(message);
      notify(message, "error");
      return false;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/mutate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await response.json().catch(() => ({}))) as { error?: string; snapshot?: AdminSnapshot };
      if (!response.ok || !json.snapshot) {
        const message = json.error || "Gagal menyimpan. Coba lagi.";
        setError(message);
        notify(message, "error");
        return false;
      }
      setSnap(json.snapshot);
      notify(okMessage);
      return true;
    } catch {
      const message = "Gagal menghubungi server. Cek internet lalu coba lagi.";
      setError(message);
      notify(message, "error");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function refreshMetrics(id?: string) {
    setError("");
    try {
      const response = await fetch("/api/admin/metrics/refresh", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(id ? { id } : { limit: 25 }),
      });
      const json = (await response.json().catch(() => ({}))) as { error?: string; updated?: number; snapshot?: AdminSnapshot };
      if (!response.ok || !json.snapshot) {
        const message = json.error || "Gagal memperbarui views dari X.";
        setError(message);
        notify(message, "error");
        return false;
      }
      setSnap(json.snapshot);
      notify(`Views ${json.updated ?? 1} video diperbarui dari X`);
      return true;
    } catch {
      const message = "Gagal menghubungi server. Cek internet lalu coba lagi.";
      setError(message);
      notify(message, "error");
      return false;
    }
  }

  const showVideo = useCallback(
    (id: string) => {
      setHighlightId(id);
      router.push("/admin/work");
    },
    [router],
  );
  const doneHighlight = useCallback(() => setHighlightId(""), []);

  const ctx = useMemo(
    () => ({ notify, ask: (options: AskOptions) => ask(options), error, clearError }),
    [notify, ask, error, clearError],
  );

  const disabled = !snap.writable || busy;
  const work = snap.content.work as unknown as Row[];
  const inboxCount = snap.submissions.length;
  const known = SPECIAL.has(section) || section === "work" || Boolean(FIELDS[section]);
  const pageTitle =
    section === "" ? "Beranda" : section === "add" ? "Tambah video" : section === "settings" ? "Teks & pengaturan" : section === "stats" ? "Angka engagement" : section === "legal" ? "Legal" : section === "submissions" ? "Kotak masuk" : TITLES[section] || "Admin";

  const navLink = (href: string, label: string, extra?: ReactNode) => {
    const active = section === href;
    return (
      <Link key={href || "home"} href={href ? `/admin/${href}` : "/admin"} className={`ad-nav-link ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
        <span>{label}</span>
        {extra}
      </Link>
    );
  };

  return (
    <AdminContext.Provider value={ctx}>
      <div className="admin">
        <header className="ad-topbar">
          <button type="button" className="ad-icon-btn" aria-label="Buka menu" aria-expanded={menuOpen} aria-controls="admin-side" onClick={() => setMenuOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <p className="ad-topbar-title">{pageTitle}</p>
          <Link href="/admin/add" className="ad-btn primary sm" aria-label="Tambah video">+ Video</Link>
        </header>

        {menuOpen ? <div className="ad-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" /> : null}

        <div className="ad-shell">
          <aside id="admin-side" className={`ad-side ${menuOpen ? "open" : ""}`} aria-label="Menu admin">
            <div className="ad-side-head">
              <div>
                <p className="ad-brand">Tirta admin</p>
                <p className="muted">{snap.writable ? "Tersambung · perubahan langsung tayang" : "Mode baca saja"}</p>
              </div>
              <button type="button" className="ad-icon-btn ad-close-menu" aria-label="Tutup menu" onClick={() => setMenuOpen(false)}>×</button>
            </div>

            <nav className="ad-nav" aria-label="Navigasi utama" onClick={(event) => { if ((event.target as HTMLElement).closest("a")) setMenuOpen(false); }}>
              {navLink("", "Beranda")}
              <Link href="/admin/add" className={`ad-btn primary ad-nav-add ${section === "add" ? "active" : ""}`} aria-current={section === "add" ? "page" : undefined}>
                + Tambah video
              </Link>
              {navLink("work", "Video · The Cut")}
              {navLink("contests", "Campaigns")}
              {navLink("ambassadors", "Partners")}
              {navLink("submissions", "Kotak masuk", inboxCount > 0 ? <span className="ad-count" aria-label={`${inboxCount} pesan`}>{inboxCount}</span> : null)}

              <button type="button" className="ad-nav-group" aria-expanded={moreOpen} aria-controls="nav-more" onClick={() => setMoreOpen(!moreOpen)}>
                <span>Konten lain</span>
                <span aria-hidden="true" className={`ad-caret ${moreOpen ? "open" : ""}`}>›</span>
              </button>
              {moreOpen ? <div id="nav-more" className="ad-nav-sub">{MORE.map((entry) => navLink(entry.href, entry.label))}</div> : null}

              <p className="ad-nav-label">Pengaturan</p>
              {SETTINGS.map((entry) => navLink(entry.href, entry.label))}
            </nav>

            <div className="ad-side-foot">
              <Link href="/" target="_blank" rel="noopener noreferrer" className="ad-link">Lihat situs ↗</Link>
              <button
                type="button"
                className="ad-link"
                onClick={() => {
                  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
                  document.documentElement.dataset.theme = next;
                  try {
                    localStorage.setItem("tv-theme", next);
                  } catch {}
                }}
              >
                Ganti tema
              </button>
              <button
                type="button"
                className="ad-link"
                onClick={async () => {
                  await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
                  router.push("/admin/login");
                  router.refresh();
                }}
              >
                Keluar
              </button>
            </div>
          </aside>

          <main className="ad-main" id="admin-main">
            {!snap.writable && section !== "" ? (
              <p className="ad-alert warn" role="alert">
                Mode baca saja: penyimpanan data belum tersambung, jadi perubahan belum bisa disimpan.
              </p>
            ) : null}
            {error ? (
              <p className="ad-alert error ad-dismissible" role="alert">
                <span>{error}</span>
                <button type="button" aria-label="Tutup pesan" onClick={clearError}>×</button>
              </p>
            ) : null}

            {section === "" ? <Overview snap={snap} onShowVideo={showVideo} /> : null}
            {section === "add" ? (
              <section className="ad-page">
                <header className="ad-page-head">
                  <div>
                    <h1>Tambah video</h1>
                    <p className="muted">Tempel link dari X. Sisanya terisi otomatis.</p>
                  </div>
                </header>
                <AddVideo items={work} disabled={disabled} onSnapshot={setSnap} onShowExisting={showVideo} />
              </section>
            ) : null}
            {section === "work" ? (
              <Videos
                items={work}
                disabled={disabled}
                highlightId={highlightId}
                onHighlightDone={doneHighlight}
                onRefreshMetrics={refreshMetrics}
                onCreate={(data) => send({ op: "create", type: "work", data }, "Video ditambahkan")}
                onUpdate={(id, data) => send({ op: "update", type: "work", id, data }, "Video diperbarui")}
                onDelete={(id) => send({ op: "delete", type: "work", id }, "Video dihapus")}
                onReorder={(ids) => send({ op: "reorder", type: "work", ids }, "Urutan tersimpan")}
              />
            ) : null}
            {section === "settings" ? <SettingsForm settings={snap.content.settings} disabled={disabled} onSave={(data) => send({ op: "settings", data }, "Pengaturan tersimpan")} /> : null}
            {section === "legal" ? <LegalForm content={snap.content} disabled={disabled} onSave={(slug, data) => send({ op: "legal", slug, data }, "Halaman legal tersimpan")} /> : null}
            {section === "stats" ? <StatsForm stats={snap.content.stats} disabled={disabled} onSave={(data) => send({ op: "stats", data }, "Angka tersimpan")} /> : null}
            {section === "submissions" ? <Inbox items={snap.submissions} disabled={disabled} onDelete={(id) => send({ op: "delete", type: "submissions", id }, "Pesan dihapus")} /> : null}
            {section !== "work" && FIELDS[section] ? (
              <Collection
                key={section}
                type={section}
                title={TITLES[section] || section}
                items={((snap.content[section as keyof SiteContent] as unknown[]) || []).filter((item) => item && typeof item === "object") as Row[]}
                fields={FIELDS[section]}
                disabled={disabled}
                onCreate={(data) => send({ op: "create", type: section, data }, "Ditambahkan")}
                onUpdate={(id, data) => send({ op: "update", type: section, id, data }, "Tersimpan")}
                onDelete={(id) => send({ op: "delete", type: section, id }, "Dihapus")}
                onReorder={(ids) => send({ op: "reorder", type: section, ids }, "Urutan tersimpan")}
              />
            ) : null}
            {!known ? <EmptyState title="Halaman tidak ditemukan" hint="Pilih menu di samping." action={<Link href="/admin" className="ad-btn primary">Ke Beranda</Link>} /> : null}
          </main>
        </div>

        <div className="ad-toast-wrap" aria-live="polite" role="status">
          {toast ? <div key={toast.id} className={`ad-toast ${toast.kind}`}>{toast.message}</div> : null}
        </div>
        {dialog}
      </div>
    </AdminContext.Provider>
  );
}
