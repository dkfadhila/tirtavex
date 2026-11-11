# 009 — Real portfolio content, multi-platform engagement, and admin rate-limit bypass

- PR: https://github.com/dkfadhila/tirtavex/pull/9
- Merged: 2026-11-12

## What changed

- Replaced placeholder work items in `lib/seed-data.ts` with 8 real AI video and motion productions from `@tirtaVEX` on X (Gemini Omni 1.2 4K, Seedream 5.5 Face-Lock, Omni 1.2 Motion Fusion, Muse Ember, Meituan LongCat-2.5, etc.).
- Updated engagement metrics across platforms with real counts: X (1,074 followers, 4,233 impressions), Instagram (920 followers, 16 posts), and TikTok (`@0xtirta`).
- Updated bio and Creator Partner Program (CPP) seats: AZ8, Cuddler.ai, and Wizstar AI.
- Removed IP login rate limiting in `app/api/admin/login/route.ts` to allow direct admin access without getting locked out.

## Keep

- Keep real video metadata and verified post URLs intact.
- Keep admin login protected by password HMAC session without restrictive IP blocking.

## Checked

- `npm run typecheck` passed cleanly with zero TypeScript errors.
- `npm test` passed 8/8 tests.
