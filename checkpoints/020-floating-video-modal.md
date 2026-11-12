# 020 — Floating two-column video popup for The Cut and Campaigns

- Merged: 2026-11-12 (direct to `main`)

## What changed

- **`components/sections.tsx` (`VideoModal`, `WorkSection`, `CampaignSection`, `WorkCard`, `CampaignCard`):**
  - Replaced inline `<video>` swapping inside grid cards with a single centered floating dialog (`VideoModal`) that mounts only when a thumbnail is clicked (zero video bytes on initial load).
  - Desktop split layout: **left** = video player (`object-fit: contain`, auto-adapting width for vertical 9:16 vs landscape 16:9 videos), **right** = category kicker, date (`postedAt`), title, caption, tags, impressions/likes stats, and `View on X ↗` link.
  - Supports backdrop click, `✕` close button, `Escape` key close, and body scroll lock while open.
- **`app/globals.css`:**
  - Added `.ed-modal-backdrop`, `.ed-modal`, `.ed-modal.is-vertical`, `.ed-modal-media`, `.ed-modal-body`, `.ed-modal-meta`, `.ed-modal-title`, `.ed-modal-caption`, `.ed-modal-foot`, `.ed-modal-stats`, and `.ed-modal-close`.

## Checked

- `npm run typecheck`, `npm run lint` (0 errors), `npm test` (8/8), and `npm run build` clean.
- Playwright verified modal opens (`dialogCount: 1`, `vidCount: 1`), `Escape` closes it (`afterEsc: 0`), and `vision_analyze` verified both landscape and vertical popups (`D:/FamilyAgent/Via/generated/tirtavex-020/`).
