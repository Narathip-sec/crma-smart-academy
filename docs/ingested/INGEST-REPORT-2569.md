# Ingest Report 2569 - Academic Calendar และ Class Schedule

วันที่ ingest: 3 มิถุนายน 2026  
โปรเจ็กต์: CRMA Smart Academy LINE LIFF

---

## 1. ไฟล์ที่นำเข้าแล้ว

| ประเภท | ไฟล์ต้นทางใน workspace | สถานะ |
| --- | --- | --- |
| Class Schedule | `docs/sources/class-schedule-2569.pdf` | อ่าน text layer ได้ |
| Academic Calendar | `docs/sources/academic-calendar-2569.pdf` | เป็น scan/image ไม่มี text layer |

ไฟล์ต้นฉบับถูกคัดลอกจาก `C:/Users/cdtNa/Downloads/` เข้ามาไว้ใน `docs/sources/` เพื่อให้โปรเจ็กต์มี source of truth อยู่ใน workspace และไม่ผูกกับโฟลเดอร์ Downloads

---

## 2. Artifact ที่สร้างจากการ ingest

| Artifact | Path | ใช้ทำอะไร |
| --- | --- | --- |
| Metadata | `docs/ingested/pdf-ingest-metadata.json` | จำนวนหน้า, จำนวนตัวอักษร, สถานะ text layer |
| Raw text - Class Schedule | `docs/ingested/class-schedule-2569.raw.txt` | source สำหรับวิเคราะห์โครงตารางเรียน |
| Raw text - Academic Calendar | `docs/ingested/academic-calendar-2569.raw.txt` | ว่าง เพราะ PDF เป็น scan ไม่มี text layer |
| Preview images | `docs/ingested/previews/` | ใช้ดูเอกสาร scan และวางแผน OCR/manual entry |

สรุปผล:

- `class-schedule-2569.pdf`: 26 หน้า, extract text ได้ประมาณ 42,641 ตัวอักษร
- `academic-calendar-2569.pdf`: 15 หน้า, extract text ได้ 0 ตัวอักษร ต้องใช้ OCR หรือ manual data entry

---

## 3. Class Schedule - สิ่งที่อ่านได้จากไฟล์

ไฟล์ตารางเรียนเป็นเอกสารตารางสอน ปีการศึกษา 2569 มีทั้งภาคการศึกษาที่ 1 และ 2 และแยกตามชั้นปี

ตัวอย่างข้อมูลที่พบ:

- ตารางสอน ชั้นปีที่ 1 ภาคการศึกษาที่ 1 ปีการศึกษา 2569
- ตารางสอน ชั้นปีที่ 2 ภาคการศึกษาที่ 1 ปีการศึกษา 2569
- ตารางสอน ชั้นปีที่ 3 ภาคการศึกษาที่ 1 ปีการศึกษา 2569
- ตารางสอน ชั้นปีที่ 4 ภาคการศึกษาที่ 1 ปีการศึกษา 2569
- ตารางสอน ชั้นปีที่ 5 ภาคการศึกษาที่ 1 ปีการศึกษา 2569
- ตารางสอน ชั้นปีที่ 1 ภาคการศึกษาที่ 2 ปีการศึกษา 2569
- ตารางสอน ชั้นปีที่ 2 ภาคการศึกษาที่ 2 ปีการศึกษา 2569
- ตารางสอน ชั้นปีที่ 3 ภาคการศึกษาที่ 2 ปีการศึกษา 2569
- ตารางสอน ชั้นปีที่ 4 ภาคการศึกษาที่ 2 ปีการศึกษา 2569

ข้อสังเกต:

- ตารางมีช่วงเวลา เช่น `0800-0930`, `0930-1000`, `1000-1030`, `1030-1100`, `1100-1200`, `1200-1300`, `1300-1400`, `1400-1430`, `1430-1500`, `1500-1530`, `1530-1600`
- บางหน้าใช้ช่วงท้าย `1500-1600`
- มีหลายตอน/กลุ่ม เช่น `ก.1`, `ก`, `ข`, `ค`, `ง` และกลุ่มสาขาเช่น `วก.`, `วผ.`, `วฟ.`, `วย.`, `วอ.`, `ซบ.`, `วท.EP`, `วท.2`, `สศ.`, `คศ.`
- PDF text layer ไม่เรียงเป็น cell table ที่ parse อัตโนมัติได้ทันที ต้องมีขั้นตอน normalize/ตรวจทาน

---

## 4. Academic Calendar - สิ่งที่เห็นจาก preview

Academic Calendar เป็นเอกสาร scan ตารางรายเดือน ประจำปีการศึกษา 2569

โครงตาราง:

- เดือน/ปี พ.ศ.
- ลำดับวันที่
- วันในสัปดาห์
- เวลา
- รายการปฏิบัติ
- หมายเหตุ

ตัวอย่างจาก preview:

