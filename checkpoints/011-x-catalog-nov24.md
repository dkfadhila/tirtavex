# 011 — X catalog, dated stats, and two film lanes

- PR: https://github.com/dkfadhila/tirtavex/pull/11
- Branch: `cursor/x-catalog-nov24-c3ec`

## What changed

- `/` and `/stats` no longer leave platform counters at 0. The stored CMS numbers render even before the count-up animation.
- X is labeled 24 Nov 2026. Impressions 569,470, posts 418, and engagement 1.37% are the 25 Sep–24 Nov window of original posts and quotes. Followers are 1,177. TikTok and Instagram stay on the 12 Nov counts.
- The Cut tabs are AI Generated and Motion Design, with a badge on each card.
- The homepage opens on the four strongest films by impressions. The catalog page still opens on AI Generated.

## Catalog

Postgres keeps the 21 films posted after Black hole to the 5th dimension (20 Nov 2026, 21:35 WIB) through 24 Nov. Seven films from 10–20 Nov that were added on 24 Nov were removed. Older entries, including Dark fantasy 4K on 17 Nov, stay. Metrics on 42 older films were refreshed from the 24 Nov pull. Live catalog count after that delete is 140.

News, tutorials, and explainers that were clearly that kind of film were moved to Motion Design, including Lushan GPU, the ElevenLabs + Flow + HyperFrames workflow, and Geger on-chain hari ini.

## Leave for Tirta

Do not recategorize a film when the post text does not say whether the picture is a generated scene or a motion graphic. The open list is in the pull request.

## Checked

`npm run typecheck` passed. Catalog count after the deletes is 147 live films. X stats saved as 569,470 / 1,177 / 418 / 1.37%.
