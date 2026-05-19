# Phase 2a — Auth Foundations

> **Status:** DRAFT — pending user approval before execution.
> **Loop position:** brainstorming ✅ → **writing-plans (this doc)** → TDD → cross-AI review → commit
> **Date:** 2026-05-19
> **Inputs:** `MIGRATION_LIFF.md §1` (auth fork rows 2–3), `MIGRATION_LIFF.md §5` (Prisma schema), `MIGRATION_LIFF.md §6` (auth flow), `MIGRATION_LIFF.md §8` (API pattern), `README.md §3` (hard constraints).
> **DoD:** `pnpm typecheck` clean, `pnpm lint` clean, `pnpm test:run` green (≥ 15 new unit tests), `pnpm prisma generate` clean, migration committed, CI green with Postgres service container, README progress tracker bilingual.

---

## 0. Goal

Land the **provider-agnostic** auth chassis so Phase 2b can drop in LIFF, 2c can drop in email OTP, and 2d can drop in TOTP — each as a single-feature commit that wires real external services.

Phase 2a stays inside the boundary of `node_modules` and `prisma` (Postgres). **No LINE SDK, no SMTP, no QR code generation, no LIFF SDK** — those land in 2b/2c/2d as decided this session.

---

## 1. Decisions locked-in this session

| #   | Decision           | Value                                                                                                                                      |
| --- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Scope              | 2a foundations only; 2b (LIFF), 2c (email OTP), 2d (TOTP) split off                                                                        |
| 2   | Session lifetime   | 1h access JWT + 30d refresh JWT (rotation on use)                                                                                          |
| 3   | Cookie             | `httpOnly` + `Secure` + `SameSite=Lax`, name prefix `__Host-`                                                                              |
| 4   | TOTP issuer string | `CRMA Smart Academy` (used in 2d)                                                                                                          |
| 5   | JWT lib            | `jose` 5.x (already locked)                                                                                                                |
| 6   | DB host            | Supabase Postgres `ap-southeast-1` (provisioning deferred)                                                                                 |
| 7   | Creds in hand      | LINE Login channel ID + secret (consumed in 2b, stored as env in 2a `.env.example`)                                                        |
| 8   | Test DB strategy   | Local: mocked Prisma client (unit tests only). CI: Postgres 16 service container for migrate-diff + integration tests in later sub-phases. |

Open creds (deferred): LIFF ID, Supabase URL, Brevo SMTP. Phase 2a does not need them.

---

## 2. Schema delta (Prisma 7)

Land **the minimum subset** of `MIGRATION_LIFF.md §5` needed for auth + audit. Other models stay out until their owning view phase needs them.

### Models added in Phase 2a

```prisma
enum Role {
  CADET
  INSTRUCTOR
  OFFICER
  ADMIN
}

model User {
  id             String    @id @default(cuid())
  cadetId        String    @unique
  email          String    @unique               // @crma.ac.th gate enforced at app layer
  emailVerified  DateTime?
  lineUserId     String?   @unique
  displayName    String
  avatarUrl      String?
  role           Role      @default(CADET)
  company        String?
  year           Int?
  totpSecret     String?                          // encrypted at app layer in 2d
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  refreshTokens  RefreshToken[]
  auditLogs      AuditLog[]
  @@index([role])
}

model RefreshToken {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash   String   @unique                    // sha256 of the JWT, never raw
  deviceFp    String                              // device fingerprint (UA + iphash) for TOTP gate
  expiresAt   DateTime
  revokedAt   DateTime?
  createdAt   DateTime @default(now())
  lastUsedAt  DateTime @default(now())
  @@index([userId, expiresAt])
  @@index([tokenHash])
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  action     String                                // "READ:grades", "WRITE:roster", "AUTH:login_attempt"
  resource   String                                // "semester:2/2568", "user:abc123"
  result     AuditResult @default(ALLOW)
  ip         String?
  userAgent  String?
  metadata   Json?
  createdAt  DateTime @default(now())
  @@index([userId, createdAt])
  @@index([resource, createdAt])
  @@index([action, createdAt])
}

enum AuditResult {
  ALLOW
  DENY
  ERROR
}
```

### Models deferred

`Semester`, `Course`, `ClassSession`, `Enrollment`, `PFTResult`, `DutyRoster`, `Announcement`, `Event`, `EventRSVP` — each lands in its owning phase (5–9).

### Sensitive columns flagged

| Column                   | Encryption mode                  | Phase that wires it                     |
| ------------------------ | -------------------------------- | --------------------------------------- |
| `User.email`             | pgcrypto envelope                | 2c (only need it once OTP send happens) |
| `User.totpSecret`        | pgcrypto envelope                | 2d                                      |
| `RefreshToken.tokenHash` | already a sha256 — not encrypted | 2a                                      |

