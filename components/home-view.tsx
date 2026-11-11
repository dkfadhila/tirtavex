"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import type { Collab, WorkItem } from "@/lib/types";
import { categoryLabel, compactNumber, formatDate, formatDuration, fullNumber, placementLabel, timeAgo } from "@/lib/format";
import { safeHttpUrl, safeXUrl } from "@/lib/safe-url";
import { useSite } from "./site-provider";
import { BriefForm } from "./contact-form";
import { Delta, Magnetic, Marquee, Odometer, Reveal, SectionHeading, TextReveal, Thumb, outboundX } from "./ui";

const FILTERS = ["all", "ai-video", "web3", "contest", "collab"] as const;

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 5000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  return now;
}

export function HomeView() {
  const { content } = useSite();
  const { settings } = content;
  return (
    <>
      <Hero />
      <Intro />
      <Marquee items={settings.marquee} className="border-y border-line py-4" />
      <Pulse />
      <Work />
      <Collabs />
      <Programs />
      <Ambassadors />
      <PreviousProjects />
      <Contests />
      <Reviews />
      <Reel />
      <Process />
      <Toolkit />
      <Marquee items={[settings.contactHeadline, "Imagine more", settings.heroTitle]} className="bg-mint-100 py-8" />
      <ContactBand />
    </>
  );
}

function Hero() {
  const { content } = useSite();
  const { settings, agent } = content;
  const reduce = useReducedMotion();
  const now = useNow();
  const [ago, setAgo] = useState("just now");
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const tick = () => setAgo(timeAgo(agent.lastHeartbeatAt));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [agent.lastHeartbeatAt]);
  useEffect(() => {
    if (reduce) return;
    const node = root.current;
    if (!node) return;
    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      node.querySelectorAll<HTMLElement>("[data-depth]").forEach((shape) => {
        const depth = Number(shape.dataset.depth || 0);
        shape.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
    };
    node.addEventListener("pointermove", onMove);
    return () => node.removeEventListener("pointermove", onMove);
  }, [reduce]);
  const stale = now != null && agent.lastHeartbeatAt ? now - new Date(agent.lastHeartbeatAt).getTime() > 5 * 60 * 1000 : false;

  return (
    <section ref={root} className="relative overflow-hidden pt-32 pb-16 md:pt-40">
      <div className="aurora" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <div className="wrap relative">
        <div className="flex flex-wrap items-center gap-3">
          <p className="eyebrow">{settings.heroEyebrow}</p>
          <span className="chip">
            <span className={stale ? "stale-dot" : "live-dot"} />
            {stale ? "Stale" : `Agent synced ${ago}`}
          </span>
          <span className="chip">@{settings.xHandle}</span>
        </div>
        <h1 className="display mt-6 text-[clamp(72px,15vw,240px)] text-forest">
          <TextReveal text={settings.heroTitle} />
        </h1>
        <div className="mt-8 grid items-end gap-8 md:grid-cols-12">
          <p className="display text-[clamp(32px,4vw,64px)] md:col-span-8">
            <TextReveal text={settings.heroHeadline} />
          </p>
          <div className="md:col-span-4">
            <p className="muted">{settings.heroLede}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Magnetic>
                <a className="btn" href="#work">
                  {settings.heroPrimaryLabel}
                </a>
              </Magnetic>
              <Magnetic>
                <a className="btn ghost" href="#contact">
                  {settings.heroSecondaryLabel}
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
        <Shape className="left-[8%] top-24 hidden md:block" depth={18} label="ring" />
        <Shape className="right-[12%] top-16 hidden md:block" depth={28} label="cube" />
        <Shape className="right-[28%] bottom-6 hidden lg:block" depth={12} label="pill" />
        <div className="absolute right-0 bottom-0 hidden h-36 w-36 text-emerald-700 lg:block" aria-hidden>
          <svg viewBox="0 0 200 200" className={reduce ? "" : "spin-slow"}>
            <defs>
              <path id="ringtext" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
            </defs>
            <text fill="currentColor" fontSize="13" letterSpacing="3.5">
              <textPath href="#ringtext">AI VIDEO · WEB3 · CONTENT · </textPath>
            </text>
          </svg>
        </div>
        <p className="scroll-cue mt-16 text-xs tracking-[0.2em] text-emerald-700 uppercase">Scroll</p>
      </div>
    </section>
  );
}

