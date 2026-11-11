"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { Project, WorkItem } from "@/lib/types";
import { compactNumber } from "@/lib/format";
import { safeXUrl } from "@/lib/safe-url";
import { presets, spring, stairs, textFx } from "@/lib/motion";
import { stills } from "@/lib/stills";
import { useSite } from "./site-provider";
import { Still } from "./still";

const shots = stills();
const tickerImgs = [...shots.tiles, ...shots.gallery, ...shots.panels];

export function HomeView() {
  return (
    <>
      <Hero />
      <div className="relative z-10 bg-white" style={{ marginTop: "100vh" }}>
        <Why />
        <Formats />
        <Partners />
        <Portfolio />
        <Proof />
        <Showreel />
        <Process />
        <Roles />
        <ContactBand />
      </div>
    </>
  );
}

function introSeen() {
  return document.documentElement.classList.contains("intro-seen");
}

function useFirstVisit() {
  const first = useSyncExternalStore(
    () => () => {},
    () => !introSeen(),
    () => true,
  );
  useEffect(() => {
    if (introSeen()) return;
    const timer = window.setTimeout(() => {
      sessionStorage.setItem("tvIntroSeen", "1");
      document.documentElement.classList.add("intro-seen");
    }, 3200);
    return () => window.clearTimeout(timer);
  }, []);
  return first;
}

function Split({
  text,
  className,
  mode = "word",
  hero = false,
  start,
}: {
  text: string;
  className?: string;
  mode?: "word" | "char";
  hero?: boolean;
  start?: number;
}) {
  const reduce = useReducedMotion();
  const fx = hero ? textFx.charRiseHero : mode === "char" ? textFx.charRise : textFx.wordRise;
  const parts = mode === "char" || hero ? Array.from(text) : text.split(" ");
  if (reduce) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {parts.map((part, index) => (
          <motion.span
            key={`${part}-${index}`}
            className="inline-block"
            initial={fx.from}
            whileInView={hero ? undefined : { opacity: 1, y: 0 }}
            animate={hero ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true, amount: 0 }}
            transition={{ ...fx.transition, delay: (start ?? fx.startDelay) + index * fx.stagger }}
          >
            {part === " " ? "\u00A0" : part}
            {mode === "word" && !hero && index < parts.length - 1 ? "\u00A0" : ""}
          </motion.span>
        ))}
      </span>
    </span>
  );
}

function Hero() {
  const { settings, agent } = useSite().content;
  const first = useFirstVisit();
  const reduce = useReducedMotion();
  const d = (value: number) => (first && !reduce ? value : 0.05);
  const { scrollY } = useScroll();
  const titleY = useTransform(scrollY, [0, 800], [0, 40]);
  const imageY = useTransform(scrollY, [0, 800], [0, 56]);
  return (
    <section className="fixed inset-0 z-0 overflow-hidden" style={{ background: "linear-gradient(180deg, #ECFDF5 0%, #D1FAE5 100%)" }}>
      {!reduce ? (
        <div className="hero-curtain pointer-events-none absolute inset-0 z-20 grid grid-cols-4">
          {[1.2, 1.4, 1.5, 1.6].map((duration, index) => (
            <motion.div
              key={duration}
              className="h-full bg-[#10B981]"
              initial={{ y: 0 }}
              animate={{ y: "-110%" }}
              transition={spring(duration, 0.2, first ? (index === 3 ? 1.2 : 1.1) : 0)}
            />
          ))}
        </div>
      ) : null}
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y: imageY }}>
        <Still
          src={shots.hero}
          alt="Editorial portrait"
          sizes="100vw"
          priority
          className={`object-cover ${shots.heroFade ? "object-center" : "object-[center_bottom]"}`}
        />
        {shots.heroFade ? <div className="scrim absolute inset-0" /> : <div className="absolute inset-x-0 bottom-0 h-[55%] scrim" />}
      </motion.div>
      {!reduce ? (
        <>
          <SideTicker className="left-0" images={tickerImgs} velocity={50} reverse={false} slow={false} />
          <SideTicker className="left-[92px] hidden md:block" images={tickerImgs.slice(2)} velocity={60} reverse={false} slow />
          <SideTicker className="right-[92px] hidden md:block" images={tickerImgs.slice(4)} velocity={60} reverse slow />
          <SideTicker className="right-0" images={tickerImgs.slice(1)} velocity={50} reverse slow={false} />
        </>
      ) : null}
      <motion.div className="absolute inset-x-0 bottom-[8vh] z-10 px-6 text-center text-white" style={reduce ? undefined : { y: titleY }}>
        <motion.p className="t-eyebrow !text-white" style={{ fontSize: 36 }} initial={{ opacity: 0.001, y: 330 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, ease: [0.94, 0, 0.56, 1], delay: d(0) }}>
          <Split text={settings.heroEyebrow || "AI video × Web3"} mode="char" hero start={d(0.1)} />
        </motion.p>
        <motion.h1 className="t-hero mx-auto mt-3 max-w-[16ch] text-white" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={spring(0.8, 0.2, d(1.2))}>
          AI video
          <br />
          Storyteller
        </motion.h1>
        <motion.p className="t-body mx-auto mt-4 max-w-[300px] !text-white" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring(0.4, 0.2, d(1.4))}>
          <Split text={settings.heroLede || "Every post. Every number. Always current."} mode="word" hero={false} start={d(1.2)} />
        </motion.p>
        <a className="t-meta mt-6 inline-block text-white underline-offset-4 hover:underline" href="#formats">
          See the work
        </a>
      </motion.div>
      <motion.p className="t-meta absolute bottom-6 left-6 z-10 inline-flex items-center gap-2 text-white" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring(0.4, 0.2, d(1.5))}>
        <span className={agent.lastHeartbeatAt ? "live-dot" : "stale-dot"} />
        {agent.lastHeartbeatAt ? "Agent synced" : "Waiting for the agent"}
      </motion.p>
      <motion.p className="t-meta absolute right-6 bottom-6 z-10 text-white" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring(0.4, 0.2, d(1.5))}>
        @{settings.xHandle}
      </motion.p>
    </section>
  );
}

