# Phase 2e — Device-Fingerprint Re-verify

> **Status:** ✅ COMPLETE 2026-05-20.
> **Loop position:** brainstorming ✅ → writing-plans ✅ → TDD ✅ → cross-AI review (Codex auditor) ✅ → commit ✅
> **Date:** 2026-05-20
> **Inputs:** Phase 2d TOTP enrolment (`lib/totp.ts`, `/api/auth/totp/enrol/*`), CLAUDE.md hard constraint ("TOTP 2FA mandatory; re-verify on every new device fingerprint").
> **DoD:** `pnpm typecheck` clean ✅ · `pnpm lint` clean (warnings only) ✅ · 170 unit tests green (up from 148) ✅ · e2e chassis green ✅.
> **Scope:** new-device re-verify + replay protection. NOT in scope: lost-device recovery, backup codes, per-device session inventory UI.

---

## 0. Goal

Cadet finished Phase 2d → carries an authenticator pairing. On a fresh device fingerprint (new browser, cleared cookies, different phone), the LINE callback no longer hands out access + refresh cookies on first sight. Instead it returns `{ status: 'needs_reverify' }` and an enrol cookie. The cadet lands on `/reverify/totp`, types a 6-digit code, and the server:

1. Decrypts `User.totpSecret`, validates the code against the ±1 step window.
2. Rejects replay — the used step must be strictly greater than `User.lastTotpStep`.
3. Persists a `RefreshToken` row for the new device fingerprint.
4. Mints access + refresh cookies, clears the enrol cookie.

A device is "known" when at least one non-expired, non-revoked `RefreshToken` row for `(userId, deviceFp)` exists at LINE-callback time.

---

## 1. Decisions locked-in this session

| #   | Decision                      | Value                                                                                                                                                           |
| --- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Device-known criterion        | At least one `RefreshToken` row for `(userId, deviceFp)` with `expiresAt > now` and `revokedAt = null`                                                          |
| 2   | Replay strategy               | Single global `User.lastTotpStep BigInt?` — used step must be `> lastTotpStep`. Per-device storage deferred to Phase 10.                                        |
| 3   | Step calculation              | `floor(timestampMs / 30000) + delta` where `delta` is what `otpauth.validate` returns. Stored as `BigInt` (epoch / 30 will exceed 2^31 in 2038, so use 64-bit). |
| 4   | New route                     | `POST /api/auth/totp/reverify` mirrors `enrol/verify` shape but does **not** stamp `totpVerified` (already set). Same cookie behaviour.                         |
| 5   | LINE callback branch          | After `emailVerified` + `totpVerified` both true: if device unknown → `{ status: 'needs_reverify' }` + enrol cookie. Else mint cookies as today.                |
| 6   | UI                            | New `/reverify/totp` server-component page + `ReverifyTotpForm` client island. No QR (already paired) — just 6-digit input.                                     |
| 7   | Replay enforcement everywhere | `enrol/verify` ALSO sets `User.lastTotpStep` so the very first code locks the window forward.                                                                   |
| 8   | Middleware                    | No change — `/reverify/*` joins the enrol allow-list.                                                                                                           |

---

## 2. Schema delta

```prisma
model User {
  // …
  /// Last successfully consumed TOTP step (Math.floor(epochMs / 30_000) + delta).
  /// Phase 2e replay guard: a code that resolves to ≤ this step is rejected.
  /// Initialised by /enrol/totp/verify on first pair-up; advanced by every
  /// successful enrol or reverify thereafter.
  lastTotpStep    BigInt?
  // …
}
```

No `RefreshToken` change.

---

## 3. Library APIs

### `lib/totp.ts` — extension

```ts
export function currentStep(timestampMs?: number): bigint
export function consumeCode(opts: {
  secret: string
  code: string
  lastStep: bigint | null
  timestampMs?: number
}): { ok: true; step: bigint } | { ok: false; reason: 'invalid_code' | 'replay' }
```

