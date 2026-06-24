# CRMA Smart Academy LIFF — Claude Code Build Plan

> **2026-06-17 user-confirmed requirement baseline:** this is an approved latest requirement source. Before acting, read it together with `CLAUDE-CODE-TASK-BREAKDOWN.md`. Also read `../README.md`, `../CLAUDE.md`, and `PROJECT-AUDIT-2026-06-17.md` for file boundaries. Do not treat archived `.design-tmp` material or the removed `/health` route as active scope.

> Translates the **approved Claude Design mock** into a buildable Next.js LINE LIFF plan.
> Companion file: [`CLAUDE-CODE-TASK-BREAKDOWN.md`](./CLAUDE-CODE-TASK-BREAKDOWN.md) (granular, executable task list).
> Status: **approved requirement overview — do not implement from this file alone.** Execute tasks from the breakdown.

---

## 0. Sources of truth & precedence

| Concern | Source of truth | File |
|---|---|---|
| **Visual / UX** | Approved Claude Design mock | `docs/design-handoff/claude-design/CRMA Smart Academy Standalone.html` (+ `screenshots/prototype/*.png`) |
| **Product / scope** | New project structure (TH) | `docs/CRMA-LIFF-New-Project-Structure-TH.md` |
| **Data shape & content** | Ingest report + pilot CSVs | `docs/ingested/INGEST-REPORT-2569.md`, `docs/ingested/*.pilot.csv`, `docs/ingested/import-review-notes-2569.md` |

**Precedence:** mock wins for look/layout/interaction. Product doc wins for scope/features/data model. Ingest+CSV win for data fields and real values. When all three conflict, stop and flag.

---

## 1. Hard constraints (non-negotiable)

1. **No AI features anywhere in MVP.** No Health AI, AI Coach, AI Q&A, AI Insight, AI recommendation, no paid AI API. (Future AI = separate phase, never mixed into MVP.)
2. **Health AI screen is removed and replaced by Lost & Found.** Lost & Found takes the Health slot in Quick Services and the service grid. No health/fitness integrations (no Apple Health / Google Fit / Strava / Garmin).
3. **Class schedule = fixed daily Monday–Friday data.** Day tabs (Mon–Fri), not a weekly calendar grid. Data shaped like an imported school file (see §8).
4. **Academic Calendar = yearly calendar data.** Year selector + month grid + agenda. One dataset per academic year, no recurrence engine.
5. **MVP first with mock/CSV data, then DB.** Build the full UI against typed mock data + parsed pilot CSVs before any live `DATABASE_URL`. DB integration is a later phase that swaps the data layer, not the UI.
6. **Bilingual TH-first.** Every cadet-facing label ships Thai + English. Thai is primary.
7. **PDPA B.E. 2562.** Synthetic/consented data only; audit log on sensitive actions; data residency in Thailand; secrets server-side only.

---

## 2. Current repo state vs. target

There is already a `web/` Next.js app — but it is a port of the **old crimson/navy prototype**, not the new teal mock. It must be refactored, not extended blindly.

**Keep (tooling baseline):**
- Next.js `16.2.6` (App Router) · React `19.2.4` · TypeScript `5` · Tailwind CSS `4`
- Prisma `6.19.3` · `@prisma/client` · `@line/liff ^2.29` · `lucide-react`
- Patterns worth reusing: `src/lib/i18n.tsx`, `src/lib/theme.tsx`, `src/lib/liff.ts`, `src/lib/db.ts`, `BilingualLabel`, `BottomNav` shell, dev mock fallback.

**Replace / rebuild:**
- **Design tokens** — current crimson `#a8182a` / navy `#15203a` → new **teal** system (§5).
- **Routes** — current set `{home, profile, class, meal(singular), health, report, calendar, todo, activity, service}` → new set (§6). Delete `src/app/health/`; rename `meal` → `meals`; add `lost-found`, `activity/new`, `activity/[id]`, `notifications`, `settings`, `report` flow, `report/tickets`.
- **Prisma schema** — current 6 models (`Cadet, Company, Course, Enrollment, GradeRecord, ScheduleEntry`, enum `Role`) cover only grades/class. Expand to the MVP data model (§9) when DB phase starts.
- **Mock data** — current `mock-data.ts` (grades + week schedule + news) → expand to cover all 15 screens and load pilot CSVs.
- **Dev toolbar / TweaksPanel** — the mock ships a designer "Tweaks" panel + simulated iOS device frame. Strip both for production; keep only a minimal dev lang/theme switch behind a flag.

