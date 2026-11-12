# 018 — Strip small eyebrow labels, About/Cut suffixes, and Skills lede

- Merged: 2026-11-12 (direct to `main`)

## What changed

- **`components/sections.tsx` (`TitleBlock` + section headers):**
  - Made `eyebrow` optional on `TitleBlock` and removed the top-left corner eyebrow (`Indonesia`, `Featured`, `Submissions`, `Partners`, `Numbers`, `Practice`) from all section headings — keeping the `Meet me` greeting on the `Hero` only.
  - Removed `"The story"` suffix under `About` and `"Live on X"` suffix under `The Cut`.
  - Adjusted spacing in `TitleBlock` so sections without `suffix`/`copy` sit cleanly.
- **`lib/seed-data.ts`:**
  - Cleared `skillsLede` (`"Craft skills come first, followed by editing tools and the AI models used for ideas and execution."` → `""`).

## Checked

- `npm run typecheck`, `npm run lint` (0 errors), `npm test` (8/8), and `npm run build` clean.
- Playwright + `vision_analyze` (`D:/FamilyAgent/Via/generated/tirtavex-018/`) confirmed `Meet me` stays on Hero while all section corner eyebrows, `The story`, `Live on X`, and `skillsLede` are gone.
