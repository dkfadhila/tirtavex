# 024 — Refresh Metrics button in Admin and automatic sync from X

- Merged: 2026-11-13 (direct to `main`)

## What changed

- **New Admin Refresh API (`app/api/admin/metrics/refresh/route.ts`):**
  - Added authenticated `POST /api/admin/metrics/refresh` endpoint supporting batch refresh (`limit?: number`, default 25) or single-tweet refresh (`id?: string`).
  - Calls `refreshMetricsOverrides()` when in GitHub overrides mode or `refreshLiveMetrics()` when Postgres is attached.
  - Automatically fetches updated impressions, likes, reposts, replies, bookmarks, video streams, and thumbnails from X (`fxtwitter`), then commits to `content/overrides.json` and updates matching `contests` view counts.
- **Admin `/admin/work` UI Updates (`components/admin-app-v2.tsx`):**
  - Added header action button: **🔄 Refresh Semua Impressions**.
  - Added toolbar button next to search: **🔄 Refresh Metrics**.
  - Added per-card button on every tweet: **🔄 Refresh** (allows one-click refresh for any specific video).
  - Wired live toast notification: `Berhasil memperbarui N karya dari X` and instant live state update.
- **Cron Auto-refresh (`app/api/cron/refresh/route.ts`):**
  - Updated daily cron so it also runs `refreshMetricsOverrides({ limit: 20 })` automatically when running without Postgres.

## Checked

- `npm run typecheck`, `npm run lint` (0 errors), `npm test` (8/8), and `npm run build` clean.
- Tested `/api/admin/metrics/refresh` locally: successfully refreshed tweets with live fxtwitter data and returned updated snapshot.
