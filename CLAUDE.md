# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo state (2026-05-20)

Current state:

- Phase 1 Bootstrap complete (commit `73de1f7`).
- Phase 2a Auth Foundations complete (commit `814d3ca`).
- Phase 2b LIFF + LINE callback complete (commit `d1594a1`).
- Phase 2c Email OTP + crypto envelope complete (commit `220b1dd`). 123 unit tests green; 4 Playwright chassis specs.
- Phase 2d TOTP enrolment complete (commit `14e200f`). 148 unit tests green; 5 Playwright chassis specs. Cadets can complete LINE → email → TOTP end-to-end against the dev/CI fallbacks.
- Phase 2e device re-verify complete (commit `a3b3db8`). 170 unit tests green; 6 Playwright chassis specs.
- Phase 3 app shell complete (commit `5681c9a`). 180 unit tests green; 8 Playwright chassis specs. `useTabStore` + AppShell + AppHeader + BottomNav + NavRail + 7 view stubs + auth-guard layout. Build passes 14 routes.
- Phase 4 next: HomeView — 6 components (ProfileBanner · HeroCarousel · QuickServicesGrid · SmartInsightsRow · NewsEventTabs) + API stub + fixtures. See `MIGRATION_LIFF.md §4` component map.
- `PROGRESS.html` is the standalone project progression dashboard. Open it directly in a browser to see the current phase map without starting the app.

Tracked source artifacts:

- `README.md` / `README_TH.md` - bilingual project charter (must stay mirrored per commit).
- `MIGRATION_LIFF.md` - 16-section migration design (mobile RN -> LIFF web). Section 1 has 14 forks; rows 4, 5, 7, 12 still open.
- `PLAN.html` - `/init` plan (SKILL.md, moodboard, Prisma, auth flow, 4 sample components, 10 TDD phases).
- `EXPORT.html` - snapshot of predecessor mobile repo.
- `web/plans/Bootstrap.md` - Phase 1 execution plan; implementation is already done.
- `web/plans/Phase2a-Auth.md` - current Phase 2a execution plan.

Predecessor mobile codebase frozen at `C:\palm\NarathipOS\CRMA Smart academy mobile app`. Read-only reference for 1:1 component port, fixtures, prototype spec, RN tests.

## Phase progression

Phases gated. Do not skip ahead.

1. Bootstrap `web/` — Next 16 · Tailwind v4 · Prisma · Vitest · Playwright · CI green.
2. Auth — LIFF → `@crma.ac.th` email OTP → TOTP → JWT cookie middleware → RBAC → AuditLog.
3. Responsive app shell — `AppShell` · `AppHeader` · adaptive nav · `TabStore ↔ ?tab=` sync across phone, tablet, and desktop. Do not build production UI inside a fixed `IphoneFrame`.
4–8. View ports (Home, ClassSchedule, Health, Activity, Service/Grades/Me).
9. LINE Messaging push + Vercel Cron.
10. Hardening — PDPA, audit export, pen-test, Lighthouse budget.

Each phase = superpowers loop: brainstorming → writing-plans → TDD → cross-AI review → commit.

## Locked stack (do not re-pick)

Next.js 16 App Router (Node runtime for Prisma) · TS 5 strict + `noUncheckedIndexedAccess` · Tailwind v4 + CVA · Zustand 5 (slices: tab · schedule · health · activity) · next-intl (TH default) · Prisma 7 (datasource URL in `prisma.config.ts`, runtime via driver adapter) → Supabase Postgres `ap-southeast-1` · LIFF + email OTP + TOTP + jose JWT in httpOnly Secure cookie · Vercel Blob · LINE Messaging API · Vercel Cron + Inngest · Brevo SMTP · Sentry · Vitest + RTL + Playwright (LINE webview UA) + `next-test-api-route` · Vercel deploy.

## Routing contract (do not break)

