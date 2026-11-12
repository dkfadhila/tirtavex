# 014 — Creator Partners cards, logos, dummy cleanup, and Engagement update

- Merged: 2026-11-12 (direct to `main`, follow-up to 013)

## What changed

- **Creator Partners (`PartnerSection` + `ambassadors`):**
  - Removed the horizontal running ticker (`.h-ticker`) from Partners.
  - Updated partner names and added direct X links (`Ambassador.url` in types, Drizzle schema + `0002_partner_url.sql`, mapper, repository, and `/admin` Partners form):
    - `AZ8` → `https://x.com/AZ8official_JP` (`/media/partners/az8.png`)
    - `Cuddler` (renamed from `Cuddler.ai`) → `https://x.com/CuddlerAI` (`/media/partners/cuddler.png`)
    - `Wizstar` (renamed from `Wizstar AI`) → `https://x.com/WizstarAI` (`/media/partners/wizstar.png`)
    - Added `Video Rebirth` → `https://x.com/video_rebirth` (`/media/partners/video-rebirth.png`), covering commercial AI video production on the BACH engine.
  - Rendered all 4 partner cards in a balanced 2×2 grid (`.ed-grid.two`) with enlarged editorial serif project titles (`.ed-partner-name`, `clamp(30px, 3.2vw, 40px)`), crisp 64×64 local logos (`safeMediaUrl`), English copy, and direct `Visit on X ↗` links.
- **Placeholder removal & dummy text cleanup:**
  - Replaced all remaining `{{token}}` strings and `"Placeholder"` chips/copy across `lib/seed-data.ts`, `components/sections.tsx`, and `lib/content.ts` with clean English dummy entries ready for future `/admin` edits.
  - Changed `TitleBlock` suffix animation to word mode and boosted dark-mode `--tv-accent-deep` (`#34d399`) so emerald labels, links, and stat numbers stay crisp on dark backgrounds.
- **Engagement (`StatsSection` + `/api/stats`):**
  - Added `Updated 12 November 2026 · UTC` timestamp above the platform columns.
  - Updated X metrics to `572,936` with label `Impressions (Last 3 months)` and `117` `Video published`.
  - Standardized the third metric label to `Video published` across X, TikTok, and Instagram, while keeping X followers live-synced via `fxtwitter` (without overwriting `videos` with total tweets).

## Rules for later checkpoints

- Keep partner logos in `public/media/partners/` and validate local/remote paths via `safeMediaUrl`.
- Do not overwrite X `Video published` (`117`) with raw tweet count from live profile sync.
- Keep `Updated ... · UTC` visible on Engagement whenever platform figures are refreshed.

## Checked

- `npm run typecheck`, `npm run lint` (0 errors, 2 pre-existing warnings in `app/api/admin/login/route.ts`), `npm test` (8/8), and `npm run build` passed.
- Playwright screenshots (`1440x900` light & dark) reviewed with vision checks: 4 partner logos/titles/links clean, no running ticker or placeholder badges, dark-mode contrast fixed, and Engagement displays `Updated 12 November 2026 · UTC`, `572,936` (`Impressions (Last 3 months)`), and `117` (`Video published`).
