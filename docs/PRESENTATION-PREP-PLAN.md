# CRMA Smart Academy — แผนเตรียมนำเสนอ (2026-07-14 → 2026-08-10)

**เป้าหมาย:** แอปพร้อมสมบูรณ์ภายใน **2026-07-28** (2 สัปดาห์จากวันนี้) เหลือ **2026-07-28 → 2026-08-09** (13 วัน) เป็นช่วงซ้อมนำเสนอ + แก้บั๊กเท่านั้น. นำเสนอจริง **2026-08-10**.

อ้างอิงไทม์ไลน์ต้นฉบับ: `docs/AUDIT-AND-TIMELINE-2026-07-09-TH.md` — ไฟล์นี้คือเวอร์ชันอัปเดตที่สะท้อนงานที่ทำเสร็จแล้วจริง ณ วันนี้ (session ปัจจุบัน), ใช้ไฟล์นี้เป็นหลักแทน.

Google Calendar เชื่อมแล้ว (`cdt.narathipch@gmail.com`) — มี event เตือนตามหมุดสำคัญด้านล่างแล้ว (ดูหัวข้อ "หมุดปฏิทิน").

---

## ✅ เสร็จแล้ว (ยืนยันจริงใน session นี้)

- UI unification ทั้ง 14 task (T1–T14): token/geometry/typography เดียวกันทุกหน้า, touch feedback, loading/empty/error states
- LIFF login จริง (C1) + session cookie
- Upload endpoint auth (C2) — auth-gate + จำกัดชนิด/ขนาดไฟล์
- ลบ mock data ออกจาก home/profile-banner/my-day → ต่อ `/api/me` + `/api/home` จริง
- เพิ่ม schema `Grade`/`Semester` + migrate จริงบน Prisma Postgres (`prisma-postgres-violet-ridge`) + seed ข้อมูลผลการเรียน
- `mock-data.ts` ลบทิ้งแล้ว (ไม่มีไฟล์ไหนอ้างอิงอีก)
- Import ข้อมูลจริง: ตารางเรียน 17 แถว, ปฏิทินการศึกษา 31 แถว, เมนูอาหาร 93 แถว
- OG metadata + branded icon + per-activity share card (แก้ font Thai-glyph bug ระหว่างทำด้วย)
- **Rich Menu: ยิงจริงกับ LINE API แล้ว (2026-07-21)** — สมัคร Messaging API channel เสร็จ, `LINE_CHANNEL_ACCESS_TOKEN` + `NEXT_PUBLIC_LIFF_ID` ใส่ใน `.env` แล้ว, รัน `npm run rich-menu:setup` สำเร็จ (สร้าง+อัปโหลดรูป+ตั้งเป็น default), ยืนยันผ่าน LINE API ตรง (`GET /v2/bot/user/all/richmenu` + `/v2/bot/richmenu/list`) ว่ามี rich menu เดียว ตั้งเป็น default ถูกต้อง
- Deploy ขึ้น Vercel สำเร็จ, ตรวจ production แล้ว (`/opengraph-image`, `/icon` ตอบ 200, `/api/me` ตอบ 404 ถูกต้องตามที่ไม่มี session)
- **Dark theme** — แก้บั๊กปุ่มสลับธีม (ไม่ persist) แล้ว, ทดสอบจริงบนมือถือแล้ว ไม่พบบั๊ก → เก็บฟีเจอร์นี้ไว้ ไม่ต้องถอด
- **ทดสอบจริงบนมือถือผ่าน LINE (iOS)** — เจอ+แก้บั๊กจริง 4 จุด รอบเดียว:
  - ของหาย/ของพบ: รูปไม่ขึ้น (API ไม่ include asset url) + list/detail ใช้ field ที่ไม่มีในสคีมาเลย (`type`, `locationFound`, status `"open"`) → badge ขึ้น "reported" ดิบๆ, ปุ่มขอรับของค้าง disabled ตลอด
  - กิจกรรม: สร้างแล้วไม่ขึ้น list — moderation เข้า pending แต่ไม่มี moderator account/UI เลย → ตัดสินใจ auto-approve
  - กิจกรรม: การ์ดไม่มีรูป (bug เดิมซ้ำ, API ไม่ include images) + ปุ่ม RSVP เช็ค `status === "approved"` ผิด enum (ต้องเป็น `"open"`) → RSVP ค้าง disabled ตลอดทุกกิจกรรม
  - แจ้งซ่อม: list ไม่มีรูป/รายละเอียด/สถานที่ (API ไม่ include อีกเช่นกัน) + `ticketNumber` พิมพ์ผิด (field จริงคือ `ticketNo`) → เลขที่ตั๋ว blank
  - Sweep ทั้งสคีมาแล้ว ยืนยันไม่มีจุดอื่นที่พลาด include แบบเดียวกัน