---

## 3. Target stack

- **Framework:** Next.js App Router on Vercel.
- **Language/UI:** TypeScript + Tailwind CSS v4 (CSS-variable tokens).
- **DB:** PostgreSQL via Prisma (Thailand-resident instance for pilot).
- **Auth/distribution:** LIFF v2 SDK inside CRMA LINE OA; dev-mock identity until `NEXT_PUBLIC_LIFF_ID` set.
- **Icons:** `lucide-react` (mock uses a custom `Icon` set — map to lucide equivalents).
- **No** paid map API. Pin-on-Map = campus image + percentage overlay (§ screen 12).
- **Env vars:** `DATABASE_URL`, `NEXT_PUBLIC_LIFF_ID`, `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN`, `APP_BASE_URL`. Only `NEXT_PUBLIC_LIFF_ID` may be public; channel secret/token server-only.

---

## 4. Design language (from the mock)

The mock simulates an **iOS phone frame** (`IOSDevice`, `IOSStatusBar`, `IOSNavBar`, `IOSGlassPill`, `IOSKeyboard`). **That simulated device chrome is NOT part of the LIFF app** — LIFF renders full-screen inside LINE's in-app browser. Port the *visual style* (glass pills, large rounded cards, soft shadows), drop the fake hardware frame and the desktop "stage" gradient.

**Reusable UI primitives identified in the mock** (port to a real component library):
`TopBar`, `SubHeader`, `BottomNav`, `Avatar`, `Img` (with fallback), `Badge`, `CatTag`, `Chips`, `Seg` (segmented control), `Sec` (section header), `Sheet` (bottom sheet/modal), `Toast`, `EmptyState`, `LoadingState`, `ErrorState`, `Icon`.

---

## 5. Design tokens

Default theme = **Academy Teal** (mock default palette). Theme is runtime-swappable in the mock; production ships **teal as the single default** (others optional later). Brand teal **= `#0BA8A0` (CONFIRMED 2026-06-16)** from the approved mock; doc CSS `#006b67` is superseded and kept only as reference.

| Token | Mock (Academy Teal — canonical) | Product-doc CSS (reference) | Use |
|---|---|---|---|
| brand | `#0BA8A0` | `#006b67` | Primary / active tab / brand |
| brand-dark | `#0A8E87` | `#004f4b` | Pressed / gradient end |
| brand-darker | `#07706B` | — | Deep accent |
| tint | `#E1F4F2` | soft-blue `#dbeafe` | Brand wash / chips |
| tint-2 | `#F0FAF9` | — | Subtle wash |
| bg / stage | `#E9F1F6` / `#DCE6EC` | `#f5f7ff` | App background (light blue / off-white) |
| gradient | `#0FB6AD` → `#0A8E87` | — | Hero / featured headers |
| surface | `#ffffff` | `#ffffff` | Cards |
| ink | — | `#0f172a` | Primary text |
| muted | — | `#64748b` | Secondary text |
| line | — | `#e2e8f0` | Dividers |
| danger | red | `#c81e2c` | Urgent / emergency |
| success | green | `#15946b` | Done / returned |
| warning | — | `#d18b00` | Pending / due |

Other mock palettes (optional, post-MVP): **Navy Command** `#1A5EA8`, **Field Green** `#2A7A4A`, + one more.

**Card:** white, soft shadow, radius **16–24px**. **Bottom nav:** fixed, icon + bilingual label. **Header:** avatar + "Smart Academy" + notification bell. **Quick Services:** circular icon buttons. **Featured:** large image card carousel. **Activity:** image-heavy Meetup-style cards.

Fonts: Thai body = Sarabun (or system Thai); keep mock's type scale. Mobile-only, no responsive desktop.

---

## 6. Navigation & route map

Stack-based router (from mock `App`): `go(target, params)` — `-1` = pop/back; a root tab = switch tab + clear stack; anything else = push onto stack. Bottom nav visible except on screens in a `NO_NAV` set (detail/form/settings push screens).

