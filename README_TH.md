# CRMA Smart Academy — เว็บแอป (LIFF)

> แพลตฟอร์มดิจิทัลสำหรับนักเรียนนายร้อยโรงเรียนนายร้อยพระจุลจอมเกล้า (CRMA)
> เขียนใหม่ครั้งเดียวจากแอปมือถือ Expo/RN เป็นเว็บแอป LINE LIFF บน Vercel

---

## 1. ภาพรวม

**CRMA Smart Academy (เว็บแอป)** รวมระบบที่กระจัดกระจายของนักเรียนนายร้อย — ตารางเรียน การฝึกทางทหาร
ชีวิตประจำวัน ประกาศ คะแนน ผู้ฝึกสอนฟิตเนส AI — ไว้ในแอปเดียวที่กระจายผ่าน LIFF ติดตั้งจาก
LINE Official Account ของ CRMA

โค้ดเบสมือถือ (`app/` ของโปรเจ็กต์เดิม) **ถูกแช่แข็งเป็นเอกสารอ้างอิง** เท่านั้น repo นี้คือแหล่งข้อมูลจริง
ทิศทางเดียวต่อจากนี้

### กลุ่มผู้ใช้หลัก

- **นักเรียนนายร้อย** — ผู้ใช้หลัก
- **อาจารย์ / ครูฝึก** — บันทึกคะแนน ประเมินผล มอบหมายงาน
- **ผู้บังคับบัญชา / นายทหารนักเรียน** — ดูภาพรวมผลการปฏิบัติ
- **ฝ่ายธุรการ / ทะเบียน** — บริหารข้อมูลและประกาศ

---

## 2. ฟีเจอร์หลัก (เป้าหมาย parity)

### 2.1 วิชาการ

- ตารางเรียนรายสัปดาห์ / รายภาคการศึกษา
- แจ้งเตือนงานที่ยังไม่ส่ง *(การส่งงานยังอยู่นอกระบบ — Moodle: `https://lms.crma.ac.th/moodle/my/`)*
- ผลการเรียน + GPA / GPAX รายภาค *(ภาคปัจจุบัน LOCKED — ดูได้เฉพาะภาคที่จบแล้ว)*
- ห้องสมุดดิจิทัล / e-Books / ระบบถาม-ตอบด้วย AI

### 2.2 การฝึกทางทหาร

- ผลทดสอบสมรรถภาพร่างกาย (PFT) + คำแนะนำจาก AI
- บันทึกการยิงปืน / e-Books ทางยุทธวิธี
- ระบบประเมินภาวะผู้นำ

### 2.3 ชีวิตประจำวัน

- ตารางเวรยาม *(แก้ไขได้เฉพาะนายทหารขึ้นไป — RBAC)*
- เมนูโรงเลี้ยง + คำนวณแคลอรี
- ระบบขอซ่อม / ร้องเรียน
- บอร์ดประกาศ (กองพัน / กรม / ฝ่ายวิชาการ / กิจกรรม)
- ระบบสร้างห้องกิจกรรม (แรงบันดาลใจจาก MeetUp)

### 2.4 การสื่อสาร

- Push ผ่าน LINE Messaging API (narrowcast / multicast / push)
- ปฏิทินกิจกรรมส่วนกลาง
- กลุ่มแชทผ่าน LINE OA group (deep link)
- RSVP กิจกรรมผ่าน LINE flex messages

### 2.5 พัฒนาตนเอง

- เป้าหมายส่วนตัว · ปฏิทินวิชาการ · to-do · บันทึกประจำวันนักเรียน
- คอร์สเสริม · พอร์ตโฟลิโอความสำเร็จ

---

## 3. สถาปัตยกรรม

### Tech stack (LOCKED 2026-05-19)

- **Framework:** Next.js 16 (App Router, Node runtime สำหรับ Prisma)
- **ภาษา:** TypeScript 5 strict + `noUncheckedIndexedAccess`
- **Styling:** Tailwind v4 + class-variance-authority (token เหมือนแอปมือถือ)
- **State:** Zustand 5 (slices: tab · schedule · health · activity)
- **สัญญา routing:** สตริง `activeTab` ตัวเดียวสลับวิว — เหมือน prototype มือถือ
  URL `?tab=` ผูกกับ Zustand store ไม่มี nested route layout
