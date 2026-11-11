"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { presets, spring, stairs, textFx } from "@/lib/motion";
import { fullNumber, laneLabel, partnerRoleLabel, placementLabel } from "@/lib/format";
import { isPlaceholderEmail, safeHttpUrl, safeXUrl } from "@/lib/safe-url";
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
          {cutout ? (
            <Image src="/media/hero-cut.webp" alt={settings.heroImageAlt || "Tirta"} fill priority unoptimized className="ed-hero-plate ed-hero-cut" sizes="100vw" />
          ) : null}
        </motion.div>
        <div className="ed-hero-shade" />
        <motion.div className="ed-hero-copy" style={reduce ? undefined : { y: titleY }}>
          <p className="t-eyebrow !text-white">
            <Split text={settings.heroEyebrow || "TirtaVEX"} mode="char" hero />
          </p>
          <motion.h1 className="t-hero mt-3 text-white" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={spring(0.8, 0.2, 0.2)}>
            {title}
          </motion.h1>
          <p className="t-body mx-auto mt-4 max-w-[320px] !text-white">
            <Split text={settings.heroTagline || settings.heroLede} mode="word" />
          </p>
        </motion.div>
        <p className="t-meta absolute right-6 bottom-6 z-10 text-white">@tirtaVEX</p>
      </section>
      <NameTicker items={settings.marquee.length ? settings.marquee : settings.genres} />
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
  const shown = full ? ambassadors : ambassadors.slice(0, 3);
  return (
    <section className={full ? "ed-page ed-section" : "ed-section"} id="partners">
      <div className="ed-wrap">
        <div className="px-2 text-center">
          <Split text="Partners" mode="char" className="t-eyebrow" />
          <h2 className="t-statement mx-auto mt-8 max-w-[18ch]">
            <span className="text-[color:var(--tv-accent-deep)]">Ambassador seats.</span> Creator partners and collaborations, labeled until the real projects are in.
          </h2>
          <p className="t-body mx-auto mt-10 max-w-[340px]">{settings.partnersLede}</p>
          {shown.length ? (
            <div className="h-ticker mx-auto mt-12 max-w-[720px] overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)" }}>
              <div className="h-track gap-10" style={{ animationDuration: "36s" }}>
                {[...shown, ...shown].map((item, index) => (
                  <span key={`${item.id}-${index}`} className="t-eyebrow px-4 !text-[color:var(--tv-ink)] opacity-70">
                    {item.project}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {full ? null : (
            <Link className="t-meta mt-8 inline-block text-[color:var(--tv-accent-deep)]" href="/partners">
              All partners
            </Link>
          )}
        </div>
        <div className="ed-grid three">
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
  const overall = stats.platforms.find((row) => row.platform === "overall");
  const rest = stats.platforms.filter((row) => row.platform !== "overall");
  const engagement = overall?.engagement ?? stats.engagement;
  const likes = overall?.likes ?? stats.likes;
  const videos = overall?.videos ?? stats.videos;
  const placeholder = overall?.placeholder ?? stats.placeholder;
  return (
    <section className={full ? "ed-page ed-section" : "ed-section"} id="stats">
      <div className="ed-wrap">
        <TitleBlock eyebrow="Numbers" title={settings.statsTitle || "Engagement"} suffix="By platform" copy={settings.statsLede} href={full ? undefined : "/stats"} more="By platform" as={full ? "h1" : "h2"} />
        {placeholder ? <p className="ed-ph">Placeholder</p> : null}
        <div className="ed-stats" style={{ marginTop: "1.5rem" }}>
          <Stat value={engagement} label="Total engagement" placeholder={placeholder} />
          <Stat value={likes} label="Likes" placeholder={placeholder} />
          <Stat value={videos} label="Videos published" placeholder={placeholder} />
        </div>
        <div className="ed-platforms">
          {rest.map((row) => (
            <article key={row.platform} className="ed-platform">
              <strong>{row.label}</strong>
              {row.handle ? <span>@{row.handle.replace(/^@/, "")}</span> : null}
              {full ? (
                <div className="ed-stats" style={{ marginTop: "0.8rem" }}>
                  <Stat value={row.engagement} label="Engagement" placeholder={row.placeholder} compact />
                  <Stat value={row.likes} label="Likes" placeholder={row.placeholder} compact />
                  <Stat value={row.videos} label="Videos" placeholder={row.placeholder} compact />
                </div>
              ) : (
                <span>{row.placeholder ? "Placeholder totals" : `${fullNumber(row.videos)} videos`}</span>
              )}
              {row.url && !row.placeholder ? (
                <a className="ed-link" href={row.url} target="_blank" rel="noopener noreferrer">
                  Profile
                </a>
              ) : null}
            </article>
          ))}
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
    <section className={full ? "ed-page ed-section" : "ed-section"} id="contact">
      <div className="ed-wrap">
        <TitleBlock eyebrow="Creative" title="Tirtavex" suffix="Open DMs" copy={settings.contactLede} as={full ? "h1" : "h2"} />
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
        {suffix ? <Split text={suffix} mode="char" start={0.3} className="t-eyebrow absolute right-0 -bottom-8" /> : null}
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

function NameTicker({ items }: { items: string[] }) {
  const loop = [...items, ...items];
  return (
    <div className="h-ticker overflow-hidden border-y border-[color:var(--tv-line)]" style={{ maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}>
      <div className="h-track gap-10 py-4" style={{ animationDuration: "32s" }}>
        {loop.map((item, index) => (
          <span key={`${item}-${index}`} className="t-eyebrow px-2 !text-[color:var(--tv-ink)]">
            {item}
          </span>
        ))}
      </div>
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
  const x = item.placeholder ? null : safeXUrl(item.xUrl);
  const video = safeHttpUrl(item.videoUrl);
  return (
    <article className="ed-card">
      <div className="ed-media">
        {video ? <video controls playsInline preload="metadata" poster={item.thumb.src || undefined} src={video} /> : null}
        {!video && item.thumb.src ? <StillImage src={item.thumb.src} alt="" sizes="(min-width: 800px) 50vw, 100vw" fill /> : null}
        {!video && !item.thumb.src ? <span>{item.placeholder ? "Placeholder" : laneLabel(item.lane)}</span> : null}
      </div>
      <p className="ed-kicker">{laneLabel(item.lane)}</p>
      <h3>{item.title}</h3>
      {item.placeholder ? <span className="ed-ph">Placeholder</span> : null}
      {item.note && !item.placeholder ? <p>{item.note}</p> : null}
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
        {item.placeholder ? <span className="ed-ph">Placeholder</span> : null}
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
  const logo = safeHttpUrl(item.logo);
  return (
    <article className="ed-partner">
      <div className="ed-logo">
        {logo ? <StillImage src={logo} alt="" sizes="64px" width={64} height={64} /> : <span>Ph</span>}
      </div>
      <p className="ed-kicker">{partnerRoleLabel(item.roleType)}</p>
      <h3>{item.project}</h3>
      {item.placeholder ? <span className="ed-ph">Placeholder</span> : null}
      {item.summary ? <p>{item.summary}</p> : null}
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

function Stat({ value, label, placeholder, compact = false }: { value: number; label: string; placeholder: boolean; compact?: boolean }) {
  return (
    <div>
      <CountUp value={value} placeholder={placeholder} compact={compact} />
      <p className="ed-stat-label">{label}</p>
    </div>
  );
}

function CountUp({ value, placeholder, compact }: { value: number; placeholder: boolean; compact?: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [shown, setShown] = useState(0);
  const display = placeholder ? "—" : reduce || !inView ? (reduce ? fullNumber(value) : "0") : fullNumber(Math.round(shown));
  useEffect(() => {
    if (placeholder || !inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.15,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setShown(latest),
    });
    return () => controls.stop();
  }, [inView, placeholder, reduce, value]);
  return (
    <span ref={ref} className="ed-num" style={compact ? { fontSize: "clamp(32px, 4vw, 48px)" } : undefined}>
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

