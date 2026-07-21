# Sonnet 5 Execution Playbook 2 — Security + Data Wiring + UX Polish

**Authored by:** Fable 5 (audit + process design) · **Executed by:** Sonnet 5 sessions
**Date:** 2026-07-20 · **Deadline:** dev freeze 2026-07-28, นำเสนอจริง 2026-08-10

## How to use this file

เปิด Claude Code session บน **Sonnet 5** ในรีโปนี้ แล้วสั่ง:

> Read `docs/SONNET-EXECUTION-PLAYBOOK-2.md` and execute the next unchecked task. Follow the Frozen context and Guardrails exactly. Check the box and commit when the task's acceptance criteria pass.

ทำทีละ task หรือหลาย task ต่อ session ก็ได้ **เรียงบนลงล่าง — task เรียงตาม dependency แล้ว** อัปเดต checkbox ในไฟล์นี้ทุกครั้ง (checkbox = shared state ระหว่าง session)

## Context

การตรวจ 2 รอบ (security audit + UX review 2026-07-20) พบปัญหา 3 กลุ่มที่ต้องปิดก่อนนำเสนอ:

1. **Security**: 2 critical — dev-auth fallback ทำงานใน production ได้ถ้า env หาย (auth bypass ทั้งระบบ), IDOR ใน todo complete; 3 high — todo assign หาคนอื่นได้, ไม่มี input validation, photoUrl รับ URL ภายนอกแล้ว render ใน `<img>` ให้ทุกคน
2. **ข้อมูลหลังบ้านทับซ้อน**: `/class` อ่าน mock ล้วน (DB + `/api/class` ที่ import ไว้ 17 แถวไม่มีใครใช้), announcements/news = mock ทั้งระบบทั้งที่ schema มี model, ค่า hardcode ปลอมขัดกับข้อมูลจริง (unread=3, GPAX 3.62, "อยู่ในคาบเรียน")
3. **UX**: 16 ข้อจาก `docs/UX-REVIEW-FIRST-TIME-USER-2026-07-20-TH.md` — ใหญ่สุดคือข้อมูล import อยู่ผิดช่วงเวลา (มิ.ย./พ.ค. เท่านั้น) ทำให้วันนำเสนอทุกหน้า time-based ว่างเปล่า

**การตัดสินใจที่ user ยืนยันแล้ว (2026-07-20) — ห้าม re-litigate:** demo data = script clone จากข้อมูลจริงเดิมไปช่วง ส.ค. · activity คง auto-approve จดเป็น limitation · announcements ต่อ DB จริง · /report สลับเป็น list-first

---

## Frozen context (ห้าม re-derive)

- Stack: Next.js 16 App Router (**อ่าน `web/AGENTS.md` — เวอร์ชันนี้มี breaking changes, เช็ค `node_modules/next/dist/docs/` เมื่อไม่แน่ใจ**), React 19, Tailwind v4 CSS-first, Prisma 6 + Prisma Postgres (DB จริงต่อได้แล้ว — connection string ปัจจุบันใน `web/.env` ใช้งานได้), `@line/liff`
- ทุกคำสั่งรันจาก `web/`: `npm run lint`, `npx tsc --noEmit`, `npm run build`
- Mobile-only 420px. สองภาษา TH/EN ทุก string. Font 4 ขนาด (11/13/15/20). Radius: card 16 / control 12 / pill 999. สีจาก `var(--*)` tokens เท่านั้น (ตาราง decision ใน `docs/SONNET-EXECUTION-PLAYBOOK.md` §1)
- Lint rule `react-hooks/set-state-in-effect`: ห้าม setState synchronous ใน effect body — setState เฉพาะใน `.then`/`.catch` หรือใช้ lazy `useState(() => ...)`
- UI kit: `src/components/ui/index.ts` exports `Avatar, Badge, CatTag, Button, Card, Chip, ChipRow, FormField, Icon, Img, ListItem, Sec, Seg, Sheet, EmptyState, LoadingState, ErrorState, Toast`
- Auth helpers: `getCurrentUser()` (`src/lib/auth.ts`), `requireCadet/requireModerator/requireInstructor` (`src/lib/rbac.ts` — rank-based, สูงกว่า inherit ต่ำกว่า), `writeAuditLog/ipFrom` (`src/lib/audit.ts`)
- ห้าม: dependency ใหม่, แตะ `docs/archive/`, แตะ `.env`, แตะ Blob credentials
- Commit ต่อ task, format:
  ```
  <type>(<scope>): <task id> <description>

  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  ```