- **i18n:** next-intl (TH default, EN fallback)
- **ORM:** Prisma 7 → PostgreSQL (datasource URL อยู่ที่ `prisma.config.ts`, runtime ใช้ driver adapter)
- **DB host:** Supabase Postgres ภูมิภาค `ap-southeast-1` (สิงคโปร์) — บันทึก gap เรื่องอธิปไตยข้อมูล
- **Auth:** LINE Login (LIFF) → email OTP โดเมน `@crma.ac.th` → TOTP 2FA → JWT (jose) ใน cookie httpOnly Secure
- **Storage:** Vercel Blob (มี caveat เรื่อง sovereignty) สำหรับอวาตาร์ + รูปร้องเรียน
- **Push:** LINE Messaging API (broadcast / narrowcast / push) ผ่านช่อง OA
- **Cron / jobs:** Vercel Cron + Inngest
- **Email OTP:** SMTP ผ่าน Brevo (deliverability ดีในไทย)
- **Observability:** Vercel Analytics + Sentry
- **Testing:** Vitest + `@testing-library/react` + Playwright (UA ของ LINE webview) + `next-test-api-route`
- **Deploy:** Vercel (preview ต่อ PR · prod = `main`)

### ข้อบังคับเด็ดขาด (ห้ามละเมิด)

- บังคับโดเมน `@crma.ac.th` ที่ฝั่ง server ปฏิเสธโดเมนอื่นทั้งหมด
- TOTP 2FA บังคับ ตรวจซ้ำทุกอุปกรณ์ใหม่
- คะแนนภาคปัจจุบัน LOCKED ที่ชั้น Prisma ผ่าน `Semester.isLocked`
- การแก้ไขตารางเวร RBAC เฉพาะ `OFFICER` / `ADMIN`
- ทุก mutation ของ API เขียน `AuditLog` หนึ่งบรรทัด
- PDPA: เข้ารหัส `User.totpSecret`, `User.email`, `PFTResult.*`, `Enrollment.grade` (pgcrypto / envelope ชั้นแอป)
- อธิปไตยข้อมูล: DB หลักอยู่นอกประเทศไทยคือ gap ที่บันทึกไว้ บรรเทาด้วย encryption + audit; วางแผน TH-host fallback

---

## 4. เอกสารต้นทาง (อ่านก่อนออกแบบ)

- `EXPORT.html` — snapshot ทั้งโปรเจ็กต์จากโปรเจ็กต์มือถือเดิม
- `PLAN.html` — แผน `/init`: SKILL.md, moodboard, template skeleton, Prisma, auth flow, 4 ตัวอย่างคอมโพเนนต์, 10 phase TDD
- `MIGRATION_LIFF.md` — ดีไซน์การย้ายจากมือถือเป็น LIFF (16 หัวข้อ, 14 forks)
- repo เดิม (มือถือ แช่แข็ง): `C:\palm\NarathipOS\CRMA Smart academy mobile app`
  - `prototype_spec.md` — สัญญา visual + interaction
  - `references/*.png` — mockup ที่ใส่หมายเหตุ 13 ภาพ
  - `app/src/components/` — RN 30 ตัวสำหรับ port 1:1
  - `app/src/fixtures/` — แหล่งรูปร่างข้อมูล
  - `Documents/` — งานวิจัยภาษาไทย (PDF)

---

## 5. ความปลอดภัย & compliance

- **อธิปไตยข้อมูล** — Supabase SG บันทึกเป็น gap; วางแผน TH-host fallback (CAT Cloud / NIPA / on-prem) ถ้า compliance ยกระดับ
- **การยืนยันตัวตน** — 2FA (TOTP) + allow-list `@crma.ac.th` + ผูกรหัสนักเรียนนายร้อย
- **RBAC** — enum `Role`: `CADET` · `INSTRUCTOR` · `OFFICER` · `ADMIN`
- **Audit log** — ทุก mutation + read ที่ sensitive เขียน `AuditLog`
- **Encryption** — pgcrypto สำหรับคอลัมน์ sensitive; cookie `httpOnly Secure SameSite=Lax`
- **Compliance** — พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 + การจัดชั้นข้อมูลของกองทัพบก

---

## 6. ตัวติดตามความคืบหน้า

อัปเดตหลัง milestone จบใน superpowers loop (brainstorming → writing-plans → TDD → review → commit).