Column type stays `String` in Phase 2a; the envelope helper (`lib/crypto.ts`) lands when first consumer ships in 2c.

---

## 3. Library shapes

### `lib/session.ts`

Pure functions over `jose`. No prisma imports. Fully unit-testable.

```ts
// Public API
export type SessionPayload = {
  sub: string // user.id
  role: Role
  cadetId: string
  email: string
  deviceFp: string
}

export async function signAccessToken(payload: SessionPayload): Promise<string>
export async function signRefreshToken(
  payload: SessionPayload,
): Promise<{ token: string; hash: string; expiresAt: Date }>
export async function verifyAccessToken(token: string): Promise<SessionPayload>
export async function verifyRefreshToken(token: string): Promise<SessionPayload>

export function buildAccessCookie(token: string): string // returns Set-Cookie value
export function buildRefreshCookie(token: string): string
export function clearAuthCookies(): string[]

export const ACCESS_COOKIE = '__Host-crma-access'
export const REFRESH_COOKIE = '__Host-crma-refresh'
```

JWT shape: `iss=crma-smart-academy`, `aud=crma-web`, `exp` = 3600 for access / 2592000 for refresh, `iat`, `jti` (uuid), payload claims above.

Secret: `JWT_SECRET` env var, HS256. Rotation hook: accept array `JWT_SECRETS` for verify (first entry = current sign key); deferred to Phase 10 hardening.

### `lib/rbac.ts`

Pure. No imports beyond `Role` from `@prisma/client`.

```ts
export function canViewGrades(role: Role, semesterIsLocked: boolean): boolean
export function canEditRoster(role: Role): boolean
export function canPublishAnnouncement(role: Role): boolean
export function canEditEnrollment(role: Role): boolean
export function isStaffPlus(role: Role): boolean // INSTRUCTOR | OFFICER | ADMIN
export function isOfficerPlus(role: Role): boolean // OFFICER | ADMIN
```

Matrix:

| Action                          | CADET    | INSTRUCTOR      | OFFICER | ADMIN |
| ------------------------------- | -------- | --------------- | ------- | ----- |
| view-grades (semester unlocked) | own only | enrolled cohort | all     | all   |
| view-grades (locked semester)   | ❌       | ❌              | ❌      | ❌    |
| edit-roster                     | ❌       | ❌              | ✅      | ✅    |
| publish-announcement            | ❌       | ✅              | ✅      | ✅    |
| edit-enrollment                 | ❌       | ❌              | ❌      | ✅    |

Per-resource ownership checks (e.g., "own grades only") sit at API-route layer, not in `rbac.ts`. `rbac.ts` answers only role-level capability.

### `lib/audit.ts`

```ts
// Server-only (throws if imported in client component).
import 'server-only'

export async function audit(opts: {
  userId: string | null
  action: string
  resource: string
  result?: AuditResult // default ALLOW
  ip?: string | null
  userAgent?: string | null
  metadata?: Record<string, unknown>
}): Promise<void>
```

Writes one row to `AuditLog`. Never throws to caller (logs to `console.error` on failure) — audit failure must not break the request, but it must be loud.

For tests: factory `createAudit({ prisma })` returns the `audit` fn so tests can inject a mock prisma. The default export is bound to the singleton.

### `lib/prisma.ts` — adapter wire-up

