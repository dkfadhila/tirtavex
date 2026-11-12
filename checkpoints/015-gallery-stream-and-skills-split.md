# 015 — Projects, Campaigns gallery, The Cut inline X stream, 3-way Skills/Tools/AI, and clean Stats

- Merged: 2026-11-12 (direct to `main`, follow-up to 014)

## What changed

- **Stats / Engagement (`/stats` + `#stats`):**
  - Removed `"X impressions reflect the last 3 months; X followers refresh live."` from `statsLede`.
- **Partners suffix:**
  - Restored `"Ambassador & Creator"` as the `PartnerSection` `TitleBlock` suffix while keeping the four `Creator Partner` cards.
- **Projects (`/projects`):**
  - Replaced all 6 placeholder `/ref/...` covers with real `@tirtaVEX` video thumbnails from `pbs.twimg.com`.
- **Campaigns (`/campaigns` + `#campaigns`):**
  - Converted from a plain list into a 2-column visual gallery (`CampaignCard`) matching The Cut, backed by 6 real `@tirtaVEX` campaign/showcase posts (`BACH`, `Cuddler`, `METECO`, `Sight`, `Elysium`) with a `Newest` / `Featured order` filter (default `Newest`).
- **The Cut (`/work` + `#work`):**
  - Added `Newest` / `Top impressions` sort toggle next to the `AI video` / `Motion design` tabs.
  - Added an on-frame metrics pill (`X impressions · Y likes`) inside `.ed-media`.
  - Clicking a card thumbnail now mounts `<video controls autoPlay playsInline preload="none">` streaming the direct `video.twimg.com` MP4 on demand — zero video bytes fetched on initial page load.
- **Skills, Tools & AI (`/skills` + `#skills`):**
  - Extended `Tool.kind` to `"skill" | "tool" | "ai"` across `lib/types.ts`, `lib/map.ts`, `lib/repository.ts`, and `/admin`.
  - Split the section into 3 columns (`Skills` incl. `Pre-publish drafting`; `Tools`: DaVinci Resolve, CapCut, Remotion, HyperFrames, Canva, ElevenLabs; `AI`: ChatGPT, Claude, Grok, Seedance 2.5 & Omni 1.2, Seedream 5.5 & BACH).

## Rules for later checkpoints

- Video cards only mount `<video src="https://video.twimg.com/...">` after user click (`preload="none"`) so initial page load stays fast with just thumbnails.
- Keep `Tool.kind` supporting `"skill"`, `"tool"`, and `"ai"` in sync with `/admin`.

## Checked

- `npm run typecheck`, `npm run lint`, `npm test` (8/8), and `npm run build` clean.
- Playwright + vision verification across `/work`, `/campaigns`, `/projects`, `/skills`, `/stats`, and `/partners` (`D:/FamilyAgent/Via/generated/tirtavex-015/`), plus verified `Top impressions` sort and click-to-mount `<video>` on `/work`.
