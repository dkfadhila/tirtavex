"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { compactNumber, formatDate, placementLabel } from "@/lib/format";
import { safeHttpUrl, safeXUrl } from "@/lib/safe-url";
import type { Article, Project } from "@/lib/types";
import { useSite } from "./site-provider";
import { BriefForm } from "./contact-form";
import { CopyEmail } from "./home-view";
import { Still } from "./still";
import { Markdown, Reveal, SectionHeading, headings } from "./ui";

export function ProjectsIndex() {
  const { projects, settings } = useSite().content;
  const scopes = ["All", ...new Set(projects.flatMap((item) => item.scope))];
  const [scope, setScope] = useState("All");
  const list = projects.filter((item) => scope === "All" || item.scope.includes(scope));
  return (
    <article className="pt-32">
      <header className="wrap">
        <p className="eyebrow">Selected work</p>
        <h1 className="display mt-3 text-[clamp(64px,10vw,140px)]">The portfolio.</h1>
        <p className="mt-4 max-w-xl text-xl muted">Case studies for films that already live on X. {settings.heroLede}</p>
      </header>
      <div className="wrap mt-10 flex flex-wrap gap-2">
        {scopes.map((item) => (
          <button key={item} className={`rounded-pill px-4 py-2 text-sm ${scope === item ? "bg-emerald-700 text-white" : "bg-mint-100"}`} onClick={() => setScope(item)} aria-pressed={scope === item}>
            {item}
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-3 px-3 md:grid-cols-2">
        {list.map((item) => (
          <Link key={item.id} href={`/projects/${item.slug}`} className="group relative aspect-[16/10] overflow-hidden">
            <Still src={item.cover} alt={item.name} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 scrim" />
            <span className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
              <span className="text-[12px] tracking-[0.18em] uppercase">{[item.date, item.client].filter(Boolean).join(" · ")}</span>
              <span className="display mt-2 block text-5xl md:text-6xl">{item.name}</span>
            </span>
          </Link>
        ))}
        {list.length === 0 ? <p className="py-10">No projects in this scope yet.</p> : null}
      </div>
    </article>
  );
}

export function CaseStudy({ project }: { project: Project }) {
  const { projects } = useSite().content;
  const live = projects.find((item) => item.id === project.id) ?? project;
  const x = safeXUrl(live.xUrl);
  const site = safeHttpUrl(live.websiteUrl);
  const next = projects.find((item) => item.sortOrder > live.sortOrder) ?? projects.find((item) => item.id !== live.id);
  return (
    <article className="pt-24">
      <header className="relative min-h-[78vh] overflow-hidden">
        <Still src={live.cover} alt={live.name} sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 scrim" />
        <div className="wrap relative flex min-h-[78vh] flex-col justify-end py-16 text-white">
          <p className="text-[12px] tracking-[0.28em] uppercase">{live.industry}</p>
          <h1 className="display mt-3 text-[clamp(64px,12vw,160px)]">{live.name}</h1>
          <p className="mt-4 max-w-2xl text-xl">{live.overview}</p>
          <p className="mt-6 text-sm tracking-[0.16em] text-white/80 uppercase">{live.date}</p>
        </div>
      </header>
      <section className="section">
        <div className="wrap grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="eyebrow">Project overview</p>
            <h2 className="display mt-3 text-5xl">The problem was attention.</h2>
            <p className="mt-4">{live.challenge}</p>
            <p className="mt-4">{live.approach}</p>
          </div>
          <dl className="grid content-start gap-4 md:col-span-5">
            {[
              ["Client", live.client],
              ["Industry", live.industry],
              ["Services", live.services.join(", ")],
              ["Budget", live.budget],
              ["Stack", live.aiTech],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-line pb-3">
                <dt className="eyebrow">{label}</dt>
                <dd className="mt-1">{value}</dd>
              </div>
            ))}
            <div className="flex flex-wrap gap-3 pt-2">
              {x ? (
                <a className="btn" href={x} target="_blank" rel="noopener noreferrer" data-track="outbound_x_click" data-track-id={live.id}>
                  View on X
                </a>
              ) : null}
              {site ? (
                <a className="btn ghost" href={site} target="_blank" rel="noopener noreferrer">
                  Visit site
                </a>
              ) : null}
            </div>
          </dl>
        </div>
      </section>
      <section className="bg-mist py-16">
        <div className="wrap">
          <p className="eyebrow">Achievements</p>
          <ul className="mt-6 grid gap-3 md:grid-cols-3">
            {live.achievements.map((item) => (
              <li key={item} className="rounded-card bg-white p-5">{item}</li>
            ))}
          </ul>
          <p className="display mt-10 text-4xl">{live.outcome}</p>
        </div>
      </section>
      <div className="overflow-hidden border-y border-line py-6">
        <p className="display whitespace-nowrap text-6xl text-stroke">{Array.from({ length: 8 }, () => live.name).join("  ·  ")}</p>
      </div>
      <section className="section">
        <div className="wrap grid items-end gap-8 md:grid-cols-2">
          <div>
            <p className="eyebrow">Client review</p>
            <p className="display mt-3 text-7xl text-emerald-700">{live.reviewStat}</p>
            <p className="mt-2">{live.reviewStatLabel}</p>
          </div>
          <blockquote>
            <p className="text-2xl leading-snug">“{live.reviewQuote}”</p>
            <footer className="mt-4 text-sm muted">
              {live.reviewAuthor} · {live.reviewRole}
            </footer>
          </blockquote>
        </div>
      </section>
      {next ? (
        <Link href={`/projects/${next.slug}`} className="block bg-forest px-6 py-16 text-white">
          <p className="eyebrow text-mint-300">Next project</p>
          <p className="display text-[clamp(48px,8vw,120px)]">{next.name}</p>
        </Link>
      ) : null}
    </article>
  );
}

export function AboutView() {
  const { settings, stats, tools, contests, programs } = useSite().content;
  const wins = contests.filter((item) => item.placement === "winner").length;
  const figures = [
    stats.impressionsAll ? [compactNumber(stats.impressionsAll), "Impressions mirrored"] : null,
    stats.followers ? [compactNumber(stats.followers), "Followers on X"] : null,
    programs.length ? [String(programs.length), "Programs"] : null,
    wins ? [String(wins), "Wins"] : null,
  ].filter((row): row is [string, string] => row !== null);
  return (
    <article className="pt-28">
      <div className="wrap grid gap-8 md:grid-cols-12">
        <p className="display text-[18vw] leading-[0.8] text-mint-300 md:col-span-4" aria-hidden>
          {settings.heroTitle}
        </p>
        <div className="md:col-span-8">
          <p className="eyebrow">About</p>
          <h1 className="display mt-3 text-[clamp(48px,7vw,100px)]">One director. A live record.</h1>
          <div className="mt-6 max-w-2xl space-y-4 text-lg">
            {settings.bioLong.split("\n").filter(Boolean).map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
      <section className="section">
        <div className="wrap grid gap-4 md:grid-cols-4">
          {figures.map(([value, label]) => (
            <Reveal key={label} className="rounded-card bg-mist p-6">
              <p className="display text-6xl text-emerald-700">{value}</p>
              <p className="mt-2 text-sm muted">{label}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="wrap pb-20">
        <SectionHeading index="—" kicker="Toolkit" title="What the films are made with." />
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <span key={tool.id} className="rounded-pill border border-line px-4 py-2 text-sm">
              {tool.name}
            </span>
          ))}
        </div>
        <div className="mt-12 divide-y divide-line border-t border-line">
          {contests.map((item) => (
            <div key={item.id} className="grid gap-2 py-4 md:grid-cols-4">
              <span className="eyebrow">{item.year}</span>
              <span className="md:col-span-2">{item.name}</span>
              <span>{placementLabel(item.placement)}</span>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

export function JournalIndex() {
  const { articles, links } = useSite().content;
  const tags = ["All", ...new Set(articles.flatMap((item) => item.tags))];
  const [tag, setTag] = useState("All");
  const visible = articles.filter((item) => tag === "All" || item.tags.includes(tag));
  const pinned = visible.find((item) => item.pinned) ?? visible[0];
  const rest = visible.filter((item) => item.id !== pinned?.id);
  return (
    <article className="pt-28">
      <header className="wrap">
        <p className="eyebrow">Journal</p>
        <h1 className="display text-[clamp(56px,9vw,128px)]">Notes and links.</h1>
      </header>
      <div className="wrap mt-8 flex flex-wrap gap-2">
        {tags.map((item) => (
          <button key={item} className={`rounded-pill px-3 py-1.5 text-sm ${tag === item ? "bg-emerald-700 text-white" : "bg-mint-100"}`} onClick={() => setTag(item)}>
            {item}
          </button>
        ))}
      </div>
      {pinned ? <Feature article={pinned} /> : <p className="wrap py-10">No notes yet.</p>}
      <div className="wrap divide-y divide-line border-t border-line">
        {rest.map((item) => (
          <ArticleRow key={item.id} article={item} />
        ))}
      </div>
      <section className="section">
        <div className="wrap">
          <p className="eyebrow">Elsewhere</p>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {links
              .filter((item) => item.group === "journal" || item.group === "footer")
              .map((item) => {
                const href = safeHttpUrl(item.url);
                return href ? (
                  <li key={item.id}>
                    <a className="block rounded-card border border-line p-5 hover:bg-mint-100" href={href} target="_blank" rel="noopener noreferrer">
                      {item.label}
                    </a>
                  </li>
                ) : null;
              })}
          </ul>
        </div>
      </section>
    </article>
  );
}

function Feature({ article }: { article: Article }) {
  const href = article.kind === "link" ? safeHttpUrl(article.url) : `/journal/${article.slug}`;
  return (
    <div className="wrap my-10">
      <LinkOrA href={href} className="block rounded-hero p-8 md:p-14" style={{ background: article.coverDominant }}>
        <p className="eyebrow text-forest">{article.source || "Journal"} · {formatDate(article.publishedAt)}</p>
        <h2 className="display mt-4 text-[clamp(40px,6vw,92px)] text-forest">{article.title}</h2>
        <p className="mt-4 max-w-xl">{article.excerpt}</p>
        <p className="mt-6 font-semibold">{article.kind === "link" ? "Open link" : "Full article"}</p>
      </LinkOrA>
    </div>
  );
}

function ArticleRow({ article }: { article: Article }) {
  const href = article.kind === "link" ? safeHttpUrl(article.url) : article.slug ? `/journal/${article.slug}` : null;
  return (
    <LinkOrA href={href} className="grid gap-3 py-6 md:grid-cols-12">
      <span className="text-sm text-emerald-700 md:col-span-3">{article.tags[0] || article.kind} · {formatDate(article.publishedAt)}</span>
      <span className="font-display text-3xl md:col-span-6">{article.title}</span>
      <span className="text-sm muted md:col-span-3">{article.excerpt}</span>
    </LinkOrA>
  );
}

function LinkOrA({ href, className, children, style }: { href: string | null; className?: string; children: ReactNode; style?: CSSProperties }) {
  if (!href) return <div className={className}>{children}</div>;
  if (href.startsWith("/")) return <Link href={href} className={className} style={style}>{children}</Link>;
  return (
    <a href={href} className={className} style={style} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export function ArticleView({ article }: { article: Article }) {
  const { articles } = useSite().content;
  const live = articles.find((item) => item.id === article.id) ?? article;
  const next = articles.find((item) => item.kind === "article" && item.slug && item.id !== live.id);
  const source = safeHttpUrl(live.url);
  return (
    <article className="wrap max-w-3xl pt-32 pb-20">
      <p className="eyebrow">{live.tags.join(" · ") || "Journal"}</p>
      <h1 className="display mt-3 text-[clamp(48px,7vw,92px)]">{live.title}</h1>
      <p className="mt-4 text-sm muted">
        {formatDate(live.publishedAt)} · {live.source}
      </p>
      {source ? (
        <p className="mt-4">
          <a className="text-emerald-700 underline" href={source} target="_blank" rel="noopener noreferrer">
            Original source
          </a>
        </p>
      ) : null}
      <div className="mt-10">
        <Markdown source={live.body || live.excerpt} />
      </div>
      {next?.slug ? (
        <Link href={`/journal/${next.slug}`} className="mt-16 block rounded-card bg-mist p-6">
          <p className="eyebrow">Next</p>
          <p className="font-display text-4xl">{next.title}</p>
        </Link>
      ) : null}
    </article>
  );
}

export function ContactView() {
  const { settings } = useSite().content;
  const x = safeXUrl(settings.xUrl);
  const rows = [
    ["DM", `Message @${settings.xHandle}`, x],
    ["Email", settings.email, settings.email.includes("@") ? `mailto:${settings.email}` : null],
    ["Place", settings.location, null],
  ] as const;
  return (
    <article className="pt-28">
      <div className="wrap grid gap-12 lg:grid-cols-2">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">Contact</p>
          <h1 className="display text-[clamp(56px,8vw,110px)]">{settings.contactHeadline}</h1>
          <p className="mt-4 max-w-md text-lg muted">{settings.contactLede}</p>
          <div className="relative mt-10 hidden h-40 md:block">
            <div className="absolute top-0 left-0 h-40 w-40 rounded-full bg-emerald-500/30 blur-2xl" />
          </div>
        </div>
        <BriefForm budgets={settings.budgetOptions} />
      </div>
      <div className="mt-16 border-t border-line">
        {rows.filter(([, value]) => value).map(([label, value, href]) =>
          href ? (
            <a key={label} href={href} className="group grid border-b border-line px-6 py-8 md:grid-cols-12" target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
              <span className="eyebrow md:col-span-3">{label}</span>
              <span className="display text-4xl transition group-hover:text-emerald-700 md:col-span-9 md:text-6xl">{value}</span>
            </a>
          ) : (
            <div key={label} className="grid border-b border-line px-6 py-8 md:grid-cols-12">
              <span className="eyebrow md:col-span-3">{label}</span>
              <span className="display text-4xl md:col-span-9 md:text-6xl">{value}</span>
            </div>
          ),
        )}
      </div>
      <div className="wrap flex gap-3 py-10">
        <CopyEmail email={settings.email} />
        <button
          className="btn ghost"
          onClick={() => {
            const text = `${settings.heroTitle} (@${settings.xHandle})\n${settings.bio}\n${settings.pressNote}\n${settings.email}`;
            const blob = new Blob([text], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "tirtavex-press.txt";
            anchor.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download press kit
        </button>
      </div>
    </article>
  );
}

export function LegalView({ slug }: { slug: "terms" | "privacy" }) {
  const page = useSite().content.legal[slug];
  const toc = useMemo(() => headings(page.body), [page.body]);
  if (slug === "privacy") {
    return (
      <article className="wrap grid gap-10 pt-32 pb-20 md:grid-cols-12">
        <aside className="md:col-span-4 md:sticky md:top-28 md:self-start">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1 className="display mt-3 text-6xl">{page.title}</h1>
          <ul className="mt-6 grid gap-2 text-sm">
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.text}</a>
              </li>
            ))}
          </ul>
        </aside>
        <div className="md:col-span-8">
          <Markdown source={page.body} />
          <p className="mt-8 text-sm muted">Updated {formatDate(page.updatedAt)}</p>
        </div>
      </article>
    );
  }
  return (
    <article className="mx-auto max-w-3xl px-4 pt-32 pb-20">
      <p className="eyebrow">{page.eyebrow}</p>
      <h1 className="display mt-3 text-[clamp(56px,8vw,100px)]">{page.title}</h1>
      <div className="mt-10">
        <Markdown source={page.body} />
      </div>
      <p className="mt-8 text-sm muted">Updated {formatDate(page.updatedAt)}</p>
    </article>
  );
}

export function NotFoundView() {
  return (
    <article className="wrap flex min-h-[80vh] flex-col justify-center py-28">
      <h1 className="display text-[clamp(96px,22vw,280px)] leading-none text-stroke">Page not found</h1>
      <p className="mt-4 max-w-lg text-xl">This page drifted off the timeline. The work is still on the home reel.</p>
      <div className="mt-6 overflow-hidden">
        <p className="display whitespace-nowrap text-3xl text-emerald-700">lost frame · lost frame · lost frame · lost frame ·</p>
      </div>
      <Link className="btn mt-8 w-fit" href="/">
        Back home
      </Link>
    </article>
  );
}
