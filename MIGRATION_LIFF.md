# Migration Design Pattern — Mobile App → LIFF Web App

> **Source:** Expo + React Native + NativeWind + Supabase (current `app/`)
> **Target:** Next.js (App Router) + Prisma + PostgreSQL + LINE LIFF + Vercel
> **Auth gate:** `@crma.ac.th` allow-list, 2FA, LINE OAuth bound to cadet ID
> **Doc version:** 2026-05-19 · status: DRAFT — pending stack-lock approval

---

## 0. TL;DR

| Concern | Mobile (current) | LIFF target |
|---|---|---|
| Runtime | Expo Go / native binaries | LINE in-app webview + standalone browser |
| UI | RN + NativeWind | Next.js 15 (App Router) + Tailwind |
| State | Zustand slices | **Keep** Zustand slices (port 1:1) |
| Nav | `activeTab` string | `activeTab` string in URL `?tab=` (preserve no-router pattern) |
| Data | Supabase REST/Realtime | Next.js Route Handlers + **Prisma** → PostgreSQL |
| Auth | Supabase email-OTP + TOTP | **LINE Login (LIFF)** + `@crma.ac.th` email verify + TOTP |
| Push | `expo-notifications` (FCM/APNs) | **LINE Messaging API push** (Bot → OA followers) |
| Storage | `expo-secure-store` | `httpOnly` Secure cookies (JWT session) + DB-side |
| Deploy | EAS Build / TestFlight | **Vercel** (preview + prod) |
| Distribution | App stores | LIFF URL inside LINE OA rich-menu |

**Win:** zero-install for cadets, single domain (`@crma.ac.th`) + LINE identity, Vercel preview per PR, Prisma migrations in CI.
**Loss:** no native biometrics, push throttled by LINE limits, in-app webview quirks (iOS safe-area, scroll, file upload).

---

## 1. Decision Tree (locks needed)

Treat each as a fork to confirm before writing PLAN.md.

| # | Fork | Recommended | Why |
|---|---|---|---|
| 1 | LIFF size | **Full responsive** (phone, tablet, desktop) | Keeps mobile prototype feel without locking production UI to an iPhone frame |
| 2 | Auth flow | LINE Login → email verify `@crma.ac.th` → TOTP enrol | Lowest friction, still 2FA |
| 3 | Session | JWT in `httpOnly` cookie, 1h access + 30d refresh | LIFF webview cookies survive |
| 4 | DB host | **Supabase Postgres** (region `ap-southeast-1` SG) or **Neon** SG | Closest to TH; data-sovereignty caveat documented |
| 5 | ORM | **Prisma** (locked by user) | Schema-first migrations |
| 6 | Push | LINE Messaging API broadcast + narrowcast | Re-use OA — no FCM |
| 7 | Realtime | Polling first → Pusher/Ably only if needed | Cheap, predictable |
| 8 | i18n | `next-intl`, TH default, EN fallback | Mirrors RN setup |
| 9 | Styling | Tailwind v4 + class-variance-authority | Re-use design tokens 1:1 |
| 10 | Component port | Manual rewrite per screen (no `react-native-web`) | Cleaner, faster long-term |
| 11 | Tab nav | URL search-param (`?tab=home`) backed by Zustand | Preserves prototype contract |
| 12 | File upload | Vercel Blob (avatar, complaint photos) | TH-residency caveat |
| 13 | Background jobs | Vercel Cron + Inngest | Roster reminders, audit log batching |
| 14 | Observability | Vercel Analytics + Sentry | Required for audit |

---

## 2. Target Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  LINE App (cadet phone)                                        │
│  └─ Rich-menu → LIFF URL → LIFF SDK (liff.init, liff.login)    │
└──────────────────┬─────────────────────────────────────────────┘
                   │ HTTPS (Vercel edge)
                   ▼
┌────────────────────────────────────────────────────────────────┐
│  Next.js 15 App Router (Vercel)                                │
│  ├─ app/(public)/login            → LINE OAuth bounce          │
│  ├─ app/(app)/page.tsx?tab=…      → HomeView / ClassSchedule…  │
│  ├─ app/api/auth/line/callback    → exchange code → JWT cookie │
│  ├─ app/api/auth/verify-email     → @crma.ac.th OTP            │
│  ├─ app/api/auth/totp             → TOTP enrol + verify        │
│  ├─ app/api/[resource]/route.ts   → Prisma CRUD + RBAC guard   │
│  └─ middleware.ts                 → session + audit-log         │
└──────────────────┬─────────────────────────────────────────────┘
                   │ Prisma Client (TCP, pgbouncer)
                   ▼