function SideTicker({ className, images, velocity, reverse, slow }: { className: string; images: string[]; velocity: number; reverse: boolean; slow: boolean }) {
  const loop = [...images, ...images];
  const distance = loop.length * 64;
  const duration = `${Math.max(12, distance / velocity)}s`;
  return (
    <div className={`v-ticker ${slow ? "slow" : ""} ${className}`} style={{ ["--dur" as string]: duration }}>
      <div className="v-track" style={{ animationDuration: duration, animationDirection: reverse ? "reverse" : "normal" }}>
        {loop.map((src, index) => (
          <div key={`${src}-${index}`} className="relative h-[118px] w-full">
            <Still src={src} alt="" sizes="86px" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TitleBlock({ eyebrow, title, suffix, left, right, copy }: { eyebrow: string; title: string; suffix: string; left: string; right: string; copy: string }) {
  return (
    <div className="relative px-6 py-16 text-center">
      <p className="t-meta absolute top-16 left-6 hidden text-[color:var(--tv-ink-60)] md:block">{left}</p>
      <p className="t-meta absolute top-16 right-6 hidden text-[color:var(--tv-ink-60)] md:block">{right}</p>
      <div className="relative mx-auto inline-block">
        <Split text={eyebrow} mode="char" className="t-eyebrow absolute -top-8 left-0" />
        <motion.h2 className="t-display text-[color:var(--tv-ink)]" {...presets.fadeUp40}>
          {title}
        </motion.h2>
        <Split text={suffix} mode="char" start={0.3} className="t-eyebrow absolute right-0 -bottom-8" />
      </div>
      <motion.p className="t-body mx-auto mt-14 max-w-[320px]" {...presets.fadeUp20}>
        {copy}
      </motion.p>
    </div>
  );
}

function Why() {
  const { settings, stats } = useSite().content;
  const tiles = [
    [shots.tiles[0], "Viral", "AI video"],
    [shots.tiles[2] || shots.tiles[0], "Web3", "Native"],
    [shots.tiles[3] || shots.tiles[1], "Live", "Numbers"],
  ] as const;
  const figures = [
    stats.impressionsAll ? [compactNumber(stats.impressionsAll), "Total impressions"] : null,
    stats.impressions30d ? [compactNumber(stats.impressions30d), "30-day impressions"] : null,
    stats.likes ? [compactNumber(stats.likes), "Likes"] : null,
    stats.posts ? [String(stats.posts), "Posts"] : null,
    stats.followers ? [compactNumber(stats.followers), "Followers"] : null,
  ].filter((row): row is [string, string] => row !== null);
  return (
    <section id="pulse" className="px-6 text-center" style={{ paddingTop: "var(--section-gap)" }}>
      <Split text={settings.introRightKicker || "Why Tirta"} mode="char" className="t-eyebrow" />
      <h2 className="t-statement mx-auto mt-8 max-w-[600px]">
        <span className="text-[color:var(--tv-accent-deep)]">
          <Split text="Proof, not a sizzle reel." mode="char" />
        </span>{" "}
        <Split text="Real posts, live numbers, and AI films people actually finish." mode="word" start={0.3} />
      </h2>
      <motion.p className="t-body mx-auto mt-8 max-w-[320px]" {...presets.fadeUp20}>
        Every card is a real post. Click it and you land on X.
      </motion.p>
      <div className="mx-auto mt-16 grid max-w-5xl gap-4 md:grid-cols-3">
        {tiles.map(([src, a, b], index) => (
          <motion.article key={a} className="grid grid-cols-2 overflow-hidden border border-[color:var(--tv-line)]" {...presets.fadeUp40} transition={spring(0.6, 0.2, 0.2 + index * 0.1)}>
            <div className="relative min-h-[170px]">
              <Still src={src} alt="" sizes="180px" />
            </div>
            <motion.div className="grid place-items-center bg-[color:var(--tv-tint)] px-3 text-[color:var(--tv-forest)]" style={{ perspective: 800 }} {...presets.flipX}>
              <p className="t-eyebrow !text-[color:var(--tv-forest)]">
                {a}
                <br />
                {b}
              </p>
            </motion.div>
          </motion.article>
        ))}
      </div>
      {figures.length ? (
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {figures.map(([value, label]) => (
            <div key={label}>
              <p className="t-stat">{value}</p>
              <p className="t-body mt-2">{label}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="t-meta mt-16 text-[color:var(--tv-ink-60)]">No live totals yet. Counts appear after the agent syncs.</p>
      )}
    </section>
  );
}

function Formats() {
  const cards = [
    ["AI video", "/work", shots.services[0]],
    ["Web3", "/projects", shots.services[1]],
    ["Contests", "/contests", shots.services[2]],
    ["Collabs", "/contact", shots.services[3]],
  ] as const;
  return (
    <section id="formats" style={{ marginTop: "var(--section-gap)" }}>
      <TitleBlock eyebrow="AI-native" title="Formats" suffix="On X" left="02 Formats" right="Visuals" copy="AI films, Web3 threads, contest entries and collabs." />
      <div className="grid md:grid-cols-2">
        {cards.map(([label, href, src], index) => (
          <motion.div key={label} className={index % 2 ? "md:mt-24" : ""} {...presets.riseUp150} transition={spring(1, 0.2, index % 2 ? 0.1 : 0)}>
            <Link href={href} className="group relative block h-[72vh] overflow-hidden">
              <motion.div className="absolute inset-0" whileHover={{ scale: 1.04 }} transition={{ duration: 0.5, ease: [0.44, 0, 0.56, 1] }}>
                <Still src={src} alt={label} sizes="(max-width: 809px) 100vw, 50vw" />
              </motion.div>
              <div className="scrim pointer-events-none absolute inset-0" />
              <motion.p className="absolute inset-x-0 top-[70%] text-center text-[length:var(--t-card-title)] text-white uppercase" style={{ fontFamily: "var(--tv-font-display)" }} {...presets.flipX}>
                {label}
              </motion.p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Partners() {
  const collabs = useSite().content.collabs;
  const names = collabs.map((item) => item.name);
  return (
    <section id="collabs" className="px-6 text-center" style={{ marginTop: "var(--section-gap)" }}>
      <Split text="Collabs" mode="char" className="t-eyebrow" />
      <h2 className="t-statement mx-auto mt-8 max-w-[600px]">
        <span className="text-[color:var(--tv-accent-deep)]">Trusted by Web3 builders.</span> Films and launch stories, made with the people who ship them.
      </h2>
      {names.length ? (
        <div className="h-ticker mx-auto mt-16 max-w-[600px] overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)" }}>
          <div className="h-track gap-8" style={{ animationDuration: "40s" }}>
            {[...names, ...names].map((name, index) => (
              <span key={`${name}-${index}`} className="t-eyebrow px-4 !text-[color:var(--tv-ink)] opacity-60">
                {name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="t-meta mt-16 text-[color:var(--tv-ink-60)]">Partner names appear here once they are published.</p>
      )}
    </section>
  );
}

function Portfolio() {
  const projects = useSite().content.projects.slice(0, 4);
  return (
    <section id="work" style={{ marginTop: "var(--section-gap)" }}>
      <TitleBlock eyebrow="Featured" title="Work" suffix="Live on X" left="03 Work" right="Case studies" copy="Selected films and campaigns." />
      {projects.map((project) => (
        <WorkPanel key={project.id} project={project} />
      ))}
      <div className="py-16 text-center">
        <Link className="btn" href="/work">
          All work
        </Link>
      </div>
    </section>
  );
}

function WorkPanel({ project }: { project: Project }) {
  const href = safeXUrl(project.xUrl) || `/projects/${project.slug}`;
  const external = href.startsWith("http");
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="relative block min-h-[100svh] overflow-hidden" data-cursor="View">
      <Still src={project.cover} alt={project.name} sizes="100vw" />
      <div className="scrim absolute inset-0" />
      <div className="scrim-veil absolute inset-0" />
      <div className="absolute inset-0 grid place-items-center px-6 text-center text-white">
        <div>
          <motion.h3 className="text-[length:var(--t-card-title)] uppercase" style={{ fontFamily: "var(--tv-font-display)", fontStyle: "normal" }} {...presets.fadeUp40}>
            {project.name}
          </motion.h3>
          <div className="relative mx-auto mt-6 h-[220px] w-[160px] overflow-hidden">
            <Still src={project.cover} alt="" sizes="160px" />
          </div>
        </div>
      </div>
      <p className="t-meta absolute inset-x-6 bottom-6 flex justify-between text-white/80">
        <span>{project.date}</span>
        <span>{project.client}</span>
      </p>
    </a>
  );
}

function Proof() {
  const quotes = useSite().content.testimonials;
  if (!quotes.length) return null;
  return (
    <section id="proof" className="px-6" style={{ marginTop: "var(--section-gap)" }}>
      <TitleBlock eyebrow="Real" title="Proof" suffix="From partners" left="04 Proof" right="Results" copy="What the work did, in their words." />
      <div className="mx-auto grid max-w-6xl gap-16">
        {quotes.slice(0, 3).map((item) => (
          <article key={item.id} className="grid items-center gap-8 md:grid-cols-3">
            <div>
              <p className="t-body">Results</p>
              <p className="t-quote mt-4">{item.resultLine || item.quote}</p>
              {item.stat ? <p className="t-stat mt-6">{item.stat}</p> : null}
            </div>
            <div className="relative mx-auto h-[532px] w-full max-w-[426px]">
              <Still src={shots.gallery[0]} alt="" sizes="426px" />
            </div>
            <div>
              <p className="t-body">Review</p>
              <p className="t-quote mt-4">{item.quote}</p>
              <p className="t-body mt-6 !text-[color:var(--tv-ink)]">
                {item.name}
                {item.role ? ` · ${item.role}` : ""}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Showreel() {
  const ref = useScroll({ offset: ["start end", "end start"] });
  const reduce = useReducedMotion();
  const inset = useTransform(ref.scrollYProgress, [0.15, 0.55], ["30%", "0%"]);
  const clip = useTransform(inset, (value) => `inset(${value})`);
  return (
    <section id="reel" className="relative bg-[color:var(--tv-mint)]" style={{ marginTop: "var(--section-gap)", minHeight: reduce ? "100vh" : "180vh" }}>
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <p className="t-display pointer-events-none absolute left-[8vw] text-[color:var(--tv-accent-deep)]">Show</p>
        <p className="t-display pointer-events-none absolute right-[8vw] text-[color:var(--tv-accent-deep)]">Reel</p>
        <motion.div className="absolute inset-0" style={reduce ? undefined : { clipPath: clip }}>
          <Still src={shots.panels[4] || shots.hero} alt="Showreel still" sizes="100vw" />
          <div className="absolute inset-0 bg-[rgba(6,78,59,.25)]" />
        </motion.div>
      </div>
    </section>
  );
}

function Process() {
  const steps = useSite().content.process;
  return (
    <section id="process" className="px-6 text-center" style={{ marginTop: "var(--section-gap)" }}>
      <Split text="How I make it" mode="char" className="t-eyebrow" />
      <h2 className="t-statement mx-auto mt-8 max-w-[600px]">
        <span className="text-[color:var(--tv-accent-deep)]">From idea to timeline.</span> A creator workflow built for speed, taste and replays.
      </h2>
      <ol className="mx-auto mt-16 max-w-[600px] text-left">
        {steps.map((step, index) => (
          <motion.li key={step.id} className="grid grid-cols-[1fr_1.2fr] gap-4 border-b border-[color:var(--tv-line)] py-4 md:grid-cols-[150px_150px_1fr]" {...stairs(index)}>
            <span className="t-eyebrow hidden md:block">{step.title}</span>
            <span className="t-body">{step.kicker}</span>
            <span className="t-body text-right !text-[color:var(--tv-ink)]">{step.body}</span>
          </motion.li>
        ))}
      </ol>
      <motion.div className="mt-10" {...stairs(steps.length)}>
        <Link className="btn" href="/work">
          See the work
        </Link>
      </motion.div>
    </section>
  );
}

function Roles() {
  const projects = useSite().content.projects.slice(0, 3);
  if (!projects.length) return null;
  return (
    <section id="roles" className="px-6 text-center" style={{ marginTop: "var(--section-gap)" }}>
      <div className="relative mx-auto h-[420px] w-[320px] overflow-hidden">
        <Still src={projects[0].cover} alt={projects[0].name} sizes="320px" />
      </div>
      <p className="t-eyebrow mt-4">{projects[0].name}</p>
      <h2 className="t-display mt-6 text-[length:var(--t-display)]">
        Make them
        <br />
        replay it
      </h2>
    </section>
  );
}

function ContactBand() {
  const { settings } = useSite().content;
  const x = safeXUrl(settings.xUrl);
  const images = [...shots.gallery, ...shots.panels];
  return (
    <section id="contact" className="px-6 pb-8 text-center" style={{ marginTop: "var(--section-gap)" }}>
      <div className="relative inline-block">
        <Split text="Let's make" mode="char" className="t-eyebrow absolute -top-8 left-0" />
        <motion.h2 className="t-display" {...presets.fadeUp40}>
          Tirtavex
        </motion.h2>
        <Split text="Something people replay" mode="word" start={0.3} className="t-eyebrow absolute right-0 -bottom-10" />
      </div>
      <p className="t-body mx-auto mt-16 max-w-[320px]">DM on X, or send a brief.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {x ? (
          <a className="btn" href={x} target="_blank" rel="noopener noreferrer">
            DM on X
          </a>
        ) : null}
        {settings.email ? <CopyEmail email={settings.email} /> : null}
        <Link className="btn ghost" href="/contact">
          Send a brief
        </Link>
      </div>
      <div className="h-ticker mt-16 -mx-6 overflow-hidden">
        <div className="h-track" style={{ animationDuration: "48s" }}>
          {[...images, ...images].map((src, index) => (
            <div key={`${src}-${index}`} className="relative h-[220px] w-[280px] shrink-0 md:h-[420px] md:w-[360px]">
              <Still src={src} alt="" sizes="360px" />
            </div>
          ))}
        </div>
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
        <motion.i key={bit.id} className="pointer-events-none absolute top-0 left-1/2 h-2 w-2 rounded-full bg-[#10B981]" initial={{ opacity: 1, x: 0, y: 0 }} animate={{ opacity: 0, x: bit.x, y: bit.y }} transition={{ duration: 0.7 }} />
      ))}
    </span>
  );
}

export function WorkCard({ item, priority = false }: { item: WorkItem; priority?: boolean }) {
  const href = safeXUrl(item.xUrl);
  const body = (
    <article className="group relative aspect-[16/10] overflow-hidden">
      <motion.div className="absolute inset-0" whileHover={{ scale: 1.04 }} transition={{ duration: 0.5, ease: [0.44, 0, 0.56, 1] }}>
        <Still src={item.thumb.src} alt={item.title} sizes="(max-width: 768px) 100vw, 50vw" priority={priority} />
      </motion.div>
      <div className="scrim absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
        <p className="t-meta">{item.category.replace("-", " ")}</p>
        <h2 className="mt-2 text-[length:var(--t-card-title)] uppercase" style={{ fontFamily: "var(--tv-font-display)", fontStyle: "normal" }}>
          {item.title}
        </h2>
      </div>
    </article>
  );
  if (!href) return body;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" data-cursor="View on X" data-track="work_card_click" data-track-id={item.id} className="block">
      {body}
      <span className="sr-only">{item.title}, view on X</span>
    </a>
  );
}

export function PageFrame({ children }: { children: ReactNode }) {
  return <div className="bg-white">{children}</div>;
}
