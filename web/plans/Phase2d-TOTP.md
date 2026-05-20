# Phase 2d — TOTP Enrolment

> **Status:** ✅ COMPLETE 2026-05-20.
> **Loop position:** brainstorming ✅ → writing-plans ✅ → TDD ✅ → cross-AI review (Codex auditor) ✅ → commit ✅
> **Date:** 2026-05-20
> **Inputs:** Phase 2c chassis (enrol cookie, `lib/crypto.ts`, `EnrolEmailForm`), CLAUDE.md hard constraints ("TOTP 2FA mandatory" / "PDPA encryption for `User.totpSecret`").
> **DoD:** `pnpm typecheck` clean ✅ · `pnpm lint` clean ✅ (warnings only) · 148 unit tests green (up from 123) ✅ · e2e chassis green ✅.
> **Scope:** initial enrolment only. Device-fingerprint re-verify deferred to Phase 2e.

---

## 0. Goal

Cadet finishes email OTP → page redirects to `/enrol/totp` → server generates a TOTP secret, encrypts it onto `User.totpSecret`, and returns the otpauth URI + a QR data-URL. Cadet scans the QR with Google Authenticator / Authy / 1Password / Microsoft Authenticator → types the 6-digit code → POST `/api/auth/totp/enrol/verify` validates the code → on success, stamps `User.totpVerified`, mints `__Host-crma-access` + `__Host-crma-refresh` cookies, clears `__Host-crma-enrol`, and the client lands on `/`.

---

## 1. Decisions locked-in this session

| #   | Decision          | Value                                                                                                                                                                                                               |
| --- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Algorithm         | RFC 6238: HOTP-HMAC-SHA1, 30 s step, 6 digits                                                                                                                                                                       |
| 2   | Secret length     | 20 bytes (standard; produces 32 base32 chars)                                                                                                                                                                       |
| 3   | Library           | `otpauth` npm (pure JS, Edge-safe via Web Crypto, no abandoned deps)                                                                                                                                                |
| 4   | QR rendering      | `qrcode` npm — server-side data-URL emitted by `/start`; client renders `<img src=…>`                                                                                                                               |
| 5   | Issuer label      | `CRMA Smart Academy`                                                                                                                                                                                                |
| 6   | Account label     | `user.cadetId` (institutional ID), not email (avoids leaking PII in QR caches)                                                                                                                                      |
| 7   | Clock skew window | ±1 step (30 s either side) on verify                                                                                                                                                                                |
| 8   | Secret storage    | `User.totpSecret` holds AES-GCM ciphertext via `lib/crypto.encrypt`. Plaintext never written.                                                                                                                       |
| 9   | Two-stage flag    | New column `User.totpVerified DateTime?`. LINE callback gates `needs_totp` on `!user.totpVerified` (NOT `!user.totpSecret` — see §9 risk).                                                                          |
| 10  | Verify success    | Sets `User.totpVerified = now`, mints access+refresh cookies, clears enrol cookie. Same `RefreshToken` row creation as the existing LINE-callback-ok branch.                                                        |
| 11  | Restart enrolment | If `/start` is called again before `/verify`, the previous `totpSecret` is overwritten (single-shot per cadet during enrolment). Once `totpVerified` is set, `/start` 409s — re-enrolment is a Phase 10 admin tool. |

---

## 2. Schema delta

```prisma
model User {
  // … existing fields …
  /// AES-GCM ciphertext of the TOTP secret (via lib/crypto.encrypt).
  /// Plaintext base32 never persisted. Nullable until /enrol/totp/start.
  totpSecret      String?
  /// Stamped by /enrol/totp/verify after the first valid 6-digit code.
  /// LINE callback uses this — NOT totpSecret presence — to decide
  /// whether to mint session cookies; a half-enrolled cadet whose
  /// /start ran but /verify did not still routes to needs_totp.
  totpVerified    DateTime?
  // …
}
```

The `User.totpSecret` column already exists from Phase 2a — only `totpVerified` is new. Path B migration: schema edited in place; CI runs `prisma db push`.

LINE callback (`/api/auth/line/callback/handler.ts`):

```ts
if (!user.totpVerified) {
  // …mint enrol cookie, return needs_totp…
}
```

(currently reads `!user.totpSecret`; both must change in one commit).

---

## 3. Library APIs

### `lib/totp.ts`