| วันที่     | Milestone                                        | หมายเหตุ                                                                |
| ---------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| 2026-05-19 | Seed repo                                        | `README.md`, `README_TH.md`, `EXPORT.html`, `PLAN.html`, `MIGRATION_LIFF.md` มาจาก session โปรเจ็กต์เดิม |
| 2026-05-19 | `/init` + CLAUDE.md                              | วาง guidance ต่อ repo สำหรับ Claude Code · เลื่อน SKILL.md ไปก่อน Phase 2 |
| 2026-05-19 | Phase 1 — Bootstrap `web/`                       | Next.js 16 · React 19 · TS 5 strict · Tailwind v4 · Prisma 7 · Vitest 4 · Playwright 1.60 · Husky + lint-staged · CI wired · อัปเดต lock: Next 15→16, Prisma 5→7 |
| 2026-05-19 | Phase 2a — รากฐาน Auth                          | Schema (User · Role · RefreshToken · AuditLog) · `@prisma/adapter-pg` · `lib/session.ts` (jose · 1ชม. + 30วัน · cookie `__Host-`) · `lib/rbac.ts` · `lib/audit.ts` · `middleware.ts` · `/login` shell · CI postgres service · unit 48 · e2e 3 ผ่าน |
| 2026-05-19 | Phase 2b — LIFF + LINE callback                  | `lib/line.ts` (jose ES256 + LINE JWKs) · `/api/auth/line/callback` (branch `needs_email` · `needs_totp` · `ok` · AuditLog ทุกครั้ง) · `LiffSignInButton` client island (gate ด้วย NEXT_PUBLIC_LIFF_ID · deviceFp ด้วย Web Crypto SHA-256) · refactor `/login` · unit 63 + e2e 3 ผ่าน · ใช้งานจริงเมื่อ LIFF_ID + DATABASE_URL พร้อม |
| 2026-05-20 | Phase 2c — Email OTP                             | `lib/crypto.ts` envelope AES-256-GCM + HMAC · แยกคอลัมน์ `User` เป็น `emailHash` + `emailCiphertext` · โมเดล `EmailOtp` · `lib/email-otp.ts` (รหัส 6 หลัก · หมดอายุ 10 นาที · 5 ครั้ง · จำกัด 60 วินาทีต่อครั้ง) · `lib/email.ts` Brevo HTTP + fallback สำหรับ dev · คุกกี้ `__Host-crma-enrol` (15 นาที · `aud=crma-enrol`) · เส้นทาง `/api/auth/email/start` + `/verify` · middleware ปลดล็อก `/enrol/*` · `EnrolEmailForm` แบ่ง 2 ขั้น (client island) · unit 123 + e2e 4 ผ่านทั้งหมด |
| 2026-05-20 | Phase 2d — TOTP                                  | `lib/totp.ts` (RFC 6238 SHA1 / 30 วินาที / 6 หลัก ผ่าน `otpauth`) · เพิ่มคอลัมน์ `User.totpVerified` + gate ของ LINE callback · `/api/auth/totp/enrol/start` (เข้ารหัส secret ลง `User.totpSecret` · ส่ง otpauth URI + QR PNG data URL) · `/api/auth/totp/enrol/verify` (ถอดรหัส → ตรวจรหัส ±1 step → ประทับ `totpVerified` → mint cookie access+refresh → ล้างคุกกี้ enrol ในรอบเดียว) · หน้า `/enrol/totp` + `EnrolTotpForm` client island · unit 148 + e2e 5 ผ่าน · re-verify ด้วยลายนิ้วมืออุปกรณ์เลื่อนไป Phase 2e |
| 2026-05-20 | Phase 2e — Re-verify อุปกรณ์                     | คอลัมน์ `User.lastTotpStep BigInt?` กันการ replay · `lib/totp.consumeCode` + `currentStep` · `/enrol/verify` บันทึก `lastTotpStep` คู่กับ `totpVerified` · LINE callback ตรวจ `RefreshToken` หาแถวคู่ `(userId, deviceFp)` ที่ยังใช้ได้ — ไม่พบ → `{ status: 'needs_reverify' }` + คุกกี้ enrol · `/api/auth/totp/reverify` (ถอดรหัส → consumeCode + reject replay → เลื่อน `lastTotpStep` → mint access+refresh + แถว `RefreshToken` ใหม่ + ล้าง enrol) · middleware ปลดล็อก `/reverify/*` · หน้า `/reverify/totp` + `ReverifyTotpForm` client island · unit 170 + e2e 6 ผ่าน |
| 2026-05-20 | Phase 3 — Responsive app shell                   | ติดตั้ง `zustand` 5.x · `store/useTabStore.ts` (7 TAB_KEYS · NAV_TABS 5 รายการ · setTab · isValidTab) · `components/ui/` — AppShell · AppHeader · BottomNav (แสดงเฉพาะมือถือ · `env(safe-area-inset-bottom)`) · NavRail (ไอคอนอย่างเดียวที่ md / ไอคอน+ข้อความที่ xl) · `app/(app)/layout.tsx` (ตรวจ x-user-id) · `app/(app)/page.tsx` (VIEWS map · TabStoreSync · Suspense) · stub view 7 หน้า · build ผ่าน · unit 180 ผ่าน |
| 2026-05-20 | Phase 4 — HomeView                               | ติดตั้ง `lucide-react` · `fixtures/home.ts` · `ProfileBanner` · `HeroCarousel` (client · เลื่อนอัตโนมัติ) · `QuickServicesGrid` · `SmartInsightsRow` · `NewsEventTabs` (client · สลับ news/event) · HomeView ครบทุก component · unit 193 ผ่าน |
| 2026-05-20 | Phase 5 — ClassScheduleView                      | `lib/courseTypeColor.ts` + `lib/formatMilTime.ts` · `fixtures/schedule.ts` · `useScheduleStore` · `DaySwitcher` (แถบ slate-800 · active amber-400) · `SemesterPill` (amber pill + native select) · `ClassCard` (แถบสี · pill เวลา · badge ประเภท) · ส่งออก `DESIGN_BRIEF.txt` · unit 207 ผ่าน |
| 2026-05-20 | Phase 6 — HealthView                             | `fixtures/health.ts` (7 วัน · ActivityType) · `useHealthStore` (selectedDate · waterCups · add/remove) · `WeekCalendarStrip` (SVG ring 7 วัน · ความคืบหน้าก้าวเดิน) · `StepsCard` (donut SVG) · `WaterLogger` (ไอคอนแก้ว · +/−) · `CaloriesCard` (รับ/เผา/เป้า/สุทธิ) · `ActivityLog` (ไอคอนประเภท · empty state) · HealthView ครบทุก component · unit 230 ผ่าน |
| 2026-05-20 | Phase 7 — ActivityView                           | `fixtures/activity.ts` · `useActivityStore` (activeTab · rsvpSet · toggleRsvp) · `TopTabs` · `AttendeesStack` (ซ้อน initial · แสดง overflow) · `EventCard` (badge ประเภท · RSVP toggle · aria-pressed) · `AnnouncementCard` (badge ระดับ) · ActivityView ครบทุก component · unit 249 ผ่าน |
| _pending_  | Phase 8 — Service + Grades + Me                  | external ผ่าน `liff.openWindow` · บังคับ semester-lock                 |
| _pending_  | Phase 9 — Push (LINE Messaging)                  | Webhook · narrowcast worker · Vercel Cron แจ้งเวร                      |
| _pending_  | Phase 10 — Hardening                             | PDPA · export audit · pen-test · Lighthouse budget · custom domain      |