- Activity list เปลี่ยนเป็น photo card (แนวตั้ง full-width) ตามที่ขอ
- **Playbook 2 (`docs/SONNET-EXECUTION-PLAYBOOK-2.md`) เสร็จครบ 14/14 task — 2026-07-21:**
  - Security: dev-auth bypass ปิดใน production, todo IDOR แก้, input validation + blob URL allowlist ทุก POST, auth ครบทุก API route + ปิด attendee/claimant leak, LINE token aud/exp re-check
  - ลบ hardcode ปลอมทั้งหมด (unread badge, GPAX, "อยู่ในคาบเรียน", recent section ปลอม)
  - `/class` และ announcements ต่อ DB จริงทั้งระบบ (เลิกใช้ mock)
  - UX: lost/found type จริง, ฟอร์มแจ้งซ่อมตัด team dropdown, `/report` เป็น list-first, settings แสดงสถานะ LINE จริง + หน้า PDPA, ยกเลิกลงทะเบียนกิจกรรมได้, เมนูอาหารแก้บั๊กวันหยุดสุดสัปดาห์ + empty state
  - Demo data: script `npm run demo:extend` clone ตารางเรียน/เมนูอาหารจริงไปช่วง ส.ค. + ปฏิทิน ส.ค. + notification จริงพร้อม unread badge ใช้งานได้
  - D2 final sweep: lint/tsc/build เขียว, ~20 route ผ่านหมด (light+dark), security re-check ยืนยัน 401/400/404 ถูกต้องทุกจุด (เจอ+แก้บั๊ก `/api/me` เดิมตอบ 404 แทน 401 ระหว่างสวีป), guardrail (hex/font-scale/lib-data) ผ่าน
- **Rich Menu ยิงจริงกับ LINE API แล้ว** — ขนาดใหญ่ 2500x1686 (ปรับจาก compact เพราะปุ่มเล็กเกิน กดยาก), TopBar มีโลโก้ครุฑ/ตราโรงเรียนกดกลับหน้าแรกได้, avatar sync กับรูป LINE จริงทั้ง TopBar/การ์ดโปรไฟล์/หน้า Profile
- **ทดสอบอุปกรณ์จริงรอบใหม่หลัง Playbook 2 เสร็จแล้วทั้ง Android และ iOS (2026-07-22)** — เจอ+แก้บั๊กจริงจาก Android หลายจุด (claim ของหาย-พบ error, ตารางเรียนซ้ำข้ามสัปดาห์, ปุ่มแนบรูปไม่มีตัวเลือกกล้อง/คลัง) ระหว่างทาง, รอบสุดท้ายทั้งสองแพลตฟอร์มผ่านหมดไม่มีบั๊กเหลือ

## ⚠️ ยังไม่ได้ตรวจ / ไม่รู้สถานะ

- ยังไม่ได้ทำสไลด์นำเสนอให้เสร็จ (draft พร้อมแล้ว รอกรอกชื่อผู้จัดทำ/อาจารย์ที่ปรึกษา + เปิดดูใน PowerPoint จริง)
- ยังไม่ได้ซ้อม demo script เต็มรูปแบบตามเวลาจริง

---

## 📅 ตารางงาน 2 สัปดาห์ (Dev sprint: 2026-07-14 → 2026-07-28)

### สัปดาห์นี้ (07-14 → 07-20)

- [ ] **07-15 (Wed):** สมัครเบอร์ + LINE OA (ถ้ายังไม่ได้ทำ) → รัน `npm run rich-menu:setup`
- [x] **07-15/16:** ตรวจสอบ Dark theme ทุกหน้า — เสร็จแล้ว, ทดสอบจริงบนมือถือ ไม่พบบั๊ก
- [x] **07-16/17:** ทดสอบเปิดแอปผ่าน LINE จริงบนมือถือ (iOS) — เจอ+แก้บั๊กจริงแล้ว 4 จุด (ดูรายละเอียดด้านบน)
- [x] **07-22:** ทดสอบรอบใหม่หลัง Playbook 2 ทั้ง Android + iOS — เจอ+แก้บั๊กจริงเพิ่ม, รอบสุดท้ายผ่านหมดทั้งสองแพลตฟอร์ม
- [x] **07-17/18:** Edge cases — double-submit guard เช็คแล้วทุกฟอร์ม (มีอยู่แล้วจาก T11/T12), no-CadetProfile null-safe แล้ว, session cookie 30 วันเลยไม่ใช่ความเสี่ยงจริงในช่วง demo — ตัดสินใจไม่ทำ retry/refresh token เพิ่ม
- [x] **07-18/19:** Performance — Leaflet dynamic import เช็คแล้ว (ทำไปแล้วจาก sweep ก่อนหน้า), เพิ่ม client-side image compression ก่อนอัปโหลด (ทดสอบ 17.3MB→877KB) — ยังไม่ได้เช็ค Lighthouse score
- [ ] **07-20 (Mon):** เช็คพอยต์กลางสัปดาห์ — สรุปว่าเหลืออะไรก่อน 07-28

