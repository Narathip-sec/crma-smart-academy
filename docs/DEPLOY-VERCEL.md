# Deploy to Vercel — Prisma Postgres + Vercel Blob

Infra/config for deploying the `web/` LIFF app to Vercel with **Prisma Postgres
(Accelerate)** as the database and **Vercel Blob** for file/image storage.

> The app still renders mock data. This sets up the deployable shell + storage
> wiring. Replacing mock reads with real Prisma queries is later (Phase 3).

## What is already wired in the repo

| File | Purpose |
|---|---|
| `web/package.json` | `build` + `postinstall` run `prisma generate --no-engine`; `db:migrate*` scripts |
| `web/src/lib/db.ts` | Prisma client extended with `withAccelerate()` |
| `web/src/lib/blob.ts` | Server-side Blob helpers (`uploadBlob`, `deleteBlob`, `listBlobs`) |
| `web/src/app/api/upload/route.ts` | Client-upload token endpoint (bypasses 4.5 MB limit) |
| `web/vercel.json` | Framework + function region `sin1` (Singapore, closest to TH) |
| `web/.env.example` | `DATABASE_URL` (prisma+postgres), `BLOB_READ_WRITE_TOKEN` |

## Prerequisites

- Vercel account.
- This project pushed to a GitHub repo (git integration deploy method).

## 1. Push to GitHub

Repo is not yet git-initialised. From the repo root
(`CRMA Smart Academy Line LIFF/`):

```bash
git init
git add .
git commit -m "chore: vercel + prisma postgres + blob infra"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

The root `.gitignore` already excludes `web/node_modules`, `web/.next`,
`web/.env*` (except `.env.example`), and `web/.vercel`.

## 2. Import the project in Vercel

1. Vercel dashboard → **Add New… → Project** → import the GitHub repo.
2. **Root Directory → set to `web`.** (Critical — the Next.js app lives in
   `web/`, not the repo root. This cannot be set via `vercel.json`.)
3. Framework preset auto-detects **Next.js**. Leave build/install commands as
   default (the `build` script already runs `prisma generate`).
4. Don't deploy yet — connect storage first (next steps), or deploy and
   redeploy after env vars land.

## 3. Create the Prisma Postgres store

1. Vercel project → **Storage → Create Database → Prisma Postgres**
   (Marketplace integration). Pick a region near Thailand (Singapore).
2. Connect it to the project. Vercel injects **`DATABASE_URL`**
   (a `prisma+postgres://…?api_key=…` string) into the project env.
3. Confirm it exists under **Settings → Environment Variables**.

## 4. Create the Blob store

1. Vercel project → **Storage → Create → Blob**.
2. Connect it to the project. Vercel injects **`BLOB_READ_WRITE_TOKEN`**.

## 5. Add the remaining env vars

> **LINE / LIFF is deferred** — not the current focus. The app has a dev-mock
> identity fallback (`src/lib/liff.ts`): with no `NEXT_PUBLIC_LIFF_ID` it skips
> LIFF init and returns a mock cadet, so the web app deploys and renders fine.
> **Skip the LINE vars for the first deploy.**

Minimum to deploy the web app now:

```
APP_BASE_URL       = https://<your-app>.vercel.app
AUTH_EMAIL_DOMAIN  = crma.ac.th
```

`DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` are added automatically by steps 3–4.
The app currently renders mock data, so `DATABASE_URL` is not even required for
the first render — but keep the store connected for the Blob upload route and
future DB work.

Add later, when wiring LINE LIFF:

```
NEXT_PUBLIC_LIFF_ID        = <from LINE Developers>      # public
LINE_CHANNEL_ID            = <server-only>
LINE_CHANNEL_SECRET        = <server-only>
LINE_CHANNEL_ACCESS_TOKEN  = <server-only>
```

## 6. Run the first migration

> Optional for the first web deploy (app uses mock data). Do this when you
> start reading/writing real DB data.

The schema (`web/prisma/schema.prisma`) needs to be pushed to the new database.
Locally, with the Prisma Postgres `DATABASE_URL` in `web/.env`:

```bash
cd web
cp .env.example .env        # then paste the real DATABASE_URL
npx prisma migrate dev --name init     # creates migration + applies it
git add prisma/migrations && git commit -m "feat: initial db migration" && git push
```

On future deploys, apply pending migrations in CI/build by adding
`prisma migrate deploy` to the build step, or run `npm run db:migrate` manually.

## 7. Deploy

Push to `main` (or click **Deploy**). Vercel runs `npm install`
(`postinstall` → `prisma generate --no-engine`) then `npm run build`.

## Local development

```bash
cd web
cp .env.example .env     # fill DATABASE_URL + BLOB_READ_WRITE_TOKEN from Vercel
npm install
npm run dev
```

Notes:
- The Prisma client is generated with `--no-engine`, so it **only** works with a
  `prisma+postgres://` URL (Accelerate over HTTP) — not a plain local Postgres.
  Use the Prisma Postgres dev URL, or `npx prisma dev` for a local PPg server.
- `onUploadCompleted` in `/api/upload` does **not** fire on `localhost` (Blob
  needs a public callback URL); it works once deployed.

## Security / PDPA reminders

- Add real auth + RBAC checks in `onBeforeGenerateToken` before allowing uploads.
- Keep `LINE_CHANNEL_SECRET` / `LINE_CHANNEL_ACCESS_TOKEN` server-only.
- Blob uploads are `public` — for ID cards / official docs, add moderation +
  partial masking (per Build Plan §7.10) before exposing URLs.