```ts
export const TOTP_ISSUER = 'CRMA Smart Academy'
export const TOTP_DIGITS = 6
export const TOTP_PERIOD_SECONDS = 30
export const TOTP_WINDOW_STEPS = 1
export const TOTP_SECRET_BYTES = 20

export function generateSecret(): string // 32-char base32
export function buildOtpAuthUri(opts: {
  secret: string // base32
  account: string // cadetId
}): string // otpauth://...

export async function buildQrDataUrl(otpAuthUri: string): Promise<string>
// data:image/png;base64,… (PNG QR; uses `qrcode` npm under the hood)

export function verifyCode(opts: {
  secret: string // base32
  code: string // 6-digit
}): boolean
```

All four functions thin wrappers around `otpauth` + `qrcode`. Factory-injected `prisma` is not needed at this layer — the route handlers compose `lib/totp` with `lib/crypto` themselves.

### `lib/session.ts` (extension)

No new APIs. The existing `signAccessToken` / `signRefreshToken` / `buildAccessCookie` / `buildRefreshCookie` / `clearEnrolCookie` already cover the verify success path.

---

## 4. Route contracts

### `POST /api/auth/totp/enrol/start`

- Reads `__Host-crma-enrol` cookie (`verifyEnrolToken`).
- Looks up `user` by `sub`.
- `user.totpVerified` set → 409 `{ error: 'already_enrolled' }`.
- Generates 20-byte secret → base32.
- Encrypts secret via `lib/crypto.encrypt` → writes ciphertext to `user.totpSecret`.
- Builds otpauth URI: `otpauth://totp/${encodeURIComponent(TOTP_ISSUER)}:${encodeURIComponent(user.cadetId)}?secret=<base32>&issuer=${encodeURIComponent(TOTP_ISSUER)}&period=30&digits=6&algorithm=SHA1`.
- Builds QR PNG data URL via `qrcode`.
- Response: `200 { ok: true, otpAuthUri, qrDataUrl }`.
- 3 audit branches (ALLOW, DENY for cookie, DENY for already_enrolled).

### `POST /api/auth/totp/enrol/verify`

- Reads enrol cookie.
- Body: `{ code: string }` — must match `^\d{6}$`.
- Loads `user`; if `!user.totpSecret` → 409 `{ error: 'enrol_not_started' }`.
- Decrypts `user.totpSecret` via `lib/crypto.decrypt`.
- `verifyCode({ secret, code })` — false → 401 `{ error: 'invalid_code' }`.
- True → updates `user.totpVerified = now`. Mints access + refresh JWTs, persists `RefreshToken` row, builds `Set-Cookie` for access + refresh, builds expired `Set-Cookie` for enrol.
- Response: `200 { status: 'ok' }`.
- 5 audit branches (ALLOW + 4 DENY).

### Middleware

No change — Phase 2c already routes `/enrol/totp` through `isEnrolPath` and `/api/auth/totp/*` through the `/api/auth` public prefix. The verify route's cleared enrol cookie + new access cookie hand the cadet straight into the protected area.

### LINE callback update

One-line change: switch `!user.totpSecret` to `!user.totpVerified` so a half-started enrolment (cookie expired mid-flow) doesn't accidentally mint a session.

---

## 5. UI

### `app/(public)/enrol/totp/page.tsx`

- Server component. Reads enrol cookie via `cookies()`. Missing or invalid → `redirect('/login')`.
- Calls `/api/auth/totp/enrol/start` server-side? **No** — pure client interaction (the cadet may want to retry). Page renders `<EnrolTotpForm>` and lets the client island POST `/start` on mount.

### `components/auth/EnrolTotpForm.tsx` (client)

- On mount: `useEffect` → POST `/start` → on `{ otpAuthUri, qrDataUrl }` set state.
- Renders QR `<img src={qrDataUrl}>` + manual-entry fallback (cadetId + base32 secret extracted from URI).
- Code input → POST `/verify` → on `{ status: 'ok' }` `window.location.assign('/')`.
- Error toasts via `role="alert"` for `enrol-totp-error` / `enrol-totp-start-error`.
- Test IDs: `enrol-totp-qr` / `enrol-totp-secret` / `enrol-totp-input` / `enrol-totp-submit` / `enrol-totp-error`.

---

## 6. File tree delta

