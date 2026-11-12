"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { presets, spring, stairs, textFx } from "@/lib/motion";
import { fullNumber, laneLabel, partnerRoleLabel, placementLabel } from "@/lib/format";
import { isPlaceholderEmail, safeHttpUrl, safeMediaUrl, safeXUrl } from "@/lib/safe-url";
import type { Ambassador, Contest, Settings, Tool, WorkItem } from "@/lib/types";
import { useSite } from "./site-provider";

const LANES = [
  { id: "generation", label: "AI video" },
  { id: "motion", label: "Motion design" },
] as const;

export function Hero() {
  const { settings } = useSite().content;
  const reduce = useReducedMotion();
  const title = settings.heroTitle || "Tirta";
  const cutout = !settings.heroImage || settings.heroImage === "/media/hero.webp";
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 800], [0, 56]);
  const titleY = useTransform(scrollY, [0, 800], [0, 40]);
  return (
    <>
      <section className="ed-hero" aria-label="Intro">
        <motion.div className="absolute inset-0" style={reduce ? undefined : { y: imageY }}>
          <Image src={settings.heroImage || "/media/hero.webp"} alt="" fill priority className="ed-hero-plate" sizes="100vw" />
          {cutout ? <HeroRings reduce={Boolean(reduce)} /> : null}
          <HeroMeteors reduce={Boolean(reduce)} />
          {cutout ? (
            <Image src="/media/hero-cut.webp" alt={settings.heroImageAlt || "Tirta"} fill priority className="ed-hero-plate ed-hero-cut" sizes="100vw" />
          ) : null}
        </motion.div>
        <div className="ed-hero-shade" />
        <motion.div className="ed-hero-copy" style={reduce ? undefined : { y: titleY }}>
          <p className="t-eyebrow !text-white">
            <Split text={heroGreeting(settings.heroEyebrow)} mode="char" hero />
          </p>
          <motion.h1 className="ed-hero-name" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={spring(0.8, 0.2, 0.2)}>
            {title}
          </motion.h1>
          <p className="ed-hero-tag">
            <Split text={settings.heroTagline || settings.heroLede} mode="word" />
          </p>
        </motion.div>
      </section>
    </>
  );
}

