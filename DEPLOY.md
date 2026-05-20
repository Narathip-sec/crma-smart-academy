# Deploy runbook — CRMA Smart Academy v1

Step-by-step from local repo to production LIFF on the official CRMA LINE OA. Each phase has a verification step — do not move to the next phase until the verifier passes.

> **Time budget:** ~3–4 hours end-to-end for a first deploy, assuming all third-party accounts (LINE Developers, Supabase, Brevo, Vercel) are reachable and the custom domain DNS is yours to edit.

---

## 0. Pre-flight (local, ~10 min)

- [ ] `corepack pnpm install --frozen-lockfile` clean from `web/`
- [ ] `corepack pnpm test:run` — 316 unit tests green
- [ ] `corepack pnpm typecheck` — no output
- [ ] `corepack pnpm build` — completes; note bundle size warnings
- [ ] Repo pushed to `origin/master`
- [ ] No populated `.env.local` / `.env.production` accidentally staged (`git status` clean)

## 1. Generate cryptographic secrets (local, ~3 min)

Run these once and store the outputs in your password manager — they are required in steps 4 and 6.

```bash
# JWT_SECRET
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"

# ENCRYPTION_KEY  (32 bytes / base64url — AES-256-GCM)
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"

# HMAC_KEY  (32 bytes / base64url — deterministic email hash)
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"

# CRON_SECRET  (32 bytes / base64url)
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

> Rotation: rotate `JWT_SECRET` invalidates every active session; rotate `ENCRYPTION_KEY` requires a re-encrypt migration over `User.emailCiphertext` + `User.totpSecret` + (future) `PFTResult.*` + `Enrollment.grade`. Coordinate rotation drills before incident.

## 2. Provision Supabase Postgres (web, ~15 min)

1. Create an organisation at https://supabase.com if you don't have one.
2. Create a new project.
   - Region: **Southeast Asia (Singapore) — `ap-southeast-1`** (matches CLAUDE.md locked stack).
   - DB password: generate fresh; store in password manager.
3. Settings → Database → Connection string. Copy two values:
   - **Connection pooling → Transaction (port 6543)** → `DATABASE_URL` (append `?pgbouncer=true&connection_limit=1`).
   - **Direct connection (port 5432)** → `DIRECT_URL`.
4. Database → Extensions → enable `pgcrypto` (planned for Phase 11 grade encryption; safe to enable now).

Verify: `corepack pnpm prisma db pull` from `web/` against `DIRECT_URL` connects without error. Don't commit `schema.prisma` changes — this is a connectivity smoke test only.

## 3. Apply Prisma migrations (local against prod DB, ~5 min)

```bash
cd web
export DIRECT_URL="postgresql://...:5432/postgres"     # from step 2
corepack pnpm prisma migrate deploy
```

Verify in Supabase Table editor: `User`, `RefreshToken`, `AuditLog`, `EmailOtp`, `Role` enum exist.

## 4. Provision LINE channels (web, ~30 min)

You need **two** channels under the same Provider in https://developers.line.biz/console/ :

### 4a. LINE Login channel
- Channel type: **LINE Login**
- App types: **Web app** + **LIFF**
- Callback URL: `https://<your-domain>/api/auth/line/callback` (set after step 7)
- OpenID Connect: **on**
- Scopes: `openid`, `profile`, `email`
- Note: **Channel ID** → `LINE_CHANNEL_ID`; **Channel secret** → `LINE_CHANNEL_SECRET`.

Add a LIFF app under the same channel:
- Size: **Full**
- Endpoint URL: `https://<your-domain>/login` (set after step 7)
- Scopes: `openid`, `profile`, `email`
- Bot link feature: **off** (Messaging API integration handled in 4b)
- Note: **LIFF ID** → `NEXT_PUBLIC_LIFF_ID`.

