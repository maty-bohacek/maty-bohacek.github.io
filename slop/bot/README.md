# Reddit → Slop ingestion bot (images-only MVP)

An academic-research bot that pulls flaired **r/aislop** posts, enriches each one
with a Claude vision pass (is-it-really-slop, reasoning, location inference), and
submits them to the [AI Slop in the Wild](../README.md) app as a normal **USER** —
so every import lands in the **review queue (`PENDING`)** for super-admin review.
Nothing is published automatically.

> This is a scoping-stage MVP: **images only**, and it always links back to the
> original Reddit post. Video handling is a deliberate follow-up.

## How it fits the app

The bot is glue on top of the app's existing flow. It logs in as the bot account
(`POST /api/auth/login`), then submits via the same multipart
`POST /api/submissions` the web form uses — reusing the app's media processing,
validation, and geocoding. Because the bot is a plain `USER`, submissions are
created `PENDING` and wait in `/review`.

```
r/aislop (flair filter)  →  fetch image  →  Claude vision enrichment
        │                                          │
        │                                   filter + location guess
        ▼                                          ▼
   dedup (state/seen.json)  ──────────►  POST /api/submissions  →  PENDING → you review
```

## Pipeline stages

1. **Reddit** (`reddit.ts`) — OAuth script-app auth, flair-filtered search
   (`sort=new`), images-only (videos dropped), pagination to Reddit's ~1000 cap.
2. **Media** (`media.ts`) — download + validate against the app's allowed
   image MIME types / 12 MB cap.
3. **Enrich** (`enrich.ts`) — one `claude-opus-4-8` vision call per post, output
   constrained to a schema: `isInTheWildSlop`, `confidence`, `caption`,
   `reasoning`, `modelAttribution`, `locationGuess` + specificity, `flags`.
4. **Geocode** (`geocode.ts`) — Nominatim (same backend as the app), 1 req/s.
5. **Submit** (`slop.ts`) — login + multipart submit, `sourceType=LINK`,
   `sourceUrl` = the Reddit permalink.
6. **Dedup** (`seen.ts`) — `state/seen.json`, keyed by permalink, committed back
   by the weekly Action so state persists.

**Location policy (default):** import-with-flag. If a location can't be inferred
or geocoded, the item is still imported with a flagged placeholder
(`Unknown — set during review`, `locationApproximate=true`, a `location_unknown`
flag in the reasoning footer) so the reviewer sets the real pin. Nothing is
silently dropped.

## Runtimes

| Command | What it does |
| --- | --- |
| `npm run backfill` | One-shot historical pass — both flairs to the ~1000 cap. Re-runnable (dedup). |
| `npm run weekly` | Incremental — stops once it hits a run of already-seen posts. |
| `DRY_RUN=true npm run weekly` | Enrich + geocode but **don't** submit. No bot account needed. |

## Setup

1. `cp .env.example .env` and fill it in (see the table in `.env.example`).
2. `npm install`
3. `DRY_RUN=true npm run weekly` to test end-to-end without submitting.

### Credentials you need

- **Reddit script app** — create at <https://www.reddit.com/prefs/apps> (type
  *script*) under the bot's Reddit account → `REDDIT_CLIENT_ID` / `_SECRET`;
  the account login is `REDDIT_USERNAME` / `_PASSWORD`.
- **Bot app account** — register at the app's `/register` as a plain USER →
  `SLOP_BOT_EMAIL` / `_PASSWORD`; `SLOP_API_URL` is the app's public URL.
- **Anthropic** — `ANTHROPIC_API_KEY` (vision enrichment).
- **Nominatim** — `NOMINATIM_CONTACT` (your email, per OSM policy).

## Automation

`.github/workflows/slop-import.yml` (repo root) runs `weekly` on a Monday cron
and offers a manual `backfill` / `dry_run` dispatch. Set the credentials above as
**repo secrets**. The workflow commits the updated `state/seen.json` back so
dedup survives across runs. It's independent of the GitHub Pages deploy.

## Limits & notes

- **Images only.** Video posts (`v.redd.it`) are skipped in this MVP.
- **Historical depth** is bounded by Reddit's ~1000-post listing cap per flair.
  True full history needs academic Pushshift/Reddit research access.
- **Capture date** is left null — a Reddit post date is not the capture date; the
  reviewer can set it.
- **NSFW** posts are flagged and held out of the auto pipeline.
- Everything is reviewed manually before publishing — by design.