- Guardrail: task ไหนบานเกิน 3 ไฟล์นอก spec → หยุด เขียน Notes ท้ายไฟล์นี้ แล้วจบ session
- Gate ทุก task: `npm run lint && npx tsc --noEmit` เขียว; task ที่แตะโครงหน้า → `npm run build` ด้วย; หน้า UI → เปิด dev server ดูจริง 390×844

---

## Phase S — Security (ทำก่อนทุกอย่าง, S1–S2 critical)

### S1 — ปิด dev-auth bypass ใน production ☑ (done — Sonnet 5, 2026-07-20: `DEV_FALLBACK_ALLOWED = NODE_ENV !== "production"` เพิ่มเข้าเงื่อนไข fallback)
`src/lib/auth.ts:22-24`: fallback `DEV_USER_EMAIL` ทำงานเมื่อ `!NEXT_PUBLIC_LIFF_ID` โดยไม่เช็ค NODE_ENV → prod ที่ลืมตั้ง env = ทุก request กลายเป็น dev cadet
**แก้:** เงื่อนไข fallback เพิ่ม `process.env.NODE_ENV !== "production"`. Production ที่ LIFF ไม่ config = return null (401) เสมอ
**Accept:** โค้ด production path ไม่มีทางถึง DEV_EMAIL lookup; lint+tsc เขียว

### S2 — Todo IDOR + role gate ☑ (done — Sonnet 5, 2026-07-20: complete checks TaskAssignment ownership → 404; POST forces assigneeIds=[self] unless instructor+; audit logs added to todo create/complete + activity rsvp/rsvp_cancel. Verified live: IDOR 404 confirmed, assignee-override confirmed, audit rows confirmed)
- `src/app/api/todo/[id]/complete/route.ts`: เช็ค `prisma.taskAssignment.findUnique({ where: { taskId_userId: { taskId: id, userId: user.id } } })` ก่อน upsert — ไม่มี assignment → 404
- `src/app/api/todo/route.ts` POST: บังคับ `assigneeIds = [user.id]` เว้นแต่ `hasRole(user.role, Role.instructor)` จึงใช้ body.assigneeIds ได้ (ปิดช่อง assign งานให้คนอื่นเป็น cadet; คง flow สร้าง todo ตัวเองไว้ — demo ใช้)
- เพิ่ม `writeAuditLog` ให้ todo create + complete + rsvp (`activity/[id]/rsvp`) — ตอนนี้ 3 จุดนี้ไม่ log
**Accept:** cadet A complete task ของ B → 404; cadet ส่ง assigneeIds คนอื่น → ถูก override เป็นตัวเอง; audit rows เพิ่มจริง

### S3 — Input validation + blob URL allowlist ☑ (done — Sonnet 5, 2026-07-20: `src/lib/validate.ts` + applied to report/lost-found/activity/todo POST. Verified live: evil photoUrl → 400, maxAttendees=-1 → 400, 5000-char title → 400, valid submit → 201)
สร้าง `src/lib/validate.ts` (ไม่มี dep ใหม่ — plain functions):
- `isAllowedBlobUrl(url)`: https + hostname ลงท้าย `.public.blob.vercel-storage.com`
- `boundedString(v, max)`, `validDate(v)`, `intInRange(v, min, max)`
Apply ใน POST routes: report / lost-found / activity / todo — title ≤ 200, description ≤ 2000, `maxAttendees` 1–10000, วันที่ต้อง valid, `photoUrl`/`coverImageUrl` ต้องผ่าน `isAllowedBlobUrl` ไม่งั้น 400 (ข้อความ error สองภาษา)
**Accept:** POST photoUrl=`https://evil.tld/x.gif` → 400; maxAttendees=-1 → 400; title 5000 ตัว → 400; ของถูกต้องผ่านปกติ

