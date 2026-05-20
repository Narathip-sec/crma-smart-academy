# Phase 2b — LIFF + LINE Callback

> **Status:** DRAFT — pending user approval before execution.
> **Loop position:** brainstorming ✅ → **writing-plans (this doc)** → TDD → cross-AI review → commit
> **Date:** 2026-05-19
> **Inputs:** `web/plans/Phase2a-Auth.md` (chassis), `MIGRATION_LIFF.md §6` (auth flow), CLAUDE.md hard constraints, user decisions 2026-05-19.
> **DoD:** `pnpm typecheck` clean, `pnpm lint` clean, `pnpm test:run` green (≥ 7 new unit tests for lib/line + 6 for callback route), `pnpm build` green, `pnpm test:e2e` green on chassis specs (login button mounts without LIFF_ID and falls back to "LIFF not configured" message).

---

## 0. Goal

Wire the LINE Login path end-to-end **modulo external creds**:

- Client-side: `LiffSignInButton` initialises `@line/liff`, calls `liff.login()`, retrieves the ID token, POSTs to the callback route.
- Server-side: `/api/auth/line/callback` verifies the LINE ID token via the LINE JWKs endpoint, upserts the `User` row, mints session cookies, and writes an `AuditLog` entry.
- Env vars `LIFF_ID`, `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET` are wired but absent in dev/test — the chassis must degrade gracefully (button shows a "LIFF not configured" message instead of crashing).
- Email + TOTP enrolment are out of scope (Phase 2c and 2d). The callback returns `{ needsEmail: true }` or `{ needsTotp: true }` so the UI can route to those enrolment pages once they exist.

---

## 1. Decisions locked-in this session

| #   | Decision                | Value                                                                                                                                 |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Verification            | `jose.createRemoteJWKSet('https://api.line.me/oauth2/v2.1/certs')`                                                                    |
| 2   | Token issuer            | `https://access.line.me` (LINE Login v2.1)                                                                                            |
| 3   | Audience                | `LINE_CHANNEL_ID`                                                                                                                     |
| 4   | Login UI                | Client island in server page (`/login` stays server, button is `'use client'`)                                                        |
| 5   | Missing creds behaviour | Button renders disabled with a phase-note when `LIFF_ID` is unset; callback route returns 503 with `{ error: 'liff_not_configured' }` |

---

## 2. Public API contracts

### `lib/line.ts`

```ts
export type LineProfile = {
  lineUserId: string
  displayName: string
  picture?: string
  email?: string
}

export async function verifyLineIdToken(idToken: string): Promise<LineProfile>
```

- Throws if `LINE_CHANNEL_ID` is unset, the token is missing, or verification fails.
- Verifies `alg=ES256`, issuer, audience, expiry via `jose.jwtVerify`.
- `email` claim is optional and is **not** treated as the verified institutional email (Phase 2c handles `@crma.ac.th` verification independently).
- Remote JWKs URL is overridable via the `LINE_JWKS_URL` env var for tests.

### `POST /api/auth/line/callback`

Request body:

```ts
{
  idToken: string
  deviceFp: string
}
```

Response branches:

- **400** `{ error: 'bad_request' }` — missing fields
- **401** `{ error: 'invalid_token' }` — LINE verification failed
- **503** `{ error: 'liff_not_configured' }` — `LINE_CHANNEL_ID` env missing
- **200** `{ status: 'needs_email' }` — user upserted, `emailVerified` is null; UI should redirect to `/enrol/email` (Phase 2c)
- **200** `{ status: 'needs_totp' }` — email verified, `totpSecret` is null; UI redirects to `/enrol/totp` (Phase 2d)
- **200** `{ status: 'ok' }` — fully enroled, sets `__Host-crma-access` + `__Host-crma-refresh` cookies, persists a `RefreshToken` row keyed by `deviceFp`

Every call writes one `AuditLog` row with `action='AUTH:line_callback'` and `result` matching the response branch.

### Client island `components/auth/LiffSignInButton.tsx`

```tsx
'use client'
// Props: { returnTo: string }
// On mount: dynamic-import @line/liff, call liff.init({ liffId: env.NEXT_PUBLIC_LIFF_ID }).
//   - If init throws → render fallback "Sign in unavailable (LIFF not configured)".
// On click: liff.isLoggedIn() ? getIDToken() : liff.login({ redirectUri }).
// POST { idToken, deviceFp } to /api/auth/line/callback.
// Branch on response.status; route via router.push.
```

`deviceFp` is derived client-side from a salted hash of `navigator.userAgent + screen.width + screen.height + timezone` — coarse but stable enough to gate the TOTP re-prompt in Phase 2d. Full fingerprinting is out of scope.

---

## 3. File tree delta

```
web/
├─ app/
│  ├─ api/
│  │  └─ auth/
│  │     └─ line/
│  │        └─ callback/
│  │           └─ route.ts            ← NEW
│  └─ (public)/
│     └─ login/
│        └─ page.tsx                  ← EDIT: embed <LiffSignInButton />
├─ components/
│  └─ auth/
│     └─ LiffSignInButton.tsx         ← NEW (client island)
├─ lib/
│  └─ line.ts                         ← NEW
├─ __tests__/
│  ├─ line.test.ts                    ← NEW
│  └─ auth-line-callback.test.ts      ← NEW
├─ .env.example                       ← EDIT: LIFF_ID, LINE_CHANNEL_*, LINE_JWKS_URL
└─ package.json                       ← @line/liff added
```

