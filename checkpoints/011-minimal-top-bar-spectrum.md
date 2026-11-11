# 011 — Minimal top bar with a micro-spectrum in the title lockup

- PR: https://github.com/dkfadhila/tirtavex/pull/11
- Merged: 2026-11-12

## What changed

- The speech-bubble navbar is gone. Navigation is now a single full-width hairline top bar (`.ed-bar`), 58px desktop / 52px mobile, transparent over the hero and picking up a soft blurred tint plus a 1px bottom rule once the page scrolls past 24px.
- Spectrum mark: seven 1px horizontal hairlines of varying length (`.ed-spec`, widths 12/20/15/26/18/22/10px) are stacked and right-anchored at the far right of the bar, beside the theme and menu buttons, and breathe on a 3.6s loop. Horizontal lines, right side, held to the bar height only — never a full-height rail. They hold a single still frame under `prefers-reduced-motion`.
- Desktop (≥900px): the seven primary routes are inline on the right, 11px uppercase with wide tracking, active route at full opacity with a 1px underline.
- All breakpoints: a 40×40 theme toggle and menu button sit at the far right. The menu opens a 216px right-aligned dropdown sheet (`.ed-sheet`) with the primary routes in display serif plus Journal / Projects / Terms / Privacy in the footer row. Escape, outside click, and navigation all close it.
- Hero pages render the bar in white (`.ed-bar.on-hero`) and fall back to ink once the bar turns solid.
- Removed the old `.ed-nav*`, `.ed-menu*`, `.ed-nav-btn` and `.ed-nav-title` rules, the 46px green circular button, and the 390px pill container. `MenuGlyph` is now a 1px currentColor three-line glyph that morphs to an X.

## Keep

- One fixed top bar only. No pill, no card, no fullscreen overlay.
- The spectrum stays a short horizontal hairline stack at the right end of the bar; do not stretch it across the header or down the viewport edge.
- Every route stays reachable on every breakpoint: primary routes inline on desktop and inside the sheet everywhere, secondary routes in the sheet and in the footer.
- Do not exceed ~2px for any spectrum hairline.

## Still placeholder

Nothing new. Content rules from 007 and 009 are unchanged.

## Checked

- `npm run typecheck`, `npm test` (8/8), `npm run build` passed. `npm run lint`: 0 errors, the 2 pre-existing unused-import warnings in `app/api/admin/login/route.ts`.
- Playwright screenshots at 1440x900 and 390x844, light and dark, closed and open, top and scrolled: `D:/FamilyAgent/Via/generated/tirtavex-012/`. Reviewed with vision checks — bar reads slim, the spectrum mark is legible next to the wordmark, right-hand utilities sit on the edge, the sheet is right-aligned and does not clip.
