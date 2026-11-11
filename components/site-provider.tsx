"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { SiteContent } from "@/lib/types";

type StreamState = "live" | "reconnecting" | "polling";

const SiteContext = createContext<{ content: SiteContent; stream: StreamState } | null>(null);

export function useSite() {
  const value = useContext(SiteContext);
  if (!value) throw new Error("useSite must be used inside the site shell");
  return value;
}

export function SiteProvider({ initial, children }: { initial: SiteContent; children: ReactNode }) {
  const [epoch, setEpoch] = useState(initial);
  const [content, setContent] = useState(initial);
  const [stream, setStream] = useState<StreamState>("live");
  if (epoch !== initial) {
    setEpoch(initial);
    setContent(initial);
  }

  useEffect(() => {
    let timer: number | undefined;
    let delay = 60_000;
    let stopped = false;
    const schedule = () => {
      timer = window.setTimeout(() => void tick(), delay);
    };
    const tick = async () => {
      if (stopped) return;
      if (document.visibilityState === "hidden") {
        schedule();
        return;
      }
      try {
        const response = await fetch("/api/portfolio", { cache: "no-store" });
        if (!response.ok) throw new Error("portfolio unavailable");
        setContent((await response.json()) as SiteContent);
        setStream("polling");
        delay = 60_000;
      } catch {
        setStream("reconnecting");
        delay = Math.min(delay * 2, 5 * 60_000);
      }
      schedule();
    };
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      delay = 60_000;
      window.clearTimeout(timer);
      void tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    schedule();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    let stopped = false;
    const boot = async () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const [{ default: Lenis }, gsapModule, stModule] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (stopped) return;
      const gsap = gsapModule.default;
      const ScrollTrigger = stModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const lenis = new Lenis({ autoRaf: false, lerp: 0.12 });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      (window as unknown as { __lenis?: { scrollTo: (target: string | number, options?: { offset?: number }) => void } }).__lenis = lenis;
      const onClick = (event: MouseEvent) => {
        const anchor = (event.target as HTMLElement | null)?.closest("a");
        if (!anchor) return;
        const href = anchor.getAttribute("href") || "";
        const hash = href.startsWith("#") ? href : href.startsWith("/#") && location.pathname === "/" ? href.slice(1) : "";
        if (!hash) return;
        const target = document.querySelector(hash);
        if (!target) return;
        event.preventDefault();
        lenis.scrollTo(hash, { offset: -90 });
      };
      document.addEventListener("click", onClick);
      return () => {
        document.removeEventListener("click", onClick);
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    };
    let cleanup: void | (() => void);
    void boot().then((fn) => {
      cleanup = fn;
    });
    return () => {
      stopped = true;
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const node = (event.target as HTMLElement | null)?.closest("[data-track]");
      if (!node) return;
      const name = node.getAttribute("data-track") || "";
      const id = node.getAttribute("data-track-id") || "";
      const payload = new Blob([JSON.stringify({ name, id })], { type: "application/json" });
      if (navigator.sendBeacon) navigator.sendBeacon("/api/analytics", payload);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const value = useMemo(() => ({ content, stream }), [content, stream]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