```ts
import 'server-only'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const url = process.env.DATABASE_URL
if (!url && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL is required in production')
}

const adapter = url ? new PrismaPg({ connectionString: url }) : undefined

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient(adapter ? { adapter } : {})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

Generator preview features may need `driverAdapters` in `schema.prisma` — confirm against Prisma 7 release notes during execution.

### `middleware.ts`

Edge runtime is **off** (Prisma requires Node). Use `runtime = 'nodejs'`.

```ts
// Pseudocode
1. Skip middleware for /_next, /favicon.ico, /api/auth/*, public assets.
2. Read ACCESS_COOKIE.
3. If absent → for /api/* → 401; for app routes → redirect to /login.
4. verifyAccessToken → on fail, try refresh; if refresh OK, mint new access cookie inline.
5. Attach payload to req via `x-user-*` headers (id, role, cadetId).
6. For /api/* methods POST|PUT|PATCH|DELETE → audit row WRITE attempt before route handler runs.
   (Successful mutations still write their domain audit row; this row captures the entry.)
```

Middleware does NOT call Prisma directly — it uses a tiny `auditEntry` helper that POSTs to an internal route (`/api/_audit/entry`) so the Edge/Node split stays clean. **For Phase 2a, middleware writes the audit row inline via direct Prisma call** since runtime is Node; the internal-route helper is a Phase 10 hardening item.

---

## 4. File tree delta

```
web/
├─ app/
│  └─ (public)/
│     └─ login/
│        └─ page.tsx              ← NEW: server component placeholder
├─ lib/
│  ├─ audit.ts                    ← NEW
│  ├─ prisma.ts                   ← REWRITE: wire adapter-pg
│  ├─ rbac.ts                     ← NEW
│  └─ session.ts                  ← NEW
├─ prisma/
│  ├─ schema.prisma               ← EDIT: add User/Role/RefreshToken/AuditLog/AuditResult
│  └─ migrations/
│     └─ <timestamp>_auth_foundation/
│        └─ migration.sql         ← NEW (generated)
├─ __tests__/
│  ├─ session.test.ts             ← NEW: sign/verify round-trip, expiry, tamper
│  ├─ rbac.test.ts                ← NEW: matrix table tests
│  ├─ audit.test.ts               ← NEW: writes row, failure swallowed
│  └─ middleware.test.ts          ← NEW: cookie-gate behavior
├─ middleware.ts                  ← NEW
└─ .env.example                   ← EDIT: add LINE_*, JWT_SECRET
.github/workflows/ci.yml          ← EDIT: postgres:16 service + prisma migrate diff
```

---

## 5. Execution order (TDD per atomic commit)

### Step 5.1 — Schema + migration

- Edit `prisma/schema.prisma` per §2.
- Add `previewFeatures = ["driverAdapters"]` to generator block if Prisma 7 still requires it.
- Run `pnpm prisma generate` (must succeed without DB).
- `prisma migrate dev --name auth_foundation` requires a real DB. Two paths:
  - **Path A:** start a throwaway local Postgres via Docker; generate the migration; commit `migration.sql`.
  - **Path B:** defer migration file generation to first `prisma migrate dev` against Supabase; commit only schema for now.
- Recommendation: **Path A** so CI can replay the migration against its postgres service.
- Commit: `feat(phase2a): prisma schema for auth + audit`

### Step 5.2 — Prisma adapter wire-up

- `pnpm add @prisma/adapter-pg pg`; `pnpm add -D @types/pg`.
- Rewrite `lib/prisma.ts` per §3.
- Verify: `pnpm typecheck`, `pnpm prisma generate`.
- Commit: `feat(phase2a): wire @prisma/adapter-pg`

### Step 5.3 — lib/session.ts (jose) — TDD

- `pnpm add jose`.
- Write `__tests__/session.test.ts` first — must FAIL on missing implementation:
  - sign access → verify → payload matches
  - sign refresh → hash is deterministic sha256, returned hash matches recomputed
  - verifying expired token throws
  - verifying tampered token throws
  - cookies have `httpOnly; Secure; SameSite=Lax; Path=/`; `__Host-` prefix requires `Path=/` + `Secure` + no Domain
- Implement `lib/session.ts` until tests pass.
- Commit: `feat(phase2a): session lib (jose JWT + httpOnly cookies)`

### Step 5.4 — lib/rbac.ts — TDD

- Write `__tests__/rbac.test.ts` with table tests against the matrix in §3.
- Implement `lib/rbac.ts`.
- Commit: `feat(phase2a): rbac role matrix`

### Step 5.5 — lib/audit.ts — TDD

- Write `__tests__/audit.test.ts` with injected mock prisma:
  - writes one row with action/resource/userId/ip/userAgent
  - swallows DB error and logs (assert via `vi.spyOn(console, 'error')`)
  - `server-only` import gate (smoke check via `expect(() => …).toThrow` from a forced client context)
- Implement `lib/audit.ts`.
- Commit: `feat(phase2a): audit log writer`

### Step 5.6 — middleware.ts — TDD

- Write `__tests__/middleware.test.ts` using `NextRequest`/`NextResponse` from `next/server`:
  - no cookie + /api/foo → 401
  - no cookie + /home → redirect /login
  - expired access + valid refresh → 200 with new access cookie set
  - valid access + POST /api/foo → audit entry row written
  - bypass path (/api/auth/line/callback) → no audit, passes through
- Implement `middleware.ts`. Set `runtime = 'nodejs'` via `config` export.
- Commit: `feat(phase2a): auth middleware`

### Step 5.7 — (public)/login page shell

- Create `app/(public)/login/page.tsx`:
  - Server component, reads `?return=` for post-login redirect target.
  - Renders headline ("Sign in with LINE") and a disabled placeholder button.
  - No client JS, no LIFF SDK — only documents the contract Phase 2b will fulfill.
- Add Playwright spec `e2e/login.spec.ts` asserting the page reachable + heading visible.
- Commit: `feat(phase2a): login route shell (LIFF wiring deferred to 2b)`

### Step 5.8 — CI Postgres + migrate-diff

- Edit `.github/workflows/ci.yml`:
  - Add `services.postgres` with image `postgres:16`, env `POSTGRES_PASSWORD=ci`, healthcheck.
  - Set `DATABASE_URL=postgresql://postgres:ci@localhost:5432/postgres` for steps.
  - Insert step `pnpm prisma migrate deploy` before `pnpm test:run`.
  - Insert step `pnpm prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --script` → fail if non-empty (catches drift).
- Local verification: skip (no docker assumed); CI proves it.
- Commit: `ci(phase2a): postgres service + prisma migrate deploy + drift check`

### Step 5.9 — Progress tracker + lock notes

- README.md §6 + README_TH.md §6 add Phase 2a row.
- README.md §3 note: `jose`, `@prisma/adapter-pg`, `pg` added to stack.
- Commit: `docs(phase2a): mark Phase 2a complete`

---

## 6. What's NOT in Phase 2a (block any leak)

- ❌ No LIFF SDK install, no `liff.init`.
- ❌ No `/api/auth/line/callback` route handler body (Phase 2b).
- ❌ No SMTP / email OTP send (Phase 2c).
- ❌ No TOTP enrollment, no QR code, no `otpauth` lib (Phase 2d).
- ❌ No real email-domain regex check at write-time (Phase 2c will own it).
- ❌ No pgcrypto helper (`lib/crypto.ts`) — added when 2c first writes `User.email` encrypted.
- ❌ No `/api/auth/_audit/entry` internal route (Phase 10 hardening).
- ❌ No middleware-driven JWKs fetch (Phase 2b).
- ❌ No device-fingerprint TOTP gate (Phase 2d).

If any of these creep in during execution, abort the commit and split.

---

## 7. Hard constraints encoded in 2a

| Constraint                                     | How 2a encodes it                                                                                                |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `@crma.ac.th` gate                             | `User.email` schema-unique; regex deferred to 2c but documented in schema comment                                |
| TOTP mandatory                                 | `User.totpSecret` column exists, nullable; non-null check + verify on auth deferred to 2d                        |
| Current-semester grades LOCKED at Prisma layer | Out of 2a scope (no Semester model yet)                                                                          |
| Duty roster mutations RBAC-gated               | `lib/rbac.ts` `canEditRoster` returns false for non-OFFICER (table test pins)                                    |
| Every API mutation writes AuditLog             | Middleware writes entry row for all POST/PUT/PATCH/DELETE on `/api/*`; domain audit rows added in feature phases |
| PDPA encryption sensitive cols                 | Columns flagged in §2; helper deferred but column types reserved (String, no Bytes)                              |
| Cookies httpOnly Secure SameSite=Lax           | `lib/session.ts` enforces; `__Host-` prefix bans Domain attribute and forces Path=/                              |
| `localStorage` for tokens forbidden            | n/a — no client-side storage anywhere in 2a                                                                      |

---

## 8. Risks specific to Phase 2a

| Risk                                                               | Mitigation                                                                                                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prisma 7 `driverAdapters` preview flag drift                       | Pin Prisma 7.8.0 in lockfile (already pinned); document required flag in `schema.prisma` comment                                                        |
| `@prisma/adapter-pg` Windows + pgbouncer behavior                  | Phase 2a uses direct pg (no pgbouncer until prod); pooled URL via PgBouncer is a Supabase-time concern                                                  |
| `next/server` typing differences in middleware tests               | Use `@vercel/edge` types? No — Node runtime; use `next/server` types directly; mock cookie store via `NextRequest` constructor                          |
| jose token replay                                                  | Add `jti` claim + per-refresh rotation: each successful refresh-use revokes the consumed `RefreshToken` row and mints a new one                         |
| Audit table grows fast                                             | Index strategy in §2 covers the common queries; partitioning + cold storage is a Phase 10 task — flagged in `MIGRATION_LIFF.md §15 risk 5`              |
| Hooks block Phase 2a commits if lint-staged times out on big diffs | Pre-commit already proven in Phase 1; if it bites, increase `lint-staged` concurrency — never bypass with `--no-verify`                                 |
| Migration generation needs local Postgres                          | Document Docker fallback: `docker run --rm -d -p 5432:5432 -e POSTGRES_PASSWORD=local postgres:16`; abort if user has neither Docker nor Supabase ready |

---

## 9. Approval gate

Before executing Steps 5.1–5.9:

- [ ] User confirms schema delta §2 — any models to add/remove for 2a?
- [ ] User confirms cookie names `__Host-crma-access` / `__Host-crma-refresh` (prefix prevents domain hijack but breaks if Vercel preview URLs don't serve HTTPS — they do).
- [ ] User confirms RBAC matrix §3 — any role/action missing?
- [ ] User confirms Path A (local Docker Postgres for migration) vs Path B (defer migration until Supabase provisioning).
- [ ] User has Docker available OR accepts Path B with the consequence that CI won't be able to migrate-deploy until 2b provisions Supabase.

On approval → claim task #9 (schema) and proceed step-by-step.
