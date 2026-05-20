# Threat Model — CRMA Smart Academy (Web/LIFF)

_Authored 2026-05-20 during Phase 10 hardening. Maintained alongside `CLAUDE.md §"Hard constraints"`. Update whenever a hard constraint is added, relaxed, or a control gets implemented or retired._

## Scope

Single Next.js 16 LIFF web app on Vercel, talking to Supabase Postgres
(`ap-southeast-1`), Brevo SMTP, and the LINE Messaging + Login APIs. In
scope: account compromise, data exfiltration, abuse of mutation
endpoints, PDPA non-compliance. Out of scope: physical access to a
cadet's device, social engineering of staff via channels the app does
not control (e.g. WhatsApp), and OS-level attacks on the LINE app
itself.

## Assets

| Asset | Sensitivity | Where it lives |
| --- | --- | --- |
| `User.emailCiphertext` | PII / PDPA | Postgres column, AES-256-GCM enveloped via `ENCRYPTION_KEY` |
| `User.emailHash` | Lookup hash | Postgres column, HMAC-SHA-256 via `HMAC_KEY` |
| `User.totpSecret` | Auth secret | Postgres column, AES-256-GCM enveloped |
| `Enrollment.grade` | Academic record | Phase 11 — pgcrypto column-level encryption planned |
| `PFTResult.*` | Health PII | Phase 11 — pgcrypto column-level encryption planned |
| Refresh tokens | Session credential | httpOnly Secure cookie + hashed `RefreshToken.tokenHash` row |
| LINE channel access token | Bot credential | `LINE_CHANNEL_ACCESS_TOKEN` env, never logged |
| `CRON_SECRET` | Cron auth | env var, used for `Bearer` check in `/api/cron/*` |

## Threats and mitigations

### T1. Account takeover via stolen access cookie

- **Vector:** XSS exfiltrates `document.cookie`, or LINE webview cache leaks the cookie to another origin.
- **Controls in place:**
  - `__Host-` prefixed cookies → no `Domain` attribute, `Secure` + `Path=/` mandatory.
  - `HttpOnly` blocks `document.cookie` read entirely.
  - `SameSite=Lax` blocks cross-site POSTs.
  - CSP `frame-ancestors 'none'` + `X-Frame-Options: DENY` blocks click-jacking.
  - `localStorage` is never used for tokens — LINE webview evicts it on iOS, but more importantly it would be reachable from injected scripts.
- **Residual risk:** XSS that runs in the same origin still loses against `HttpOnly`. Continue to rely on Phase 10 CSP + React escaping. Nonce-based CSP is a Phase 10b follow-up to remove `'unsafe-inline'`.

### T2. TOTP code replay across requests

- **Vector:** Attacker observes a valid 6-digit code in a phishing UI and replays it within the 30s window.
- **Controls in place:**
  - `User.lastTotpStep` records the last successfully consumed step. `verify` rejects codes resolving to a step ≤ `lastTotpStep`.
  - Verification window is `±1` step, not `±N`.
- **Residual risk:** Same-step double-submit by the user themselves on a slow LINE webview is benign — the second 409 surfaces in UI but does not roll back the first.

### T3. New device session hijack

- **Vector:** Attacker imports stolen LINE credentials onto their own device; `LineLogin` succeeds; LIFF callback would otherwise mint cookies.
- **Controls in place:**
  - Browser fingerprint `deviceFp` (Web Crypto SHA-256 of `navigator.*` features) is stored on every `RefreshToken` row.
  - LINE callback only mints cookies when a non-expired, non-revoked `RefreshToken(userId, deviceFp)` row exists. Otherwise → `needs_reverify` → `/reverify/totp` re-prompt.
- **Residual risk:** A determined attacker can replay the same fingerprint. The TOTP re-prompt limits the attack to "stole the TOTP secret too".

### T4. Webhook spoofing of LINE events

- **Vector:** Attacker posts crafted JSON to `/api/line/webhook` impersonating LINE to trigger AuditLog noise or test downstream side-effects.
- **Controls in place:**
  - HMAC-SHA-256 of raw request body verified against `x-line-signature` header using `LINE_CHANNEL_SECRET`.
  - `crypto.timingSafeEqual` for constant-time compare.
  - On signature mismatch: 401 + `WEBHOOK:line_receive` audit row tagged `DENY`.
- **Residual risk:** Channel-secret leak. Mitigation: rotate via LINE Developer console + redeploy.

### T5. Cron endpoint abuse

