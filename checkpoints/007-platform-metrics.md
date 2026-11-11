# 007 — Per-platform stats, wider partners line

- PR: https://github.com/dkfadhila/tirtavex/pull/7
- Merge commit: `205b806d1846863c8987006df572ca94b25a873d`
- Merged: 2026-11-11

## What changed

The partners statement is wider. On a desktop it wraps to about three lines, roughly three to six words each:

> Ambassador seats. Creator partners  
> and collaborations, labeled  
> until the real projects are in.

Engagement no longer shows one overall total. X, TikTok, and Instagram each show impressions, followers, and videos published. Empty figures stay a dash. One placeholder chip covers the section. Admin edits those three numbers per platform. The old overall row is not shown.

## Keep

- Homepage order: hero, about, work, campaigns, partners, engagement, skills, contact.
- Nav sits top-right: theme switch, “Tirtavex”, hamburger. Hero greeting is “Meet me”. No running ticker under the hero.
- Contact icons are centered under the name. Footer kickers (“Get in touch”, “Navigation”, “About”) stay emerald.
- Placeholder content stays labeled. Do not invent real brand names, campaign results, or engagement totals.

## Still placeholder

Work, campaigns, partners, and the three platform counts are seed stand-ins until they are replaced in `/admin`.

## Checked

Typecheck, lint, and `npm test` passed. Desktop and mobile layouts were checked for the partners heading and the engagement block. CI on the PR was green before merge.
