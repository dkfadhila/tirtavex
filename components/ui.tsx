"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { compactNumber, fullNumber } from "@/lib/format";
import { safeColor, safeHttpUrl, safeXUrl } from "@/lib/safe-url";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      data-reveal
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: reduce ? 0.15 : 0.7, ease: EASE, delay: reduce ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}

export function TextReveal({ text, className, as: Tag = "span" }: { text: string; className?: string; as?: "span" | "h1" | "h2" }) {
  const reduce = useReducedMotion();
  if (reduce) return <Tag className={className}>{text}</Tag>;
  const words = text.split(" ");
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.04 * index }}
            >
              {word}
              {index < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  );
}

export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={(event) => {
        if (reduce || !ref.current || window.matchMedia("(pointer: coarse)").matches) return;
        const rect = ref.current.getBoundingClientRect();
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        if (Math.hypot(x, y) > 80) return;
        ref.current.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px)`;
      }}
      onMouseLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
      style={{ transition: "transform 0.32s var(--tv-ease)" }}
    >
      {children}
    </div>
  );
}

export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const reduce = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const loop = [...items, ...items];
  useEffect(() => {
    const node = track.current;
    if (!node || reduce || items.length === 0) return;
    const animation = node.animate([{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }], {
      duration: 38000,
      iterations: Infinity,
    });
    const parent = node.parentElement;
    const slow = () => {
      animation.playbackRate = 0.2;
    };
    const fast = () => {
      animation.playbackRate = 1;
    };
    parent?.addEventListener("mouseenter", slow);
    parent?.addEventListener("mouseleave", fast);
    return () => {
      animation.cancel();
      parent?.removeEventListener("mouseenter", slow);
      parent?.removeEventListener("mouseleave", fast);
    };
  }, [items, reduce]);
  return (
    <div className={`marquee ${className}`}>
      <div ref={track} className="marquee-track">
        {loop.map((item, index) => (
          <span key={`${item}-${index}`} className="display px-8 text-[clamp(40px,7vw,96px)] text-stroke">
            {item}
            <span className="mx-6 text-emerald-500">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Odometer({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const seen = useRef(false);
  const from = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const animate = (start: number, end: number) => {
      if (reduce) {
        setDisplay(end);
        from.current = end;
        return;
      }
      const began = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - began) / 900);
        const eased = 1 - (1 - t) ** 3;
        const next = start + (end - start) * eased;
        setDisplay(next);
        if (t < 1) requestAnimationFrame(step);
        else from.current = end;
      };
      requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        if (!seen.current) {
          seen.current = true;
          animate(0, value);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduce, value]);

  useEffect(() => {
    if (!seen.current) return;
    const start = from.current;
    if (start === value) return;
    if (reduce) {
      from.current = value;
      const frame = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(frame);
    }
    const began = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - began) / 700);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(start + (value - start) * eased);
      if (t < 1) requestAnimationFrame(step);
      else from.current = value;
    };
    requestAnimationFrame(step);
  }, [value, reduce]);

  return (
    <span ref={ref} className="tabular" title={fullNumber(value)}>
      {compactNumber(display)}
    </span>
  );
}

export function Delta({ value }: { value: number }) {
  const previous = useRef(value);
  const [delta, setDelta] = useState<number | null>(null);
  useEffect(() => {
    const diff = value - previous.current;
    previous.current = value;
    if (diff <= 0) return;
    setDelta(diff);
    const timer = window.setTimeout(() => setDelta(null), 1500);
    return () => window.clearTimeout(timer);
  }, [value]);
  if (!delta) return null;
  return (
    <motion.span className="delta" initial={{ opacity: 0, y: 6 }} animate={{ opacity: [0, 1, 0], y: -16 }} transition={{ duration: 1.4 }}>
      +{compactNumber(delta)}
    </motion.span>
  );
}

export function Thumb({
  src,
  alt,
  dominant,
  className = "",
}: {
  src?: string;
  alt: string;
  dominant?: string;
  className?: string;
}) {
  const color = safeColor(dominant);
  const safe = src ? safeHttpUrl(src) : null;
  const [broken, setBroken] = useState(false);
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(145deg, white, ${color})` }}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 30% 20%, white, transparent 40%), radial-gradient(circle at 70% 80%, ${color}, transparent 46%)`,
        }}
      />
      <svg viewBox="0 0 200 120" className="absolute inset-0 h-full w-full opacity-70" aria-hidden>
        <ellipse cx="70" cy="60" rx="36" ry="22" fill="none" stroke={color} strokeWidth="6" />
        <rect x="112" y="38" width="40" height="40" rx="12" fill="white" fillOpacity="0.7" stroke={color} />
      </svg>
      {safe && !broken ? (
        // External thumbs come from X or Blob and are not known at build time.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={safe} alt={alt} className="absolute inset-0 h-full w-full object-cover" onError={() => setBroken(true)} />
      ) : (
        <span className="sr-only">{alt}</span>
      )}
    </div>
  );
}

export function SectionHeading({ index, kicker, title, lede }: { index: string; kicker: string; title: string; lede?: string }) {
  return (
    <div className="mb-12 grid items-end gap-6 md:grid-cols-12">
      <div className="md:col-span-3">
        <p className="eyebrow">{index}</p>
        <p className="mt-2 text-sm text-ink-muted">{kicker}</p>
      </div>
      <h2 className="display text-[clamp(40px,6vw,88px)] md:col-span-6">{title}</h2>
      {lede ? <p className="max-w-xs text-ink-muted md:col-span-3">{lede}</p> : null}
    </div>
  );
}

export function outboundX(url: string | undefined) {
  return safeXUrl(url);
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`}>
        {list.map((item) => (
          <li key={item}>{inline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  };
  lines.forEach((line, index) => {
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      return;
    }
    flush();
    if (!line.trim()) return;
    if (line.startsWith("### ")) blocks.push(<h3 key={index} id={anchor(line.slice(4))}>{inline(line.slice(4))}</h3>);
    else if (line.startsWith("## ")) blocks.push(<h2 key={index} id={anchor(line.slice(3))}>{inline(line.slice(3))}</h2>);
    else blocks.push(<p key={index}>{inline(line)}</p>);
  });
  flush();
  return <div className="rich">{blocks}</div>;
}

function anchor(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function inline(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = safeHttpUrl(link[2]);
      if (!href) return <span key={index}>{link[1]}</span>;
      const external = !href.startsWith("/");
      return (
        <a key={index} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
          {link[1]}
        </a>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    return <span key={index}>{part}</span>;
  });
}

export function headings(source: string) {
  return source
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => {
      const text = line.slice(3).trim();
      return { text, id: anchor(text) };
    });
}
