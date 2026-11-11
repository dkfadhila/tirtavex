# 012 — Vertical navigation rail on the right edge

- Merged: 2026-11-12 (direct to `main`, follow-up to 011)

## What changed

- Primary navigation moved out of the top bar into a **fixed vertical rail on the right edge** (`.ed-rail`), vertically centred, right-aligned, ≥900px only. Links are 10px uppercase with 0.2em tracking at 0.68 opacity; each link carries a thin 1px horizontal tick (`.ed-rail-tick`, widths 16/30/22/40/26/34/20px) that breathes on a 3.8s loop, so the stack reads as a slim waveform silhouette against the edge.
- Active route sits at full opacity with its tick extended; hover/focus lifts the link to full opacity and stretches its tick.
- Top bar is now only the `Tirtavex` wordmark on the left and the theme + menu buttons on the right. It stays transparent until 24px of scroll, then takes a blurred tint and a 1px bottom rule.
- Below 900px the rail is hidden and the right-aligned sheet (`.ed-sheet`) remains the navigation surface, so every route stays reachable on mobile.
- Hero pages (`.on-hero`) render the rail in white at 0.92 opacity, weight 500, with a soft dark text-shadow so it holds up against the slate-blue plate. Legibility went from 6/10 to 8/10 in the vision check.
- Ticks are frozen under `prefers-reduced-motion`.

## Rules for later checkpoints

- The primary nav lives on the right edge, vertically. Do not move it back into a horizontal row or into a pill/card.
- Tick hairlines stay 1px, right-aligned, and confined to lead beside the labels — never a full-height rail of decoration.
- Keep the mobile sheet in sync with the rail labels.

## Checked

- `npm run typecheck`, `npm test` (8/8), `npm run build` green. Lint: 0 errors, 2 pre-existing warnings in `app/api/admin/login/route.ts`.
- Playwright at 1440x900 and 390x844, light and dark, top and scrolled: `D:/FamilyAgent/Via/generated/tirtavex-012/`. Vision checks confirm the rail reads vertically, sits in the negative space right of the subject, and does not clip.
