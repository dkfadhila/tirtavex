# 013 — Hero framing on 1080p, reveal safety, redundant menu removed

- Merged: 2026-11-12 (direct to `main`)

## What changed

- **Hero image framing.** `.ed-hero-plate` / `.ed-hero-cut` were never given an `object-fit`, so the browser default (`fill`) stretched the plate to whatever the viewport shape was — that is why the subject looked squashed on tall screens and why the crop read as a hard, ugly cut. They now use `object-fit: cover` with `object-position: center 24%`, stepping to `center 16%` below 1280px and `center 0%` + `translateY(11%) scale(1.18)` below 900px. 1920x1080 shows the full crown with headroom; portrait phones get headroom without any empty band at the bottom.
- **Top scrim.** `.ed-hero::before` lays a 160px (120px mobile) gradient from `rgba(10,14,18,0.55)` to transparent so the bar and the top of the photo never fight.
- **Redundant dropdown.** Desktop already lists all seven routes inline, so `.ed-bar-toggle` is hidden at ≥900px. Journal / Projects / Terms / Privacy are now appended to the footer navigation, so nothing is orphaned when the sheet is mobile-only.
- **Loading.** Dropped `unoptimized` from the hero cutout, so both hero images go through the optimizer (45KB + 64KB at 1920 wide instead of the full source). Weighted total for a cold home load: 661KB, FCP 264ms locally.
- **"Page kadang ilang".** `Reveal` started at `opacity: 0.001` and only reached 1 via `whileInView`; if IntersectionObserver never fired, the section stayed invisible. It now also flips to visible through a 1.4s `animate` fallback and uses `amount: 0.05` instead of `0.2`. Verified 0 invisible `[data-reveal]` nodes after load.

## Rules for later checkpoints

- Any hero/large media element needs an explicit `object-fit` and `object-position`; never rely on the `fill` default.
- Never leave content dependent on a single visibility trigger — pair `whileInView` with an `animate` fallback.
- Only one navigation surface per breakpoint: inline links on desktop, sheet below 900px.

## Checked

- `npm run typecheck`, `npm test` (8/8), `npm run build` green; lint 0 errors (2 pre-existing warnings in `app/api/admin/login/route.ts`).
- Playwright at 1920x1080 (light + dark), 1536x864, 390x844: `D:/FamilyAgent/Via/generated/tirtavex-012/`. Vision checks confirm headroom, no stretch, no empty band, and no dropdown trigger on desktop.
