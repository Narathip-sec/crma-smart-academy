# Phase 2c — Email OTP + Crypto Envelope

> **Status:** ✅ COMPLETE 2026-05-20.
> **Loop position:** brainstorming ✅ → writing-plans ✅ → TDD ✅ → cross-AI review (Codex auditor) ✅ → commit ✅
> **Date:** 2026-05-19 → 2026-05-20
> **Inputs:** Phase 2a chassis, Phase 2b LINE callback, CLAUDE.md hard constraint ("PDPA encryption for `User.email`"), user decisions 2026-05-19.
> **DoD:** `pnpm typecheck` clean ✅ · `pnpm lint` clean ✅ · 123 unit tests green (up from 73) ✅ · e2e chassis green ✅.
> **Deviation note:** plan §2 omitted `EmailOtp.emailCiphertext`; added during step 8 so `/verify` can copy the ciphertext to the `User` row without re-prompting for the address. See commit `b3fb3dc`.

---

## 0. Goal

Cadet finishes LINE login → callback returns `{ status: 'needs_email' }` and sets an enrolment cookie. Cadet lands on `/enrol/email`, submits their `@crma.ac.th` email, receives a 6-digit OTP via Brevo, enters it, the route stores `User.emailHash` + `User.emailCiphertext`, sets `User.emailVerified`, and returns `{ status: 'needs_totp' }` (or `'ok'` once 2d lands).

Phase 2c builds the chassis end-to-end. Without `BREVO_API_KEY`, the send falls back to a logged stub so dev/CI still exercises the verify path against fixed test codes.

---

## 1. Decisions locked-in this session

| #   | Decision             | Value                                                                                                                                                                |
| --- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | OTP shape            | 6 numeric digits                                                                                                                                                     |
| 2   | OTP TTL              | 10 minutes                                                                                                                                                           |
| 3   | Max attempts         | 5 (after which the row is consumed = locked out; user re-requests)                                                                                                   |
| 4   | Send rate-limit      | 1 request per user per 60 seconds (DB-backed via OTP createdAt)                                                                                                      |
| 5   | Email gate           | `^[^@\s]+@crma\.ac\.th$`, normalised lowercase before hash/encrypt                                                                                                   |
| 6   | Transactional sender | Brevo HTTP API `https://api.brevo.com/v3/smtp/email`, header `api-key: ${BREVO_API_KEY}`                                                                             |
| 7   | Send fallback        | `BREVO_API_KEY` unset → log the code, return success (dev/CI only)                                                                                                   |
| 8   | Enrolment cookie     | `__Host-crma-enrol` JWT, aud `crma-enrol`, exp 15 min, claim `{ sub, lineUserId, deviceFp, scope: 'enrol' }`                                                         |
| 9   | Encryption           | AES-256-GCM via Web Crypto, key from `ENCRYPTION_KEY` (32 raw bytes, base64url). HMAC-SHA-256 deterministic hash from `HMAC_KEY` for unique lookup. Edge-compatible. |
| 10  | Schema migration     | Path B continues: schema edited in place, CI runs `prisma db push`, real migration files land when DATABASE_URL is provisioned.                                      |

---

## 2. Schema delta

```prisma
model User {
  id              String   @id @default(cuid())
  cadetId         String   @unique
  // Phase 2c split: deterministic HMAC for unique lookup, AES-GCM
  // ciphertext for retrieval. Pre-verify the User row carries a
  // placeholder hash derived from the lineUserId (see lib/crypto).
  emailHash       String   @unique
  emailCiphertext String?
  emailVerified   DateTime?
  lineUserId      String?  @unique
  displayName     String
  avatarUrl       String?
  role            Role     @default(CADET)
  company         String?
  year            Int?
  totpSecret      String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  refreshTokens   RefreshToken[]
  auditLogs       AuditLog[]
  emailOtps       EmailOtp[]

  @@index([role])
}

model EmailOtp {
  id         String    @id @default(cuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  /// SHA-256 of the 6-digit code. Codes themselves are never persisted.
  codeHash   String
  /// Plaintext-equivalent emailHash so the OTP binds to the specific
  /// email the cadet entered, not just the user row.
  emailHash  String
  expiresAt  DateTime
  attempts   Int       @default(0)
  consumedAt DateTime?
  createdAt  DateTime  @default(now())

  @@index([userId, createdAt])
  @@index([emailHash, createdAt])
}
```

Existing `User.email` String column is replaced by `emailHash` + `emailCiphertext`. The LINE callback (Phase 2b) must be updated to write `emailHash = hmac("pending:${lineUserId}@crma.ac.th")` and leave `emailCiphertext` null until verify.

---

## 3. Library APIs

### `lib/crypto.ts`