- **Vector:** Attacker discovers `/api/cron/duty-reminder` and triggers the LINE multicast burst.
- **Controls in place:**
  - Endpoint demands `Authorization: Bearer ${CRON_SECRET}` (Vercel injects automatically).
  - Direct, constant-time string compare for the bearer.
  - Missing or wrong secret → 401 + `CRON:duty_reminder` audit `DENY`.
  - Middleware `PUBLIC_PREFIXES` adds `/api/cron` so the handler is the sole gate — no double-counting.
- **Residual risk:** CRON_SECRET in env logs. Mitigation: scrub env from CI logs (Vercel scrubs by default).

### T6. Locked-semester grade leak

- **Vector:** Cadet or attacker hits `/api/grades` for the current semester before grades are released.
- **Controls in place:**
  - Server-side `Semester.isLocked` gate in the (forthcoming Phase 11) `/api/grades` handler → returns 423.
  - Frontend `GradesView` (Phase 8) shows `LockedNotice` instead of grades when `isLocked === true`.
- **Residual risk:** If the gate is forgotten in a future grade endpoint, the encrypted column saves us only after decryption. Code review checklist must include the lock check.

### T7. PDPA non-compliance (right to access + erasure)

- **Vector:** Cadet requests a copy of their data or asks to be deleted; we cannot fulfil the request in the regulatory window.
- **Controls in place:**
  - `GET /api/me/export` returns the full PII bundle (User row with decrypted email + all AuditLog rows keyed to that user).
  - `POST /api/me/delete` revokes every active `RefreshToken` row, clears cookies, writes an audit row.
  - Every PDPA action writes an `AuditLog` tagged `PDPA:export` / `PDPA:delete_sessions`.
- **Residual risk:** Hard deletion of the User row + cascade across `RefreshToken`, `AuditLog`, `EmailOtp` is not yet implemented — it requires a `deletedAt` migration and a scheduled hard-delete job (Phase 10b). Until then, deletion requests are fulfilled manually by an operator running a Prisma script + an admin audit export.

### T8. Audit log tampering or quiet drop

- **Vector:** Attacker inside the network or a careless commit removes the `audit()` call on a mutation handler, leaving no record.
- **Controls in place:**
  - `lib/audit.ts` swallows DB errors but logs to `console.error`; reviewers grep for the loud message.
  - `ADMIN:audit_export` produces CSV evidence for compliance review, gated by `lib/rbac.canExportAudit` (ADMIN only).
  - CLAUDE.md hard constraint: "Every API mutation writes one `AuditLog` row. No exceptions."
- **Residual risk:** No append-only or hash-chained AuditLog yet. Phase 10b follow-up: WORM storage rotation + tamper-evident chaining.

### T9. Data sovereignty (Supabase SG)

- **Vector:** TH compliance review flags storing cadet PII outside Thailand.
- **Controls in place:**
  - All PDPA-grade columns are encrypted with locally-held keys (`ENCRYPTION_KEY`, `HMAC_KEY`) → DB host sees only ciphertext + hashes.
  - LINE channel credentials are env vars on Vercel; the LINE OA itself is operated from TH.
  - The risk is **documented** in `README.md §5 — Security & compliance`.
- **Residual risk:** A subpoena or warrant served on Supabase SG could still produce ciphertext that survives key rotation if both keys leak. TH-host fallback (CAT Cloud / NIPA / on-prem) is the planned remediation if compliance escalates.

### T10. CSRF on mutation endpoints

- **Vector:** Attacker hosts a form that POSTs to `/api/me/delete` from a cadet's browser.
- **Controls in place:**
  - `SameSite=Lax` on `__Host-crma-access` blocks cross-site POSTs automatically.
  - Mutation endpoints require the cookie, which the cross-site form cannot read or forge.
  - Cron + webhook endpoints use bearer / HMAC instead of cookies, so the CSRF surface there is zero.
- **Residual risk:** GET endpoints (e.g. `/api/me/export`) could in principle be triggered cross-site for side-effects. We rely on no GET handler having side-effects beyond an audit row.

## Performance / availability budget (Phase 10)

- Lighthouse mobile preset, simulated throttling, three runs per route.
- See `web/lighthouserc.json` for assertions. Headline: performance ≥ 0.85, accessibility ≥ 0.95, LCP ≤ 2.5s, JS bundle ≤ 250KB.
- Vercel Cron `0 22 * * *` for the daily duty reminder; failures surface via Sentry + the AuditLog row tagged `result: ERROR`.

## Pen-test cadence

External pen test booked once per release train (every 4 milestone phases). Findings flow into this document under a new "Threats" entry plus an issue on the milestone board.
