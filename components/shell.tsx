"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { uiSpring } from "@/lib/motion";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/work", label: "The Cut" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/partners", label: "Partners" },
  { href: "/stats", label: "Stats" },
  { href: "/skills", label: "Skills" },
  { href: "/contact", label: "Contact" },
];

const OTHER = [
  { href: "/journal", label: "Journal" },
  { href: "/projects", label: "Projects" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <>
      <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Nav />
      <main id="content" tabIndex={-1}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.44, 0, 0.56, 1] }}
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

function Nav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const navRef = useRef<HTMLDivElement>(null);
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPath(null);
    };
    const onPointer = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenPath(null);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <header className="ed-nav-wrap">
      <motion.nav
        ref={navRef}
        aria-label="Primary"
        className="ed-nav"
        initial={reduce ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0.01 } : uiSpring}
      >
        <div className="ed-nav-row">
          <ThemeToggle />
          <Link href="/" className="wordmark ed-nav-title">
            Tirtavex
          </Link>
          <button
            type="button"
            className="ed-nav-btn"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpenPath(open ? null : pathname)}
          >
            <MenuGlyph open={open} />
          </button>
        </div>
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              id="site-menu"
              key="menu"
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={reduce ? { duration: 0.01 } : { duration: 0.45, ease: [0.66, 0.01, 0.42, 0.97] }}
              style={{ overflow: "hidden" }}
            >
              <ul className="ed-menu">
                {NAV.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", duration: 0.4, bounce: 0, delay: reduce ? 0 : index * 0.04 }}
                  >
                    <Link href={link.href} aria-current={pathname === link.href ? "page" : undefined} onClick={() => setOpenPath(null)}>
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="ed-menu-more">
                {OTHER.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setOpenPath(null)}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}

function themeDark() {
  return document.documentElement.dataset.theme === "dark";
}

function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeTheme, themeDark, () => false);
  function toggle() {
    const theme = dark ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("tv-theme", theme);
    } catch {
      /* ignore private mode */
    }
    window.dispatchEvent(new Event("tv-theme"));
  }
  return (
    <button
      type="button"
      className="ed-nav-logo"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={dark}
      onClick={toggle}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function subscribeTheme(onChange: () => void) {
  window.addEventListener("tv-theme", onChange);
  return () => window.removeEventListener("tv-theme", onChange);
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path fill="currentColor" d="M15.5 2.5a8.8 8.8 0 1 0 6 14.2A8 8 0 0 1 15.5 2.5z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
    </svg>
  );
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3 w-4" aria-hidden>
      <span className={`absolute left-0 h-0.5 w-4 bg-white transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
      <span className={`absolute top-1.5 left-0 h-0.5 w-4 bg-white transition ${open ? "opacity-0" : ""}`} />
      <span className={`absolute left-0 h-0.5 w-4 bg-white transition ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
    </span>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="ed-foot">
      <div className="ed-wrap">
        <div className="ed-head" style={{ marginBottom: "1.25rem" }}>
          <p className="wordmark" style={{ fontSize: 36, margin: 0 }}>
            Tirtavex
          </p>
          <p className="ed-note">AI video · Indonesia</p>
        </div>
        <nav className="ed-foot-links" aria-label="Footer">
          {NAV.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          {OTHER.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="ed-note" style={{ marginTop: "1.5rem" }}>
          © Tirta {year}
        </p>
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
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        document.getElementById("content")?.focus();
      }}
    >
      <svg viewBox="0 0 48 48" className="pointer-events-none absolute inset-0" aria-hidden>
        <circle cx="24" cy="24" r="22" fill="none" stroke="#6EE7B7" strokeWidth="2" />
        <motion.circle cx="24" cy="24" r="22" fill="none" stroke="#047857" strokeWidth="2" style={{ pathLength: progress }} />
      </svg>
      <span aria-hidden className="relative text-lg">
        ↑
      </span>
    </button>
  );
}