```
web/
├─ app/
│  ├─ (public)/
│  │  └─ enrol/
│  │     └─ totp/
│  │        └─ page.tsx                  ← NEW
│  └─ api/
│     └─ auth/
│        └─ totp/
│           └─ enrol/
│              ├─ start/
│              │  ├─ handler.ts          ← NEW
│              │  └─ route.ts            ← NEW
│              └─ verify/
│                 ├─ handler.ts          ← NEW
│                 └─ route.ts            ← NEW
├─ components/
│  └─ auth/
│     └─ EnrolTotpForm.tsx               ← NEW (client)
├─ lib/
│  └─ totp.ts                            ← NEW
├─ __tests__/
│  ├─ totp.test.ts                       ← NEW
│  ├─ auth-totp-start.test.ts            ← NEW
│  ├─ auth-totp-verify.test.ts           ← NEW
│  └─ auth-line-callback.test.ts         ← EDIT: totpVerified gate
├─ e2e/
│  └─ enrol-totp.spec.ts                 ← NEW (chassis: no-cookie redirect)
├─ app/api/auth/line/callback/handler.ts ← EDIT: totpVerified gate
├─ prisma/schema.prisma                  ← EDIT: User.totpVerified
└─ package.json                          ← EDIT: + otpauth + qrcode
```

---

## 7. Execution order (TDD per atomic commit)

1. **Deps** — `pnpm add otpauth qrcode` + types for `qrcode` (`@types/qrcode`).
2. **schema + LINE callback gate** — add `User.totpVerified`, swap callback gate from `totpSecret` to `totpVerified`, update existing callback tests' `UserState`.
3. **`lib/totp.ts`** — TDD: generateSecret length + base32 charset; URI shape; verifyCode happy / wrong code / ±1 step / outside window. QR data-URL prefix.
4. **`/api/auth/totp/enrol/start`** — TDD: cookie gate, already_enrolled 409, happy returns URI + qr + persists ciphertext (not plaintext).
5. **`/api/auth/totp/enrol/verify`** — TDD: cookie gate, missing-secret 409, invalid_code 401, happy mints access+refresh cookies + clears enrol cookie + stamps totpVerified + persists RefreshToken row.
6. **`/enrol/totp` page + `EnrolTotpForm`** — server-component redirect, client form chassis, e2e no-cookie redirect.
7. **README + tracker + plan doc flip to COMPLETE** — bilingual progress row.

---

## 8. What's NOT in Phase 2d

- ❌ Device-fingerprint re-verify gate (Phase 2e).
- ❌ Backup codes / recovery flow (Phase 10).
- ❌ Admin re-enrolment / lost-device reset (Phase 10).
- ❌ Bilingual Thai email / QR copy (Phase 10 hardening).
- ❌ Encrypted PFTResult / Enrollment.grade (per-phase when those models land).

---

## 9. Risks

| Risk                                                                                                                               | Mitigation                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Half-started enrolment (`/start` succeeded, `/verify` never ran) lets the LINE callback mint a session because `totpSecret` is set | The dedicated `totpVerified` flag fixes this — callback gates on `totpVerified`, not `totpSecret`.                                                              |
| Clock skew between cadet's phone and Vercel                                                                                        | `TOTP_WINDOW_STEPS = 1` covers ±30 s. Phase 10 may widen if telemetry shows drift.                                                                              |
| QR scrape from screenshot / clipboard                                                                                              | QR carries the base32 secret in cleartext — same risk every TOTP app accepts. Mitigation = TLS + short user attention span; backup-code flow lands in Phase 10. |
| `otpauth` lib silently changes RFC defaults                                                                                        | Pin major in `package.json`. Vector tests in `__tests__/totp.test.ts` verify a known secret + timestamp produces a known code.                                  |
| `qrcode` is Node-only                                                                                                              | Both `/enrol/totp/*` routes are Node runtime (they touch Prisma). No Edge concern.                                                                              |
| Race on `/start` overwriting secret while old QR is still on cadet's screen                                                        | Acceptable — the new secret invalidates the old QR; `/verify` only knows the latest.                                                                            |
| Replay of verified TOTP code                                                                                                       | `User.totpVerified` is a stamp, not a nonce. Phase 2e re-verify will record the most-recent-used 30 s window per device to block replay there.                  |

---

## 10. Approval gate

- [x] Scope = initial enrolment only (per session decision).
- [x] Library = `otpauth` + `qrcode`.
- [x] New column `User.totpVerified` acceptable.
- [x] Plaintext secret never persisted; ciphertext lives on `User.totpSecret`.
- [x] Verify mints session cookies + clears enrol cookie in the same response.

On approval → execute Step 1 (deps).
