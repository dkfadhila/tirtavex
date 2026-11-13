# 021 — Fix video playback via no-referrer policy & remove 'motion designer' phrasing

- Merged: 2026-11-13 (direct to `main`)

## What changed

- **Video playback fix (`app/layout.tsx`):**
  - Added `referrer: "no-referrer"` to `generateMetadata()` in `app/layout.tsx`. Twitter's video CDN (`video.twimg.com`) actively blocks requests carrying an external `Referer` (403 Forbidden). Stripping the `Referer` header allows direct, unrestricted MP4 video playback in all browsers.
  - Video element in modal plays muted on mount to comply with browser autoplay security policies, allowing user unmute and control without playback being blocked.
- **Copy update (`lib/seed-data.ts`):**
  - Removed `"and motion designer"` from bio, bioLong, footer blurb, meta description, and work lede. Tirta is now consistently presented as an **AI video creator**.

## Checked

- `npm run typecheck`, `npm run lint` (0 errors), `npm test` (8/8), and `npm run build` clean.
- Verified in Playwright that clicking video modal plays smoothly without 403 (`readyState: 4`, `paused: false`, `currentTime > 0`, `duration: 176.68s`).
