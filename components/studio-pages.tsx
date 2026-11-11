"use client";

import Link from "next/link";
import { compactNumber, placementLabel } from "@/lib/format";
import { safeXUrl } from "@/lib/safe-url";
import { useSite } from "./site-provider";
import { WorkCard } from "./home-view";
import { Odometer as Numbers } from "./ui";

export function WorkIndex() {
  const work = useSite().content.work;
  return (
    <article className="bg-white pt-28">
      <header className="px-6 py-16 text-center">
        <p className="text-[12px] tracking-[0.28em] text-emerald-700 uppercase">Selected posts</p>
        <h1 className="display text-[clamp(64px,10vw,140px)]">The work.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm tracking-[0.12em] text-ink-muted uppercase">Every frame opens the original post on X.</p>
      </header>
      <div className="grid gap-3 px-3 pb-3 md:grid-cols-2">
        {work.map((item) => (
          <WorkCard key={item.id} item={item} />
        ))}
      </div>
    </article>
  );
}

export function PulsePage() {
  const { stats, work, settings } = useSite().content;
  const best = work.find((item) => item.id === stats.bestPostId);
  const cells = [
    ["Impressions", stats.impressionsAll],
    ["30 days", stats.impressions30d],
    ["Likes", stats.likes],
    ["Posts", stats.posts],
    ["Followers", stats.followers],
  ] as const;
  return (
    <article className="bg-white px-6 pt-32 pb-24">
      <p className="text-center text-[12px] tracking-[0.28em] text-emerald-700 uppercase">Live pulse</p>
      <h1 className="display mt-4 text-center text-[clamp(56px,8vw,120px)]">The numbers.</h1>
      {settings.pulseLede ? <p className="mx-auto mt-4 max-w-lg text-center text-ink-muted">{settings.pulseLede}</p> : null}
      <div className="mx-auto mt-20 grid max-w-5xl gap-16 md:grid-cols-2">
        {cells.map(([label, value]) => (
          <div key={label}>
            <p className="text-[12px] tracking-[0.2em] text-ink-muted uppercase">{label}</p>
            <p className="display mt-2 text-[clamp(64px,8vw,120px)]">
              <Numbers value={value} />
            </p>
          </div>
        ))}
      </div>
      {best ? (
        <p className="mx-auto mt-16 max-w-xl text-center text-lg">
          Best post right now: {best.title}
          {best.metrics.impressions ? ` · ${compactNumber(best.metrics.impressions)} impressions` : ""}
        </p>
      ) : null}
    </article>
  );
}

export function ProgramsPage() {
  const { programs, ambassadors, work } = useSite().content;
  return (
    <article className="bg-white px-6 pt-32 pb-24 md:px-12">
      <p className="text-[12px] tracking-[0.28em] text-emerald-700 uppercase">Programs and seats</p>
      <h1 className="display mt-4 max-w-4xl text-[clamp(56px,8vw,120px)]">The long work.</h1>
      <div className="mt-20 grid gap-20">
        {programs.map((item) => (
          <section key={item.id} className="grid gap-6 border-t border-line pt-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="text-[12px] tracking-[0.18em] text-emerald-700 uppercase">{item.status}</p>
              <h2 className="display mt-3 text-5xl md:text-6xl">{item.name}</h2>
              <p className="mt-3 text-ink-muted">{[item.role, item.start, item.end].filter(Boolean).join(" · ")}</p>
            </div>
            <div className="md:col-span-7">
              <ul className="grid gap-2 text-lg">
                {item.highlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <PostLinks ids={item.postIds} work={work} />
            </div>
          </section>
        ))}
      </div>
      <h2 className="display mt-28 text-[clamp(48px,6vw,88px)]">Ambassador</h2>
      <div className="mt-10 grid gap-12">
        {ambassadors.map((item) => (
          <section key={item.id} className="grid gap-4 border-t border-line pt-8 md:grid-cols-12">
            <h3 className="display text-4xl md:col-span-5">{item.project}</h3>
            <div className="md:col-span-7">
              <p>{[item.title, item.region, item.start].filter(Boolean).join(" · ")}</p>
              <ul className="mt-3 grid gap-1">
                {item.duties.map((duty) => (
                  <li key={duty}>{duty}</li>
                ))}
              </ul>
              <PostLinks ids={item.postIds} work={work} />
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

function PostLinks({ ids, work }: { ids: string[]; work: { id: string; title: string; xUrl: string }[] }) {
  const links = ids
    .map((id) => work.find((item) => item.id === id))
    .filter((item): item is { id: string; title: string; xUrl: string } => Boolean(item))
    .map((item) => ({ ...item, href: safeXUrl(item.xUrl) }))
    .filter((item) => item.href);
  if (!links.length) return null;
  return (
    <p className="mt-4 flex flex-wrap gap-4 text-sm">
      {links.map((item) => (
        <a key={item.id} className="text-emerald-700 underline" href={item.href!} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      ))}
    </p>
  );
}

export function ContestsPage() {
  const contests = useSite().content.contests;
  return (
    <article className="bg-white px-6 pt-32 pb-24">
      <p className="text-center text-[12px] tracking-[0.28em] text-emerald-700 uppercase">AI contests</p>
      <h1 className="display mt-4 text-center text-[clamp(56px,8vw,120px)]">Placements.</h1>
      <div className="mx-auto mt-16 grid max-w-5xl gap-16">
        {contests.map((item) => {
          const href = safeXUrl(item.xUrl);
          return (
            <section key={item.id} className="border-t border-line pt-8">
              <p className="display text-6xl text-emerald-700">{placementLabel(item.placement)}</p>
              <h2 className="display-roman mt-3 text-4xl">{item.name}</h2>
              <p className="mt-2 text-ink-muted">{[item.organizer, item.date].filter(Boolean).join(" · ")}</p>
              {href ? (
                <a className="mt-4 inline-block text-emerald-700 underline" href={href} target="_blank" rel="noopener noreferrer">
                  Entry on X
                </a>
              ) : null}
            </section>
          );
        })}
      </div>
      <p className="mt-16 text-center">
        <Link className="btn" href="/projects">
          See the case studies
        </Link>
      </p>
    </article>
  );
}
