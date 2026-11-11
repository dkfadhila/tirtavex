"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { timeAgo } from "@/lib/format";
import { safeXUrl } from "@/lib/safe-url";
import { uiSpring } from "@/lib/motion";
import { stills } from "@/lib/stills";
import { useSite } from "./site-provider";

const LINKS = [
  { href: "/work", label: "Work" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <>
      <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Cursor />
      <Nav />
      <main id="content" tabIndex={-1}>
        <AnimatePresence mode="wait">
          <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.44, 0, 0.56, 1] }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}

const MORE = [
  { href: "/contests", label: "Contests" },
  { href: "/programs", label: "Programs" },
  { href: "/pulse", label: "Pulse" },
];

function Nav() {
  const { content } = useSite();
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const x = safeXUrl(content.settings.xUrl) ?? "https://x.com/TirtaVEX";
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPath(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <header className="pointer-events-none fixed inset-x-0 top-6 z-[60] flex justify-center px-3">
      <motion.nav
        aria-label="Primary"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0, height: open ? "auto" : 60 }}
        transition={open ? { duration: 0.5, ease: [0.66, 0.01, 0.42, 0.97] } : uiSpring}
        className="glass pointer-events-auto w-[min(390px,calc(100vw-24px))] overflow-hidden border border-[color:var(--tv-line)] px-1.5 shadow-[var(--sh-float)]"
        style={{ borderRadius: 30 }}
      >
        <div className="flex h-[60px] items-center gap-2">
          <a href={x} target="_blank" rel="noopener noreferrer" aria-label="Tirta on X" className="flex h-[46px] w-16 items-center justify-center gap-1 rounded-[23px] bg-[color:var(--tv-tint)]">
            <Image src={stills().tiles[0]} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
            <span className="live-dot" />
          </a>
          <Link href="/" className="flex-1 text-center text-[24px] text-[color:var(--tv-forest)] uppercase" style={{ fontFamily: "var(--tv-font-display)", fontStyle: "italic", letterSpacing: "-0.02em" }}>
            Tirtavex
          </Link>
          <button
            className="grid h-[46px] w-16 place-items-center rounded-[23px] bg-[#10B981] text-white"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpenPath(open ? null : pathname)}
          >
            <span className="relative block h-3 w-4">
              <span className={`absolute left-0 h-0.5 w-4 bg-white transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute top-1.5 left-0 h-0.5 w-4 bg-white transition ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 h-0.5 w-4 bg-white transition ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
            </span>
          </button>
        </div>
        {open ? (
          <div id="site-menu" className="max-h-[calc(100dvh-96px)] overflow-auto px-6 pt-4 pb-8 text-center">
            <p className="t-meta text-[color:var(--tv-ink-60)]">Navigation</p>
            <div className="mt-4 grid gap-3">
              {[{ href: "/", label: "Home" }, ...LINKS].map((link, index) => (
                <motion.div key={link.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={springMenu(index)}>
                  <Link href={link.href} className="text-[32px] text-[color:var(--tv-forest)] uppercase" style={{ fontFamily: "var(--tv-font-display)", fontStyle: "normal" }} onClick={() => setOpenPath(null)}>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
            <p className="t-meta mt-8 text-[color:var(--tv-ink-60)]">More</p>
            <div className="mt-3 flex flex-wrap justify-center gap-4">
              {MORE.map((link) => (
                <Link key={link.href} href={link.href} className="text-[24px] uppercase" style={{ fontFamily: "var(--tv-font-display)" }} onClick={() => setOpenPath(null)}>
                  {link.label}
                </Link>
              ))}
            </div>
            <a className="btn mt-8" href={x} target="_blank" rel="noopener noreferrer">
              Follow @{content.settings.xHandle}
            </a>
          </div>
        ) : null}
      </motion.nav>
    </header>
  );
}

function springMenu(index: number) {
  return { type: "spring" as const, duration: 0.4, bounce: 0, delay: index * 0.04 };
}

function Footer() {
  const { content, stream } = useSite();
  const [ago, setAgo] = useState("just now");
  useEffect(() => {
    const tick = () => setAgo(timeAgo(content.agent.lastHeartbeatAt));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [content.agent.lastHeartbeatAt]);
  const x = safeXUrl(content.settings.xUrl);
  const synced = content.agent.lastHeartbeatAt;
  const stale = stream === "reconnecting";
  return (
    <footer className="bg-white px-6 py-12">
      <div className="grid gap-10 md:grid-cols-3">
        <div>
          <p className="t-eyebrow">Get in touch</p>
          <p className="t-body mt-4">DMs open on X</p>
          {content.settings.email ? <p className="t-body mt-2 !text-[color:var(--tv-ink)]">{content.settings.email}</p> : null}
          {x ? (
            <a className="t-body mt-2 inline-block !text-[color:var(--tv-ink)]" href={x} target="_blank" rel="noopener noreferrer">
              @{content.settings.xHandle}
            </a>
          ) : null}
        </div>
        <div>
          <p className="t-eyebrow">Navigation</p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {[{ href: "/", label: "Home" }, ...LINKS].map((link) => (
              <Link key={link.href} href={link.href} className="t-body !text-[color:var(--tv-ink)]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="md:text-right">
          <p className="t-eyebrow">Live status</p>
          <p className="t-body mt-4 inline-flex items-center gap-2 md:justify-end">
            <span className={synced && !stale ? "live-dot" : "stale-dot"} />
            {synced ? `Last synced ${ago}` : "Waiting for the agent"}
          </p>
        </div>
      </div>
      <div className="t-meta mt-10 flex flex-wrap justify-between gap-3 border-t border-[color:var(--tv-line)] pt-4 text-[color:var(--tv-ink-60)]">
        <span>© Tirtavex {new Date().getFullYear()}</span>
        <span>Built with an agent</span>
        <span className="flex gap-3">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </span>
      </div>
    </footer>
  );
}

function BackToTop() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 400, damping: 30, mass: 1 });
  const [on, setOn] = useState(false);
  useEffect(() => {
    const tick = () => setOn(window.scrollY > window.innerHeight);
    tick();
    window.addEventListener("scroll", tick, { passive: true });
    return () => window.removeEventListener("scroll", tick);
  }, []);
  return (
    <button
      type="button"
      className="top-btn"
      aria-label="Back to top"
      hidden={!on}
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const lenis = (window as unknown as { __lenis?: { scrollTo: (n: number, o?: { duration: number }) => void } }).__lenis;
        if (lenis && !reduce) lenis.scrollTo(0, { duration: 1.2 });
        else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        document.getElementById("content")?.focus();
      }}
    >
      <svg viewBox="0 0 48 48" className="pointer-events-none absolute inset-0" aria-hidden>
        <circle cx="24" cy="24" r="22" fill="none" stroke="#6EE7B7" strokeWidth="2" pathLength={1} style={{ strokeDasharray: 1 }} />
        <motion.circle cx="24" cy="24" r="22" fill="none" stroke="#047857" strokeWidth="2" style={{ pathLength: progress }} />
      </svg>
      <span aria-hidden className="relative text-lg">
        ↑
      </span>
    </button>
  );
}

function Cursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [label, setLabel] = useState("");
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.body.classList.add("has-cursor");
    const move = (event: MouseEvent) => {
      setPos({ x: event.clientX, y: event.clientY });
      const target = event.target as HTMLElement | null;
      const flagged = target?.closest("[data-cursor]");
      const field = target?.closest("input, textarea, select");
      setLabel(flagged?.getAttribute("data-cursor") || "");
      setOn(Boolean(flagged) && !field);
    };
    window.addEventListener("mousemove", move);
    return () => {
      document.body.classList.remove("has-cursor");
      window.removeEventListener("mousemove", move);
    };
  }, []);
  return (
    <>
      <div className="cursor-dot" style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }} />
      <div className="cursor-ring" style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${on ? 1.7 : 1})`, transition: "transform 0.25s var(--tv-ease)" }}>
        {on && label ? <span className="px-2 text-center leading-tight">{label}</span> : null}
      </div>
    </>
  );
}
