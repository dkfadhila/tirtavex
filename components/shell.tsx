"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { timeAgo } from "@/lib/format";
import { safeHttpUrl, safeXUrl } from "@/lib/safe-url";
import { Magnetic } from "./ui";
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
      <Progress />
      <Cursor />
      <Nav />
      <main id="content">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0.001, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.001 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.79, 0.03, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}

function Progress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return <motion.div className="progress" style={{ scaleX }} />;
}

function Nav() {
  const { content } = useSite();
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const [scrolled, setScrolled] = useState(false);
  const x = safeXUrl(content.settings.xUrl) ?? "https://x.com/TirtaVEX";
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 md:pt-5">
      <nav
        aria-label="Primary"
        className={`pointer-events-auto glass flex w-full max-w-3xl items-center gap-1 rounded-pill border border-emerald-700/15 px-2 shadow-lift ${scrolled ? "py-1.5" : "py-2"}`}
        style={{ animation: "nav-in 0.8s var(--tv-ease) 0.35s both" }}
      >
        <Link href="/" className="grid h-11 w-11 shrink-0 place-items-center rounded-pill bg-emerald-700 font-display text-lg text-white" aria-label="Tirta home">
          T
        </Link>
        <div className="relative mx-1 hidden flex-1 items-center justify-center md:flex">
          {LINKS.map((link) => {
            const active = link.href.startsWith("/#") ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link key={link.href} href={link.href} className="relative rounded-pill px-3 py-2 text-sm font-medium" aria-current={active ? "page" : undefined}>
                {active ? <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-pill bg-mint-100" transition={{ type: "spring", stiffness: 260, damping: 26 }} /> : null}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </div>
        <Magnetic className="ml-auto hidden md:block">
          <a className="btn !min-h-10 !px-4" href={x} target="_blank" rel="noopener noreferrer" data-track="outbound_x_click">
            Follow
          </a>
        </Magnetic>
        <button className="ml-auto rounded-pill px-4 py-2 text-sm font-semibold md:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpenPath(open ? null : pathname)}>
          {open ? "Close" : "Menu"}
        </button>
      </nav>
      {open ? (
        <div id="mobile-nav" className="sheet pointer-events-auto md:hidden">
          <div className="grid gap-1">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="display py-2 text-5xl" onClick={() => setOpenPath(null)}>
                {link.label}
              </Link>
            ))}
            <a className="btn mt-3" href={x} target="_blank" rel="noopener noreferrer">
              Follow @{content.settings.xHandle}
            </a>
          </div>
        </div>
      ) : null}
      <style>{`@keyframes nav-in { from { transform: translateY(-16px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
    </header>
  );
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
    <footer className="section border-t border-line bg-mist">
      <div className="wrap">
        <p className="display text-[clamp(72px,18vw,280px)] leading-[0.8] text-forest">{content.settings.heroTitle}</p>
        <div className="mt-8 grid gap-8 md:grid-cols-4">
          <p className="muted md:col-span-2">{content.settings.footerBlurb}</p>
          <div className="grid gap-2 text-sm">
            <Link href="/about">About</Link>
            <Link href="/journal">Journal</Link>
            <Link href="/projects">Projects</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="grid content-start gap-2 text-sm">
            {content.settings.socials.map((item) => {
              const href = safeHttpUrl(item.url);
              return href ? (
                <a key={item.label} href={href} target="_blank" rel="noopener noreferrer">
                  {item.label}
                </a>
              ) : null;
            })}
            {content.links
              .filter((item) => item.group === "footer")
              .map((item) => {
                const href = safeHttpUrl(item.url);
                return href ? (
                  <a key={item.id} href={href} target="_blank" rel="noopener noreferrer">
                    {item.label}
                  </a>
                ) : null;
              })}
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-sm">
          {synced ? (
            <p className="inline-flex items-center gap-2">
              <span className={stale ? "stale-dot" : "live-dot"} />
              {stale ? "Reconnecting" : `Agent synced ${ago}`}
            </p>
          ) : (
            <p className="text-ink-muted">Waiting for the agent</p>
          )}
          <p className="flex flex-wrap gap-4">
            <Link href="/work">Work</Link>
            <Link href="/pulse">Numbers</Link>
            <Link href="/programs">Programs</Link>
            <Link href="/contests">Contests</Link>
          </p>
          <p className="flex gap-4">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            {x ? (
              <a href={x} target="_blank" rel="noopener noreferrer">
                @{content.settings.xHandle}
              </a>
            ) : null}
          </p>
        </div>
      </div>
    </footer>
  );
}

function BackToTop() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const tick = () => setOn(window.scrollY > 600);
    tick();
    window.addEventListener("scroll", tick, { passive: true });
    return () => window.removeEventListener("scroll", tick);
  }, []);
  if (!on) return null;
  return (
    <button
      className="top-btn"
      aria-label="Back to top"
      onClick={() => {
        const lenis = (window as unknown as { __lenis?: { scrollTo: (n: number) => void } }).__lenis;
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <span aria-hidden>↑</span>
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
