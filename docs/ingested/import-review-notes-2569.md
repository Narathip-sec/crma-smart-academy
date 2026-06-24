# Import Review Notes — 2569

Pilot extraction flags. Resolve before full import.

---

## Class Schedule — ชั้นปีที่ 1 ภาคการศึกษาที่ 1

### Uncertain time boundaries

| Row(s) | Issue | Action |
|--------|-------|--------|
| All Tuesday rows (periods 1–3, all cohorts) | MS 1001 appears as ONE continuous block 08:00–12:00 in the image. Represented as two periods (08:00–09:30 and 10:00–12:00) for schema consistency. Unknown whether break is observed between periods. | Verify with instructor or printed schedule |
| Tuesday period 3 end time (all cohorts) | MS 1001 afternoon end time estimated 14:30 from image proportions. Could be 15:00 or 15:30. | Verify |
| Wednesday period 3 end time (all cohorts) | Advisory end time estimated 14:30. | Verify |
| Thursday period 3 end time (all cohorts) | Advisory end time estimated 14:30. | Verify |
| Friday period 3 (PE 1001, all cohorts) | End time estimated 15:30 from image. PE at CRMA may run to 16:00. | Verify |

### Subject name truncation

| Subject | Image text | Used value | Note |
|---------|------------|------------|------|
| SS 1201 | "Principles of Political (SS 1201E)" | Principles of Political Science | Likely truncated in cell. Verify full EN name. |

### Missing English names

Cohorts ก, ข, ค, ง show only Thai subject names in the timetable image. English names in the pilot CSV were inferred from ก.1 rows with matching subject codes. These are the same subjects — inference is safe — but confirm if instructed otherwise.

### Cohorts not in pilot

All cohorts (ก.1, ก, ข, ค, ง) extracted for Year 1 Sem 1 Mon–Fri. Years 2–5 and Semester 2 not extracted in this pilot.

### Subject code ME 1601 (แนวคิดและหลักการยานยนต์ทหาร)

Visible in raw text page 17 under ชั้นปีที่ 1 ภาคการศึกษาที่ 2. Not in this pilot (Sem 2 scope excluded).

---

## Academic Calendar — เมษายน–พฤษภาคม 2569

### April entries needing label verification

| Date | Issue |
|------|-------|
| 2026-04-13 | วันสงกรานต์ confirmed by INGEST-REPORT as visible in page 02. Thai label used as-is. Verify exact wording in image. |
| 2026-04-14 | Songkran Day 2 — standard Thai holiday. label_th unverified from image. Possibly วันสงกรานต์ or วันครอบครัว depending on year. |
| 2026-04-15 | Songkran Day 3 — standard Thai holiday. label_th unverified from image. Same note as April 14. |

### April entries not extracted (unclear from image)

Re-examined `docs/ingested/previews/academic-calendar-2569-page-02.png`. Two additional event types visible in event text column but dates unreadable:

- การเลือกสาขาวิชา (branch/major selection) — appears in early-to-mid April rows
- สอบ/ปรับอักษรระดับ (grade adjustment exam) — appears in early April rows

Not added to pilot CSV. Manual entry required from source PDF or printed copy.

### May 2026 — entire month unextracted

Re-examined `docs/ingested/previews/academic-calendar-2569-page-03.png`. Event text too small to read reliably at image resolution. Zero entries added to pilot CSV. Full manual entry required.

**Visual observations from page-03 (for manual verifier):**

| Approximate date | Observation |
|-----------------|-------------|
| May 4 (Mon) | Yellow-highlighted row visible. Strong candidate: วันฉัตรมงคล (Coronation Day) — confirmed Thai national holiday falling annually on May 4. Verify label against source PDF. |
| May 12–13 area | Yellow-highlighted row(s) visible. Candidate: วันพืชมงคล (Royal Ploughing Ceremony) — exact date set annually by royal announcement. Verify. |
| Mid-month (approx. May 17) | วันวิสาขบูชา 2026 falls ~May 17 (Sunday); if sub. holiday follows on May 18 (Mon), verify against source. |
| Various non-highlighted rows | Text entries visible in event column. Content unreadable. Could be academic admin events (exams, grade submission, activity days). |

None of these candidates added to pilot CSV. Verification required before import.

### Missing months

Only April and May covered in this pilot scope. Months June–March need separate extraction passes using remaining preview images (pages 04–15).

---

## Source quality notes

| Source | Issue |
|--------|-------|
| `class-schedule-2569.raw.txt` | PDF text layer does not preserve table grid. Row-to-column mapping is unreliable. Use preview images (page-03.png, page-04.png) as authoritative source for Year 1 data. |
| `academic-calendar-2569.pdf` | Scanned image, no text layer. All extraction requires visual reading of preview PNGs or OCR. |