### S4 — Auth ทุก route + ปิด data leak ใน detail ☑ (done — Sonnet 5, 2026-07-20: auth เพิ่มใน activity GET/[id]/meta, lost-found/[id]/meta, report/meta, calendar, class, meals. activity/[id] → attendeeCount+myRsvp แทน attendees array, lost-found/[id] → claimCount+myClaim แทน claims array, client pages 2 จุดต่อ field ใหม่แล้ว. Verified live: response shape ไม่มี array userId/claimantId หลงเหลือ)
กติกาเดียว: **ทุก route ใต้ `/api` ยกเว้น `/api/auth/line` ต้องมี `getCurrentUser()` → 401 ถ้าไม่มี**. เพิ่มใน: `activity` GET, `activity/[id]`, `activity/meta`, `lost-found/[id]`, `lost-found/meta`, `report/meta`, `calendar`, `class`, `meals`
พร้อมกันปิด leak:
- `activity/[id]`: ตัด `attendees` array (userId ทั้งหมด) ออกจาก response → ส่ง `attendeeCount` + `myRsvp: boolean` (server เช็คจาก user ปัจจุบัน) แทน; client (`activity/[id]/page.tsx`) ตั้ง initial `rsvpDone = myRsvp` (แก้บั๊กรีโหลดแล้วปุ่มเด้งกลับด้วย)
- `lost-found/[id]`: ตัด `claimantId` รายตัว → ส่ง `claimCount` + `myClaim: boolean`
**Accept:** curl ไม่มี cookie → 401 ทุก route ยกเว้น auth/line; response detail ไม่มี userId คนอื่น; RSVP/claim ที่เคยกดแล้ว รีโหลดหน้า สถานะยังถูก

### S5 — Auth/line hardening + housekeeping ☑ (done — Sonnet 5, 2026-07-21: aud+exp re-asserted after LINE verify, console.log removed from upload route, dead `src/lib/data/todo.ts` deleted. lint+tsc+build green; login flow not exercisable locally — LIFF unconfigured in dev, matches this task's own accept note)
- `api/auth/line/route.ts`: หลัง verify สำเร็จ assert `verified.aud === CHANNEL_ID` และ `verified.exp * 1000 > Date.now()`
- `api/upload/route.ts`: ลบ `console.log` blob URL
- ลบไฟล์ตาย `src/lib/data/todo.ts`
**Accept:** login flow เดิมยังทำงาน (dev mode ไม่มี LIFF = ไม่เข้า path นี้); grep console.log ใน api ไม่เหลือ

**Deferred (ไม่ทำในรอบนี้ — จดใน D2):** rate limiting (ต้องมี infra), session revocation/logout, zod เต็มรูปแบบ, upload-to-record binding

---

## Phase F — ปิดค่าปลอม (เล็ก, ทำรวดเดียว)

### F1 — Kill hardcodes ☑ (done — Sonnet 5, 2026-07-21: unread=0, "อยู่ในคาบเรียน" removed, service page Popular subs + entire Recent section removed. Verified live: home + service render clean)
- `src/app/page.tsx:34`: `unread={3}` → `0` (ซ่อน badge จนกว่าจะมีระบบ notification จริงจาก D1)
- `src/components/home/profile-banner.tsx:71`: ตัดป้าย "อยู่ในคาบเรียน" ออก (static ขัดข้อมูลจริง) — เหลือ battalion/company
- `src/app/service/page.tsx:31-34`: ตัด sub ปลอม ("GPAX 3.62", "5 กิจกรรม", "1 รายการ", "มื้อวันนี้") → เหลือชื่อบริการ; ตัด section "ใช้ล่าสุด Recent" ทั้งก้อน (static ปลอม)
**Accept:** grep "3.62|unread={3}|อยู่ในคาบเรียน" ไม่เหลือ; หน้า home + service เปิดดูแล้วไม่มีตัวเลขปลอม

### F2 — /api/home nextClass ตามเวลาจริง + ตัด fetch ซ้ำใน My Day ☐
- `src/app/api/home/route.ts`: nextClass เพิ่มเงื่อนไข `startTime >= เวลาปัจจุบัน "HH:MM"` (string compare ใช้ได้กับ format นี้) — ถ้าหมดวันแล้ว → null
- `src/components/home/my-day.tsx`: ใช้ `nextActivity` จาก `/api/home` (มีอยู่แล้วใน response) แทน fetch `/api/activity?status=open` + `scoreActivity` client-side — ลบ logic ซ้ำซ้อนทิ้ง
**Accept:** เหลือ fetch เดียวใน my-day; การ์ดกิจกรรมยังโชว์ข้อมูลถูก; lint set-state-in-effect ไม่แตก

---

## Phase W — Rewire mock → DB

