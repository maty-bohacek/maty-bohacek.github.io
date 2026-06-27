# AI Slop in the Wild

A community-built map of AI-generated imagery and video spotted in the **real
world** — billboards, store displays, posters, menus, packaging, screens. Each
pin is a sighting with a location, a caption, and a reason it's believed to be
AI-generated.

This is a self-contained app that deploys to [Railway](https://railway.app). It
lives in the `slop/` subdirectory of the [matybohacek.com](https://matybohacek.com)
repo but builds and runs entirely on its own — it does **not** affect the main
GitHub Pages site. It reuses the main site's design language (Charter + Inter,
the green palette) so the two feel like one family.

> The repo is public. **No secrets live in the code** — everything sensitive is
> read from environment variables you set in Railway.

## Stack

- **Next.js (App Router)** server app — server components + route handlers
- **PostgreSQL** via **Prisma**
- **Custom auth** — bcrypt password hashing, signed JWT session cookie (`jose`)
- **Leaflet + OpenStreetMap** for the map, **Nominatim** for geocoding (no API keys)
- **sharp** for image processing; uploads stored on a **Railway Volume**

## Roles

| Role | Submit | Publishes | Review others | Manage users |
| --- | --- | --- | --- | --- |
| **User** | ✅ | after review | — | — |
| **Trusted** | ✅ | immediately | — | — |
| **Reviewer** | ✅ | immediately | ✅ | — |
| **Super admin** | ✅ | immediately | ✅ | ✅ |

There is exactly **one super admin** — you. It is not created by registration;
it's reconciled on every boot from `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`.
Change the password env var and redeploy to rotate it. The super admin promotes
users to Trusted/Reviewer and can ban accounts from **Users**.

## Environment variables

See [`.env.example`](./.env.example). Required:

| Variable | What |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `SESSION_SECRET` | Long random string for signing sessions (`openssl rand -base64 48`) |
| `SUPER_ADMIN_EMAIL` | Your login email (the one super admin) |
| `SUPER_ADMIN_PASSWORD` | Your super-admin password |
| `SUPER_ADMIN_NAME` | Display name for your posts |
| `DATA_DIR` | Where uploads are stored — `/data` on Railway |
| `NEXT_PUBLIC_APP_URL` | Public URL, e.g. `https://slop.matybohacek.com` |
| `NOMINATIM_CONTACT` | A contact (your email) sent to OpenStreetMap's geocoder |

## Deploy to Railway

1. **New Project → Deploy from GitHub repo**, pick this repo.
2. In the service **Settings → Source**, set **Root Directory** to `slop`.
   (This is what keeps it separate from the main site.)
3. **Add a database:** *New → Database → PostgreSQL*.
4. **Add a Volume** to the app service, mount path **`/data`** (persists uploads
   across deploys).
5. **Variables** — set everything from the table above. For the database, you can
   reference Railway's value:
   ```
   DATABASE_URL = ${{Postgres.DATABASE_URL}}
   ```
6. Deploy. On boot the app runs `prisma db push` (creates tables) and reconciles
   the super-admin account. Build/start commands come from `package.json` and
   `railway.json` — no extra config needed.
7. **Custom domain:** service **Settings → Networking → Custom Domain** →
   `slop.matybohacek.com`, then add the shown **CNAME** at your DNS provider.
   Set `NEXT_PUBLIC_APP_URL` to match.

## Local development

```bash
cd slop
cp .env.example .env          # fill in values; DATA_DIR=./data is fine locally
npm install                   # runs `prisma generate`
npx prisma db push            # create tables in your local/dev Postgres
npm run dev                   # http://localhost:3000
```

You need a Postgres database for local dev (a free Neon/Railway/local instance
works). Uploaded files go to `./data` (gitignored).

## How it fits with the main site

- The main site is a **static export** built from the repo root and deployed to
  GitHub Pages. Its workflow only builds the root, so `slop/` is ignored there.
- This app is **not** linked from the main navigation — by design.
- Railway builds **only** `slop/` (Root Directory = `slop`).

## Notes & limits

- Uploaded **images** are re-encoded to WebP (strips EXIF/GPS for privacy, caps
  dimensions) and get a thumbnail. **Videos** (mp4/webm/mov) are transcoded with
  `ffmpeg` to a compact H.264/AAC mp4 — this **strips all metadata** (incl.
  GPS/device tags) for the same privacy reason and shrinks stored size. The
  `ffmpeg` binary ships via the `ffmpeg-static` npm package (no system install
  needed); if it's ever unavailable the original file is kept as a fallback.
- Max upload: 12 MB images, 75 MB videos (tunable in `src/lib/constants.ts`).
  Transcoded video size/quality is tunable there too (`VIDEO_MAX_DIM`, `VIDEO_CRF`).
- A sighting's location can be flagged **approximate** (when the exact spot is
  unknown); this is set on submit and editable retroactively, and shown as a hint
  on the map, cards, and detail page.
- The **super admin** can download a full database backup — a ZIP of every table
  as `database.json` plus all uploaded media — from **Backups** in the nav (or
  directly at `/api/admin/backup`).
- Geocoding uses the public Nominatim service — fine for light traffic; respect
  its usage policy.
- Rate limiting is best-effort and in-memory (per instance).
