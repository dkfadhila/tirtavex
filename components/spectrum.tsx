"use client";

import { useEffect, useRef } from "react";

/**
 * Far-right vertical spectrum: 1px hairlines of varying length, right-anchored.
 * Purely decorative. No labels, no controls. Reacts to scroll position and
 * velocity, breathes gently, and holds still under prefers-reduced-motion.
 */

type Rgb = [number, number, number];
const INK: Record<"light" | "dark", { base: Rgb; bright: Rgb }> = {
  // cool slate / charcoal on the cream page
  light: { base: [71, 85, 105], bright: [15, 23, 42] },
  // soft silver / cool white on the dark page and over the hero plate
  dark: { base: [203, 213, 225], bright: [248, 250, 252] },
};

function hash(n: number, salt: number) {
  const s = Math.sin(n * 127.1 + salt * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function Spectrum() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let dpr = 1;
    let w = 0;
    let h = 0;
    let gap = 7;
    let maxLen = 40;
    let inset = 8;
    let count = 0;
    let cur: Float32Array = new Float32Array(0);
    let grads: CanvasGradient[] = [];
    let raf = 0;
    let last = performance.now();
    let lastY = window.scrollY;
    let vel = 0;
    let phase = 0;
    let visible = true;

    const isDark = () => document.documentElement.dataset.theme === "dark";

    const build = () => {
      const narrow = window.innerWidth < 810;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      gap = narrow ? 6 : 7;
      maxLen = narrow ? 26 : 44;
      inset = narrow ? 5 : 9;
      w = maxLen + inset + 8;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(8, Math.floor(h / gap));
      if (n !== count) {
        count = n;
        cur = new Float32Array(n);
      }
      const x0 = w - inset - maxLen;
      const x1 = w - inset;
      const mk = (c: Rgb) => {
        const g = ctx.createLinearGradient(x0, 0, x1, 0);
        g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        g.addColorStop(0.55, `rgba(${c[0]},${c[1]},${c[2]},0.7)`);
        g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},1)`);
        return g;
      };
      // 0 page-base, 1 page-bright, 2 hero-base, 3 hero-bright
      const page = INK[isDark() ? "dark" : "light"];
      grads = [mk(page.base), mk(page.bright), mk(INK.dark.base), mk(INK.dark.bright)];
    };

    const frame = (now: number, still: boolean) => {
      const dt = Math.min(48, now - last);
      last = now;
      const y = window.scrollY;
      const span = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const prog = Math.min(1, Math.max(0, y / span));
      if (!still) {
        const raw = (y - lastY) / Math.max(1, dt);
        vel += (Math.min(1, Math.abs(raw) / 3) - vel) * 0.12;
        phase += dt * 0.00035 + (y - lastY) * 0.0016;
      } else {
        vel = 0;
        phase = prog * 6;
      }
      lastY = y;

      const hero = document.querySelector(".ed-hero")?.getBoundingClientRect();
      ctx.clearRect(0, 0, w, h);
      const x = w - inset;
      const breath = still ? 0 : now * 0.0006;
      const dark = isDark();

      for (let i = 0; i < count; i++) {
        const u = i / (count - 1);
        const e =
          0.38 * Math.sin(u * 9 + phase) +
          0.27 * Math.sin(u * 23 + phase * 1.7 + 1.3) +
          0.18 * Math.sin(u * 51 - phase * 2.3 + 0.7);
        let s = Math.pow(Math.max(0, (e + 0.83) / 1.66), 1.5);
        s *= (0.55 + 0.45 * hash(i, 1)) * (1 + 0.1 * Math.sin(breath + u * 5));
        s *= 1 + vel * (0.5 + 0.7 * hash(i, 2));
        const g = Math.exp(-Math.pow(u - prog, 2) / 0.006);
        s += g * 0.35;
        const target = Math.min(1, 0.06 + s);
        cur[i] += (target - cur[i]) * (still ? 1 : 0.16);

        const bright = hash(i, 3) > 0.93 || g > 0.85 + hash(i, 4) * 0.1;
        const len = Math.max(3, cur[i] * maxLen);
        const yy = Math.round((i * gap + gap / 2) * dpr) / dpr;
        const onHero = hero ? yy >= hero.top && yy <= hero.bottom : false;
        ctx.globalAlpha = Math.min(1, (bright ? 0.7 : 0.16) + cur[i] * (bright ? 0.3 : 0.5) + g * 0.2);
        ctx.fillStyle = grads[(onHero ? 2 : 0) + (bright ? 1 : 0)];
        ctx.shadowBlur = bright ? 5 : 0;
        ctx.shadowColor = bright ? (onHero || dark ? "rgba(226,232,240,0.55)" : "rgba(71,85,105,0.35)") : "transparent";
        ctx.fillRect(x - len, yy, len, 1);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    const loop = (now: number) => {
      if (visible) frame(now, false);
      raf = requestAnimationFrame(loop);
    };

    const redrawStatic = () => {
      build();
      for (let i = 0; i < 3; i++) frame(performance.now(), true);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      build();
      if (reduce.matches) {
        redrawStatic();
        return;
      }
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const rebuild = () => (reduce.matches ? redrawStatic() : build());
    const onVis = () => {
      visible = !document.hidden;
      last = performance.now();
    };
    const onScrollStatic = () => {
      if (reduce.matches) redrawStatic();
    };

    start();
    window.addEventListener("resize", rebuild);
    window.addEventListener("tv-theme", rebuild);
    window.addEventListener("scroll", onScrollStatic, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    reduce.addEventListener("change", start);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", rebuild);
      window.removeEventListener("tv-theme", rebuild);
      window.removeEventListener("scroll", onScrollStatic);
      document.removeEventListener("visibilitychange", onVis);
      reduce.removeEventListener("change", start);
    };
  }, []);

  return (
    <div className="spectrum" aria-hidden="true">
      <canvas ref={ref} />
    </div>
  );
}