---

## 4. Execution order (TDD per atomic commit)

### Step 4.1 — env example + dep install

- `corepack pnpm add @line/liff`
- `.env.example` adds:

  ```
  # LINE Login channel (server)
  LINE_CHANNEL_ID=
  LINE_CHANNEL_SECRET=
  LINE_JWKS_URL=https://api.line.me/oauth2/v2.1/certs

  # LIFF (client — must be NEXT_PUBLIC_ for the browser bundle)
  NEXT_PUBLIC_LIFF_ID=
  ```

- Commit: `chore(phase2b): @line/liff dep + env keys`

### Step 4.2 — lib/line.ts TDD

- Tests (`__tests__/line.test.ts`, node env):
  - good token → returns `{ lineUserId, displayName, picture?, email? }`
  - wrong issuer → throws
  - wrong audience → throws
  - expired → throws
  - missing `LINE_CHANNEL_ID` → throws
- Implementation uses a `createRemoteJWKSet` with `LINE_JWKS_URL`; test injects a mock JWKs via a local `jose.SignJWT` + `exportJWK` round-trip and overrides `LINE_JWKS_URL` to a `data:` URI or local fixture.
- Commit: `feat(phase2b): lib/line.ts (LINE ID token verifier)`

### Step 4.3 — /api/auth/line/callback TDD

- Tests (`__tests__/auth-line-callback.test.ts`, node env):
  - missing body → 400 + audit `DENY`
  - missing `LINE_CHANNEL_ID` env → 503 + audit `ERROR`
  - bad token → 401 + audit `DENY`
  - good token, new user → upsert, response `{ status: 'needs_email' }`, audit `ALLOW`
  - good token, email verified, no TOTP → `{ status: 'needs_totp' }`, audit `ALLOW`
  - good token, fully enroled → `{ status: 'ok' }`, sets access + refresh cookies, persists `RefreshToken` row, audit `ALLOW`
- Test plumbing: factory `createCallbackHandler({ prisma, verifyLineIdToken, signAccess, signRefresh })` so the route stays thin and the unit test can pin every branch.
- Commit: `feat(phase2b): /api/auth/line/callback route`

### Step 4.4 — LiffSignInButton client island

- Dynamic-import `@line/liff` so SSR never pulls it.
- Component renders a fallback when `process.env.NEXT_PUBLIC_LIFF_ID` is absent.
- Component-level testing limited to render-fallback case (jsdom). Full LIFF SDK interaction is gated by env in 2b — verified manually once LIFF_ID lands.
- Commit: `feat(phase2b): LiffSignInButton client island`

### Step 4.5 — Login refactor + e2e

- Replace disabled button in `/login` with `<LiffSignInButton returnTo={safeReturn} />`.
- Existing Playwright spec updated to assert the button reaches the fallback state (no LIFF_ID in CI env) — still disabled-equivalent, still data-testid `login-line-button`.
- Commit: `feat(phase2b): wire LiffSignInButton into /login`

### Step 4.6 — README + progress tracker

- `README.md §6` + `README_TH.md §6`: Phase 2b row → done.
- Commit: `docs(phase2b): mark Phase 2b complete`

---

## 5. What's NOT in Phase 2b

- ❌ No email OTP send (2c).
- ❌ No `lib/crypto.ts` envelope for `User.email` (2c) — column stays plaintext until 2c.
- ❌ No TOTP enrolment, no QR code (2d).
- ❌ No `/enrol/email` or `/enrol/totp` pages — the callback returns branches but UI lands in 2c/2d.
- ❌ No Supabase provisioning — tests use a mock prisma; first real migration in 2b's follow-up when DATABASE_URL is set.
- ❌ No `proxy.ts` rename (middleware deprecation) — Phase 10.

---

## 6. Risks

| Risk                                                   | Mitigation                                                                                                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@line/liff` pulls jQuery-like globals at SSR          | Dynamic import (`import('@line/liff')`) inside `useEffect`                                                                                             |
| LINE JWKs cache TTL surprises                          | `jose.createRemoteJWKSet` caches with the response headers; LINE serves `Cache-Control` so we accept the SDK default                                   |
| Test JWKs setup is awkward                             | Use `jose.exportJWK` + serve via a `data:` URL or a tiny http server in test setup; document the fixture                                               |
| `deviceFp` collisions                                  | Coarse fingerprint is a re-prompt heuristic, not a security boundary; full fingerprint (FingerprintJS / canvas) is Phase 10 only if compliance demands |
| Edge runtime cannot use Prisma                         | Route handler runs in Node runtime by default (`/api/*/route.ts`), not Edge — confirmed by Next 16 docs                                                |
| Build fails because `NEXT_PUBLIC_LIFF_ID` is undefined | Read via `process.env.NEXT_PUBLIC_LIFF_ID ?? ''` and gate the component accordingly; never throw at import time                                        |

---

## 7. Approval gate

- [ ] User confirms callback branches `needs_email` / `needs_totp` / `ok` are acceptable enrolment states.
- [ ] User confirms `deviceFp` as coarse hash is acceptable for 2b (refined in 10).
- [ ] User confirms `LIFF_ID` will surface as `NEXT_PUBLIC_LIFF_ID` (only `NEXT_PUBLIC_*` vars reach the client bundle).
- [ ] User confirms tests using `jose`-issued tokens against a synthesised JWKs are an acceptable proxy for the real LINE certs in unit tests.

On approval → claim task #20 and execute Step 4.1.
