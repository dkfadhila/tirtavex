# 019 — Auto-extract video MP4, dimensions, thumbnail, and metrics when pasting X URLs

- Merged: 2026-11-12 (direct to `main`)

## What changed

- **`lib/metrics.ts` (`mediaFrom`, `pickMp4`):**
  - Replaced `thumbFrom` with `mediaFrom` to pull `thumbSrc`, highest-bitrate MP4 `videoUrl`, `thumbWidth`, `thumbHeight`, and `durationSec` directly from `fxtwitter` (`media.videos` / `media.all`) alongside `impressions`, `likes`, `reposts`, `replies`, `bookmarks`, and `postedAt`.
- **`app/api/admin/x/import/route.ts` & `lib/repository.ts`:**
  - Wired `thumb` (`src`, `w`, `h`, `durationSec`), `videoUrl`, `metrics`, `authorName`, `authorHandle`, and `postedAt` into both GitHub overrides and Postgres import flows.
- **`lib/overrides-mutate.ts`:**
  - Newly added `work` items prepend to the top of the list so new tweets appear immediately at the top of `/admin/work`.

## Checked

- `npm run typecheck`, `npm run lint` (0 errors), `npm test` (8/8), and `npm run build` clean.
- Verified `/api/admin/x/preview` with `https://x.com/tirtaVEX/status/2120737539262972159?s=20` returns `thumbSrc`, `videoUrl`, `1344x768`, `durationSec: 176.6`, and live `metrics` (`impressions: 3782, likes: 32`).