- หน้าแรกเป็นบันทึกข้อความขออนุมัติ/ตรวจสอบปฏิทินการศึกษา
- หน้าเดือนเมษายน 2569 มีรายการ เช่น การเลือกสาขาวิชา, สอบ/ปรับอักษรระดับ, วันจักรี, วันสงกรานต์, เปิดภาคการศึกษา
- หน้าเดือนพฤษภาคม/มิถุนายน/พฤศจิกายน มีโครงเดียวกัน
- แถบสีเหลืองใช้เน้นวันหยุดหรือช่วงต่อเนื่อง
- แถบสีชมพูใช้เน้นกิจกรรมสำคัญบางรายการ

สถานะ:

- ยังไม่สามารถสร้าง structured event list ได้จาก text extraction
- ต้องเลือกหนึ่งในสองวิธี:
  - OCR ภาษาไทย แล้วตรวจทาน
  - ทำ import sheet จาก preview/manual entry

คำแนะนำ:

เริ่มด้วย manual entry/import sheet สำหรับ Academic Calendar จะเร็วและแม่นกว่าพยายาม parse scan อัตโนมัติใน MVP

---

## 5. Import Schema ที่แนะนำ

### 5.1 Class Schedule

ใช้ CSV/Excel schema นี้:

| column | description |
| --- | --- |
| `academic_year` | ปีการศึกษา เช่น `2569` |
| `semester` | ภาคการศึกษา เช่น `1` หรือ `2` |
| `year_level` | ชั้นปี เช่น `1` |
| `cohort` | ตอน/กลุ่ม เช่น `ก.1`, `ก`, `ข`, `วก.`, `วท.EP` |
| `day_of_week` | Monday-Friday |
| `period_order` | ลำดับคาบ |
| `start_time` | เวลาเริ่ม เช่น `08:00` |
| `end_time` | เวลาจบ เช่น `09:30` |
| `subject_code` | รหัสวิชา เช่น `PH 1001` |
| `subject_name_th` | ชื่อวิชาภาษาไทย |
| `subject_name_en` | ชื่อวิชาภาษาอังกฤษ ถ้ามี |
| `room` | ห้องเรียน ถ้ามี |
| `instructor` | อาจารย์ ถ้ามี |
| `category` | academic, military, pe, advisory, self_study |
| `source_page` | หน้า PDF ที่มาของข้อมูล |

### 5.2 Academic Calendar

ใช้ CSV/Excel schema นี้:

| column | description |
| --- | --- |
| `academic_year` | ปีการศึกษา เช่น `2569` |
| `date` | วันที่ ค.ศ. เช่น `2026-04-01` |
| `thai_date_label` | วันที่ตามเอกสาร เช่น `1 เม.ย. 69` |
| `day_of_week_th` | วันในสัปดาห์ภาษาไทย |
| `start_time` | เวลาเริ่ม ถ้ามี |
| `end_time` | เวลาจบ ถ้ามี |
| `title_th` | รายการปฏิบัติ |
| `title_en` | optional |
| `category` | academic, exam, holiday, military, activity, admin, deadline |
| `note` | หมายเหตุ |
| `source_page` | หน้า PDF ที่มาของข้อมูล |
| `source_row` | แถวในเอกสาร ถ้าต้องการ trace |

---

## 6. ควรเริ่มอย่างไร

ลำดับเริ่มที่แนะนำ:

1. สรุป data model และ import schema ก่อนทำ UI เพิ่ม
2. ทำ import sheet/manual structured CSV สำหรับ Academic Calendar เพราะ PDF เป็น scan
3. ทำ parser/normalizer สำหรับ Class Schedule จาก raw text เฉพาะบางชั้นปีนำร่อง
4. สร้าง mock data จาก structured CSV แล้วออกแบบ UI ด้วยข้อมูลจริงบางส่วน
5. ทำ UI หน้าหลัก, Class รายวัน, Academic Calendar ก่อน เพราะเป็น feature ที่เอกสารต้นทางพร้อมสุด
6. ค่อยทำ Meals, Lost&Found, Report, Activity ตามลำดับ

---

## 7. คำแนะนำเรื่อง Stitch / Design Tool

ใช้ Stitch ได้ดีสำหรับ “หา visual direction และ layout หลายแบบเร็ว ๆ” แต่ไม่ควรให้ Stitch เป็น source of truth ของข้อมูลหรือ logic

Workflow ที่แนะนำ:

1. ทำ spec/data schema ใน Markdown ก่อน
2. ใช้ Stitch หรือ Figma ทำ mockup 3-5 หน้าหลัก:
   - Home
   - Class Daily Schedule
   - Academic Calendar
   - Meals
   - Lost&Found
3. เลือก visual direction
4. ให้ Claude Code สร้าง Next.js app จาก spec และ mockup
5. ใช้ browser screenshot เทียบกับ mockup แล้วปรับ UI

ไม่ควรเริ่มด้วย code ทันทีโดยยังไม่สรุป schema เพราะ schedule/calendar เป็นข้อมูลตาราง ถ้า schema ผิด UI จะต้องแก้ซ้ำเยอะ