```ts
// Deterministic HMAC for unique lookups.
export function hmacEmail(emailNormalised: string): string

// AES-256-GCM envelope; ciphertext = base64url(iv || ciphertext || tag).
export async function encrypt(plaintext: string): Promise<string>
export async function decrypt(envelope: string): Promise<string>

// Helpers.
export function normaliseEmail(raw: string): string // trim + lowercase
```

- Keys read once and cached via lazy `getKeys()`.
- Throws clear errors when env keys missing.
- `ENCRYPTION_KEY` = base64url 32 bytes; `HMAC_KEY` = base64url ≥ 32 bytes.

### `lib/email-otp.ts`

```ts
export const OTP_LENGTH = 6
export const OTP_TTL_SECONDS = 600
export const OTP_MAX_ATTEMPTS = 5
export const OTP_RATE_LIMIT_SECONDS = 60

export function generateCode(): string                       // crypto.randomInt
export function hashCode(code: string): Promise<string>      // SHA-256 hex

export type OtpRow = {
  id: string
  userId: string
  codeHash: string
  emailHash: string
  expiresAt: Date
  attempts: number
  consumedAt: Date | null
  createdAt: Date
}

// Factory pattern for testability.
export function createOtpService(deps: { prisma: { emailOtp: ... } }) {
  return {
    issue(opts: { userId, emailHash }): Promise<{ code: string, expiresAt: Date }>
    verify(opts: { userId, code }): Promise<{ ok: true; emailHash: string }
                                          | { ok: false; reason: 'expired'|'mismatch'|'attempts_exceeded'|'not_found' }>
    canSendAgain(opts: { userId }): Promise<{ ok: boolean; retryAt?: Date }>
  }
}
```

### `lib/email.ts`

```ts
export type SendResult = { ok: true } | { ok: false; reason: string }

export async function sendOtpEmail(opts: { to: string; code: string }): Promise<SendResult>
```

- Env-gated: missing `BREVO_API_KEY` → log `[email] OTP <code> to <to>` and return `{ ok: true, reason: 'noop:dev_fallback' }` (still satisfies the route contract so test can pass without external creds).
- Real call: POST `https://api.brevo.com/v3/smtp/email` with sender name "CRMA Smart Academy", subject `"Your CRMA verification code"`, plain-text body containing the code.

### Session lib extension (`lib/session.ts`)

```ts
export const ENROL_COOKIE = '__Host-crma-enrol'

export type EnrolPayload = { sub: string; lineUserId: string; deviceFp: string }

export async function signEnrolToken(payload: EnrolPayload): Promise<string>
export async function verifyEnrolToken(token: string): Promise<EnrolPayload>
export function buildEnrolCookie(token: string): string // Max-Age = 900
```

Adds `aud='crma-enrol'`, `exp=15m`. Cookie shares `__Host-` + `HttpOnly` + `Secure` + `SameSite=Lax` + `Path=/` discipline.

---

## 4. Route contracts

### `POST /api/auth/email/start`

- Reads `__Host-crma-enrol` cookie (`verifyEnrolToken`).
- Body: `{ email: string }`. Validates `@crma.ac.th` regex.
- Rate-limit: reject if a non-consumed OTP exists with `createdAt > now - 60s` → 429.
- Reject if an unrelated `User.emailHash` matches → 409 (`email_in_use`).
- Generates code, persists `EmailOtp` row, calls `sendOtpEmail`.
- Response: `200 { ok: true, expiresAt }`.
- 4 audit branches (ALLOW, DENY for bad email, DENY for rate-limit, ERROR for send failure).

### `POST /api/auth/email/verify`

- Reads enrol cookie.
- Body: `{ code: string }`.
- Loads the latest unconsumed OTP for the user.
- On invalid code: increment `attempts`; if `>= 5`, set `consumedAt = now`. 401 with `{ error: 'invalid_code' | 'attempts_exceeded' | 'expired' }`.
- On success: set `consumedAt = now`, update `User.emailHash` + `User.emailCiphertext` + `User.emailVerified = now`.
- Returns `{ status: 'needs_totp' }` (or `'ok'` if `User.totpSecret` exists, e.g. re-verify path).
- 5 audit branches (ALLOW + 4 DENY).

### Middleware update

- `/enrol/*` and `/api/auth/email/*` allowed when `__Host-crma-enrol` cookie verifies.
- Otherwise unchanged — full access cookie still required for `/api/*` not in the allow-list.

### `LINE callback` update

- On `needs_email` branch, also set `__Host-crma-enrol` cookie before returning.

---

## 5. UI

### `app/(public)/enrol/email/page.tsx`

- Server component. Reads enrol cookie via `cookies()`. If absent → redirect `/login`.
- Renders `EnrolEmailForm`.

### `components/auth/EnrolEmailForm.tsx` (client)

- Two-stage form: (1) email input → POST `/start`; (2) on success show code input → POST `/verify`.
- Branch on verify response: `needs_totp` → `/enrol/totp`, `ok` → `/`.
- Error toasts via `role="alert"` lines (same testIDs `enrol-email-error` / `enrol-otp-error`).

