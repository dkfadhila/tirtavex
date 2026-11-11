"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { Project, WorkItem } from "@/lib/types";
import { safeHttpUrl, safeXUrl } from "@/lib/safe-url";
import { stills } from "@/lib/stills";
import { useSite } from "./site-provider";
import { BriefForm } from "./contact-form";
import { Still } from "./still";
import { Magnetic, Reveal, TextReveal } from "./ui";

const shots = stills();

const TILES = [
  { src: shots.tiles[0], alt: "Floating still", className: "left-[3%] top-[18%] hidden w-[16vw] max-w-[140px] sm:block md:top-[14%]", shift: 1.6 },
  { src: shots.tiles[1], alt: "Floating still", className: "left-[2%] bottom-[16%] hidden w-[14vw] max-w-[130px] md:block", shift: -1.2 },
  { src: shots.tiles[2], alt: "Floating still", className: "right-[3%] top-[18%] hidden w-[16vw] max-w-[140px] sm:block md:top-[12%]", shift: -1.5 },
  { src: shots.tiles[3], alt: "Floating still", className: "right-[4%] top-[48%] hidden w-[14vw] max-w-[130px] md:block", shift: 1.1 },
];

const SERVICES = [
  { label: "Campaign imagery", href: "/projects", src: shots.services[0], alt: "Campaign imagery" },
  { label: "Social content", href: "/work", src: shots.services[1], alt: "Social content" },
  { label: "Product visuals", href: "/projects", src: shots.services[2], alt: "Product visual" },
  { label: "AI video", href: "/work", src: shots.services[3], alt: "AI video" },
];

const GALLERY = [
  { src: shots.gallery[0], alt: "Gallery still", className: "aspect-[3/4] md:col-span-2" },
  { src: shots.gallery[1], alt: "Gallery still", className: "aspect-video md:col-span-4" },
  { src: shots.gallery[2], alt: "Gallery still", className: "aspect-[3/4] md:col-span-2" },
  { src: shots.gallery[3], alt: "Gallery still", className: "aspect-[4/3] md:col-span-4" },
  { src: shots.gallery[4], alt: "Gallery still", className: "aspect-[3/4] md:col-span-2" },
  { src: shots.gallery[5], alt: "Gallery still", className: "aspect-video md:col-span-4" },
];

export function HomeView() {
  return (
    <>
      <Hero />
      <Why />
      <WordStrip />
      <Services />
      <Partners />
      <Portfolio />
      <Reviews />
      <Process />
      <Gallery />
      <ContactBand />
    </>
  );
}

