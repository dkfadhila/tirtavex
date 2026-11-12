# 016 — User-friendly Admin + live persistence without Postgres

- Merged: 2026-11-12 (direct to `main`)

## What changed

- **Persistence without a Postgres host (`lib/overrides.ts`, `lib/overrides-mutate.ts`, `lib/content.ts`, `app/api/admin/mutate/route.ts`, `app/api/admin/x/import/route.ts`):**
  - Added GitHub-backed `content/overrides.json` storage activated when `GITHUB_TOKEN` is set in Vercel Production env (`DATABASE_URL` absent).
  - Writes commit directly to `dkfadhila/tirtavex` and call `revalidateTag("content-overrides", "max")`; public pages read fresh overrides within 30s (instant on revalidate).
  - `/admin` now runs in live writable mode (`source: "github"`, `writable: true`).
- **Redesigned `/admin` (`components/admin-app-v2.tsx`, wired in `app/admin/(panel)/layout.tsx`):**
  - **Grouped sidebar:** Home, Content (`Tweets · The Cut`, `Campaigns`, `Projects`, `Journal`, `Partners`, `Skills · Tools · AI`), Numbers, Site.
  - **Tweets manager (`/admin/work`):** 1-step `Add tweet` box (paste X status URL → server fetches text, thumb, MP4, metrics via fxtwitter), search bar, 2-column thumbnail cards with `Live/Hidden`, `Pinned`, `impressions · likes`, pill buttons (`Edit`, `Hide/Show`, `Pin/Unpin`, `↑`, `↓`, `Delete` with confirm, `Open on X ↗`).
  - **Collections & Copy & settings:** search filter, pill action buttons, grouped editor fields with image upload + preview, human-readable labels (`prettyKey`), grouped `SettingsForm`, and bottom toast confirmations.

## Rules for later checkpoints

- `GITHUB_TOKEN` is set in Vercel Production env for `tirta3/tirtavex`. Do not hardcode it in source.
- When `DATABASE_URL` is added later, `databaseUrl()` takes priority automatically over `overrides.ts`.

## Checked

- `npm run typecheck`, `npm run lint` (0 errors), `npm test` (8/8), and `npm run build` clean.
- Live E2E test of create + delete via `/api/admin/mutate` against GitHub `content/overrides.json` verified (commits added and deleted cleanly).
- Playwright + `vision_analyze` inspection of live `https://tirtavex.tech/admin`, `/admin/work`, and `/admin/settings` (`D:/FamilyAgent/Via/generated/tirtavex-016/`).