### W1 — `/class` ต่อ DB จริง ☐
`src/app/class/page.tsx` เลิก import `lib/data/class.ts` ทั้งหมด:
- Fetch `/api/class?dayTh=<วัน>` (route มีอยู่แล้ว, ส่ง ClassPeriod raw rows) ตาม pattern LoadingState/ErrorState+retry ของหน้าอื่น
- Field map: `courseName` (แสดงหลัก), `courseCode` (บรรทัดรอง, nullable), `periodLabel` แทน periodOrder, เพิ่ม `room`/`instructor` (DB มี — ข้อมูลดีขึ้นกว่า mock), `startTime`/`endTime` เดิม
- CATEGORY_COLOR/LABEL นิยามในไฟล์ page เอง ครบ 5 ค่า enum (`academic, military, pe, advisory, self_study` — mock เดิมขาด self_study) ใช้ token เดิม (`--cat-academic`, `--cat-military`, ...)
- ตัด cohort selector + `USER_COHORT "วก."` + หัว "วิศวกรรมเครื่องกล" → หัวเป็น "ตารางเรียน · ภาค 1/2569"
- **แก้ weekend bug**: `todayDay()` คืน null เมื่อเสาร์/อาทิตย์; `selectedDay` default = `todayDay() ?? "Monday"` แต่ `isToday = selectedDay === todayDay()` (null ≠ "Monday" → badge "วันนี้" ไม่ขึ้นผิดวันอีก)
- ลบ `src/lib/data/class.ts`
**Accept:** เนื้อหาตรง DB (เทียบ 2-3 แถวกับ `/api/class?dayTh=จันทร์`); วันอาทิตย์ไม่มี badge วันนี้; build เขียว; ไฟล์ mock หาย

### W2a — Announcements: schema + seed + API ☐
- **Schema**: เพิ่ม `tag String?` ทั้ง `Announcement` และ `NewsItem` + migration `add_announcement_tag` (`npx prisma migrate dev`)
- **Seed**: เพิ่มใน `prisma/seed.ts` — ย้ายเนื้อหา 2 FEATURED + 4 NEWS จาก `lib/data/announcements.ts` ลง DB (upsert กัน dupe — Announcement/NewsItem ไม่มี unique ธรรมชาติ ใช้ findFirst by titleTh + create เฉพาะเมื่อไม่มี), `pinned: true` สำหรับ featured, `publishAt` วันจริงช่วงปลาย ก.ค./ต้น ส.ค., `tag` ตามเดิม (สอบ/วิชาการ/ทหาร/กิจกรรม/ประกาศ) — รัน seed จริง
- **API ใหม่** `src/app/api/announcements/route.ts`: GET → `{ featured, news }` (featured = pinned + ยังไม่ expire เรียง publishAt desc; news = NewsItem เรียง publishAt desc) + auth ตามกติกา S4. `src/app/api/announcements/[id]/route.ts`: GET รายตัว — id format `a_<cuid>` / `n_<cuid>` แยก model (ใช้ format เดียวกันทั้ง list links + detail)
**Accept:** migration ผ่าน แถวเดิมไม่พัง; `/api/announcements` คืนข้อมูล seed; lint+tsc เขียว

### W2b — Announcements: rewire UI 4 จุด ☐ (หลัง W2a)
Rewire (คงหน้าตาเดิมเป๊ะ): `app/announcements/page.tsx`, `app/announcements/[id]/page.tsx`, `components/home/hero-carousel.tsx`, `components/home/news-feed.tsx`
- util ใหม่ `src/lib/announcement-ui.ts`: `TAG_COLOR` map (ย้ายจาก mock, fallback `--cat-notice`), `timeAgo(publishAt)` สองภาษา (นาที/ชม./วัน), `formatDateTh(publishAt)` (พ.ศ.)
- `priority` derive: `pinned` → IMPORTANT badge; `publishAt` ≤ 3 วัน → NEW
- ลบ `src/lib/data/announcements.ts`
**Accept:** ประกาศหน้าแรก+หน้ารวม+รายละเอียดมาจาก DB; "x ชม. ที่แล้ว" เปลี่ยนตามจริง; หน้าตาเทียบก่อน/หลังเหมือนเดิม; mock หาย; build เขียว

---

## Phase U — UX fixes