function Hero() {
  const { settings } = useSite().content;
  const reduce = useReducedMotion();
  const headline = settings.heroHeadline || "AI video and Web3 stories that people actually watch.";
  const px = useSpring(0, { stiffness: 500, damping: 60, mass: 1 });
  const py = useSpring(0, { stiffness: 500, damping: 60, mass: 1 });
  const follow = (event: MouseEvent<HTMLElement>) => {
    if (reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left - rect.width / 2) / 18);
    py.set((event.clientY - rect.top - rect.height / 2) / 18);
  };
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#e7f3ee]" onMouseMove={follow} onMouseLeave={() => { px.set(0); py.set(0); }}>
      <motion.div
        className="absolute inset-y-0 left-1/2 w-[min(600px,86vw)] -translate-x-1/2"
        initial={reduce ? false : { opacity: 0.001, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.66, 0.01, 0.42, 0.97] }}
      >
        <Still src={shots.hero} alt="Editorial portrait" sizes="(max-width: 768px) 86vw, 600px" priority className="object-cover object-[center_20%]" />
      </motion.div>
      {TILES.map((tile, index) => (
        <FloatTile key={tile.src} tile={tile} index={index} px={px} py={py} />
      ))}
      <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center">
        <div className="w-[min(600px,86vw)] bg-gradient-to-t from-black/55 via-black/20 to-transparent px-4 pt-24 pb-16 text-center text-white md:pb-20">
        <motion.p className="text-[12px] tracking-[0.28em] uppercase" initial={reduce ? false : { opacity: 0.001, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", bounce: 0, duration: 0.4, delay: 0.3 }}>
          {settings.heroEyebrow}
        </motion.p>
        <TextReveal as="h1" text={headline} play="mount" y={50} bounce={0.2} duration={0.6} start={0.1} className="display mx-auto mt-4 max-w-full text-[clamp(36px,4.2vw,56px)] text-white" />
        {settings.heroLede ? <TextReveal text={settings.heroLede} play="mount" y={10} bounce={0} duration={0.4} start={0.45} className="mx-auto mt-5 max-w-md text-[13px] tracking-[0.14em] uppercase" /> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Magnetic>
            <Link className="btn" href="/projects">
              {settings.heroPrimaryLabel || "See the work"}
            </Link>
          </Magnetic>
          <Magnetic>
            <Link className="btn !bg-white !text-forest" href="/contact">
              {settings.heroSecondaryLabel || "Collab"}
            </Link>
          </Magnetic>
        </div>
        </div>
      </div>
      <p className="absolute bottom-6 left-6 z-10 rounded-pill bg-white/80 px-2 py-1 text-[11px] tracking-[0.22em] text-forest uppercase">Visual stories</p>
    </section>
  );
}

function FloatTile({
  tile,
  index,
  px,
  py,
}: {
  tile: (typeof TILES)[number];
  index: number;
  px: ReturnType<typeof useSpring>;
  py: ReturnType<typeof useSpring>;
}) {
  const reduce = useReducedMotion();
  const x = useTransform(px, (value) => value * tile.shift);
  const y = useTransform(py, (value) => value * tile.shift * 0.6);
  return (
    <motion.div
      className={`absolute aspect-square overflow-hidden shadow-[0_18px_40px_-24px_rgba(6,78,59,.45)] ${tile.className}`}
      style={reduce ? undefined : { x, y }}
      initial={reduce ? false : { opacity: 0.001, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.8, delay: 0.2 + index * 0.12 }}
    >
      <motion.div
        className="absolute inset-0"
        animate={reduce ? undefined : { y: [0, index % 2 ? -10 : 10, 0] }}
        transition={{ duration: 6.5 + index, repeat: Infinity, ease: [0.44, 0, 0.56, 1] }}
      >
        <Still src={tile.src} alt={tile.alt} sizes="(max-width: 768px) 28vw, 180px" />
      </motion.div>
    </motion.div>
  );
}

function Why() {
  const { settings } = useSite().content;
  return (
    <section className="bg-white px-6 py-[clamp(96px,14vh,180px)] text-center">
      <Reveal>
        <p className="text-[12px] tracking-[0.28em] text-emerald-700 uppercase">{settings.introRightKicker || "Why Tirta"}</p>
      </Reveal>
      <h2 className="mx-auto mt-6 max-w-3xl">
        <TextReveal text={settings.introRightTitle} y={50} bounce={0.2} duration={0.6} start={0.1} className="display block text-[clamp(40px,5vw,68px)] text-emerald-700" />
        <TextReveal text={settings.introLeftTitle} y={20} bounce={0.1} duration={0.5} start={0.4} className="display-roman mt-2 block text-[clamp(36px,4.6vw,60px)] text-ink" />
      </h2>
      {settings.introRightBody ? (
        <Reveal y={10} delay={0.5}>
          <p className="mx-auto mt-8 max-w-md text-[13px] tracking-[0.12em] text-ink-muted uppercase">{settings.introRightBody}</p>
        </Reveal>
      ) : null}
    </section>
  );
}

function WordStrip() {
  const words = useSite().content.settings.marquee.slice(0, 4);
  const photos = shots.strip;
  const row = words.length ? words : ["Faster", "Human", "Motion", "Brand"];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4">
      {row.map((word, index) =>
        index % 2 === 1 ? (
          <div key={word} className="grid min-h-[220px] place-items-center bg-mint-100 px-4 md:min-h-[320px]">
            <span className="display-roman text-2xl tracking-[0.18em] text-forest uppercase">{word}</span>
          </div>
        ) : (
          <div key={word} className="relative min-h-[220px] md:min-h-[320px]">
            <Still src={photos[index % photos.length]} alt="" sizes="(max-width: 768px) 50vw, 25vw" />
            <span className="absolute inset-0 grid place-items-center bg-black/15 text-sm tracking-[0.22em] text-white uppercase">{word}</span>
          </div>
        ),
      )}
    </div>
  );
}