---

## 7. ข้อตกลงการทำงาน

- **Superpowers loop** ต่อ phase: brainstorming → writing-plans → TDD → cross-AI review → commit
- **Caveman comms** ในแชต PR description และ body ของ commit · code, คำเตือนความปลอดภัย, และตัว commit เองเขียนเป็นประโยคปกติ
- **คู่มือ README สองภาษา** — แก้ `README.md` ทุกครั้งต้อง mirror ไป `README_TH.md` ใน commit เดียวกัน
- **DoD ต่อ phase** — `tsc --noEmit` ผ่าน · test เขียวทุกตัว · API test ยืนยันว่ามี audit log row · Lighthouse perf budget ผ่าน
- **ห้าม** — `react-native-web` shim · ข้าม audit log "ลองดูก่อน" · เก็บ token ใน `localStorage` (LINE webview ลบทิ้ง) · ใช้ managed service US-only เป็น primary data

---

## 8. เริ่มเร็ว (สำหรับ `/init`)

```text
1. /init
2. อ่าน EXPORT.html และ PLAN.html
3. ติดตั้ง PLAN.html §1 เป็น .claude/skills/crma-web/SKILL.md
4. ยืนยัน forks ที่ยังไม่ลงใน MIGRATION_LIFF.md §1 (แถว 4, 5, 7, 12)
5. Phase 1 — superpowers loop: brainstorm → plan → TDD → commit
```

---

## 9. อ้างอิง

- ระเบียบ CRMA ว่าด้วยการศึกษาและการฝึก
- พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
- ISO 27001 — การจัดการความมั่นคงสารสนเทศ
- LINE Developers — เอกสาร LIFF v2
- โปรเจ็กต์มือถือเดิม: ดูบันทึก superpowers loop ใน `README.md §6`