function Shape({ className, depth, label }: { className: string; depth: number; label: string }) {
  return (
    <div data-depth={depth} className={`pointer-events-none absolute h-24 w-24 ${className}`} aria-hidden>
      {label === "ring" ? (
        <div className="h-full w-full rounded-full border-[10px] border-emerald-500/70 bg-mint-100/40" />
      ) : label === "cube" ? (
        <div className="h-16 w-16 rounded-card bg-white/70 shadow-lift" />
      ) : (
        <div className="h-10 w-24 rounded-pill bg-emerald-500/80" />
      )}
    </div>
  );
}

function Intro() {
  const { settings } = useSite().content;
  return (
    <section className="section pt-0">
      <div className="wrap grid gap-10 md:grid-cols-2">
        <Reveal>
          <p className="eyebrow">{settings.introLeftKicker}</p>
          <h2 className="display mt-3 text-5xl md:text-6xl">{settings.introLeftTitle}</h2>
          <p className="mt-4 max-w-md muted">{settings.introLeftBody}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="eyebrow">{settings.introRightKicker}</p>
          <h2 className="display mt-3 text-5xl md:text-6xl">{settings.introRightTitle}</h2>
          <p className="mt-4 max-w-md muted">{settings.introRightBody}</p>
        </Reveal>
      </div>
    </section>
  );
}

function Pulse() {
  const { stats, work, settings } = useSite().content;
  const best = work.find((item) => item.id === stats.bestPostId) ?? [...work].sort((a, b) => b.metrics.impressions - a.metrics.impressions)[0];
  const now = useNow();
  const stale = now != null && now - new Date(stats.updatedAt).getTime() > 5 * 60 * 1000;
  const cells = [
    ["Impressions", stats.impressionsAll],
    ["30 days", stats.impressions30d],
    ["Likes", stats.likes],
    ["Posts", stats.posts],
    ["Followers", stats.followers],
  ];
  return (
    <section className="section bg-mist" id="pulse">
      <div className="wrap">
        <SectionHeading index="01" kicker="Live pulse" title="The numbers." lede={settings.pulseLede} />
        <div className="pulse-row">
          {cells.map(([label, value]) => (
            <article key={String(label)} className="glass-2 relative rounded-card p-5">
              <p className="eyebrow">{label}</p>
              <p className="display mt-3 text-4xl md:text-5xl">
                <Odometer value={Number(value)} />
              </p>
              <Delta value={Number(value)} />
              {stale ? <span className="mt-3 inline-flex items-center gap-2 text-xs text-amber"><i className="stale-dot" /> Stale</span> : null}
            </article>
          ))}
        </div>
        {best ? (
          <p className="mt-6 text-sm muted">
            Best post right now: <span className="text-ink">{best.title}</span> · {compactNumber(best.metrics.impressions)} impressions
          </p>
        ) : (
          <p className="mt-6 text-sm muted">No posts yet. The agent can add one with a single X link.</p>
        )}
      </div>
    </section>
  );
}

function Work() {
  const work = useSite().content.work;
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [sort, setSort] = useState("latest");
  const [count, setCount] = useState(12);
  const sentinel = useRef<HTMLDivElement>(null);
  const filtered = useMemo(() => {
    const list = work.filter((item) => filter === "all" || item.category === filter);
    return [...list].sort((a, b) => {
      if (sort === "liked") return b.metrics.likes - a.metrics.likes;
      if (sort === "viewed") return b.metrics.impressions - a.metrics.impressions;
      const pin = Number(b.pinned) - Number(a.pinned);
      return pin || +new Date(b.postedAt) - +new Date(a.postedAt);
    });
  }, [work, filter, sort]);
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setCount((value) => value + 12);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [filtered.length]);
  const visible = filtered.slice(0, count);

  return (
    <section className="section" id="work">
      <div className="wrap">
        <SectionHeading index="02" kicker="Featured work" title="Open it on X." lede="Thumbnails live here. The film, the replies, and the count stay on the post." />
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {FILTERS.map((item) => (
            <button
              key={item}
              className={`rounded-pill px-4 py-2 text-sm ${filter === item ? "bg-emerald-700 text-white" : "bg-mint-100 text-forest"}`}
              aria-pressed={filter === item}
              data-track="filter_change"
              data-track-id={item}
              onClick={() => {
                setFilter(item);
                setCount(12);
              }}
            >
              {item === "all" ? "All" : categoryLabel(item)}
            </button>
          ))}
          <label className="ml-auto text-sm">
            <span className="sr-only">Sort</span>
            <select className="rounded-pill border border-line bg-white px-3 py-2" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="latest">Latest</option>
              <option value="viewed">Most viewed</option>
              <option value="liked">Most liked</option>
            </select>
          </label>
        </div>
        {visible.length === 0 ? (
          <Empty message="Nothing in this filter yet." />
        ) : (
          <LayoutGroup>
            <div className="work-grid">
              {visible.map((item) => (
                <motion.div key={item.id} layout className={item.pinned ? "span-2" : ""}>
                  <WorkCard item={item} large={item.pinned} />
                </motion.div>
              ))}
            </div>
          </LayoutGroup>
        )}
        <div ref={sentinel} className="h-8" />
      </div>
    </section>
  );
}

