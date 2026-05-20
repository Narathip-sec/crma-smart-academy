# CRMA Smart Academy — Web (LIFF)

> Digital platform for cadets at the Chulachomklao Royal Military Academy (CRMA).
> Single-codebase rewrite of the Expo/RN mobile app as a LINE LIFF web app on Vercel.

---

## 1. Overview

**CRMA Smart Academy (Web)** consolidates fragmented cadet systems — class schedule, military training,
daily life, announcements, grades, AI fitness coaching — into one LIFF-distributed web app installed
through the official CRMA LINE Official Account.

Mobile codebase (`app/` in the predecessor repo) is **frozen as reference**. This repo is the forward
single source of truth.

### Primary user groups

- **Cadets** — primary users
- **Instructors / training officers** — record scores, evaluate, assign tasks
- **Commanding officers / cadet officers** — view cadet performance
- **Administrative / registrar staff** — manage data, announcements

---

## 2. Core Features (parity targets)

### 2.1 Academic

- Weekly / semester class schedules
- Incomplete assignment notifications *(submission stays external — Moodle: `https://lms.crma.ac.th/moodle/my/`)*
- Grades + GPA / GPAX per semester *(current semester LOCKED — past only)*
- Digital library / e-Books / AI-powered Q&A

### 2.2 Military training

- Physical Fitness Test (PFT) results + AI recommendations
- Shooting record / tactical training e-Books
- Leadership evaluation

### 2.3 Daily life

- Duty roster / guard schedule *(RBAC-gated edit — Officer+ only)*
- Mess hall menu + calorie calculation
- Maintenance request / complaint
- Battalion / regiment / academic / event announcements
- Event room creation (MeetUp-inspired)

### 2.4 Communication

- LINE Messaging API push (narrowcast / multicast / push)
- Central activity calendar
- Group chat rooms (via LINE OA groups — deep link)
- Event RSVP via LINE flex messages

### 2.5 Personal development

- Personal goals · academy calendar · to-do · cadet journal
- Supplementary courses · achievement portfolio

---

## 3. Architecture

### Tech stack (LOCKED 2026-05-19)

- **Framework:** Next.js 16 (App Router, Node runtime for Prisma)
- **Language:** TypeScript 5 strict + `noUncheckedIndexedAccess`
- **Styling:** Tailwind v4 + class-variance-authority (design tokens mirror mobile)
- **State:** Zustand 5 (slices: tab · schedule · health · activity)
- **Routing contract:** single `activeTab` string drives view switch — mirrors mobile prototype.
  URL `?tab=` backed by Zustand store; no nested route layouts.
- **i18n:** next-intl (TH default, EN fallback)
- **ORM:** Prisma 7 → PostgreSQL (datasource URL in `prisma.config.ts`, runtime via driver adapter)
- **DB host:** Supabase Postgres, region `ap-southeast-1` (Singapore) — sovereignty caveat documented
- **Auth:** LINE Login (LIFF) → `@crma.ac.th` email OTP → TOTP 2FA enrol → JWT (jose) in httpOnly Secure cookie
- **Storage:** Vercel Blob (sovereignty caveat) for avatars + complaint photos
- **Push:** LINE Messaging API (broadcast / narrowcast / push) via OA channel
- **Cron / jobs:** Vercel Cron + Inngest
- **Email OTP:** SMTP via Brevo (TH-friendly deliverability)
- **Observability:** Vercel Analytics + Sentry
- **Testing:** Vitest + `@testing-library/react` + Playwright (LINE webview UA) + `next-test-api-route`
- **Deploy:** Vercel (preview per PR, prod = `main`)

### Hard constraints (never violate)

- `@crma.ac.th` email gate enforced server-side. Reject all other domains.
- TOTP 2FA mandatory; verified on every new device fingerprint.
- Current-semester grades LOCKED at Prisma layer via `Semester.isLocked`.
- Duty roster mutations RBAC-gated (`OFFICER` / `ADMIN` only).
- Every API mutation writes an `AuditLog` row.
- PDPA: encrypt `User.totpSecret`, `User.email`, `PFTResult.*`, `Enrollment.grade` (pgcrypto / app-layer envelope).
- Data sovereignty: primary DB outside TH is a documented gap — mitigate via encryption + audit; TH-host fallback planned.

---

## 4. Source documents (read before designing)

- `EXPORT.html` — full project snapshot from the predecessor mobile project.
- `PLAN.html` — `/init` plan: SKILL.md, moodboard, template skeleton, Prisma, auth flow, 4 sample components, TDD phases.
- `MIGRATION_LIFF.md` — mobile→LIFF migration design (16 sections, 14 forks).
- Predecessor repo (mobile, frozen): `C:\palm\NarathipOS\CRMA Smart academy mobile app`
  - `prototype_spec.md` — visual + interaction contract
  - `references/*.png` — 13 annotated mockups
  - `app/src/components/` — 30 RN components for 1:1 port
  - `app/src/fixtures/` — data shape source
  - `Documents/` — Thai-language research PDFs

---

## 5. Security & compliance

- **Data sovereignty** — Supabase SG documented as gap; TH-host fallback (CAT Cloud / NIPA / on-prem) planned if compliance escalates.
- **Authentication** — 2FA (TOTP) + `@crma.ac.th` allow-list + cadet ID binding.
- **RBAC** — `Role` enum: `CADET` · `INSTRUCTOR` · `OFFICER` · `ADMIN`.
- **Audit log** — every mutation + sensitive read writes `AuditLog`.
- **Encryption** — pgcrypto for sensitive columns; cookies `httpOnly Secure SameSite=Lax`.
- **Compliance** — PDPA B.E. 2562 + Royal Thai Army data classification.