function Services() {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2">
        {SERVICES.map((item, index) => (
          <Reveal key={item.label} y={40} bounce={0.2} duration={0.6} delay={0.075 + index * 0.08} className="relative aspect-[16/10]">
            <Link href={item.href} className="group absolute inset-0 overflow-hidden">
              <motion.div className="absolute inset-0" whileHover={{ scale: 1.04 }} transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}>
                <Still src={item.src} alt={item.alt} sizes="(max-width: 768px) 100vw, 50vw" />
              </motion.div>
              <span className="absolute inset-0 bg-black/15 transition group-hover:bg-black/25" />
              <span className="absolute inset-0 grid place-items-center px-6 text-center text-[13px] tracking-[0.28em] text-white uppercase">{item.label}</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Partners() {
  const { collabs } = useSite().content;
  return (
    <section className="bg-white px-6 py-[clamp(110px,16vh,200px)] text-center">
      <p className="text-[12px] tracking-[0.28em] text-emerald-700 uppercase">Creative partners</p>
      <h2 className="mx-auto mt-6 max-w-4xl">
        <span className="display block text-[clamp(42px,5vw,72px)] text-emerald-700">Trusted by modern teams.</span>
        <span className="display-roman mt-2 block text-[clamp(32px,4vw,52px)]">Films and launch stories, made with the people who ship them.</span>
      </h2>
      {collabs.length ? (
        <ul className="mx-auto mt-16 flex max-w-5xl flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {collabs.map((item) => (
            <li key={item.id} className="font-display text-2xl tracking-tight text-ink/70">
              {item.name}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function Portfolio() {
  const projects = useSite().content.projects.filter((item) => !item.hidden);
  return (
    <section className="bg-white">
      <div className="px-6 pt-24 pb-10 text-center md:px-12">
        <Reveal>
          <p className="text-[12px] tracking-[0.28em] text-emerald-700 uppercase">Featured collection</p>
          <TextReveal as="h2" text="Portfolio" y={50} bounce={0.2} duration={0.6} start={0.1} className="display mt-4 text-[clamp(64px,9vw,120px)]" />
          <p className="mt-4 text-sm tracking-[0.14em] text-ink-muted uppercase">Selected films and campaigns</p>
        </Reveal>
      </div>
      <div className="grid gap-3 px-3 pb-3 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectPanel key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

function ProjectPanel({ project }: { project: Project }) {
  const x = safeXUrl(project.xUrl);
  return (
    <article className="group relative aspect-[16/10] overflow-hidden bg-mist">
      <motion.div className="absolute inset-0" whileHover={{ scale: 1.04 }} transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}>
        <Still src={project.cover} alt={project.name} sizes="(max-width: 768px) 100vw, 50vw" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white md:p-10">
        <div>
          <p className="text-[12px] tracking-[0.18em] uppercase">{[project.date, project.client].filter(Boolean).join("  ·  ")}</p>
          <h3 className="display mt-2 text-5xl md:text-7xl">{project.name}</h3>
        </div>
        <div className="flex gap-3 text-sm">
          <Link className="rounded-pill bg-white px-4 py-2 text-forest" href={`/projects/${project.slug}`} aria-label={`${project.name} case study`}>
            Case
          </Link>
          {x ? (
            <a className="rounded-pill border border-white/70 px-4 py-2" href={x} target="_blank" rel="noopener noreferrer" data-cursor="View on X" aria-label={`${project.name} on X`}>
              On X
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Reviews() {
  const quotes = useSite().content.testimonials;
  if (!quotes.length) return null;
  return (
    <section className="bg-white">
      {quotes.map((item, index) => {
        const href = safeXUrl(item.sourceUrl) ?? safeHttpUrl(item.sourceUrl);
        return (
          <article key={item.id} className={`grid items-center gap-10 px-6 py-24 md:grid-cols-2 md:px-16 ${index % 2 ? "bg-[#f6fbf8]" : ""}`}>
            <div>
              {item.stat ? <p className="display text-[clamp(72px,10vw,140px)] text-emerald-700">{item.stat}</p> : null}
              {item.statLabel ? <p className="mt-2 tracking-[0.18em] text-ink-muted uppercase">{item.statLabel}</p> : null}
              {item.resultLine ? <p className="mt-6 max-w-sm text-lg">{item.resultLine}</p> : null}
            </div>
            <blockquote>
              <p className="display-roman text-[clamp(28px,3vw,44px)] leading-tight">“{item.quote}”</p>
              <footer className="mt-6 text-sm tracking-[0.14em] uppercase">
                {item.name}
                {item.role ? <span className="text-ink-muted"> · {item.role}</span> : null}
              </footer>
              {href ? (
                <a className="mt-4 inline-block text-sm text-emerald-700 underline" href={href} target="_blank" rel="noopener noreferrer">
                  Source on X
                </a>
              ) : null}
            </blockquote>
          </article>
        );
      })}
    </section>
  );
}

function Process() {
  const steps = useSite().content.process;
  return (
    <section className="bg-white px-6 py-[clamp(96px,14vh,160px)] md:px-12">
      <p className="text-center text-[12px] tracking-[0.28em] text-emerald-700 uppercase">Creative process</p>
      <h2 className="display mt-4 text-center text-[clamp(48px,6vw,88px)]">From brief to the post.</h2>
      <ol className="mx-auto mt-16 grid max-w-6xl gap-12 md:grid-cols-4">
        {steps.map((step, index) => (
          <motion.li
            key={step.id}
            initial={{ opacity: 0.001, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", bounce: 0.1, duration: 0.5, delay: 0.4 + index * 0.1 }}
          >
            <p className="text-[12px] tracking-[0.2em] text-emerald-700 uppercase">0{index + 1} {step.kicker}</p>
            <h3 className="display mt-3 text-4xl">{step.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">{step.body}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

function Gallery() {
  return (
    <section className="bg-white pb-6">
      <div className="px-6 py-16 text-center">
        <p className="text-[12px] tracking-[0.28em] text-emerald-700 uppercase">Show reel</p>
        <h2 className="display mt-3 text-[clamp(48px,7vw,100px)]">Frames people replay.</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 px-3 md:grid-cols-6">
        {GALLERY.map((shot, index) => (
          <Reveal key={shot.src} y={30} bounce={0.2} duration={0.6} delay={0.075 + (index % 3) * 0.08} className={`relative overflow-hidden ${shot.className}`}>
            <Still src={shot.src} alt={shot.alt} sizes="(max-width: 768px) 100vw, 40vw" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ContactBand() {
  const { settings } = useSite().content;
  const x = safeXUrl(settings.xUrl);
  return (
    <section className="bg-white px-6 py-[clamp(100px,14vh,180px)]" id="contact">
      <div className="mx-auto grid max-w-6xl items-start gap-16 md:grid-cols-2">
        <div>
          <p className="text-[12px] tracking-[0.28em] text-emerald-700 uppercase">Contact</p>
          <h2 className="display mt-4 text-[clamp(48px,6vw,88px)]">{settings.contactHeadline}</h2>
          {settings.contactLede ? <p className="mt-6 max-w-md text-lg text-ink-muted">{settings.contactLede}</p> : null}
          <div className="mt-8 flex flex-wrap gap-3">
            {x ? (
              <a className="btn" href={x} target="_blank" rel="noopener noreferrer" data-track="contact_click">
                DM on X
              </a>
            ) : null}
            {settings.email ? <CopyEmail email={settings.email} /> : null}
          </div>
        </div>
        <BriefForm budgets={settings.budgetOptions.length ? settings.budgetOptions : ["Not sure yet"]} />
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
        <motion.i key={bit.id} className="pointer-events-none absolute top-0 left-1/2 h-2 w-2 rounded-full bg-emerald-500" initial={{ opacity: 1, x: 0, y: 0 }} animate={{ opacity: 0, x: bit.x, y: bit.y }} transition={{ duration: 0.7 }} />
      ))}
    </span>
  );
}

export function WorkCard({ item, priority = false }: { item: WorkItem; priority?: boolean }) {
  const href = safeXUrl(item.xUrl);
  const body = (
    <article className="group relative aspect-[16/10] overflow-hidden">
      <motion.div className="absolute inset-0" whileHover={{ scale: 1.04 }} transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}>
        <Still src={item.thumb.src} alt={item.title} sizes="(max-width: 768px) 100vw, 50vw" priority={priority} />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
        <p className="text-[12px] tracking-[0.2em] uppercase">{item.category.replace("-", " ")}</p>
        <h2 className="display mt-2 text-5xl md:text-6xl">{item.title}</h2>
        {item.note ? <p className="mt-3 max-w-lg text-sm">{item.note}</p> : null}
      </div>
    </article>
  );
  if (!href) return body;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" data-cursor="View on X" data-track="work_card_click" data-track-id={item.id} className="block">
      {body}
      <span className="sr-only">Opens the original post on X</span>
    </a>
  );
}