---

## 6. File tree delta

```
web/
├─ app/
│  ├─ (public)/
│  │  └─ enrol/
│  │     └─ email/
│  │        └─ page.tsx              ← NEW
│  └─ api/
│     └─ auth/
│        └─ email/
│           ├─ start/
│           │  ├─ handler.ts         ← NEW
│           │  └─ route.ts           ← NEW
│           └─ verify/
│              ├─ handler.ts         ← NEW
│              └─ route.ts           ← NEW
├─ components/
│  └─ auth/
│     └─ EnrolEmailForm.tsx          ← NEW (client)
├─ lib/
│  ├─ crypto.ts                      ← NEW
│  ├─ email.ts                       ← NEW
│  ├─ email-otp.ts                   ← NEW
│  ├─ session.ts                     ← EDIT: enrol cookie helpers
│  └─ ...
├─ __tests__/
│  ├─ crypto.test.ts                 ← NEW
│  ├─ email-otp.test.ts              ← NEW
│  ├─ email.test.ts                  ← NEW
│  ├─ enrol-cookie.test.ts           ← NEW
│  ├─ auth-email-start.test.ts       ← NEW
│  ├─ auth-email-verify.test.ts      ← NEW
│  └─ middleware.test.ts             ← EDIT: enrol cookie cases
├─ middleware.ts                     ← EDIT
└─ prisma/schema.prisma              ← EDIT: User split + EmailOtp
```

---

## 7. Execution order (TDD per atomic commit)

1. **schema split + EmailOtp** — schema edits, regenerate Prisma client, update LINE callback handler to write `emailHash` instead of `email`. Existing tests updated to match.
2. **lib/crypto.ts** — TDD: hmac determinism, encrypt/decrypt round-trip, tampered ciphertext rejected, missing key throws.
3. **lib/email-otp.ts** — TDD with mocked prisma: generate, issue, verify happy + expired + mismatch + attempts-exceeded + rate-limit.
4. **lib/email.ts** — TDD: BREVO_API_KEY missing → dev fallback returns ok; present → fetch called with right URL + body + headers; non-2xx → returns `{ ok: false }`.
5. **session.ts enrol helpers** — TDD: sign/verify, expiry, audience guard against access/refresh.
6. **LINE callback update** — set enrol cookie on `needs_email`/`needs_totp` branches; update existing test expectations.
7. **/api/auth/email/start** — TDD route, factory-injected services.
8. **/api/auth/email/verify** — TDD route.
9. **middleware** — allow enrol-cookie paths; update middleware tests.
10. **/enrol/email page + EnrolEmailForm** — basic render + e2e chassis spec (form renders without enrol cookie redirects to /login).
11. **README + progress tracker** — Phase 2c row bilingual.

---

## 8. What's NOT in Phase 2c

- ❌ No TOTP enrolment (2d).
- ❌ No `User.totpSecret` encryption (2d).
- ❌ No PFTResult / Enrollment.grade encryption (per-phase when the model lands).
- ❌ No real Brevo creds (dev/CI uses fallback).
- ❌ No real Supabase migration file (still Path B).
- ❌ No `proxy.ts` rename (Phase 10).
- ❌ No `/enrol/totp` page — only the `needs_totp` redirect target string.

---

## 9. Risks

| Risk                                                              | Mitigation                                                                                           |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| HMAC + encrypt key rotation collides with stored hashes           | Document: rotating `HMAC_KEY` requires a backfill job. Phase 10.                                     |
| `crypto.randomInt` unavailable in Edge                            | `crypto.getRandomValues(new Uint32Array(1))` + modulo bias check (use rejection sampling)            |
| Rate-limit window via DB createdAt is racy under high concurrency | Phase 2c uses single-row check; per-IP+per-user rate limit elsewhere lands in Phase 10               |
| Brevo template HTML                                               | Phase 2c sends plain text only; HTML template + Thai copy lands in Phase 10 hardening                |
| Replay of OTP after consume                                       | `consumedAt` is checked before verify; second attempt with same code 404s                            |
| Email plaintext leaks via logs                                    | `lib/email` dev fallback logs the OTP code but NEVER the verified email; production never logs codes |

---

## 10. Approval gate

- [ ] Schema split (User.email → emailHash + emailCiphertext) acceptable; LINE callback updated to backfill placeholder hash.
- [ ] `EmailOtp` model shape OK (no separate "attempts" history table).
- [ ] Enrolment cookie `__Host-crma-enrol` 15-min TTL OK.
- [ ] Brevo dev fallback (log + return ok) OK for CI/dev without real creds.
- [ ] `ENCRYPTION_KEY` + `HMAC_KEY` env vars OK (base64url 32 bytes).

On approval → execute Step 1 (schema split).
