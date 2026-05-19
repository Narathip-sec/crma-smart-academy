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
- **ORM:** Prisma 5 → PostgreSQL
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
| _pending_  | `/init` + ติดตั้ง SKILL.md                       | วาง `PLAN.html §1` ลงใน `.claude/skills/crma-web/SKILL.md`             |
| _pending_  | Phase 1 — Bootstrap `web/`                       | Next.js 16 · Tailwind v4 · Prisma · Vitest · Playwright · CI ผ่าน      |
| _pending_  | Phase 2 — รากฐาน Auth                            | LIFF · LINE callback · email OTP · TOTP · middleware · RBAC · AuditLog |
| _pending_  | Phase 3 — App shell                              | IphoneFrame · AppHeader · BottomNav · TabStore ↔ URL sync              |
| _pending_  | Phase 4 — HomeView                               | 6 component · API stub · fixtures                                       |
| _pending_  | Phase 5 — ClassScheduleView                      | DaySwitcher · SemesterPill · ClassCard · API schedule                  |
| _pending_  | Phase 6 — HealthView                             | Streak · WeekCalendar · Steps · Calories · Meal · Activity · Strava   |
| _pending_  | Phase 7 — ActivityView                           | TopTabs · EventCard · RSVP write · AttendeesStack                       |
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