```
ROOT_TABS = ['home', 'class', 'todo', 'activity', 'service']   // bottom nav
```

| # | Route key (mock) | App Router path | Tab? | Screen | TH / EN |
|---|---|---|---|---|---|
| 1 | `home` | `/` | tab | HomeScreen | หน้าหลัก / Home |
| 2 | `class` | `/class` | tab | ClassScreen | ตารางเรียน / Class |
| 3 | `todo` | `/todo` | tab | TodoScreen | งาน / Todo |
| 4 | `activity` | `/activity` | tab | ActivityScreen | กิจกรรม / Activity |
| 5 | `service` | `/service` | tab | ServiceScreen | บริการ / Service |
| 6 | `profile` | `/profile` | push | ProfileScreen | ประวัติ+ผลการเรียน / Profile + Grades |
| 7 | `meals` | `/meals` | push | MealsScreen | มื้ออาหาร / Meals |
| 8 | `calendar` | `/calendar` | push | CalendarScreen | ปฏิทินการศึกษา / Academic Calendar |
| 9 | `report` | `/report` | push | ReportScreen (+ ReportForm, MyTickets) | แจ้งซ่อม / Report |
| 10 | `lost` | `/lost-found` | push | LostFoundScreen | ของหาย-ของพบ / Lost & Found |
| 11 | `lostDetail` | `/lost-found/[id]` | push | LostDetailScreen | รายละเอียดของหาย / Lost item detail |
| 12 | `actDetail` | `/activity/[id]` | push | ActivityDetailScreen | รายละเอียดกิจกรรม / Activity detail |
| 13 | `createAct` | `/activity/new` | push | CreateActivityScreen | สร้างกิจกรรม / Create activity |
| 14 | `notifications` | `/notifications` | push | NotificationsScreen | การแจ้งเตือน / Notifications |
| 15 | `settings` | `/settings` | push | SettingsScreen | ตั้งค่า / Settings |

> Note: in App Router, "push" screens are real routes; the mock's in-memory stack maps to Next navigation + back. Keep nav transitions feeling native (slide), bottom nav hidden on detail/form/settings.

---

## 7. Screen inventory (MVP)

Each screen: purpose · key sections (from mock + doc) · data needed · features explicitly **cut**.

### 7.1 Home (`/`)
Daily summary hub. Header (avatar · "Smart Academy" · bell). Profile summary card (name, year/battalion, "in class now" status). Featured carousel (announcements). Quick Services = **Grades · Meals · Lost & Found · Reports**. "My Day" (Next Class, next/lunch Meal, Pending Todo count, Upcoming Activity/Academic event). News list.
Data: featured announcements, today's schedule, today's meal, todo count, latest news, notification count.

### 7.2 Profile + Grade Report (`/profile`)
Profile header · cadet info (รหัส, ชั้นปี, กองพัน, กองร้อย) · GPA / GPAX cards · term selector · subject list · transcript summary. Replaces AI Insight with **Academic Notice** + **Advisor Note**. Grade status: Published / Pending / Locked.
Data: cadet profile, term list, grade records, course credit, grade publish status. **Cut:** AI insight/recommendation.

### 7.3 Class — daily schedule (`/class`)
**Mon–Fri tabs** (จ อ พ พฤ ศ), not a weekly grid. Per-day period list: time, subject code, TH/EN name, room, instructor, category color (academic/military/pe/advisory/self_study). Semester/cohort selector (pilot has one cohort — stub others).
Data: pilot CSV `class-schedule-2569.pilot.csv` — **75 data rows** (76 lines incl header); **5 cohorts** (`ก.1`, `ก`, `ข`, `ค`, `ง`), all year 1 / semester 1, Mon–Fri.

### 7.4 Meals (`/meals`)
**Monthly** menu, 3 meals/day, **no calorie AI**. Month selector · today summary · date strip · Breakfast/Lunch/Dinner cards · menu detail · optional food image · dietary note (halal/veg/allergen) if school provides.
Data: monthly mock (no source file yet) shaped `{date, meal_type, menu_th, menu_en, note, image_url}`. **Cut:** calorie AI, nutrition recommendation.