---

## 6. Progress Tracker

Updated after each completed milestone in the superpowers loop (brainstorming → writing-plans → TDD → review → commit).

| Date       | Milestone                                        | Notes                                                                |
| ---------- | ------------------------------------------------ | -------------------------------------------------------------------- |
| 2026-05-19 | Repo seeded                                      | `README.md`, `README_TH.md`, `EXPORT.html`, `PLAN.html`, `MIGRATION_LIFF.md` from predecessor session. |
| 2026-05-19 | `/init` + CLAUDE.md                              | Per-repo Claude Code guidance landed; SKILL.md install deferred to Phase 2 prep. |
| 2026-05-19 | Phase 1 — Bootstrap `web/`                       | Next.js 16 · React 19 · TS 5 strict · Tailwind v4 · Prisma 7 · Vitest 4 · Playwright 1.60 · Husky + lint-staged · CI wired. Lock updated: Next 15→16, Prisma 5→7. |
| 2026-05-19 | Phase 2a — Auth foundations                      | Schema (User · Role · RefreshToken · AuditLog) · `@prisma/adapter-pg` · `lib/session.ts` (jose, 1h + 30d, `__Host-` cookies) · `lib/rbac.ts` · `lib/audit.ts` · `middleware.ts` · `/login` shell · CI postgres service. 48 unit tests + 3 e2e green. |
| 2026-05-19 | Phase 2b — LIFF + LINE callback                  | `lib/line.ts` (jose ES256 + LINE JWKs) · `/api/auth/line/callback` (needs_email · needs_totp · ok branches · AuditLog per call) · `LiffSignInButton` client island (NEXT_PUBLIC_LIFF_ID gated · deviceFp via Web Crypto SHA-256) · `/login` refactor. 63 unit tests + 3 e2e green. Real flow lights up when LIFF_ID + DATABASE_URL land. |
| 2026-05-20 | Phase 2c — Email OTP                             | `lib/crypto.ts` AES-256-GCM + HMAC envelope · `User` schema split (`emailHash` + `emailCiphertext`) · `EmailOtp` model · `lib/email-otp.ts` (6-digit code · 10 min TTL · 5 attempts · 60 s rate-limit) · `lib/email.ts` Brevo HTTP + dev fallback · `__Host-crma-enrol` JWT (15 min · `aud=crma-enrol`) · `/api/auth/email/start` + `/verify` routes · middleware allows `/enrol/*` · `EnrolEmailForm` two-stage client island. 123 unit tests + 4 e2e green. |
| 2026-05-20 | Phase 2d — TOTP                                  | `lib/totp.ts` (RFC 6238 SHA1 / 30 s / 6 digits via `otpauth`) · `User.totpVerified` column + LINE callback gate · `/api/auth/totp/enrol/start` (encrypts secret onto `User.totpSecret`, returns otpauth URI + PNG QR data URL) · `/api/auth/totp/enrol/verify` (decrypt → ±1 step validate → stamp `totpVerified` → mint access+refresh cookies → clear enrol cookie in one response) · `/enrol/totp` page + `EnrolTotpForm` client island. 148 unit tests + 5 e2e green. Device-fingerprint re-verify deferred to Phase 2e. |
| _pending_  | Phase 3 — Responsive app shell                   | AppShell · AppHeader · adaptive nav · TabStore ↔ URL sync across phone, tablet, and desktop. |
| _pending_  | Phase 4 — HomeView                               | 6 components · API stubs · fixtures.                                |
| _pending_  | Phase 5 — ClassScheduleView                      | DaySwitcher · SemesterPill · ClassCard · schedule API.              |
| _pending_  | Phase 6 — HealthView                             | Streak · WeekCalendar · Steps · Calories · Meal · Activity · Strava. |
| _pending_  | Phase 7 — ActivityView                           | TopTabs · EventCard · RSVP write · AttendeesStack.                  |
| _pending_  | Phase 8 — Service + Grades + Me                  | External via `liff.openWindow` · Grades semester-lock enforced.     |
| _pending_  | Phase 9 — Push (LINE Messaging)                  | Webhook · narrowcast worker · Vercel Cron roster reminder.          |
| _pending_  | Phase 10 — Hardening                             | PDPA · audit export · pen-test · Lighthouse budget · custom domain. |

---

## 7. Working agreement

- **Superpowers loop** per phase: brainstorming → writing-plans → TDD → cross-AI review → commit.
- **Caveman comms** in chat, PR descriptions, commit bodies. Code, security warnings, and commits themselves stay in normal prose.
- **Bilingual README parity** — every `README.md` edit mirrors to `README_TH.md` in the same commit.
- **DoD per phase** — `tsc --noEmit` clean, all tests green, audit log row asserted on every mutation in API tests, Lighthouse perf budget honored.
- **Forbidden** — `react-native-web` shims, skipping audit log "for a quick test", `localStorage` for tokens (LINE webview evicts), US-only managed services for primary data.

---

## 8. Quick start (for `/init`)

```text
1. /init
2. Read EXPORT.html and PLAN.html.
3. Install PLAN.html §1 as .claude/skills/crma-web/SKILL.md.
4. Confirm forks in MIGRATION_LIFF.md §1 (rows 4, 5, 7, 12 still open).
5. Phase 1 — superpowers loop: brainstorm → plan → TDD → commit.
```

---

## 9. References

- CRMA Regulations on Education and Training
- Personal Data Protection Act B.E. 2562 (PDPA)
- ISO 27001 — Information Security Management
- LINE Developers — LIFF v2 docs
- Predecessor mobile project: superpowers loop log in its `README.md §6`