export function AboutSection({ full = false }: { full?: boolean }) {
  const { settings, tools } = useSite().content;
  const paragraphs = (full ? `${settings.bioLong}\n\n${settings.aboutMore}` : settings.bioLong).split(/\n\n+/).map((part) => part.trim()).filter(Boolean);
  const skills = tools.filter((item) => item.kind === "skill");
  return (
    <section className={full ? "ed-page ed-section" : "ed-section"} id="about">
      <TitleBlock eyebrow={settings.aboutEyebrow || "Indonesia"} title={settings.aboutTitle || "About"} suffix="The story" copy="" href={full ? undefined : "/about"} more="Full story" as={full ? "h1" : "h2"} />
      <div className="ed-wrap ed-split">
        <div>
          <h3 className="t-statement">
            <span className="text-[color:var(--tv-accent-deep)]">I’m Tirta.</span> An AI video creator from Indonesia, with years behind the camera and a web3 storytelling background.
          </h3>
          <div className="ed-prose mt-8">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
          <ul className="ed-genres" aria-label="Genres">
            {settings.genres.map((genre, index) => (
              <motion.li key={genre} {...stairs(index)}>
                {genre}
              </motion.li>
            ))}
          </ul>
          {full ? (
            <ul className="ed-genres" aria-label="Craft">
              {skills.map((skill) => (
                <li key={skill.id}>{skill.name}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <motion.div className="ed-frame" {...presets.fadeUp40}>
          <Portrait src={settings.aboutImage || "/media/about.webp"} alt={settings.aboutImageAlt || "Portrait of Tirta"} width={1400} height={1400} />
        </motion.div>
      </div>
    </section>
  );
}

export function WorkSection({ full = false }: { full?: boolean }) {
  const { settings, work } = useSite().content;
  const [lane, setLane] = useState<(typeof LANES)[number]["id"]>("generation");
  const matched = work.filter((item) => item.lane === lane);
  const shown = full ? matched : matched.slice(0, 4);
  return (
    <section className={full ? "ed-page ed-section" : "ed-section"} id="work">
      <div className="ed-wrap">
        <TitleBlock eyebrow="Featured" title={settings.workTitle || "The Cut"} suffix="Live on X" copy={settings.workLede} href={full ? undefined : "/work"} more="All films" as={full ? "h1" : "h2"} />
        <div className="ed-tabs" role="tablist" aria-label="Work categories">
          {LANES.map((item) => (
            <button key={item.id} type="button" role="tab" className="ed-tab" aria-selected={lane === item.id} onClick={() => setLane(item.id)}>
              {item.label}
              {lane === item.id ? <TabLine /> : null}
            </button>
          ))}
        </div>
        <div className="ed-grid two">
          {shown.map((item, index) => (
            <motion.div key={item.id} {...stairs(index)}>
              <WorkCard item={item} />
            </motion.div>
          ))}
        </div>
        {shown.length === 0 ? <p className="ed-note">No {laneLabel(lane).toLowerCase()} pieces yet.</p> : null}
      </div>
    </section>
  );
}

export function CampaignSection({ full = false }: { full?: boolean }) {
  const { settings, contests } = useSite().content;
  const shown = full ? contests : contests.slice(0, 3);
  return (
    <section className={full ? "ed-page ed-section" : "ed-section"} id="campaigns">
      <div className="ed-wrap">
        <TitleBlock eyebrow="Submissions" title="Campaigns" suffix="Quests" copy={settings.campaignsLede} href={full ? undefined : "/campaigns"} more="All entries" as={full ? "h1" : "h2"} />
        <div>
          {shown.map((item, index) => (
            <motion.div key={item.id} {...stairs(index)}>
              <CampaignRow item={item} />
            </motion.div>
          ))}
        </div>
        {shown.length === 0 ? <p className="ed-note">No campaigns yet.</p> : null}
      </div>
    </section>
  );
}

export function PartnerSection({ full = false }: { full?: boolean }) {
  const { settings, ambassadors } = useSite().content;
  const shown = full ? ambassadors : ambassadors.slice(0, 4);
  return (
    <section className={full ? "ed-page ed-section" : "ed-section"} id="partners">
      <div className="ed-wrap">
        <TitleBlock
          eyebrow="Partners"
          title={settings.partnersTitle || "Partners"}
          suffix="Creator Partners"
          copy={settings.partnersLede}
          href={full ? undefined : "/partners"}
          more="All partners"
          as={full ? "h1" : "h2"}
        />
        <div className="ed-grid two mt-10">
          {shown.map((item, index) => (
            <motion.div key={item.id} {...stairs(index)}>
              <PartnerCard item={item} />
            </motion.div>
          ))}
        </div>
        {shown.length === 0 ? <p className="ed-note">No partners yet.</p> : null}
      </div>
    </section>
  );
}

export function StatsSection({ full = false }: { full?: boolean }) {
  const { settings, stats } = useSite().content;
  const [live, setLive] = useState<Record<string, { followers: number }>>({});

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const response = await fetch("/api/stats", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { platforms?: { platform: string; followers: number }[] };
        if (!alive || !Array.isArray(payload.platforms)) return;
        const next: Record<string, { followers: number }> = {};
        for (const row of payload.platforms) {
          if (row.platform === "x") next[row.platform] = { followers: row.followers };
        }
        setLive(next);
      } catch {
        /* keep static numbers */
      }
    };
    load();
    const timer = setInterval(load, 300000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const platforms = stats.platforms.filter((row) => row.platform !== "overall");
  return (
    <section className={full ? "ed-page ed-section" : "ed-section"} id="stats">
      <div className="ed-wrap">
        <TitleBlock eyebrow="Numbers" title={settings.statsTitle || "Engagement"} suffix="By platform" copy={settings.statsLede} as={full ? "h1" : "h2"} />
        <p className="ed-stats-updated">Updated 12 November 2026 · UTC</p>
        <div className="ed-platforms">
          {platforms.map((row) => {
            const profile = safeHttpUrl(row.url);
            const feed = live[row.platform];
            return (
              <article key={row.platform} className="ed-platform">
                <header className="ed-platform-head">
                  {profile ? (
                    <a href={profile} target="_blank" rel="noopener noreferrer">
                      <strong>{row.label}</strong>
                    </a>
                  ) : (
                    <strong>{row.label}</strong>
                  )}
                  {row.handle ? <span>@{row.handle.replace(/^@/, "")}</span> : null}
                </header>
                <div className="ed-platform-metrics">
                  <Stat value={row.impressions} label={row.platform === "x" ? "Impressions (Last 3 months)" : "Impressions"} />
                  <Stat value={feed ? feed.followers : row.followers} label="Followers" />
                  <Stat value={row.videos} label="Video published" />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SkillsSection({ full = false }: { full?: boolean }) {
  const { settings, tools } = useSite().content;
  const skills = tools.filter((item) => item.kind === "skill");
  const stack = tools.filter((item) => item.kind === "tool");
  const shownSkills = full ? skills : skills.slice(0, 4);
  const shownTools = full ? stack : stack.slice(0, 4);
  return (
    <section className={full ? "ed-page ed-section" : "ed-section"} id="skills">
      <div className="ed-wrap">
        <TitleBlock eyebrow="Practice" title="Skills" suffix="And tools" copy={settings.skillsLede} href={full ? undefined : "/skills"} more="Full list" as={full ? "h1" : "h2"} />
        <div className="ed-two">
          <div>
            <p className="ed-kicker">Skills</p>
            {shownSkills.map((item, index) => (
              <motion.div key={item.id} {...stairs(index)}>
                <SkillRow item={item} full={full} />
              </motion.div>
            ))}
          </div>
          <div>
            <p className="ed-kicker">Tools</p>
            {shownTools.map((item, index) => (
              <motion.div key={item.id} {...stairs(index)}>
                <SkillRow item={item} full={full} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactSection({ full = false }: { full?: boolean }) {
  const { settings } = useSite().content;
  const links = contactLinks(settings);
  return (
    <section className={full ? "ed-page ed-section contact-band" : "ed-section contact-band"} id="contact">
      <div className="ed-wrap contact-lock">
        {full ? <h1 className="t-display">Tirtavex</h1> : <h2 className="t-display">Tirtavex</h2>}
        <p className="t-body foot-copy">{settings.contactLede}</p>
        <div className="ed-contact">
          {links.map((item, index) => (
            <motion.a
              key={item.label}
              className="ed-icon-btn"
              href={item.href}
              aria-label={item.aria}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              initial={false}
              whileHover={{ scale: 1.08, backgroundColor: "#10B981", color: "#ffffff", borderColor: "#10B981" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.2, delay: index * 0.04 }}
            >
              <ContactIcon name={item.label} />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

function heroGreeting(value: string) {
  if (!value || /tirtavex/i.test(value)) return "Meet me";
  return value;
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

function TitleBlock({
  eyebrow,
  title,
  suffix,
  copy,
  href,
  more,
  as = "h2",
}: {
  eyebrow: string;
  title: string;
  suffix?: string;
  copy?: string;
  href?: string;
  more?: string;
  as?: "h1" | "h2";
}) {
  const Title = as;
  return (
    <div className="relative px-4 py-8 text-center">
      <div className="relative mx-auto inline-block max-w-full">
        <Split text={eyebrow} mode="char" className="t-eyebrow absolute -top-8 left-0" />
        <Title className="t-display text-[color:var(--tv-ink)]">
          <motion.span className="inline-block" {...presets.fadeUp40}>
            {title}
          </motion.span>
        </Title>
        {suffix ? <Split text={suffix} mode="word" start={0.2} className="t-eyebrow absolute right-0 -bottom-8" /> : null}
      </div>
      {copy ? (
        <motion.p className="t-body mx-auto mt-16 max-w-[340px]" {...presets.fadeUp20}>
          {copy}
        </motion.p>
      ) : null}
      {href && more ? (
        <Link className="t-meta mt-6 inline-block text-[color:var(--tv-accent-deep)]" href={href}>
          {more}
        </Link>
      ) : null}
    </div>
  );
}

function HeroMeteors({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  const drops = [
    { side: "left", x: "6%", delay: 0, duration: 3.4 },
    { side: "left", x: "14%", delay: 1.2, duration: 2.7 },
    { side: "left", x: "22%", delay: 2.1, duration: 3.8 },
    { side: "right", x: "6%", delay: 0.5, duration: 3.1 },
    { side: "right", x: "15%", delay: 1.7, duration: 2.5 },
    { side: "right", x: "24%", delay: 2.6, duration: 3.6 },
  ];
  return (
    <div className="ed-meteors" aria-hidden>
      {drops.map((drop, index) => (
        <motion.span
          key={index}
          className="ed-meteor"
          style={{ [drop.side]: drop.x }}
          initial={{ y: "-20%", opacity: 0 }}
          animate={{ y: ["-20%", "120%"], opacity: [0, 1, 0] }}
          transition={{ duration: drop.duration, delay: drop.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

function HeroRings({ reduce }: { reduce: boolean }) {
  const sizes = [34, 50, 68, 88];
  return (
    <div className="ed-rings" aria-hidden>
      {sizes.map((size, index) => (
        <motion.span
          key={size}
          className={index % 2 ? "ed-ring dashed" : "ed-ring"}
          style={{ width: `${size}vmin`, height: `${size}vmin`, marginLeft: `${-size / 2}vmin`, marginTop: `${-size / 2}vmin` }}
          animate={reduce ? undefined : { rotate: index % 2 ? -360 : 360 }}
          transition={{ duration: 18 + index * 8, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

function TabLine() {
  const reduce = useReducedMotion();
  if (reduce) return <span className="ed-tab-line" />;
  return <motion.span layoutId="work-tab" className="ed-tab-line" transition={{ type: "spring", stiffness: 420, damping: 34 }} />;
}

function WorkCard({ item }: { item: WorkItem }) {
  const x = safeXUrl(item.xUrl);
  const video = safeHttpUrl(item.videoUrl);
  return (
    <article className="ed-card">
      <div className="ed-media">
        {video ? <video controls playsInline preload="metadata" poster={item.thumb.src || undefined} src={video} /> : null}
        {!video && item.thumb.src ? <StillImage src={item.thumb.src} alt="" sizes="(min-width: 800px) 50vw, 100vw" fill /> : null}
        {!video && !item.thumb.src ? <span>{laneLabel(item.lane)}</span> : null}
      </div>
      <p className="ed-kicker">{laneLabel(item.lane)}</p>
      <h3>{item.title}</h3>
      {item.note ? <p>{item.note}</p> : null}
      <ul className="ed-tags">
        {item.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      {x ? (
        <a className="ed-link" href={x} target="_blank" rel="noopener noreferrer">
          View on X
        </a>
      ) : null}
    </article>
  );
}

function CampaignRow({ item }: { item: Contest }) {
  const href = safeHttpUrl(item.link) || safeXUrl(item.xUrl);
  const result = item.result || placementLabel(item.placement);
  return (
    <article className="ed-row">
      <div>
        <h3>{item.name}</h3>
      </div>
      <p>{item.organizer}</p>
      <p>{item.date}</p>
      <p>
        {result || "Result not recorded"}
        {href ? (
          <>
            {" "}
            <a className="ed-link" href={href} target="_blank" rel="noopener noreferrer">
              Open
            </a>
          </>
        ) : null}
      </p>
    </article>
  );
}

function PartnerCard({ item }: { item: Ambassador }) {
  const logo = safeMediaUrl(item.logo);
  const href = safeHttpUrl(item.url);
  return (
    <article className="ed-partner">
      <div className="ed-partner-top">
        <div className="ed-logo">
          {logo ? <StillImage src={logo} alt={`${item.project} logo`} sizes="64px" width={64} height={64} /> : <span>{item.project.slice(0, 2)}</span>}
        </div>
        <div className="ed-partner-meta">
          <p className="ed-kicker">{partnerRoleLabel(item.roleType)}</p>
          <h3 className="ed-partner-name">
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {item.project}
              </a>
            ) : (
              item.project
            )}
          </h3>
        </div>
      </div>
      {item.summary ? <p className="ed-partner-copy">{item.summary}</p> : null}
      {href ? (
        <a className="ed-link ed-partner-cta" href={href} target="_blank" rel="noopener noreferrer">
          Visit on X ↗
        </a>
      ) : null}
    </article>
  );
}

function SkillRow({ item, full }: { item: Tool; full: boolean }) {
  return (
    <article className="ed-skill">
      <div className="ed-icon" aria-hidden>
        <Mark name={item.icon} logo={safeHttpUrl(item.icon)} />
      </div>
      <div>
        <h3>{item.name}</h3>
        {full && item.note ? <p>{item.note}</p> : item.group ? <p>{item.group}</p> : null}
      </div>
    </article>
  );
}

function Stat({ value, label }: { value: number; label: string; placeholder?: boolean }) {
  return (
    <div>
      <CountUp value={value} />
      <p className="ed-stat-label">{label}</p>
    </div>
  );
}

function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [shown, setShown] = useState(0);
  const display = reduce || !inView ? (reduce ? fullNumber(value) : "0") : fullNumber(Math.round(shown));
  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.15,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setShown(latest),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);
  return (
    <span ref={ref} className="ed-num">
      {display}
    </span>
  );
}

function Portrait({
  src,
  alt,
  priority = false,
  hero = false,
  width = 2000,
  height = 1128,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  hero?: boolean;
  width?: number;
  height?: number;
}) {
  if (hero) {
    return (
      <StillImage
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_20%]"
      />
    );
  }
  return <StillImage src={src} alt={alt} width={width} height={height} priority={priority} sizes="(min-width: 860px) 42vw, 100vw" className="h-auto w-full object-cover" />;
}

function StillImage({
  src,
  alt,
  sizes,
  className,
  fill,
  width,
  height,
  priority,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  if (!src.startsWith("/")) {
    return (
      // Remote posters are not rewritten by the image optimizer.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} width={width} height={height} className={className} />
    );
  }
  if (fill) {
    return <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={className} />;
  }
  return <Image src={src} alt={alt} width={width || 1200} height={height || 1200} priority={priority} sizes={sizes} className={className} />;
}

function contactLinks(settings: Settings) {
  const emailOk = Boolean(settings.email) && settings.email.includes("@") && !isPlaceholderEmail(settings.email);
  const x = safeXUrl(settings.xUrl);
  const tiktok = safeHttpUrl(settings.tiktokUrl);
  const instagram = safeHttpUrl(settings.instagramUrl);
  return [
    emailOk ? { href: `mailto:${settings.email}`, label: "Email", aria: `Email ${settings.email}`, external: false } : null,
    x ? { href: x, label: "X", aria: `Message @${settings.xHandle} on X`, external: true } : null,
    tiktok ? { href: tiktok, label: "TikTok", aria: "TikTok @0xtirta", external: true } : null,
    instagram ? { href: instagram, label: "Instagram", aria: "Instagram @0xtirta", external: true } : null,
  ].filter((item): item is { href: string; label: string; aria: string; external: boolean } => Boolean(item));
}

function ContactIcon({ name }: { name: string }) {
  if (name === "Email") return <Icon path="M3 6h18v12H3z M3 7l9 7 9-7" />;
  if (name === "TikTok") return <Icon path="M14 4v10.2a3.2 3.2 0 1 1-2.2-3.05V8.2A6.2 6.2 0 0 0 16 9.4V6.2A8 8 0 0 1 14 4z" />;
  if (name === "Instagram") return <Icon path="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z M17.4 6.6h.01" />;
  return <Icon path="M4 4l7.2 16.2 2.2-6.6L20 11.2z" />;
}

function Mark({ name, logo }: { name: string; logo: string | null }) {
  if (logo) return <StillImage src={logo} alt="" width={22} height={22} sizes="22px" className="h-[22px] w-[22px] object-contain" />;
  const paths: Record<string, string> = {
    camera: "M4 8h3l2-2h6l2 2h3v10H4z M12 10.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    lens: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
    clapper: "M4 9h16v10H4z M4 9l3-4h4l-2 4 M11 9l3-4h4l-2 4",
    cut: "M7 7a2.2 2.2 0 1 0 0 4.4A2.2 2.2 0 0 0 7 7z M7 14a2.2 2.2 0 1 0 0 4.4A2.2 2.2 0 0 0 7 14z M9 10l9-5 M9 14l9 5",
    type: "M5 18h14 M8 18l4-12 4 12 M9.5 14h5",
    spark: "M12 3l1.4 5.2L18 10l-4.6 1.8L12 17l-1.4-5.2L6 10l4.6-1.8z",
    play: "M8 6l10 6-10 6z",
    image: "M4 6h16v12H4z M4 15l4-4 3 3 3-3 6 4",
    audio: "M5 10v4 M9 7v10 M13 5v14 M17 8v8 M21 11v2",
    music: "M9 18a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z M14 16V6l6-2v10 M14 10l6-2",
    code: "M8 8l-4 4 4 4 M16 8l4 4-4 4",
    layout: "M4 5h16v14H4z M4 10h16 M10 10v9",
  };
  return <Icon path={paths[name] || paths.spark} />;
}

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={path} />
    </svg>
  );
}

