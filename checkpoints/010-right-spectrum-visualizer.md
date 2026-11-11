# 010 — Right-edge spectrum replaces the pill navbar

- PR: https://github.com/dkfadhila/tirtavex/pull/10
- Merge commit: see `git log` on `main` (PR #10)
- Merged: 2026-11-12

## What changed

- Removed the floating `.ed-nav` pill, the hamburger button, and the dropdown/fullscreen menu. Page tops are unobstructed.
- Added `components/spectrum.tsx`: a fixed, decorative canvas along the far-right edge. 1px hairlines of varying length, right-anchored, soft silver/cool-gray in dark mode and slate/charcoal in light mode (white over the hero plate), a few brighter lines with a faint glow, a gradient fade on each line and a top/bottom edge mask. It breathes slowly, shifts with scroll position and velocity, and draws one still frame under `prefers-reduced-motion`.
- Top-left now shows only a bare `Tirtavex` wordmark (home link) and a small theme-toggle icon. No pill, border, or menu. It scrolls away with the page (`.ed-corner`).
- Footer: `Navigation` still lists the seven main routes. A new `nav[aria-label="More"]` row carries Journal, Projects, Terms, Privacy, which only the old menu used to reach.
- `.top-btn` (back to top) moved left of the rail (`right: 72px` desktop, `48px` mobile).
- Dropped unused `.ed-nav*` / `.ed-menu*` CSS and `MenuGlyph`.

## Keep

- The spectrum has no labels, links, icons, or buttons, is `aria-hidden`, and `pointer-events: none`. Keep it purely visual.
- No top-right nav. This overrides checkpoint 007's "Nav sits top-right" rule. Primary navigation is the footer.
- Keep `<nav aria-label="Footer">` so every route stays reachable.
- Do not add chunky bars, thick lines, or strong glow to the spectrum.

## Still placeholder

Nothing new. Content rules from 007 and 009 are unchanged.

## Checked

- `npm run typecheck`, `npm test` (8/8), and `npm run build` passed. `npm run lint`: 0 errors; 2 existing warnings in `app/api/admin/login/route.ts`.
- Desktop 1440x900 and mobile 390x844, light and dark, on `/` (hero, scrolled) and `/about`, via headless Chrome against `next start`. Screenshots reviewed.