┌────────────────────────────────────────────────────────────────┐
│  PostgreSQL (Supabase SG / Neon SG)                            │
│  └─ Row-level audit triggers → audit_log table                 │
└────────────────────────────────────────────────────────────────┘
                   ▲
                   │ Vercel Cron (hourly)
┌──────────────────┴─────────────────────────────────────────────┐
│  LINE Messaging API ← server push (announcements, roster)      │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Directory Layout (target)

```
web/
├─ app/
│  ├─ (public)/
│  │  ├─ login/page.tsx
│  │  └─ link-cadet/page.tsx
│  ├─ (app)/
│  │  ├─ layout.tsx              ← responsive AppShell + AppHeader + adaptive nav
│  │  ├─ page.tsx                ← reads ?tab=, renders view
│  │  └─ me/page.tsx
│  ├─ api/
│  │  ├─ auth/line/callback/route.ts
│  │  ├─ auth/email-otp/route.ts
│  │  ├─ auth/totp/route.ts
│  │  ├─ schedule/route.ts
│  │  ├─ health/route.ts
│  │  ├─ activity/route.ts
│  │  ├─ service/route.ts
│  │  └─ grades/route.ts
│  └─ layout.tsx                 ← <html>, fonts, LIFF init
├─ components/
│  ├─ home/        (port of app/src/components/home/*)
│  ├─ class/       (DaySwitcher, SemesterPill, ClassCard, …)
│  ├─ health/      (StreakBadge, WeekCalendarStrip, …)
│  ├─ activity/    (TopTabs, EventCard, PromoBanner, …)
│  ├─ service/     (ServiceLink, ServiceGroupCard)
│  ├─ ui/          (AppShell, AppHeader, AdaptiveNav, BottomNav)
│  └─ i18n/
├─ lib/
│  ├─ prisma.ts
│  ├─ liff.ts
│  ├─ session.ts            ← jose JWT sign/verify
│  ├─ rbac.ts               ← port from app/src/lib/rbac.ts
│  ├─ audit.ts              ← server-only logger
│  ├─ courseTypeColor.ts    ← port 1:1
│  ├─ formatMilTime.ts      ← port 1:1
│  └─ weekCalendarDays.ts   ← port 1:1
├─ store/                   ← Zustand slices (port 1:1)
│  ├─ useTabStore.ts
│  ├─ useScheduleStore.ts
│  ├─ useHealthStore.ts
│  └─ useActivityStore.ts
├─ messages/
│  ├─ th.json               ← port from app i18n
│  └─ en.json
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ fixtures/                ← port app/src/fixtures/*
├─ middleware.ts
├─ next.config.mjs
├─ tailwind.config.ts
├─ tsconfig.json            ← strict + noUncheckedIndexedAccess (mirror app)
├─ vercel.json              ← cron schedule
└─ package.json
```

---

## 4. Component Port Map (RN → Next.js)

Mechanical rewrites — same names, same props, same testIDs. Tailwind classes ~95% identical; only the wrapper element changes.

