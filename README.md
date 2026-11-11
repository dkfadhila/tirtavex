# TirtaVEX

Living portfolio for Tirta (@TirtaVEX). Content is stored in Postgres and edited at `/admin` or by an external agent. With `DATABASE_URL` unset, the site renders the placeholder seed and does not crash.

Production: [tirtavex.vercel.app](https://tirtavex.vercel.app). Pushes to `main` deploy on Vercel.

## Agent checkpoints

Read the newest file in `checkpoints/` before you change the site. It is the handoff from the last agent.

When your pull request merges into `main`, add the next checkpoint before you stop. One merged PR, one new file. Do not edit or delete older checkpoints.

Name it `checkpoints/NNN-short-slug.md`. `NNN` is the pull request number (`007-platform-metrics.md`). Put this in the same PR when you still can. If the PR already merged, open a follow-up that only adds the checkpoint.

Each file should say:

- PR link and merge commit
- What changed on the public site
- Decisions a later agent must keep
- What is still a placeholder
- How you checked it

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
npm run db:migrate   # apply SQL; safe to re-run. Also runs on server boot when DATABASE_URL is set.
npm run db:seed      # load the sample library. Unpublished {{tokens}} stay hidden on the public site.
npm run db:setup     # migrate + seed. Run once against a fresh Neon database.
```

The public site does not treat the sample library as live proof. Counts stay at zero, the agent heartbeat stays quiet, placeholder brands stay hidden, and example.com links are dropped until real records replace them.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | for edits | Postgres (Neon or local). Missing = read-only seed. |
| `ADMIN_PASSWORD` | for `/admin` | Login password. |
| `ADMIN_SESSION_SECRET` | for `/admin` | HMAC secret for the httpOnly session cookie. 16+ characters. |
| `AGENT_API_KEY` | for `/api/agent/*` | Bearer token for the external agent. |
| `CRON_SECRET` | for `/api/cron/refresh` | Bearer token. Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. |
| `BLOB_READ_WRITE_TOKEN` | for uploads | Vercel Blob. Missing = paste image URLs instead. |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical origin, no trailing slash. |
| `METRICS_PROVIDER` | no | `fxtwitter` (default) or `manual`. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | no | Optional Plausible domain. |
| `CONTACT_WEBHOOK_URL` | no | Optional POST target after a collab brief is stored. |

Copy `.env.example` to `.env.local`. Do not commit secrets.

Metrics use the public [FxTwitter](https://api.fxtwitter.com) / [VxTwitter](https://api.vxtwitter.com) endpoints, then Twitter oEmbed for text only. `manual` never calls out. Hobby cron runs once a day (`0 8 * * *`). The agent is the frequent refresh.

## Agent API

All routes are `POST` with `Authorization: Bearer $AGENT_API_KEY` and JSON. Adding a work item is idempotent on the normalized `xUrl`.

```bash
# Add a post. Category: ai-video | web3 | contest | collab
curl -s -X POST "$ORIGIN/api/agent/items" \
  -H "Authorization: Bearer $AGENT_API_KEY" -H "Content-Type: application/json" \
  -d '{"xUrl":"https://x.com/TirtaVEX/status/123","category":"ai-video","tags":["launch"],"pinned":false}'

# Article or link. kind: article | link. Same url is idempotent.
curl -s -X POST "$ORIGIN/api/agent/articles" \
  -H "Authorization: Bearer $AGENT_API_KEY" -H "Content-Type: application/json" \
  -d '{"kind":"link","title":"Essay","url":"https://example.com/essay","source":"Example","tags":["press"],"pinned":false,"date":"2026-11-11"}'

# Batch metrics
curl -s -X POST "$ORIGIN/api/agent/metrics" \
  -H "Authorization: Bearer $AGENT_API_KEY" -H "Content-Type: application/json" \
  -d '{"updates":[{"xUrl":"https://x.com/TirtaVEX/status/123","impressions":1000,"likes":10,"reposts":1,"replies":2,"bookmarks":0,"quotes":0}]}'

# Hide a deleted post
curl -s -X POST "$ORIGIN/api/agent/deleted" \
  -H "Authorization: Bearer $AGENT_API_KEY" -H "Content-Type: application/json" \
  -d '{"xUrl":"https://x.com/TirtaVEX/status/123"}'

# Heartbeat (drives "Agent synced … ago")
curl -s -X POST "$ORIGIN/api/agent/heartbeat" \
  -H "Authorization: Bearer $AGENT_API_KEY" -H "Content-Type: application/json" \
  -d '{"message":"ok"}'

# Live Pulse totals
curl -s -X POST "$ORIGIN/api/agent/stats" \
  -H "Authorization: Bearer $AGENT_API_KEY" -H "Content-Type: application/json" \
  -d '{"impressionsAll":100,"impressions30d":20,"likes":5,"posts":1,"followers":10,"bestPostId":"work_01"}'
```

Public reads: `GET /api/portfolio`, `GET /api/items?category=&sort=&cursor=`, `GET /api/stats`, `GET /api/stream` (SSE; the client polls every 30s if the stream drops). `POST /api/collab-brief` accepts `{ name, project, budget, link, message }` and ignores a filled `website` honeypot.

## Admin

`/admin` — password login, httpOnly cookie, rate-limited. CRUD, reorder, pin, hide, settings, legal pages, and “Add from X link”. Image upload uses Blob when `BLOB_READ_WRITE_TOKEN` is set.