export function WorkCard({ item, large = false }: { item: WorkItem; large?: boolean }) {
  const href = outboundX(item.xUrl);
  const now = useNow();
  const fresh = now != null && now - new Date(item.addedAt).getTime() < 86_400_000;
  const stale = now != null && now - new Date(item.metrics.updatedAt).getTime() > 5 * 60 * 1000;
  const body = (
    <>
      <div className={`tilt relative ${large ? "aspect-[16/8]" : "aspect-video"} overflow-hidden rounded-card`}>
        <Thumb src={item.thumb.src} alt="" dominant={item.thumb.dominant} className="h-full w-full" />
        <span className="glare" />
        <span className="scan" />
        <span className="absolute top-4 left-4 grid h-12 w-12 place-items-center rounded-full bg-white/80 text-forest">▶</span>
        {formatDuration(item.thumb.durationSec) ? (
          <span className="absolute right-4 bottom-4 rounded-pill bg-white/80 px-2 py-1 text-xs tabular">{formatDuration(item.thumb.durationSec)}</span>
        ) : null}
        {fresh ? <span className="absolute top-4 right-4 chip">New</span> : null}
      </div>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="chip">{categoryLabel(item.category)}</p>
          <h3 className="mt-2 font-display text-2xl tracking-tight">{item.title}</h3>
          {item.note ? <p className="mt-1 max-w-prose text-sm muted">{item.note}</p> : null}
        </div>
        <p className="text-xs text-ink-muted">{formatDate(item.postedAt)}</p>
      </div>
      <dl className="mt-3 flex flex-wrap gap-4 text-sm tabular">
        <Metric label="impressions" value={item.metrics.impressions} />
        <Metric label="likes" value={item.metrics.likes} />
        <Metric label="reposts" value={item.metrics.reposts} />
        <Metric label="replies" value={item.metrics.replies} />
      </dl>
      {stale ? <p className="mt-2 text-xs text-amber">Stale metrics</p> : null}
    </>
  );
  if (!href) return <article className="rounded-card">{body}</article>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="View on X"
      data-track="work_card_click"
      data-track-id={item.id}
      className="block rounded-card"
    >
      {body}
      <span className="sr-only">Opens the original post on X in a new tab</span>
    </a>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div title={fullNumber(value)}>
      <dt className="text-[11px] tracking-widest text-ink-muted uppercase">{label}</dt>
      <dd>{compactNumber(value)}</dd>
    </div>
  );
}

function Collabs() {
  const { collabs, work } = useSite().content;
  const [open, setOpen] = useState<Collab | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);
  return (
    <section className="section bg-white" id="collabs">
      <div className="wrap">
        <SectionHeading index="—" kicker="Collabs" title="Partners in the cut." lede="Logos arrive from Tirta. Until then, the tiles are glass monograms." />
      </div>
      <div className="marquee mt-4">
        <div className="flex w-max gap-4 px-4">
          {[...collabs, ...collabs].map((item, index) => (
            <button key={`${item.id}-${index}`} className="glass-2 w-64 rounded-card p-5 text-left" onClick={() => setOpen(item)}>
              <Monogram name={item.name} />
              <p className="mt-4 font-display text-2xl">{item.name}</p>
              <p className="chip mt-2">{item.type}</p>
            </button>
          ))}
        </div>
      </div>
      <dialog ref={dialog} className="glass-3 w-full rounded-hero p-6" onClose={() => setOpen(null)}>
        {open ? (
          <div>
            <p className="eyebrow">{open.date}</p>
            <h3 className="display mt-2 text-5xl">{open.name}</h3>
            <p className="mt-4">{open.summary}</p>
            <p className="mt-3 text-emerald-700">{open.result}</p>
            <ul className="mt-4 grid gap-2">
              {open.postIds.map((id) => {
                const post = work.find((item) => item.id === id);
                const href = post ? outboundX(post.xUrl) : null;
                return (
                  <li key={id}>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
                        {post?.title} on X
                      </a>
                    ) : (
                      <span>{post?.title ?? id}</span>
                    )}
                  </li>
                );
              })}
            </ul>
            <button className="btn mt-6" onClick={() => setOpen(null)}>
              Close
            </button>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}