### 4b. Messaging API channel
- Channel type: **Messaging API**
- Note: **Channel secret** (for webhook HMAC). If you want one secret across both channels, reuse `LINE_CHANNEL_SECRET` from 4a — `LINE_CHANNEL_ACCESS_TOKEN` is still distinct.
- Channel access token (long-lived): **Issue** → `LINE_CHANNEL_ACCESS_TOKEN`.
- Webhook URL: `https://<your-domain>/api/line/webhook` (set after step 7).
- **Use webhook**: on.
- **Auto-reply messages**: off (cadets should not get LINE's default replies).
- **Greeting messages**: off (we run our own onboarding via LIFF).

## 5. Provision Brevo SMTP for OTP (web, ~10 min)

1. Sign up at https://www.brevo.com (free tier covers email OTP volume for the cadet cohort).
2. **Senders & IP** → add `no-reply@crma.ac.th` → verify DNS records (SPF + DKIM CNAMEs).
3. **SMTP & API** → **API keys** → generate v3 key → `BREVO_API_KEY`.

Verify locally: with the key in `web/.env.local`, run `corepack pnpm dev`, complete `/login` → `/enrol/email/start` with your `@crma.ac.th` address, check inbox.

## 6. Wire Vercel env vars (web, ~15 min)

1. Install Vercel CLI: `corepack pnpm dlx vercel --version`.
2. From `web/`: `vercel link` (choose the org / create a new project — name it `crma-smart-academy`).
3. Set env vars (use `--env production` for each):

```bash
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add JWT_SECRET production
vercel env add ENCRYPTION_KEY production
vercel env add HMAC_KEY production
vercel env add LINE_CHANNEL_ID production
vercel env add LINE_CHANNEL_SECRET production
vercel env add NEXT_PUBLIC_LIFF_ID production
vercel env add BREVO_API_KEY production
vercel env add LINE_CHANNEL_ACCESS_TOKEN production
vercel env add CRON_SECRET production
```

Repeat for `preview` if you want preview-deploy LIFF testing (use a separate LIFF app with the preview URL pattern as endpoint).

## 7. Deploy + custom domain (web, ~20 min)

1. `vercel --prod` from `web/` — first deploy.
2. Note the assigned `<project>.vercel.app` URL.
3. Vercel project → **Domains** → add `crma.ac.th` (or your chosen apex/subdomain). Follow the DNS instructions. CNAME / A records propagate within minutes once published.
4. Once the custom domain is live and HTTPS is green:
   - Update LINE Login callback URL → `https://crma.ac.th/api/auth/line/callback`
   - Update LIFF endpoint URL → `https://crma.ac.th/login`
   - Update Messaging API webhook URL → `https://crma.ac.th/api/line/webhook`
   - Save each in LINE Developers Console.

Verify HSTS preload eligibility at https://hstspreload.org — `Strict-Transport-Security` header (set by `lib/security-headers.ts`) should already satisfy the preload requirements. Submit when you are committed to HTTPS-forever for the apex.

## 8. Verify Vercel Cron (web, ~5 min)

Vercel project → **Settings → Cron Jobs** should list:

| Path | Schedule |
| --- | --- |
| `/api/cron/duty-reminder` | `0 22 * * *` |

This comes from `web/vercel.json`. Click **Run** to fire manually — confirm a `CRON:duty_reminder` row lands in `AuditLog` (Supabase Table editor).

## 9. End-to-end smoke test (LINE client, ~15 min)

On a phone with LINE installed:

1. Open the LIFF entry URL (LINE Developers → LIFF app → "LIFF URL").
2. LINE prompts for permission → grant.
3. App redirects to `/enrol/email/start` → enter `@crma.ac.th` address → receive OTP via Brevo → enter code on `/enrol/email/verify`.
4. App redirects to `/enrol/totp` → scan QR with Google Authenticator / 1Password → enter 6-digit code.
5. Land on Home tab. Tap through Class Schedule → Health → Activity → Service → Me.
6. Service → tap "ระบบ LMS" → LINE opens `lms.crma.ac.th/moodle/my/` in external browser.
7. Me → "ออกจากระบบ" → confirm session purge (`POST /api/me/delete`) clears cookies.
8. Repeat steps 1–4 on a **second** device — expect TOTP re-prompt at `/reverify/totp` per Phase 2e device-fp gate.

If any step fails: check Vercel Runtime Logs + Sentry (Phase 11 wires DSN); the per-step `AuditLog` row identifies the failing branch.

## 10. Post-deploy operational tasks

- [ ] Submit HSTS preload at https://hstspreload.org once you commit to HTTPS-forever.
- [ ] Configure Vercel Analytics + Sentry DSN (set `SENTRY_DSN` env, install `@sentry/nextjs` — currently deferred).
- [ ] GitHub Actions: add `pnpm typecheck` + `pnpm test:run` + `lighthouserc.json` to PR checks (Phase 11 polish).
- [ ] Branch protection on `master`: require status checks + 1 reviewer.
- [ ] Run external pen test (`THREAT_MODEL.md` final section — booked once per release train).
- [ ] First scheduled cron run hits at 22:00 Asia/Bangkok — confirm push lands in test cadet's LINE chat.

---

## Rollback

- Vercel project → **Deployments** → pick a known-good deployment → **Promote to Production**.
- Prisma rollback: `prisma migrate resolve --rolled-back <migration_name>` then `prisma migrate deploy` from the prior known-good migration tag. Always rehearse on a Supabase **branch** before running against production.
- LINE channels: keep the **prior** webhook URL recorded; reverting the URL in the LINE console takes effect immediately.

## Secret rotation

| Secret | Rotation impact |
| --- | --- |
| `JWT_SECRET` | All access + refresh tokens invalidated; every cadet must sign in again. |
| `ENCRYPTION_KEY` | Requires re-encrypt migration over `User.emailCiphertext` + `User.totpSecret`. Schedule downtime. |
| `HMAC_KEY` | `User.emailHash` lookups break — full backfill required. Avoid unless leaked. |
| `LINE_CHANNEL_SECRET` (webhook) | Past webhook signatures no longer validate. Rotate in LINE console + Vercel env in one window. |
| `LINE_CHANNEL_ACCESS_TOKEN` | Old token is revoked on issue; outbound push gap of seconds. |
| `CRON_SECRET` | Vercel cron auth breaks until env propagates. Rotate during low-traffic window. |
| `BREVO_API_KEY` | OTP email send breaks until env propagates. Hold during exam-period sign-up surges. |