| Mobile (`app/src/...`) | Web (`web/components/...`) | Notes |
|---|---|---|
| `BottomNav.tsx` (RN `Pressable`) | `ui/BottomNav.tsx` (`<button>`) | `activeTab` → URL `?tab=` via `useRouter().replace` |
| `screens/HomeScreen.tsx` | `(app)/views/HomeView.tsx` | Server component shell + client islands |
| `components/home/HeroCarousel.tsx` | `home/HeroCarousel.tsx` | `setInterval` → `useEffect` |
| `components/home/ProfileBanner.tsx` | `home/ProfileBanner.tsx` | `<Link href="?tab=me">` |
| `components/home/QuickServicesGrid.tsx` | `home/QuickServicesGrid.tsx` | 1:1 |
| `components/home/SmartInsightsRow.tsx` | `home/SmartInsightsRow.tsx` | 1:1 |
| `components/home/NewsEventTabs.tsx` | `home/NewsEventTabs.tsx` | 1:1 |
| `components/class/DaySwitcher.tsx` | `class/DaySwitcher.tsx` | 1:1 |
| `components/class/SemesterPill.tsx` | `class/SemesterPill.tsx` | `ActionSheet` → `<dialog>` |
| `components/class/ClassCard.tsx` | `class/ClassCard.tsx` | 1:1 |
| `components/health/WeekCalendarStrip.tsx` | `health/WeekCalendarStrip.tsx` | SVG identical |
| `components/health/StepsCard.tsx` | `health/StepsCard.tsx` | SVG donut identical |
| `components/activity/EventCard.tsx` | `activity/EventCard.tsx` | `<img>` instead of `<Image>` |
| `components/activity/AttendeesStack.tsx` | `activity/AttendeesStack.tsx` | 1:1 |
| `components/service/ServiceLink.tsx` | `service/ServiceLink.tsx` | `<a target=_blank>` for external |
| `components/service/ServiceGroupCard.tsx` | `service/ServiceGroupCard.tsx` | 1:1 |
| `components/AppHeader.tsx` | `ui/AppHeader.tsx` | Notification dot driven by SWR poll |

---

## 5. Prisma Schema (initial cut)

```prisma
// prisma/schema.prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

model User {
  id            String   @id @default(cuid())
  cadetId       String   @unique           // links to CRMA cadet ID card
  email         String   @unique           // must end @crma.ac.th
  emailVerified DateTime?
  lineUserId    String?  @unique           // from LIFF profile
  displayName   String
  avatarUrl     String?
  role          Role     @default(CADET)
  company       String?
  year          Int?
  totpSecret    String?                    // encrypted at rest
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  enrollments   Enrollment[]
  pftResults    PFTResult[]
  auditLogs     AuditLog[]
}

enum Role { CADET INSTRUCTOR OFFICER ADMIN }

model Semester {
  id        String   @id @default(cuid())
  code      String   @unique             // e.g. "2/2568"
  startsAt  DateTime
  endsAt    DateTime
  isLocked  Boolean  @default(false)     // current semester = LOCKED grades
  courses   Course[]
}

model Course {
  id         String   @id @default(cuid())
  code       String                       // e.g. "CS101"
  title      String
  credits    Int
  type       CourseType
  semesterId String
  semester   Semester @relation(fields: [semesterId], references: [id])
  sessions   ClassSession[]
  enrollments Enrollment[]
}

enum CourseType { LECTURE LAB MILITARY PE SEMINAR }

model ClassSession {
  id        String   @id @default(cuid())
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])
  dayOfWeek Int                            // 1=MON..5=FRI
  startMil  String                         // "0800"
  endMil    String                         // "1200"
  room      String?
}

model Enrollment {
  id       String @id @default(cuid())
  userId   String
  courseId String
  grade    String?                          // null if semester locked
  user     User   @relation(fields: [userId], references: [id])
  course   Course @relation(fields: [courseId], references: [id])
  @@unique([userId, courseId])
}

model PFTResult {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  recordedAt DateTime
  pushups   Int
  situps    Int
  run2km    Int                              // seconds
  recommendation String?                     // AI output cache
}

model DutyRoster {
  id        String   @id @default(cuid())
  date      DateTime
  shift     String                           // "00-06" etc
  cadetId   String
  editorId  String                           // RBAC: must be OFFICER+
  editedAt  DateTime @default(now())
}

model Announcement {
  id         String   @id @default(cuid())
  audience   Audience                         // BATTALION REGIMENT ACADEMIC EVENT
  title      String
  body       String
  publishAt  DateTime
  pushedToLine Boolean @default(false)
  authorId   String
}

enum Audience { BATTALION REGIMENT ACADEMIC EVENT ALL }

model Event {
  id         String   @id @default(cuid())
  title      String
  startsAt   DateTime
  endsAt     DateTime
  location   String
  capacity   Int
  attendees  EventRSVP[]
}

model EventRSVP {
  id      String @id @default(cuid())
  eventId String
  userId  String
  status  RsvpStatus @default(GOING)
  event   Event @relation(fields: [eventId], references: [id])
}

enum RsvpStatus { GOING WAITLIST CANCELLED }

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  action    String                            // "READ:grades", "EDIT:roster"
  resource  String
  ip        String?
  userAgent String?
  createdAt DateTime @default(now())
  @@index([userId, createdAt])
  @@index([resource, createdAt])
}
```