function Monogram({ name }: { name: string }) {
  const letter = name.replace(/[{}]/g, "").trim().charAt(0) || "T";
  return <div className="grid h-16 w-16 place-items-center rounded-2xl bg-mint-100 font-display text-3xl text-forest">{letter}</div>;
}

function Programs() {
  const { programs, work } = useSite().content;
  const ref = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const shipped = programs.reduce((sum, item) => sum + item.postIds.length, 0);
  const impressions = programs.reduce((sum, item) => sum + item.impressions, 0);
  useEffect(() => {
    const node = line.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.style.transform = "scaleY(1)";
      return;
    }
    let revert: (() => void) | undefined;
    let cancelled = false;
    void (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.fromTo(node, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "top 75%", end: "bottom 55%", scrub: true } });
      }, ref);
      revert = () => ctx.revert();
    })();
    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);
  return (
    <section className="section" id="programs">
      <div className="wrap">
        <SectionHeading index="03" kicker="Content partner programs" title="Seats, not slogans." />
        <p className="mb-10 rounded-card bg-mint-100 px-5 py-4 text-forest">
          Programs joined: {programs.length} · Posts shipped: {shipped} · Impressions: {compactNumber(impressions)}
        </p>
        <div ref={ref} className="timeline grid gap-8 pl-10">
          <div ref={line} className="timeline-line" />
          {programs.map((item, index) => {
            const side = index % 2 === 0 ? "md:ml-0" : "md:ml-24";
            return (
              <Reveal key={item.id} className={side}>
                <article className="rounded-card border border-line bg-white p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-3xl">{item.name}</h3>
                    <span className="chip">{item.status}</span>
                  </div>
                  <p className="mt-1 text-sm muted">
                    {item.role} · {item.start}
                    {item.end ? ` – ${item.end}` : ""}
                  </p>
                  <ul className="mt-4 grid gap-1 text-sm">
                    {item.highlights.map((lineItem) => (
                      <li key={lineItem}>– {lineItem}</li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    {item.postIds.map((id) => {
                      const post = work.find((entry) => entry.id === id);
                      const href = post ? safeXUrl(post.xUrl) : null;
                      return href ? (
                        <a key={id} href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">
                          {post?.title}
                        </a>
                      ) : null;
                    })}
                  </div>
                </article>
              </Reveal>
            );
          })}
          {programs.length === 0 ? <Empty message="No programs yet." /> : null}
        </div>
      </div>
    </section>
  );
}

function Ambassadors() {
  const { ambassadors, work } = useSite().content;
  return (
    <section className="section bg-mist" id="ambassador">
      <div className="wrap">
        <SectionHeading index="04" kicker="Ambassador" title="Roles with a paper trail." />
        <div className="grid gap-5 md:grid-cols-3">
          {ambassadors.map((item) => (
            <div key={item.id} className="flip" tabIndex={0}>
              <div className="flip-inner">
                <div className="flip-face">
                  <span className="chip">{item.status}</span>
                  <h3 className="mt-4 font-display text-4xl">{item.project}</h3>
                  <p className="mt-2">{item.title}</p>
                  <p className="text-sm muted">
                    {item.region} · since {item.start}
                  </p>
                  <div className="pointer-events-none absolute right-6 bottom-6 h-16 w-16 rounded-full border border-dashed border-emerald-600/40" aria-hidden />
                </div>
                <div className="flip-face flip-back">
                  <p className="eyebrow">Duties</p>
                  <ul className="mt-3 grid gap-2">
                    {item.duties.map((duty) => (
                      <li key={duty}>{duty}</li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.postIds.map((id) => {
                      const post = work.find((entry) => entry.id === id);
                      const href = post ? safeXUrl(post.xUrl) : null;
                      return href ? (
                        <a key={id} className="text-sm underline" href={href} target="_blank" rel="noopener noreferrer">
                          See posts
                        </a>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PreviousProjects() {
  const projects = useSite().content.projects;
  const [pos, setPos] = useState({ x: 0, y: 0, id: "" });
  const active = projects.find((item) => item.id === pos.id);
  return (
    <section className="section" id="projects">
      <div className="wrap">
        <SectionHeading index="05" kicker="Previous projects" title="The record." lede="Hover a row. Open the case. The post is one more click away." />
        <div className="divide-y divide-line border-y border-line">
          {projects.map((item) => (
            <Link
              key={item.id}
              href={`/projects/${item.slug}`}
              className="grid items-center gap-3 py-6 md:grid-cols-12"
              onMouseMove={(event) => setPos({ x: event.clientX, y: event.clientY, id: item.id })}
              onMouseLeave={() => setPos((current) => ({ ...current, id: "" }))}
            >
              <span className="tabular text-sm text-emerald-700 md:col-span-2">{item.year}</span>
              <span className="display text-4xl md:col-span-6 md:text-6xl">{item.name}</span>
              <span className="text-sm muted md:col-span-4">{item.scope.join(" · ")} · {item.outcome}</span>
            </Link>
          ))}
        </div>
      </div>
      {active ? (
        <div className="pointer-events-none fixed z-40 hidden h-40 w-56 overflow-hidden rounded-card shadow-lift md:block" style={{ left: pos.x + 24, top: pos.y - 40 }}>
          <Thumb src={active.cover} alt="" dominant={active.accent} className="h-full w-full" />
        </div>
      ) : null}
    </section>
  );
}

function Contests() {
  const contests = useSite().content.contests;
  const [year, setYear] = useState<number | "all">("all");
  const years = [...new Set(contests.map((item) => item.year))].sort((a, b) => b - a);
  const list = contests.filter((item) => year === "all" || item.year === year);
  const rank = { winner: 0, finalist: 1, top10: 2, participant: 3 };
  const ordered = [...list].sort((a, b) => rank[a.placement] - rank[b.placement]);
  const podium = ordered.slice(0, 3);
  const rest = ordered.slice(3);
  return (
    <section className="section bg-mist" id="contests">
      <div className="wrap">
        <SectionHeading index="06" kicker="AI contests" title="Placements." />
        <div className="mb-8 flex gap-2">
          <button className={`rounded-pill px-4 py-2 text-sm ${year === "all" ? "bg-emerald-700 text-white" : "bg-white"}`} onClick={() => setYear("all")}>
            All years
          </button>
          {years.map((item) => (
            <button key={item} className={`rounded-pill px-4 py-2 text-sm ${year === item ? "bg-emerald-700 text-white" : "bg-white"}`} onClick={() => setYear(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="podium">
          {podium.map((item) => {
            const href = safeXUrl(item.xUrl);
            return (
              <article key={item.id} className={`rounded-card bg-white p-5 ${item.placement === "winner" ? "md:-translate-y-6" : ""}`}>
                <div className="medal text-xs font-bold tracking-widest text-forest">{placementLabel(item.placement)}</div>
                <h3 className="mt-4 font-display text-3xl">{item.name}</h3>
                <p className="text-sm muted">
                  {item.organizer} · {item.date}
                </p>
                {href ? (
                  <a className="mt-4 inline-block text-emerald-700 underline" href={href} target="_blank" rel="noopener noreferrer">
                    Entry on X
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
        <div className="mt-6 grid gap-3">
          {rest.map((item) => (
            <p key={item.id} className="flex justify-between border-b border-line py-3">
              <span>{item.name}</span>
              <span className="text-sm muted">{placementLabel(item.placement)}</span>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const quotes = useSite().content.testimonials;
  return (
    <section className="section">
      <div className="wrap">
        <SectionHeading index="07" kicker="Reviews" title="From the other side of the brief." />
        <div className="flex snap-x gap-5 overflow-x-auto pb-4">
          {quotes.map((item) => {
            const href = safeXUrl(item.sourceUrl) ?? safeHttpUrl(item.sourceUrl);
            return (
              <article key={item.id} className="min-w-[80%] snap-start rounded-hero bg-mist p-8 md:min-w-[46%]">
                <p className="display text-7xl text-emerald-700">{item.stat}</p>
                <p className="eyebrow mt-2">{item.statLabel}</p>
                <p className="mt-6 text-2xl leading-snug">{item.quote}</p>
                <p className="mt-4 text-sm muted">{item.resultLine}</p>
                <p className="mt-6 font-semibold">{item.name}</p>
                <p className="text-sm muted">{item.role}</p>
                {href ? (
                  <a className="mt-3 inline-block text-sm text-emerald-700 underline" href={href} target="_blank" rel="noopener noreferrer">
                    Source
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Reel() {
  const work = useSite().content.work;
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth < 900) return;
    let revert: (() => void) | undefined;
    let cancelled = false;
    void (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled || !track.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        const distance = () => Math.max(0, (track.current?.scrollWidth ?? 0) - window.innerWidth + 80);
        gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 1, invalidateOnRefresh: true },
        });
      });
      revert = () => ctx.revert();
    })();
    return () => {
      cancelled = true;
      revert?.();
    };
  }, [work.length]);
  return (
    <section ref={section} className="section overflow-hidden bg-mint-100">
      <div className="wrap">
        <p className="eyebrow">Show reel</p>
        <h2 className="display text-[clamp(48px,8vw,120px)]">Frames, not files.</h2>
      </div>
      <div ref={track} className="mt-8 flex w-max gap-4 px-4 md:px-8">
        {work.map((item) => (
          <div key={item.id} className="w-[70vw] max-w-md shrink-0">
            <Thumb src={item.thumb.src} alt={item.title} dominant={item.thumb.dominant} className="aspect-video rounded-card" />
            <p className="mt-3 font-display text-2xl">{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Process() {
  const steps = useSite().content.process;
  return (
    <section className="section">
      <div className="wrap">
        <SectionHeading index="08" kicker="How a film gets made" title="Four moves." />
        <ol className="grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.id} className="rounded-card border border-line p-5">
              <p className="eyebrow">0{index + 1} {step.kicker}</p>
              <h3 className="mt-3 font-display text-4xl">{step.title}</h3>
              <p className="mt-3 text-sm muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Toolkit() {
  const { settings, tools } = useSite().content;
  return (
    <section className="section bg-mist">
      <div className="wrap grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow">About</p>
          <h2 className="display mt-3 text-6xl">A short bio.</h2>
          <p className="mt-4 max-w-prose">{settings.bio}</p>
          <Link className="btn mt-6" href="/about">
            Read the longer version
          </Link>
        </div>
        <div className="flex flex-wrap content-start gap-2 md:col-span-7">
          {tools.map((tool) => (
            <span key={tool.id} className="glass-2 rounded-pill px-4 py-3 text-sm">
              <span className="text-ink-muted">{tool.group}</span> · {tool.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactBand() {
  const { settings } = useSite().content;
  const x = safeXUrl(settings.xUrl);
  return (
    <section className="section" id="contact">
      <div className="wrap grid gap-10 md:grid-cols-2">
        <div>
          <p className="eyebrow">{settings.availability}</p>
          <h2 className="display mt-3 text-[clamp(48px,6vw,88px)]">{settings.contactHeadline}</h2>
          <p className="mt-4 max-w-md muted">{settings.contactLede}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {x ? (
              <Magnetic>
                <a className="btn" href={x} target="_blank" rel="noopener noreferrer" data-track="contact_click">
                  DM on X
                </a>
              </Magnetic>
            ) : null}
            <CopyEmail email={settings.email} />
          </div>
        </div>
        <BriefForm budgets={settings.budgetOptions} />
      </div>
    </section>
  );
}

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const [bits, setBits] = useState<{ id: number; x: number; y: number }[]>([]);
  return (
    <span className="relative inline-flex">
      <button
        className="btn ghost"
        data-track="contact_click"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            setBits(Array.from({ length: 12 }, (_, id) => ({ id, x: (Math.random() - 0.5) * 120, y: -20 - Math.random() * 60 })));
            window.setTimeout(() => setCopied(false), 1600);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "Copied" : "Copy email"}
      </button>
      {bits.map((bit) => (
        <motion.i
          key={bit.id}
          className="pointer-events-none absolute top-0 left-1/2 h-2 w-2 rounded-full bg-emerald-500"
          initial={{ opacity: 1, x: 0, y: 0 }}
          animate={{ opacity: 0, x: bit.x, y: bit.y }}
          transition={{ duration: 0.7 }}
        />
      ))}
    </span>
  );
}

function Empty({ message }: { message: string }) {
  const x = safeXUrl(useSite().content.settings.xUrl);
  return (
    <p className="rounded-card bg-mist p-8">
      {message}{" "}
      {x ? (
        <a className="text-emerald-700 underline" href={x} target="_blank" rel="noopener noreferrer">
          Follow on X
        </a>
      ) : null}
    </p>
  );
}