Single `activeTab` string drives view switch. URL `?tab=` backed by Zustand `useTabStore`. **No nested route layouts.** `app/(app)/page.tsx` reads `activeTab` and renders from a `VIEWS` map (see `MIGRATION_LIFF.md §7`). `AdaptiveNav` mutates store directly; phone mode uses bottom nav, wider screens use rail/sidebar navigation.

## Hard constraints (auto-reject violating diffs)

- `@crma.ac.th` email gate enforced server-side. Reject all other domains.
- TOTP 2FA mandatory; re-verify on every new device fingerprint.
- Current-semester grades LOCKED at Prisma layer via `Semester.isLocked` → return 423.
- Duty roster mutations RBAC-gated (`OFFICER` / `ADMIN` only).
- Every API mutation writes one `AuditLog` row. No exceptions.
- PDPA encryption (pgcrypto / app-layer envelope) for `User.totpSecret`, `User.email`, `PFTResult.*`, `Enrollment.grade`.
- Cookies `httpOnly Secure SameSite=Lax`. **Never** `localStorage` for tokens — LINE webview evicts.
- No `react-native-web` shims. Manual port per component.
- No US-only managed services for primary data.

## DoD per phase

`tsc --noEmit` clean · all Vitest + Playwright green · API tests assert audit-log row on every mutation · Lighthouse perf budget honored · README.md + README_TH.md mirrored in same commit.

## Working agreement

- Bilingual README parity — every `README.md` edit mirrors to `README_TH.md` in the same commit.
- Caveman comms in chat, PR descriptions, commit bodies. Code, security warnings, commits themselves stay in normal prose.
- Update `README.md §6` progress tracker after each phase.

## LIFF quirks to remember

`100vh` ≠ viewport on iOS in-app webview → use `100dvh` + `env(safe-area-inset-*)` for BottomNav. External links via `liff.openWindow({ external: true })` (E-Book, OPAC, Moodle). Prefer `liff.shareTargetPicker` over Web Share API. Test matrix: LINE iOS, LINE Android, Safari iOS (LIFF Browser button), Chrome Android.

## Predecessor reference paths

- `prototype_spec.md` — visual + interaction contract
- `references/*.png` — 13 annotated mockups
- `app/src/components/` — 30 RN components for 1:1 port (see `MIGRATION_LIFF.md §4` mapping table)
- `app/src/fixtures/` — data shape source
- `app/src/lib/{rbac,courseTypeColor,formatMilTime,weekCalendarDays}.ts` — port 1:1
- `Documents/` — Thai-language research PDFs

## Build / test commands

Workspace root has `package.json` (Husky + lint-staged only). All app commands run inside `web/` via `corepack pnpm <script>`:

| Command | Purpose |
|---|---|
| `corepack pnpm dev` | Next dev server (turbopack) |
| `corepack pnpm build` | Production build |
| `corepack pnpm start` | Serve production build |
| `corepack pnpm typecheck` | `tsc --noEmit` with strict + `noUncheckedIndexedAccess` |
| `corepack pnpm lint` | ESLint (Next preset + import-order + unused-imports) |
| `corepack pnpm format` | Prettier write |
| `corepack pnpm test` | Vitest watch |
| `corepack pnpm test:run` | Vitest CI mode |
| `corepack pnpm test:e2e` | Playwright (line-ios · line-android · safari) |
| `corepack pnpm test:e2e:ui` | Playwright UI mode |
| `corepack pnpm prisma generate` | Re-emit Prisma client |
| `corepack pnpm prisma:migrate` | Local migrate dev |

CI runs `pnpm install --frozen-lockfile` from workspace root, then everything inside `web/`. See `.github/workflows/ci.yml`. Pre-commit hook runs `lint-staged` + `typecheck`.

Local pnpm via `corepack pnpm` — no global pnpm install needed (Node 22 ships corepack). To use bare `pnpm`, run `corepack enable` in an admin PowerShell once.