PDPA: `User.totpSecret`, `User.email`, `PFTResult.*`, `Enrollment.grade` are sensitive → encrypt-at-rest via PG `pgcrypto` or app-layer envelope encryption.

---

## 6. Auth Flow (LIFF + @crma.ac.th + TOTP)

```
1. Cadet taps OA rich-menu → opens LIFF URL.
2. liff.init() → if !liff.isLoggedIn() → liff.login()
3. Get liff.getIDToken() → POST /api/auth/line/callback
4. Server verifies LINE ID token (LINE JWKs).
   ├─ first time: prompt for CRMA email
   │   → send OTP to <email>@crma.ac.th via SMTP
   │   → user submits OTP → mark emailVerified, bind lineUserId
   │   → prompt TOTP enrol (QR via otpauth://) → store totpSecret (encrypted)
   └─ returning: verify TOTP → mint JWT session cookie (httpOnly, Secure, SameSite=Lax)
5. middleware.ts → every request → verify cookie, attach user, RBAC, write AuditLog.
```

**Hard rules:**
- Reject any `email` that doesn't match `/@crma\.ac\.th$/`.
- TOTP required on every new device fingerprint (cookie miss).
- LINE Login alone is **not** sufficient — email + TOTP gate stays.

---

## 7. Routing — Preserve `activeTab` Contract

Prototype spec §5: single `activeTab` state, no router. Web mirrors via URL search-param so deep-links + back-button work, **but** the rendering pattern stays identical:

```tsx
// app/(app)/page.tsx
'use client'
import { useTabStore } from '@/store/useTabStore'
import HomeView from './views/HomeView'
import ClassScheduleView from './views/ClassScheduleView'
// …
const VIEWS = { home: HomeView, class_schedule: ClassScheduleView, … }
export default function Page() {
  const activeTab = useTabStore(s => s.activeTab)
  const View = VIEWS[activeTab] ?? HomeView
  return <View />
}
```

`useTabStore` syncs `activeTab ↔ ?tab=` via `useRouter().replace()` and reads `useSearchParams()` on mount. `AdaptiveNav` mutates the store directly; phone mode uses `BottomNav`, wider screens use rail/sidebar navigation.

---

## 8. API Pattern (Route Handlers + Prisma + RBAC + Audit)

```ts
// app/api/grades/route.ts
import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/session'
import { canViewGrades } from '@/lib/rbac'
import { audit } from '@/lib/audit'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await requireSession(req)
  if (!canViewGrades(session.user)) return new NextResponse(null, { status: 403 })

  const url = new URL(req.url)
  const semesterCode = url.searchParams.get('semester')
  const semester = await prisma.semester.findUnique({ where: { code: semesterCode! } })
  if (!semester) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (semester.isLocked) return NextResponse.json({ error: 'locked' }, { status: 423 })

  const rows = await prisma.enrollment.findMany({
    where: { userId: session.user.id, course: { semesterId: semester.id } },
    include: { course: true },
  })
  await audit(session.user.id, 'READ:grades', `semester:${semester.code}`, req)
  return NextResponse.json(rows)
}
```

Every mutation → check `rbac` → run Prisma → write `AuditLog` row. No exceptions.

---

## 9. LIFF Quirks Checklist

- iOS in-app webview: `100vh` ≠ viewport — use `100dvh` + safe-area env() padding for BottomNav.
- `liff.openWindow({ external: true })` for external links (E-Book, OPAC, Moodle).
- File uploads (complaint photos) — LIFF supports `<input type=file>` since v2.18; fallback `liff.scanCodeV2` for QR-only flows.
- Clipboard / share: prefer `liff.shareTargetPicker` over Web Share API.
- LINE in-app webview clears `localStorage` aggressively → use cookies for session, IndexedDB for cache.
- Test matrix: LINE iOS, LINE Android, Safari iOS (LIFF Browser button), Chrome Android.

---

## 10. Push Notifications via LINE Messaging API

| Prototype need | LINE API mapping |
|---|---|
| Urgent announcement (battalion) | `narrowcast` filtered by `audience` tag |
| Daily roster reminder | Vercel Cron → `multicast` to that day's duty cadets |
| Personal grade release | `push` to single `lineUserId` |
| Event invite | `flex message` with RSVP buttons → webhook → `/api/webhook/line` |