### U1 — Lost & Found: เพิ่ม type ของหาย/ของพบ ☐
- Schema: `enum LostFoundType { lost, found }` + column `type LostFoundType @default(found)` บน `LostFoundItem` → migration `add_lostfound_type` (default found — ตรงกับแถว demo เดิม)
- Form (`lost-found/new/page.tsx`): radio 2 ปุ่มบนสุด (Chip active style) "ของหาย / Lost" | "ของพบ / Found" — required, ส่ง `type` ใน body; API POST validate ค่า
- List (`lost-found/page.tsx`): filter chips ทั้งหมด/ของหาย/ของพบ (filter จาก field จริง), badge type (หาย=`--danger`, พบ=`--brand`) คู่กับ badge status เดิม, border-left ตามสี type
- Detail (`lost-found/[id]/page.tsx`): ปุ่ม claim ตาม type — lost: "ฉันพบของชิ้นนี้ → แจ้งเพื่อจับคู่" / found: "นี่คือของฉัน → ขอรับคืน"
**Accept:** แจ้งของหายแล้วขึ้น badge หาย filter ได้ถูกกลุ่ม; ปุ่ม claim label ตรง type; แถวเก่าใน DB ยังแสดงปกติ (found)

### U2 — ฟอร์มแจ้งซ่อม: ตัด team dropdown + validation ☐ (ทำก่อน U3)
- ตัด dropdown "ส่งให้ทีม" ออกจาก UI (field `teamId` ใน API/DB คงไว้ให้เจ้าหน้าที่ assign ทีหลัง)
- "รายละเอียด" ใส่ `*` + เพิ่มใน disable เงื่อนไขปุ่ม submit (`!descriptionTh.trim()`) — pattern เดียวกับ lost-found form
- สร้าง helper `sortOtherLast(items)` (เรียงให้ nameTh "อื่น ๆ" ท้ายสุด) ใช้ dropdown ประเภททั้ง report + lost-found + activity form
**Accept:** submit โดยไม่กรอกรายละเอียดไม่ได้ตั้งแต่ client; ไม่มี dropdown ทีม; อื่น ๆ อยู่ท้ายทุกฟอร์ม

### U3 — /report สลับเป็น list-first ☐
- ย้ายเนื้อหา `report/tickets/page.tsx` → `report/page.tsx` (list = default), ฟอร์มเดิม → `report/new/page.tsx`
- ปุ่มแจ้งใหม่ = FAB style เดียวกับ activity; แก้ lost-found ให้ใช้ FAB ด้วย (consistency)
- `/report/tickets` → redirect ไป `/report` (กัน deep link เก่า/rich menu script)
- อัปเดต route list ใน `CLAUDE.md` (+ `/report/new`, `/settings/pdpa`)
**Accept:** เข้า /report เจอ list; แจ้งใหม่ผ่าน FAB → form → submit → เด้งกลับ list เห็นรายการ; ลิงก์เดิมจาก home/service ยังใช้ได้

### U4 — Settings: LINE status จริง + หน้า PDPA ☐
- แถว "เชื่อมต่อ LINE": fetch `/api/me` → `lineLinked` (มีใน response แล้ว) → "เชื่อมต่อแล้ว ✓" (`--success`) หรือ "ยังไม่เชื่อมต่อ" — เลิกเขียน "เร็วๆ นี้"
- หน้าใหม่ `src/app/settings/pdpa/page.tsx`: นโยบายย่อสองภาษา static (ข้อมูลที่เก็บ: LINE profile, ชื่อ-รหัส-สังกัด, รายการที่ผู้ใช้สร้าง; วัตถุประสงค์; สิทธิ์ผู้ใช้; ช่องทางติดต่อ) — AppBar back, token styling; แถว PDPA → href จริง
**Accept:** settings แสดงสถานะ LINE ตรงจริง (dev = ยังไม่เชื่อม); กด PDPA เข้าเนื้อหาได้

### U5 — Activity: ยกเลิกลงทะเบียน ☐ (หลัง S4 — ใช้ myRsvp)
`activity/[id]/page.tsx`: หลังลงทะเบียน แสดง "✓ ลงทะเบียนแล้ว" + ปุ่มรอง "ยกเลิกลงทะเบียน" (ghost/muted, ยิง `action: "cancel"` — API รองรับแล้ว) → สำเร็จแล้ว refresh สถานะ + attendeeCount
**Accept:** ลงทะเบียน → ยกเลิก → ลงใหม่ ครบ loop; จำนวนคนอัปเดต; double-tap มี disabled guard

### U6 — Meals: weekend + empty state ☐
`meals/page.tsx`:
- `getMondayOf`: อาทิตย์ → สัปดาห์ถัดไป (`diff = day === 0 ? 1 : 1 - day`)
- สัปดาห์ที่ fetch แล้วรวม 0 items → `EmptyState` "ยังไม่มีเมนูสำหรับช่วงนี้ · No menu for this period" แทนตาราง "—" ล้วน (คง pattern cancelled+keyed fetch เดิมตามคอมเมนต์ในไฟล์)
**Accept:** logic วันอาทิตย์ได้สัปดาห์ถัดไป; เดือนที่ไม่มีข้อมูลเห็น empty state ไม่ใช่ขีดล้วน