`verifyCode` (Phase 2d) keeps its boolean signature so the existing `enrol/verify` test surface stays stable; `consumeCode` is the replay-aware variant used by both `enrol/verify` (after Phase 2e) and the new `/reverify` route.

### Prisma `RefreshToken` lookup helper

No new helper; route handlers call `prisma.refreshToken.findFirst({ where: { userId, deviceFp, expiresAt: { gt: new Date() }, revokedAt: null } })` inline.

---

## 4. Route contracts

### LINE callback (`/api/auth/line/callback/handler.ts`) — edit

Fully-enrolled branch becomes:

```ts
// Both gates passed → check device.
const known = await deps.prisma.refreshToken.findFirst({
  where: {
    userId: user.id,
    deviceFp: body.deviceFp,
    expiresAt: { gt: new Date() },
    revokedAt: null,
  },
})
if (!known) {
  const enrolToken = await signEnrolToken({ sub: user.id, lineUserId, deviceFp })
  const res = NextResponse.json({ status: 'needs_reverify' })
  res.headers.append('set-cookie', buildEnrolCookie(enrolToken))
  // audit ALLOW branch 'needs_reverify'
  return res
}
// Known device → mint cookies as today.
```

Existing tests gain a `needs_reverify` case; the `ok` test sets up the matching `RefreshToken` row before calling the handler.

### `POST /api/auth/totp/reverify`

- Reads `__Host-crma-enrol` cookie.
- Body: `{ code: string }` — `/^\d{6}$/`.
- Loads user; if `!user.totpSecret` or `!user.totpVerified` → 409 `not_enrolled`.
- Decrypts `user.totpSecret`.
- `consumeCode({ secret, code, lastStep: user.lastTotpStep })`:
  - `{ ok: false, reason: 'invalid_code' }` → 401.
  - `{ ok: false, reason: 'replay' }` → 409.
  - `{ ok: true, step }` → updates `user.lastTotpStep = step`. Mints access + refresh, persists `RefreshToken`, builds 3 Set-Cookie headers (access, refresh, clear enrol). 200 `{ status: 'ok' }`.
- 6 audit branches (cookie x2, bad_code, not_enrolled, invalid_code, replay, ALLOW).

### `enrol/verify` — edit

After the existing successful `verifyCode` check, replace the call with `consumeCode` and persist `lastTotpStep` alongside the existing `totpVerified` stamp. Existing tests get one extra assertion; the happy-path mock now returns `{ ok: true, step: 1n }`.

### Middleware

`isEnrolPath` already covers `/enrol/*`; add `/reverify` to the allow-list so the new page accepts the enrol cookie.

---

## 5. UI

### `app/(public)/reverify/totp/page.tsx`

- Server component. Reads enrol cookie; redirects `/login` if missing/invalid.
- Renders `<ReverifyTotpForm>`.

### `components/auth/ReverifyTotpForm.tsx` (client)

- Single-stage form: 6-digit input → POST `/api/auth/totp/reverify`.
- Success → `window.location.assign('/')`.
- `role="alert"` toasts: `invalid_code`, `replay`, `not_enrolled`, `bad_code`, `enrol_required`.

---

## 6. File tree delta