Rate limits: 350 narrowcasts/hour, 500 multicasts/sec. Plan a `notification_queue` table + Inngest worker to drain.

---

## 11. Deploy to Vercel

- **Project:** `crma-smart-academy-web`
- **Branches:** `main` → prod; PR → preview (perfect for cross-AI review per superpowers loop).
- **Env vars (encrypted):** `DATABASE_URL`, `DIRECT_URL` (Prisma migrate), `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET`, `LIFF_ID`, `LINE_MESSAGING_TOKEN`, `JWT_SECRET`, `SMTP_*`, `ENCRYPTION_KEY`.
- **Region:** `sin1` (Singapore) — closest to TH; flag data-sovereignty gap in compliance doc.
- **Build cmd:** `prisma generate && next build`
- **Cron:** `vercel.json` → `/api/cron/roster-reminder` daily 05:30 ICT.
- **Edge middleware:** session-only (Node runtime for Prisma calls).

---

## 12. CI/CD & Migrations

```
.github/workflows/ci.yml
  - lint
  - typecheck (tsc --noEmit, strict)
  - test (vitest)
  - prisma migrate diff against shadow DB
.github/workflows/migrate.yml
  - on push main → prisma migrate deploy
```

Never edit `prisma/migrations/*.sql` after merge — generate a new migration.

---

## 13. Test Strategy (port + extend)

| Layer | Tool | Inherit | Add |
|---|---|---|---|
| Unit / component | **Vitest** + `@testing-library/react` | 212 tests from `app/__tests__` (rewritten for DOM) | Snapshot LIFF init mocks |
| API route | Vitest + `next-test-api-route` | — | RBAC + audit assertions |
| E2E | Playwright (Chromium + WebKit) | — | LIFF emulator via `liff-mock`; LINE webview UA string |
| Visual | Chromatic (optional) | — | Per-screen mobile-frame snapshots |

Definition-of-done unchanged: `tsc --noEmit` clean, all tests green, audit log row written on every mutation in API tests.

---

## 14. Migration Sequencing (10 phases, superpowers loop per phase)

| # | Phase | Output |
|---|---|---|
| 1 | Bootstrap `web/` workspace | Next 15, Tailwind, Prisma, ESLint, Vitest, Playwright, CI |
| 2 | Auth foundation | LIFF init, LINE callback, email OTP, TOTP, session middleware, RBAC, AuditLog |
| 3 | Responsive app shell | AppShell, AppHeader, adaptive nav, tab store ↔ URL sync across phone, tablet, and desktop |
| 4 | HomeView port | All 6 home components + fixtures; API stubs return fixture data |
| 5 | ClassScheduleView port | DaySwitcher, SemesterPill (dialog), ClassCard, schedule API |
| 6 | HealthView port | Streak, calendar, stats, MealCard, ActivityCard, Strava stub |
| 7 | ActivityView port | TopTabs, EventCard, RSVP write to DB, AttendeesStack |
| 8 | ServiceView + GradesView + MeView | External links via `liff.openWindow`; grades API enforces semester lock |
| 9 | Push integration | LINE webhook, narrowcast worker, Vercel Cron |
| 10 | Hardening | PDPA review, audit-log export, pen-test fixes, perf budget |

Each phase = brainstorm → PLAN.md → TDD → review → commit (mirrors `app/plans/*` cadence).

---

## 15. Open Risks

1. **Data sovereignty** — Supabase/Neon SG ≠ TH; need legal sign-off or self-host on TH-based PG (CAT Cloud, NIPA, etc.).
2. **LINE platform lock-in** — if LINE Thailand throttles OA or changes LIFF SDK, fallback = standalone PWA with same Next.js codebase (LIFF features become no-ops).
3. **No biometrics** — TOTP replaces FaceID/TouchID; UX worse on first launch per device.
4. **Webview cookie eviction** — LINE may purge on app update; refresh-token rotation must be transparent.
5. **Audit log growth** — partition `AuditLog` by month, ship to cold storage after 90 days.
6. **Mobile codebase fate** — keep `app/` frozen as reference until web reaches feature-parity, then archive (do **not** dual-maintain).

---

## 16. Next Action

Confirm or override the **14 forks in §1**. Once locked, run `brainstorming` → `writing-plans` for **Phase 1 (Bootstrap)** under `web/plans/Bootstrap.md`.
