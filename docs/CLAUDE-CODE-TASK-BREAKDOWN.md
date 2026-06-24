# CRMA Smart Academy LIFF — Task Breakdown

> **2026-06-17 user-confirmed requirement baseline:** this is the approved executable task breakdown. Use it together with `CLAUDE-CODE-BUILD-PLAN.md`. Also read `../README.md`, `../CLAUDE.md`, and `PROJECT-AUDIT-2026-06-17.md` for file boundaries. Some unchecked tasks may already be partly implemented; verify `web/src` before rebuilding or restoring old files.

> Executable companion to [`CLAUDE-CODE-BUILD-PLAN.md`](./CLAUDE-CODE-BUILD-PLAN.md).
> Each task: **ID · what · files · acceptance**. Check boxes as completed. Do tasks in phase order; within a phase, respect `deps`.
> All work happens in `web/`. Build MVP (P0–P2, mock/CSV) before DB (P3).

**Conventions**
- `[ ]` not started · `[~]` in progress · `[x]` done.
- "AC" = acceptance criteria (how to know it's done).
- Bilingual = TH + EN on every cadet-facing string.
- After each phase: `npm run build` and `npm run lint` must pass.

---

## Phase 0 — Re-baseline to new design

Goal: turn the old crimson/navy scaffold into the teal new-mock shell with all 15 routes reachable.

- [ ] **P0-1 — Audit existing scaffold.** List what in `web/src` maps to the new design vs. must go. Files: read-only sweep of `web/src/app`, `web/src/components`, `web/src/lib`.
  - AC: short note in PR description of keep/replace/delete decisions; confirms `health/` deletion and `meal`→`meals` rename.
- [ ] **P0-2 — Teal design tokens.** Replace crimson/navy tokens with teal system (Build Plan §5) in `src/lib/tokens.ts` + `src/styles/tokens.css` (or `globals.css`). Default theme only = Academy Teal.
  - AC: no `#a8182a` / `#15203a` references remain; CSS vars `--brand:#0BA8A0`, `--bg`, `--surface`, `--danger`, `--success`, `--warning` exist; light-blue bg renders.
- [ ] **P0-3 — App shell + bottom nav.** Rebuild `AppShell`, `TopBar` (avatar · "Smart Academy" · bell), `BottomNav` (5 tabs: home/class/todo/activity/service, icon + bilingual label, active = teal). Hide bottom nav on push screens (`NO_NAV` set). Files: `src/components/shell/*`.
  - AC: 5 tabs switch; detail/form screens hide nav; back works.
- [ ] **P0-4 — UI primitives library.** Port mock primitives: `Card`, `Button`, `Chip`/`Chips`, `Seg`, `Badge`, `CatTag`, `Sec` (section header), `SubHeader`, `Avatar`, `Img` (with fallback), `Sheet`, `Toast`, `EmptyState`, `LoadingState`, `ErrorState`, `Icon` (map to lucide). Files: `src/components/ui/*`.
  - AC: each renders in isolation; radius 16–24px, soft shadow, teal accents.
- [ ] **P0-5 — i18n + theme + liff carryover.** Keep/refresh `src/lib/i18n.tsx` (TH default), `src/lib/theme.tsx` (teal default), `src/lib/liff.ts` (dev-mock until LIFF ID). Add `BilingualLabel`/`L` helper.
  - AC: `setLang('th'|'en')` swaps all labels; dev-mock identity returns a fake cadet.
- [ ] **P0-6 — Route skeleton (15 screens).** Create/rename App Router routes per Build Plan §6. Delete `src/app/health/`. Rename `src/app/meal/` → `src/app/meals/`. Add `lost-found/`, `lost-found/[id]/`, `activity/[id]/`, `activity/new/`, `notifications/`, `settings/`, `report/`, `report/tickets/`. Each = placeholder screen using `EmptyState` for now.
  - AC: all 15 routes load without error; no `health` route; bottom nav + push/back all reachable.
- [ ] **P0-7 — Strip designer chrome.** Remove simulated iOS device frame, stage gradient, and the Tweaks panel from anything ported. Replace with minimal dev lang/theme toggle behind a `NEXT_PUBLIC_DEV_TOOLBAR` flag.
  - AC: app is full-bleed mobile (no fake phone bezel); no Tweaks panel in prod build.
- [ ] **P0-8 — Env template.** Update `web/.env.example` with `DATABASE_URL, NEXT_PUBLIC_LIFF_ID, LINE_CHANNEL_ID, LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN, APP_BASE_URL`. Document public-vs-server.
  - AC: `.env.example` complete; secrets noted server-only.

**P0 exit:** `npm run dev` → teal Home; 15 routes reachable; build+lint clean.

---

## Phase 1 — MVP UI + mock/CSV data

Goal: every screen renders realistic bilingual data. Deps: P0 complete.

### Data layer
- [ ] **P1-1 — Data-access module.** Create `src/lib/data/` with one typed module per domain (`class.ts`, `meals.ts`, `calendar.ts`, `profile.ts`, `home.ts`, `news.ts`). Each exports typed async getters; internally read mock/CSV. UI imports only these (so P3 can swap to DB).
  - AC: types defined; getters return typed data; no screen imports raw fixtures directly.
- [ ] **P1-2 — CSV loader.** `src/lib/data/csv.ts` parses pilot CSVs at build/runtime (no DB). Load `docs/ingested/class-schedule-2569.pilot.csv` and `academic-calendar-2569.pilot.csv` (copy into `web/` data dir or read at build). Map to canonical schemas (Build Plan §8).
  - AC: class loader returns 75 normalized data rows across 5 cohorts (`ก.1`, `ก`, `ข`, `ค`, `ง`); calendar loader returns verified rows + flags unverified.
- [ ] **P1-3 — Mock fixtures.** Expand `src/lib/data` fixtures: cadet profile + grades (synthetic), full-month meals (schema `date,meal_type,menu_th,menu_en,note,image_url`), full-year calendar seed to fill CSV gaps, news/announcements, todo list, activities, notifications.
  - AC: meals cover one full month × 3 meals; calendar covers a full academic year; all bilingual.

### Screens
- [ ] **P1-4 — Home.** Header, profile summary card (name, year/battalion, "in class now"), featured carousel, Quick Services = **Grades · Meals · Lost & Found · Reports**, My Day (next class / meal / pending-todo count / upcoming activity), News list. Deps: P1-1,3.
  - AC: matches mock layout; Quick Services correct 4; My Day pulls from data module; no AI/health anywhere.
- [ ] **P1-5 — Profile + Grades.** Profile header, cadet info (รหัส/ชั้นปี/กองพัน/กองร้อย), GPA/GPAX cards, term selector, subject list, transcript summary, Academic Notice + Advisor Note, grade status (Published/Pending/Locked). Deps: P1-1,3.
  - AC: term selector switches grade sets; **no AI insight/recommendation**; grade-status states shown.
- [ ] **P1-6 — Class (daily, Mon–Fri).** Day tabs จ/อ/พ/พฤ/ศ; per-day period list (time, code, TH/EN name, room, instructor, category color); cohort selector (5: `ก.1`/`ก`/`ข`/`ค`/`ง`) + semester selector (year/sem stubbed to 1/1). Deps: P1-2.
  - AC: Mon–Fri tabs from CSV; cohort selector switches between the 5 cohorts; **not** a weekly grid; category colors per type; empty day handled.
- [ ] **P1-7 — Meals (monthly).** Month selector, today summary, date strip, Breakfast/Lunch/Dinner cards, menu detail, optional image, dietary note. Deps: P1-3.
  - AC: month + day selectors work; 3 meals/day; **no calorie/nutrition AI**.
- [ ] **P1-8 — Academic Calendar (yearly).** Year selector, month grid with event dots, agenda for selected day, category filter (Academic/Exam/Military/Activity/Holiday/Deadline). Deps: P1-2,3.
  - AC: full year navigable; dots colored by category; filter works; agenda updates on day tap.
- [ ] **P1-9 — To-do.** Summary cards (Open/Due Today/Done), filter chips (All/Academic/Military/Personal/Activity), task list (checkbox, title, category, deadline, priority, assigned-by). Deps: P1-3.
  - AC: filters + checkbox toggle work in session; **no "Top 3 Tasks", no AI suggestion**.
- [ ] **P1-10 — Service.** Search, Recent Services, Service Hub cards, All Services grouped (Academic / Campus Life / Support) per Build Plan §7.8; items without a screen → "coming soon". Deps: P0-4.
  - AC: groups + items match doc; Lost & Found present; **no AI Coach / AI Q&A**; existing screens deep-link correctly.

**P1 exit:** all 7 MVP screens render bilingual with real data; Class shows `ก.1` Mon–Fri; Calendar full year; build+lint clean; no placeholder lorem.

---

## Phase 2 — Workflow features (in-memory)

Goal: interactive create/claim/RSVP flows backed by an in-memory mock store (no DB yet). Deps: P1.

- [ ] **P2-1 — In-memory store.** `src/lib/data/store.ts` — session-scoped mutable store for tickets, lost items, activities, notifications. Same interface P3 DB will implement.
  - AC: create/read/update survive within-session navigation.
- [ ] **P2-2 — Report screen + form.** Category (อาคาร/ไฟฟ้า/ประปา/Internet/ความสะอาด/ความปลอดภัย/เหตุเร่งด่วน), urgency (Low/Normal/High/Emergency), description, photo attach placeholder, submit → ticket number, status timeline. Deps: P2-1.
  - AC: submit returns a ticket #; ticket appears in MyTickets with status.
- [ ] **P2-3 — Pin on Map.** Campus map image overlay; tap to place pin; store `pin_x`,`pin_y` as % of image. **No paid map API.** Add a campus map image to `public/maps/`. Deps: P2-2.
  - AC: pin places + persists with ticket; coords are percentages.
- [ ] **P2-4 — Report MyTickets + status events.** Ticket list + detail with status timeline (Submitted→Assigned→In progress→Completed, bilingual). Deps: P2-2.
  - AC: status timeline renders; statuses bilingual.
- [ ] **P2-5 — Lost & Found list + tabs.** Tabs ของหาย/ของพบ/รายการของฉัน; search + filter (category/location/date/status); item cards. Deps: P2-1.
  - AC: tabs + filters work; item cards show photo/name/category/place/date/status.
- [ ] **P2-6 — Lost & Found detail + claim.** Multi-photo, description, place, reporter, Claim / contact moderator, status timeline; privacy masking for sensitive items (ID cards/docs). Deps: P2-5.
  - AC: claim flow updates status; sensitive items partially masked; moderation flag present.
- [ ] **P2-7 — Activity list + detail + RSVP.** Featured carousel, category filter (Sport/Academic/Volunteer/Social/Club/Training), event cards, detail (host, date/time, location+map preview, description, attendees, comments), Attend/Cancel. Deps: P2-1.
  - AC: RSVP toggles attendee count; detail complete; bilingual.
- [ ] **P2-8 — Create Activity + moderation states.** Cadet creates event; states Draft → Pending Review → Published / Rejected / Cancelled. Deps: P2-7.
  - AC: new event starts Pending Review; moderator action moves state; only Published shows in public list.
- [ ] **P2-9 — Notifications.** List (report status, L&F claim/match, upcoming activity, announcement), read/unread, bell badge on Home/TopBar. Deps: P2-1.
  - AC: actions generate notifications; unread count on bell.
- [ ] **P2-10 — Settings.** Language toggle, theme (teal default), notification prefs, account/LINE binding info, PDPA/privacy links, sign-out. Deps: P0-7.
  - AC: language + prefs persist in session; PDPA links present.

**P2 exit:** report (ticket #), lost item + claim, activity create + RSVP all work within a session; notifications fire; build+lint clean.

---

## Phase 3 — Backend + import (DB swap)

Goal: replace mock/CSV data layer with Postgres; UI unchanged. Deps: P1, P2; live `DATABASE_URL`.

- [ ] **P3-1 — Prisma schema.** Expand `web/prisma/schema.prisma` to MVP data model (Build Plan §9): Identity, Content, Class, Meals, Calendar, Todo, Activity, Report, Lost&Found, Service, System groups. Roles: cadet/instructor/command/moderator.
  - AC: `npx prisma generate` clean; models cover all P1/P2 data shapes.
- [ ] **P3-2 — Migrations + seed.** `prisma migrate dev`; `prisma/seed.ts` seeds reference data (categories, service items, synthetic cadet).
  - AC: migration applies on a fresh DB; seed populates without error.
- [ ] **P3-3 — Import scripts.** `scripts/import-class-schedule.ts`, `import-academic-calendar.ts`, `import-meals.ts`, `import-cadets.ts` — CSV→Prisma, idempotent, audit-logged. Use pilot CSVs.
  - AC: class import loads 75 data rows (5 cohorts); calendar import loads verified rows + marks unverified; re-run = no dupes.
- [ ] **P3-4 — Admin import preview.** Minimal page/route to preview a CSV parse before commit (counts, warnings, unverified flags).
  - AC: preview shows row counts + warnings; commit writes to DB.
- [ ] **P3-5 — API routes.** Implement Build Plan §10 routes (`/api/me`, `/home`, `/class`, `/meals`, `/calendar`, `/todo`(+complete), `/activity`(+rsvp), `/report`, `/lost-found`(+claim)). Back the data-access module with these.
  - AC: each route returns typed data from DB; data-access module switches mock→DB via env flag.
- [ ] **P3-6 — Audit log + RBAC.** `src/lib/rbac.ts` role checks on sensitive actions; write `audit_log` rows. 
  - AC: moderation/claim/ticket actions are role-gated and logged.

**P3 exit:** same UI runs on Postgres; pilot CSVs imported; mock layer toggled off via env; build+lint clean.

---

## Phase 4 — LINE integration

Goal: real distribution inside CRMA LINE OA. Deps: P3; LIFF ID + channel creds.

- [ ] **P4-1 — LIFF login + init.** Wire `@line/liff` init with `NEXT_PUBLIC_LIFF_ID`; replace dev-mock identity with real LIFF profile.
  - AC: opens inside LINE; real LINE profile loads; dev-mock still works locally.
- [ ] **P4-2 — LINE user binding.** Link LINE userId ↔ `cadet_profile` (`@crma.ac.th` domain check where applicable); store in `line_account`.
  - AC: first login binds account; repeat login resolves existing cadet.
- [ ] **P4-3 — Rich Menu.** Configure LINE Rich Menu deep-linking into key LIFF routes.
  - AC: rich menu opens correct screens.
- [ ] **P4-4 — Push notifications.** `/api/line/webhook` + push for: report status, lost-found match/claim, upcoming activity, important announcement. Personalized (not broadcast). Secrets server-side only.
  - AC: at least each notification type delivered to a test account; channel secret/token never in client.

**P4 exit:** app runs in LINE OA via LIFF; ≥1 push type delivered; secrets server-side.

---

## Phase 5 — Pilot

Goal: 1 company (~80–120 cadets). Deps: P4; PDPA checklist green.

- [ ] **P5-1 — PDPA pack.** Privacy notice, consent flow, DPO assigned, data-subject-rights path, Thailand data residency confirmed.
- [ ] **P5-2 — Data accuracy pass.** Verify class/calendar/meals against real school files (resolve calendar OCR gap + unverified labels; load remaining cohorts if provided).
- [ ] **P5-3 — Moderation ownership.** Assign owners for activity moderation + report tickets + lost-found review; document SLAs.
- [ ] **P5-4 — Pilot run + feedback.** Deploy to pilot group, collect feedback, fix UI friction, prepare rollout guide.

**P5 exit:** pilot live; feedback logged; rollout guide written; Build Plan §12 checklist green.

---

## Cross-cutting (apply throughout)

- [ ] **X-1 — No-AI guard.** No AI calls/deps anywhere; reject any "smart"/"recommend"/"insight" feature creep into MVP.
- [ ] **X-2 — Bilingual lint.** No hardcoded single-language cadet-facing strings; all via i18n/`L`.
- [ ] **X-3 — Mobile-only.** No desktop responsive work; full-bleed LIFF webview; no simulated device frame.
- [ ] **X-4 — Data-layer isolation.** Screens never import fixtures/DB directly — only `src/lib/data/*`. Keeps mock→CSV→DB swap clean.
- [ ] **X-5 — Secrets hygiene.** Only `NEXT_PUBLIC_LIFF_ID` public; channel secret/token server-only; never in client components.
- [ ] **X-6 — Audit trail.** Sensitive actions (claims, moderation, ticket status, imports) write `audit_log` from P3 on.

---

## Open decisions to resolve before/while building (owner: stakeholder)

1. Verified **academic calendar** file for the full year (current source is a scan, April-only, unverified labels). — blocks P1-8 real data / P3-3.
2. Real **monthly meals** file (none exists). — blocks P1-7 real data.
3. Brand teal: mock `#0BA8A0` vs doc `#006b67` (mock wins unless overridden). — P0-2.
4. Additional **class year levels / semesters** beyond pilot year 1 / sem 1 (5 cohorts already present). — P1-6 selectors.
5. **Campus map image** for Pin-on-Map. — P2-3.
6. **Moderator role** owners for Activity / Report / Lost&Found. — P2-6/8, P5-3.