### 7.5 Academic Calendar (`/calendar`)
**Yearly.** Year selector · month grid · event dots · agenda list for selected day · category filter (Academic/Exam/Military/Activity/Holiday/Deadline).
Data: `academic-calendar-2569.pilot.csv` — **pilot covers April only + has unverified labels** (PDF is a scan, no text layer). MVP fills full year from seed/mock; swap to verified CSV later (§8 risk).

### 7.6 To-do (`/todo`)
Summary cards (Open / Due Today / Done) · filter chips (All/Academic/Military/Personal/Activity) · task list (checkbox, title, category, deadline, priority, assigned-by). **Cut:** "Top 3 Tasks for Today", AI task suggestion.
Data: `task`, `task_assignment`, `task_completion`, `task_comment`.

### 7.7 Activity — Meetup-style (`/activity`, `/activity/[id]`, `/activity/new`)
Featured carousel · category filter (Sport/Academic/Volunteer/Social/Club/Training) · event cards (cover, title, date/time, location, host, attendee/capacity, RSVP). Detail: cover, host, date/time, location + map preview, description, attendees, comments, Attend/Cancel. Create: cadet-authored events with **moderation states** (Draft → Pending Review → Published / Rejected / Cancelled).
Data: `activity_event`, `activity_category`, `activity_attendee`, `activity_comment`, `activity_image`, `activity_moderation_log`.