```
web/
├─ app/
│  ├─ (public)/
│  │  └─ reverify/
│  │     └─ totp/
│  │        └─ page.tsx                  ← NEW
│  └─ api/
│     └─ auth/
│        └─ totp/
│           └─ reverify/
│              ├─ handler.ts             ← NEW
│              └─ route.ts               ← NEW
├─ components/
│  └─ auth/
│     └─ ReverifyTotpForm.tsx            ← NEW (client)
├─ lib/
│  └─ totp.ts                            ← EDIT: + consumeCode, + currentStep
├─ middleware.ts                         ← EDIT: + /reverify allow-list
├─ __tests__/
│  ├─ totp.test.ts                       ← EDIT: + consumeCode coverage
│  ├─ auth-totp-verify.test.ts           ← EDIT: lastTotpStep stamping
│  ├─ auth-totp-reverify.test.ts         ← NEW
│  ├─ auth-line-callback.test.ts         ← EDIT: needs_reverify branch
│  └─ middleware.test.ts                 ← EDIT: /reverify/totp cases
├─ e2e/
│  └─ reverify-totp.spec.ts              ← NEW
├─ app/api/auth/line/callback/handler.ts ← EDIT: device-known check
└─ prisma/schema.prisma                  ← EDIT: User.lastTotpStep
```

---

## 7. Execution order (TDD per atomic commit)

1. **Plan doc + schema delta** — add `User.lastTotpStep`. Regen prisma client.
2. **`lib/totp.ts` consumeCode + currentStep** — TDD: happy returns step; replay rejected; invalid still rejected. Update existing `enrol/verify` happy mock to return `{ok, step}`.
3. **`/api/auth/totp/enrol/verify` adopts consumeCode** — stamps `lastTotpStep` on the same update; existing test gets the new assertion.
4. **LINE callback device-known check + needs_reverify branch** — add `refreshToken.findFirst` to deps, edit `fullyEnrolled` branch, update fake user setup in existing test to include refresh-token state.
5. **`/api/auth/totp/reverify` route** — TDD all 6 branches; verifies access+refresh cookies + cleared enrol cookie + lastTotpStep advance.
6. **Middleware allow-list + page + form** — `/reverify/totp` server component, client island, Playwright chassis spec.
7. **README + tracker + plan flip to COMPLETE** — bilingual progress row.

---

## 8. What's NOT in Phase 2e

- ❌ Backup / recovery codes (Phase 10).
- ❌ Per-device step tracking (Phase 10 — only matters when an attacker pivots between devices within the same 30 s window).
- ❌ Session inventory UI ("active devices") (Phase 9 / app shell).
- ❌ Push approval flow via LINE Messaging (Phase 9).
- ❌ `RefreshToken.revokedAt` writer — column exists; the admin-revoke action lands in Phase 10.

---

## 9. Risks

| Risk                                                                        | Mitigation                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User loses authenticator → locked out on new device                         | Phase 10 admin reset; until then, support contact in the error copy.                                                                                                                                                                                                                                                                                          |
| Clock skew advances `lastTotpStep` past valid codes on the cadet's phone    | The window is ±1 step; once a code at step N succeeds, N+1 and N-1 also resolve to the same delta-1/delta+1 — but the next code attempt resolves to a step strictly greater than N because the 30 s window has rolled. The skew tolerance does not stack across requests.                                                                                     |
| BigInt JSON serialisation                                                   | Internal-only; JWT and API responses never echo `lastTotpStep`. Prisma client uses native BigInt; convert with `.toString()` if we ever return it.                                                                                                                                                                                                            |
| Race: two re-verify requests in the same 30 s window                        | The second `update` for `lastTotpStep` with a step ≤ the first one's would normally succeed because `update` is not conditional. Mitigate by checking inside the same transaction (`updateMany` with `where: { lastTotpStep: { lt: step } }` returning count = 0 → replay). Phase 2e ships the simpler non-transactional path; tighten in Phase 10 hardening. |
| `RefreshToken.findFirst` count check on every LINE callback adds DB latency | One indexed lookup. Prisma client compiles this to an indexed scan on `RefreshToken.userId`. Acceptable.                                                                                                                                                                                                                                                      |

---

## 10. Approval gate

- [x] Scope = new-device re-verify + global replay step.
- [x] `User.lastTotpStep BigInt?` acceptable.
- [x] Single new route `/api/auth/totp/reverify`.
- [x] Page lives at `/reverify/totp`, joins enrol allow-list.

On approval → execute Step 1 (schema delta).
