# 023 — Refresh live metrics for the 8 newest tweets

- Merged: 2026-11-13 (direct to `main`)

## What changed

- **Refreshed metrics (`lib/videos-data.json`):**
  - Updated impressions, likes, reposts, replies, and bookmarks for the 8 newest tweets from live X (`fxtwitter`):
    - `GACHA: REALITY BREAK`: 141 → 146 impressions, 4 likes.
    - `bikin film pendek 3 menit full AI`: 2,089 → 7,715 impressions, 22 → 68 likes.
    - `Belakangan ini TL rame banget`: 816 → 937 impressions, 8 → 9 likes.
    - `Stop screen-recording GIFs`: 127 → 133 impressions, 2 likes.
    - `Pakai Seedream 5.5 dan Omni 1.2`: 232 → 249 impressions, 5 likes.
    - `Told my Grok Bot`: 309 → 337 impressions, 3 likes.
    - `wkwkw masih lucu aja hasilnya gemini omni 1.2`: 74 → 79 impressions.
    - `Jensen Huang Selingkuh`: 108 → 113 impressions.
  - Synced contest card for GACHA in `contests` to reflect 146 views.

## Checked

- `npm run typecheck`, `npm run lint` (0 errors), `npm test` (8/8), and `npm run build` clean.
- Production verified.