### 7.8 Service (`/service`)
Keep the mock layout (it's clean). Service search · Recent Services · Service Hub cards · All Services grouped:
- **Academic:** Grades & Transcripts · Daily Class Schedule · Academic Calendar · Course Registration · E-Book Library
- **Campus Life:** Canteen Menu · Activity Hub · Lost & Found · Bus Schedule · Laundry Status · Campus Map
- **Support:** Report/Fix · Contact Office · Campus Map · Documents Request · FAQ

**Cut:** AI Coach, AI Q&A. Items without a screen yet link to `EmptyState`/"coming soon".

### 7.9 Report / Fix (`/report`, `/report/tickets`)
Keep existing flow + add **Pin on Map**. Category (อาคาร/ไฟฟ้า/ประปา/Internet/ความสะอาด/ความปลอดภัย/เหตุเร่งด่วน) · urgency (Low/Normal/High/Emergency) · description · photo attach (placeholder) · **Pin on Map** (campus image, store `pin_x`/`pin_y` as %, no paid API) · submit → ticket number · status tracking (timeline). MyTickets list.
Data: `report_ticket`, `report_category`, `report_attachment`, `report_status_event`, `report_location`, `maintenance_team`.

### 7.10 Lost & Found (`/lost-found`, `/lost-found/[id]`)
**Replaces Health AI.** Tabs: ของหาย / ของพบ / รายการของฉัน. Search + filter (category/location/date/status). Item card (photo, name, category, place, report date, status). Detail (multi-photo, description, place, reporter, **Claim / contact moderator**, status timeline). Workflow: report → Open → others claim → moderator review → handover at collection point → Returned/Closed.
Data: `lost_found_item`, `lost_found_category`, `lost_found_attachment`, `lost_found_claim`, `lost_found_status_event`. **Privacy:** moderation required (photos may show faces/IDs); partially mask sensitive items (ID cards, official docs).

### 7.11 Notifications (`/notifications`)
List of notifications (report status, lost-found claim/match, upcoming activity, announcement). Read/unread.
Data: `notification`, `notification_delivery`.

### 7.12 Settings (`/settings`)
Language (TH/EN), theme (default teal), notification prefs, account/LINE binding info, privacy/PDPA links, sign-out. (Production replaces the mock's designer "Tweaks" panel.)

---

## 8. Data strategy — three layers

Build **left-to-right**; the UI never knows which layer is live (single typed data-access module per domain).

```
Layer A: TYPED MOCK        Layer B: PARSED CSV            Layer C: POSTGRES (Prisma)
(handwritten fixtures) ──► (pilot 2569 files via         ──► (import scripts seed DB;
 every screen renders)      a loader/normalizer)               API routes read DB)
   MVP Phase 1                MVP Phase 1 (class/cal)            Phase 3
```

### Source data status (2569 pilot)

| Domain | Source | State | MVP action |
|---|---|---|---|
| Class schedule | `class-schedule-2569.pilot.csv` | **Usable.** 75 data rows (76 lines incl header). 5 cohorts (`ก.1`, `ก`, `ข`, `ค`, `ง`), 15 rows each, all year 1 / sem 1, Mon–Fri. Text-layer PDF extracted (~42.6k chars) then normalized. Some uncertain time boundaries & truncated names (see review notes). | Load CSV directly for Class screen; cohort selector real (5). Stub other years. |
| Academic calendar | `academic-calendar-2569.pilot.csv` | **Partial/risky.** Only ~6 rows (April 2026), many `label_unverified`. PDF is a **scan, no text layer** → needs OCR/manual sheet. June–March missing (preview pages 04–15 unextracted). | Use CSV rows that are verified; fill the rest of the year from seed/mock so the yearly UI is complete. Flag for manual extraction before pilot. |
| Meals | none yet | **No source file.** Schema agreed: `date, meal_type, menu_th, menu_en, note, image_url`. | Generate a full-month mock following the schema. Real menu file imported later. |
| Profile / grades | none (synthetic) | Synthetic only (PDPA). | Mock cadet + grades, matching old prototype fields. |
| Todo / Activity / Report / Lost&Found | none | User-generated at runtime. | In-memory mock store for MVP; persists in DB at Phase 3. |

### CSV schemas (canonical)

**Class** (`class-schedule-import-template.csv`):
`academic_year, semester, year_level, cohort, day_of_week, period_order, start_time, end_time, subject_code, subject_name_th, subject_name_en, room, instructor, category, source_page`

**Academic Calendar** (`academic-calendar-import-template.csv`):
`academic_year, date, thai_date_label, day_of_week_th, start_time, end_time, title_th, title_en, category, note, source_page, source_row`

**Meals** (proposed): `date, meal_type, menu_th, menu_en, note, image_url`

Import scripts: `scripts/import-class-schedule.ts`, `import-academic-calendar.ts`, `import-meals.ts`, `import-cadets.ts`. Each normalizes a CSV → Prisma rows, idempotent, logs to audit.

---

## 9. MVP data model (Prisma, Phase 3)

Group → tables (build incrementally; Phase 1/2 use mock equivalents of these shapes):

| Group | Tables |
|---|---|
| Identity | `user`, `cadet_profile`, `line_account`, `role_assignment` |
| Content | `announcement`, `news_item`, `file_asset` |
| Class | `class_schedule_day`, `class_period` |
| Meals | `meal_month`, `meal_day`, `meal_item` |
| Calendar | `academic_calendar_event` |
| Todo | `task`, `task_assignment`, `task_completion` (+ `task_comment`) |
| Activity | `activity_event`, `activity_attendee`, `activity_comment`, `activity_moderation_log` (+ `activity_category`, `activity_image`) |
| Report | `report_ticket`, `report_location`, `report_attachment`, `report_status_event` (+ `report_category`, `maintenance_team`) |
| Lost & Found | `lost_found_item`, `lost_found_claim`, `lost_found_attachment`, `lost_found_status_event` (+ `lost_found_category`) |
| Service | `service_item`, `service_category` |
| System | `notification`, `notification_delivery`, `audit_log` |

**RBAC roles:** `cadet` (นนร.) · `instructor` (อาจารย์) · `command` (ผู้บังคับบัญชา) + `moderator` for activity/report/lost-found review. Enforce in `src/lib/rbac.ts`.

---

## 10. API routes (Phase 3)

| Route | Method | Purpose |
|---|---|---|
| `/api/me` | GET | current user from LIFF/session |
| `/api/home` | GET | home aggregate |
| `/api/class?day=Monday` | GET | daily schedule |
| `/api/meals?month=2026-06` | GET | monthly menu |
| `/api/calendar?year=2026` | GET | yearly calendar |
| `/api/todo` · `/api/todo/{id}/complete` | GET/POST · POST | tasks |
| `/api/activity` · `/api/activity/{id}/rsvp` | GET/POST · POST | events + RSVP |
| `/api/report` | GET/POST | tickets |
| `/api/lost-found` · `/api/lost-found/{id}/claim` | GET/POST · POST | items + claim |
| `/api/line/webhook` | POST | LINE webhook |

Until Phase 3, screens read from the mock/CSV data module directly (server components / route handlers backed by fixtures).

---

## 11. Build phases (MVP-first)

| Phase | Goal | Output | Data layer |
|---|---|---|---|
| **P0 — Setup** | Re-baseline `web/` to new design | Teal tokens, app shell, bottom nav, i18n, theme, route skeleton (15 screens), remove `health/`, rename `meals`, strip iOS frame & Tweaks panel | — |
| **P1 — MVP UI + mock/CSV** | All screens render with realistic data | Home, Class (CSV), Meals (mock), Calendar (CSV+seed), Todo (no Top-3), Service (no AI Coach), Profile+Grades (no AI Insight). CSV loaders for class & calendar | A + B |
| **P2 — Workflow** | Interactive write-flows (in-memory) | Report + Pin-on-Map + status timeline; Lost & Found + claim + moderation; Activity create + RSVP + moderation states; Notifications | A (mock store) |
| **P3 — Backend + Import** | Replace data layer with DB | Prisma schema, migrations, seed, import scripts (class/meals/calendar/cadets), admin import preview, API routes, audit log | C |
| **P4 — LINE** | Real distribution | LIFF login, LINE user binding, Rich Menu, push notifications (report status, L&F match/claim, upcoming activity, announcement) | C |
| **P5 — Pilot** | 1 company (~80–120 cadets) | Feedback loop, UI-friction fixes, data-accuracy verification, rollout guide | C |

**Definition of done per phase:**
- P0: `npm run dev` boots to teal Home; all 15 routes reachable; no crimson tokens left; no `health` route.
- P1: every screen renders bilingual with no placeholder lorem; Class shows real `ก.1` Mon–Fri; Calendar shows a full year; `npm run build` + `lint` clean.
- P2: can create a report (get ticket #), file a lost item + claim it, create + RSVP an activity — all surviving navigation within a session.
- P3: same UI runs against Postgres; import scripts ingest the pilot CSVs; mock layer removable via env flag.
- P4: opens inside LINE OA via LIFF; at least one push notification type delivered.
- P5: pilot checklist (§12) green.

---

## 12. Compliance & pre-build checklist (PDPA)

- [x] Brand color confirmed: teal `#0BA8A0` (mock). Confirm app name.
- [ ] Confirm 5-tab bottom nav.
- [ ] Confirm MVP has **no AI of any kind**.
- [ ] Confirm Health-AI replacement = **Lost & Found**.
- [ ] Daily class file ready (pilot `ก.1` done; other cohorts pending).
- [ ] Monthly meals file (not yet provided — mock for MVP).
- [ ] Yearly academic-calendar file (scan; needs OCR/manual — only April verified).
- [ ] Campus map image for Pin-on-Map.
- [ ] LINE OA + LINE Developers channel + LIFF ID.
- [ ] Postgres instance (Thailand residency).
- [ ] Privacy notice + PDPA approach; DPO assigned.
- [ ] Event moderation owner + report-ticket owner named.
- [ ] Audit log on sensitive actions; secrets server-side only.

---

## 13. Risks & open questions

1. **Calendar data gap (high).** Source PDF is a scan; only April 2026 partially extracted, labels unverified. → MVP uses seed; real yearly data needs OCR/manual sheet before pilot. *Decision needed: who produces the verified calendar file?*
2. **Meals source missing.** No file exists. → mock for MVP; need real monthly menu owner.
3. ~~**Brand teal mismatch.**~~ **RESOLVED 2026-06-16:** brand = `#0BA8A0` (mock). Doc `#006b67` superseded.
4. **Class pilot = year 1 / sem 1 only.** 5 cohorts present (`ก.1`, `ก`, `ข`, `ค`, `ง`) so the cohort selector is real, but other year levels / semesters are stubs until more files arrive.
5. **Existing scaffold drift.** `web/` is the old prototype; P0 refactor must not silently keep crimson tokens or the `health` route.
6. **Moderation ownership.** Activity + Lost&Found + Report all need a human moderator role defined before P2 ships to pilot.
