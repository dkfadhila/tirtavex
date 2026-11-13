# 022 — Add GACHA: REALITY BREAK with custom poster and user-friendly Admin campaign toggle

- Merged: 2026-11-13 (direct to `main`)

## What changed

- **Added GACHA: REALITY BREAK (`lib/videos-data.json`, `public/media/gacha-reality-break.webp`):**
  - Converted the user's high-res custom poster `TapNow_1794496727961_Cover film · GACHA REALITY BREAK_1.png` to optimized WebP (`578KB`, `2560x1440`).
  - Added to **The Cut** (`work`):
    - Title: `GACHA: REALITY BREAK · AI Fusion Fes 2026 Winter`
    - URL: `https://x.com/tirtaVEX/status/2120896958500049359`
    - Thumb: `/media/gacha-reality-break.webp`
    - Video: `https://video.twimg.com/amplify_video/2120896262841192449/vid/avc1/2560x1440/WQLnGU9Ksf9lJtni.mp4?tag=29`
    - Tags: `AI Fusion Fes`, `NEO JAPONISM`, `TapNow`, `Campaign`
    - Metrics: `141 impressions`, `4 likes`
  - Added to **Campaigns** (`contests`):
    - Name: `GACHA: REALITY BREAK · NEO JAPONISM`
    - Organizer: `AI FUSION FES 2026 WINTER (TapNow)`
    - Result: `Published · 141 views`
    - Thumb: `/media/gacha-reality-break.webp`
    - Linked directly to work ID and status URL.
- **Admin `/admin/work` UX Redesign (`components/admin-app-v2.tsx`, `app/api/admin/x/import/route.ts`):**
  - Added an intuitive form for adding tweets:
    - Clear example link: `https://x.com/tirtaVEX/status/2120896958500049359`.
    - **Preview button ("Preview dari X"):** checks the tweet, shows live thumbnail, title, text, views, and verifies MP4 stream before saving.
    - **Custom Thumbnail/Poster box:** allows typing a URL or clicking an upload button for custom artwork instead of default video frame.
    - **One-click "Juga masukkan ke bagian Campaigns" checkbox:** automatically expands campaign fields (Name & Organizer) and creates entries in BOTH The Cut and Campaigns simultaneously.

## Checked

- `npm run typecheck`, `npm run lint` (0 errors), `npm test` (8/8), and `npm run build` clean.
- Verified `/work` card #1 and `/campaigns` card #1 both display GACHA: REALITY BREAK with custom poster and stream playable video.
