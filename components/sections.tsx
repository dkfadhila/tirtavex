"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
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
  return (
    <>
      <section className="ed-hero" aria-label="Intro">
        <div className="ed-stage">
          <HeroRings reduce={Boolean(reduce)} />
          {cutout ? (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 36 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: [0, -12, 0] }}
              transition={
                reduce
                  ? { duration: 0.01 }
                  : { opacity: { duration: 0.7 }, y: { duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.45 } }
              }
            >
              <Image
                src="/media/hero-cut.webp"
                alt={settings.heroImageAlt || "Tirta"}
                width={950}
                height={1011}
                priority
                className="ed-cutout"
              />
            </motion.div>
          ) : (
            <Portrait src={settings.heroImage} alt={settings.heroImageAlt || "Tirta"} priority hero />
          )}
        </div>
        <div className="ed-hero-copy">
          <motion.p className="ed-kicker" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            {settings.heroEyebrow || "TirtaVEX"}
          </motion.p>
          <h1>
            <Words text={title} />
          </h1>
          <motion.p className="ed-hero-sub" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 0.28, duration: 0.55 }}>
            TirtaVEX
          </motion.p>
          <motion.p className="ed-hero-tag" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 0.4, duration: 0.55 }}>
            {settings.heroTagline || settings.heroLede}
          </motion.p>
        </div>
        <p className="ed-watermark">@tirtaVEX</p>
      </section>
      <Marquee items={settings.marquee.length ? settings.marquee : settings.genres} />
    </>
  );
}

export function AboutSection({ full = false }: { full?: boolean }) {
  const { settings, tools } = useSite().content;
  const paragraphs = (full ? `${settings.bioLong}\n\n${settings.aboutMore}` : settings.bioLong).split(/\n\n+/).map((part) => part.trim()).filter(Boolean);
  const skills = tools.filter((item) => item.kind === "skill");
  return (
    <section className={full ? "ed-page ed-section" : "ed-section"} id="about">
      <div className="ed-wrap ed-split">
        <div>
          <SectionHead
            kicker={settings.aboutEyebrow || "About"}
            title={settings.aboutTitle || "About"}
            href={full ? undefined : "/about"}
            more="Full story"
            heading={full ? "h1" : "h2"}
          />
          <div className="ed-prose">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
          <ul className="ed-genres" aria-label="Genres">
            {settings.genres.map((genre, index) => (
              <Rise key={genre} delay={index * 0.04} as="li">
                {genre}
              </Rise>
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
        <Rise className="ed-frame" delay={0.12}>
          <Portrait src={settings.aboutImage || "/media/about.webp"} alt={settings.aboutImageAlt || "Portrait of Tirta"} width={1400} height={1400} />
        </Rise>
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
        <SectionHead
          kicker="Selected"
          title={settings.workTitle || "The Cut"}
          lede={settings.workLede}
          href={full ? undefined : "/work"}
          more="All films"
          heading={full ? "h1" : "h2"}
        />
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
            <Rise key={item.id} delay={index * 0.06}>
              <WorkCard item={item} />
            </Rise>
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
        <SectionHead
          kicker="Submissions"
          title={settings.campaignsTitle || "Campaigns & Quests"}
          lede={settings.campaignsLede}
          href={full ? undefined : "/campaigns"}
          more="All entries"
          heading={full ? "h1" : "h2"}
        />
        <div>
          {shown.map((item, index) => (
            <Rise key={item.id} delay={index * 0.05}>
              <CampaignRow item={item} />
            </Rise>
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
        <SectionHead
          kicker="With"
          title={settings.partnersTitle || "Partners"}
          lede={settings.partnersLede}
          href={full ? undefined : "/partners"}
          more="All partners"
          heading={full ? "h1" : "h2"}
        />
        <div className="ed-grid three">
          {shown.map((item, index) => (
            <Rise key={item.id} delay={index * 0.08}>
              <PartnerCard item={item} />
            </Rise>
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
        <SectionHead
          kicker="Numbers"
          title={settings.statsTitle || "Engagement"}
          lede={settings.statsLede}
          href={full ? undefined : "/stats"}
          more="By platform"
          heading={full ? "h1" : "h2"}
        />
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
        <SectionHead
          kicker="Practice"
          title={settings.skillsTitle || "Skills & tools"}
          lede={settings.skillsLede}
          href={full ? undefined : "/skills"}
          more="Full list"
          heading={full ? "h1" : "h2"}
        />
        <div className="ed-two">
          <div>
            <p className="ed-kicker">Skills</p>
            {shownSkills.map((item, index) => (
              <Rise key={item.id} delay={index * 0.05}>
                <SkillRow item={item} full={full} />
              </Rise>
            ))}
          </div>
          <div>
            <p className="ed-kicker">Tools</p>
            {shownTools.map((item, index) => (
              <Rise key={item.id} delay={index * 0.05}>
                <SkillRow item={item} full={full} />
              </Rise>
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
        <SectionHead
          kicker="Hello"
          title={settings.contactTitle || "Contact"}
          lede={full ? settings.contactLede : undefined}
          href={full ? undefined : "/contact"}
          more="Contact"
          heading={full ? "h1" : "h2"}
        />
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

function SectionHead({
  kicker,
  title,
  lede,
  href,
  more,
  heading,
}: {
  kicker: string;
  title: string;
  lede?: string;
  href?: string;
  more?: string;
  heading: "h1" | "h2";
}) {
  const Title = heading;
  return (
    <Rise className="ed-head">
      <div>
        <p className="ed-kicker">{kicker}</p>
        <Title className="ed-title">{title}</Title>
        {lede ? <p className="ed-lede">{lede}</p> : null}
      </div>
      {href && more ? (
        <Link className="ed-more" href={href}>
          {more}
        </Link>
      ) : null}
    </Rise>
  );
}

function Rise({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const Tag = as === "li" ? motion.li : motion.div;
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={reduce ? { duration: 0.01 } : { type: "spring", duration: 0.7, bounce: 0.16, delay }}
    >
      {children}
    </Tag>
  );
}

function Words({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  if (reduce) return <>{text}</>;
  return (
    <>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          style={{ display: "inline-block" }}
          initial={{ opacity: 0.001, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.7, bounce: 0.2, delay: 0.08 + index * 0.07 }}
        >
          {word}
          {index < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </>
  );
}

function HeroRings({ reduce }: { reduce: boolean }) {
  const sizes = [240, 360, 500, 660];
  return (
    <div className="ed-rings" aria-hidden>
      {sizes.map((size, index) => (
        <motion.span
          key={size}
          className={index % 2 ? "ed-ring dashed" : "ed-ring"}
          style={{ width: size, height: size, left: "50%", top: "50%", marginLeft: -size / 2, marginTop: -size / 2 }}
          animate={reduce ? undefined : { rotate: index % 2 ? -360 : 360 }}
          transition={{ duration: 18 + index * 8, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

function Marquee({ items }: { items: string[] }) {
  const reduce = useReducedMotion();
  const line = [...items, ...items, ...items, ...items];
  if (reduce) return <p className="ed-marquee-static">{items.join("  ·  ")}</p>;
  return (
    <div className="ed-marquee">
      <motion.div className="ed-marquee-track" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 32, repeat: Infinity, ease: "linear" }}>
        {line.map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </motion.div>
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

