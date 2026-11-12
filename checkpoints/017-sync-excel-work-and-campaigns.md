# 017 — Full sync of The Cut (105) & Campaigns (10) from ai_videos_oct_now.xlsx

- Merged: 2026-11-12 (direct to `main`)

## What changed

- **Source data (`lib/videos-data.json`, wired in `lib/seed-data.ts`):**
  - Replaced `work` (The Cut) and `contests` (Campaigns) completely from `C:\Users\Administrator\Downloads\ai_videos_oct_now.xlsx` (window `2026-10-01` – `2026-11-12`), enriched 105/105 via fxtwitter for `thumbnail_url`, `videoUrl` MP4 variants, dimensions, and repost/reply/bookmark counts while keeping exact spreadsheet `Likes`, `Impressions`, `Tag`, and `Campaign` classifications.
  - **The Cut:** 105 videos total — **80** under `AI video` (`generation`) and **25** under `Motion design` (`motion`).
  - **Campaigns:** cleared stale/inaccurate entries and replaced with the exact **10** campaign rows flagged in the spreadsheet (`METECO`, `Sight`, `Swamp Fishing`, `50M Story Recast`, `Renoise Halloween`, `Cuddler Halloween`, `STIKKI`, `YESTERDAY`, `Wizstar Halloween`, `KATSEYE Four KAGE`).
  - Cleared old `work` overrides from `content/overrides.json` so the 105-item synced dataset takes effect immediately.

## Rules for later checkpoints

- `lib/videos-data.json` holds the full 105-item dataset + 10 campaigns imported into `lib/seed-data.ts` so `seed-data.ts` stays clean and maintainable.
- All 105 items include real `videoUrl` MP4s and `thumb.src` from `pbs.twimg.com`/`video.twimg.com`.

## Checked

- `npm run typecheck`, `npm run lint` (0 errors), `npm test` (8/8), and `npm run build` clean.
- Playwright + `vision_analyze` verified `/work` (80 `AI video` cards, `Top impressions` #1 = `Nyobain MUSE!` at `71K impressions · 177 likes`) and `/campaigns` (10 campaign cards sorted `Newest`).