### สัปดาห์หน้า (07-21 → 07-28)

- [ ] **07-21→24:** ตามแก้บั๊กที่เจอจากการทดสอบอุปกรณ์จริง
- [ ] **07-24/25:** เตรียมข้อมูลสาธิต (seed ข้อมูลให้ดูสมจริง, ไม่ใช่ dev cadet เปล่าๆ) — ถ้ามีนักเรียนจริงหลายคนให้ import ด้วย
- [x] **07-21:** ร่าง demo script เสร็จแล้ว → `docs/DEMO-SCRIPT-2026-07-21-TH.md` (5 นาที: หน้าหลัก → ตารางเรียน → เมนูอาหาร → แจ้งซ่อม → กิจกรรม → ของหาย-ของพบ → แจ้งเตือน/ตั้งค่า) — เหลือซ้อมจริงกับอุปกรณ์
- [ ] **07-26/27:** เริ่มร่างสไลด์นำเสนอ (โครงร่างอยู่ท้ายไฟล์นี้)
- [ ] **07-28 (Tue): 🎯 Dev freeze — ฟีเจอร์แอปต้องเสร็จสมบูรณ์ภายในวันนี้**

---

## 🎤 ช่วงเตรียมนำเสนอ (2026-07-28 → 2026-08-10)

- **07-29 → 08-02:** ซ้อมพรีเซนต์ + ทำสไลด์ให้เสร็จ, เก็บภาพหน้าจอ/วิดีโอ before-after ของ UI unification (ใช้ประกอบเล่มวิจัยได้)
- **08-03 → 08-05:** ซ้อมเต็มรูปแบบพร้อมโปรเจคเตอร์/แชร์จอ, แก้เฉพาะจุดที่พังจากการซ้อม
- **08-06 (Thu): 🔒 Code freeze** — `git tag v1.0-presentation`, แก้เฉพาะบั๊กร้ายแรงเท่านั้น
- **08-07 (Fri):** อัดคลิปสำรอง 5 นาที (กันเน็ตล่ม/LINE ล่มวันจริง), เซฟภาพหน้าจอสำคัญ
- **08-08 (Sat):** ตรวจ Vercel + ข้อมูลจริงพร้อมใช้ + ซ้อมรอบสอง
- **08-09 (Sun):** พักผ่อน ห้ามแก้โค้ด
- **08-10 (Mon): 🎓 นำเสนอจริง**

---

## 📊 โครงร่างสไลด์นำเสนอ (ร่างเริ่มต้น — ปรับได้)

1. หน้าปก + ชื่อผู้ทำ/อาจารย์ที่ปรึกษา
2. โจทย์วิจัย/ปัญหา (อ้างอิง `docs/research/`)
3. วัตถุประสงค์ + ขอบเขต
4. สถาปัตยกรรมระบบ (LINE LIFF → Next.js → Prisma/Postgres → Vercel) — 1 สไลด์ diagram
5. Design system / UI unification — ภาพ before/after
6. Feature walkthrough (ตรงกับ demo script 5 นาที)
7. ผลลัพธ์ที่เชื่อมโยงกับวัตถุประสงค์วิจัย (ใช้ `RESEARCH-OBJECTIVE-ALIGNMENT-2026-06-29.md`)
8. ข้อจำกัด + แผนต่อยอด (`POST-DEMO.md` ถ้ามี)
9. สรุป + Q&A

*ให้บอกได้เลยเมื่อพร้อมทำจริง — มี pptx skill ช่วยสร้างสไลด์จากโครงร่างนี้ได้.*

---

## หมุดปฏิทิน (Google Calendar, `cdt.narathipch@gmail.com`)

ตั้งไว้แล้วสำหรับหมุดสำคัญด้านบน (ดูรายการ event ที่สร้างพร้อมไฟล์นี้). แก้/ลบ event ได้ตามต้องการในแอป Calendar ปกติ.