---

## Phase D — Demo data + final sweep

### D1 — Script clone ข้อมูลจริง → ส.ค. + notifications จริง ☐ (หลัง W2, ทำท้ายๆ)
`web/scripts/extend-demo-data.ts` (+ npm script `demo:extend`), idempotent (upsert โดย unique keys เดิม):
- **ClassPeriod**: clone สัปดาห์ 2026-06-22→26 (17 แถว) ไปสัปดาห์ 08-03 และ 08-10 (คง dayTh/periodLabel/course/room, เปลี่ยน date)
- **MealItem**: clone เมนู พ.ค. → ส.ค. วันเดียวกัน (@@unique[date, mealType] กัน dupe)
- **AcademicCalendarEvent**: สร้าง ~6-8 event ช่วง 08-01→14 (เปิดภาค, สอบย่อย, กีฬา, วันหยุด 08-12 วันแม่) กระจาย category ให้ครบสี
- **Notification**: seed 3 รายการต่อ user ทุกคนใน DB (title/deepLink ชี้หน้าจริง) แล้วต่อระบบจริง: `/api/me` เพิ่ม `unreadCount` → `page.tsx` ส่งค่าจริงเข้า TopBar (แทน 0 จาก F1); หน้า notifications แสดงรายการจริง + mark read on click (schema มี `readAt` แล้ว — ต้องมี PATCH endpoint เล็กๆ หรือ POST `/api/notifications/[id]/read`)
- รัน script จริงกับ DB → verify ผ่านแอป
**Accept:** query ช่วง 08-10 — หน้าแรกมีคาบเรียน+เมนู, ปฏิทิน ส.ค. มี event, กระดิ่ง badge ตรงกับหน้า notifications, กดอ่านแล้ว badge ลด

### D2 — Final verification sweep ☐
1. `npm run lint && npx tsc --noEmit && npm run build` เขียว
2. Tap-through ทั้ง ~20 routes ที่ 390×844 (light+dark)
3. **Security re-check** (curl/fetch): ไม่มี cookie → 401 ทุก protected route; photoUrl ภายนอก → 400; todo complete ข้าม user → 404; response detail ไม่มี userId แปลกปลอม
4. Grep guardrails เดิม: no new hex (นอก baseline), no off-scale fonts, `src/lib/data/` เหลือเฉพาะ `csv-schema.ts`
5. อัปเดต `docs/PRESENTATION-PREP-PLAN.md` + `CLAUDE.md` route list; เพิ่มหัวข้อ **Known Limitations** (rate limiting, session revocation/logout, activity auto-approve, upload-to-record binding) ใน `docs/NEXT-STEPS-SUMMARY-2026-07-16-TH.md` — ใช้ประกอบสไลด์หัวข้อ "ข้อจำกัด + แผนต่อยอด"
6. Push → verify production (fetch cache-bust ดู x-vercel-cache)
**Accept:** ทุกข้อผ่าน + จดผลไว้ใน Notes ท้ายไฟล์

---

## ลำดับ + การพึ่งพา

```
S1 → S2 → S3 → S4 → S5   (security ก่อน, เรียงตาม severity)
F1, F2                    (อิสระ, เล็ก)
W1                        (อิสระ)
W2a → W2b                 (schema/API ก่อน UI)
U1 (มี migration), U2 → U3 (แก้ฟอร์มก่อนย้ายไฟล์), U4, U6 (อิสระ), U5 (หลัง S4)
D1 (หลัง W2a — seed announcements ก่อน + หลัง UI tasks เพื่อ verify ด้วยข้อมูลจริง)
D2 สุดท้าย
```
รวม 14 tasks → เสร็จก่อน dev freeze 07-28 (วันละ 2-3 tasks)

## Definition of done (ทั้ง playbook)

- ทุก checkbox ติ๊ก, lint+tsc+build เขียว, D2 checklist ผ่านครบ
- `src/lib/data/` เหลือเฉพาะ `csv-schema.ts`
- ไม่มีค่า hardcode ปลอมที่ขัดข้อมูลจริงเหลืออยู่
- ทดสอบมือถือจริงผ่าน LINE อีกรอบ (iOS หรือ Android อย่างน้อยหนึ่ง) ก่อน dev freeze

## Notes (Sonnet sessions เขียนต่อท้ายบรรทัดนี้)
