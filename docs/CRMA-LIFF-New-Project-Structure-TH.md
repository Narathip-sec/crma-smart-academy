# CRMA Smart Academy LINE LIFF - โครงสร้างโปรเจ็กต์ใหม่

วันที่จัดทำ: 2 มิถุนายน 2026  
เป้าหมาย: วางโครงสร้างโปรเจ็กต์ใหม่สำหรับสร้าง LINE LIFF App ของ Smart Academy โดยยึดวัตถุประสงค์เดิม แต่ตัดฟีเจอร์ AI ออกทั้งหมดเพื่อลดงบประมาณและลดความซับซ้อน

---

## 1. แนวคิดหลักของแอป

แอปนี้ควรเป็น “ศูนย์กลางชีวิตประจำวันของนักเรียนนายร้อย” ที่เปิดจาก LINE Official Account ได้ทันที ใช้ดูข้อมูลที่ต้องใช้ทุกวัน เช่น ข่าวประกาศ ตารางเรียนรายวัน มื้ออาหาร งานที่ต้องทำ กิจกรรม และระบบแจ้งซ่อม/แจ้งเหตุ

หลักการออกแบบ:

- ใช้งานผ่านมือถือเป็นหลัก เพราะ LIFF จะเปิดใน LINE
- หน้าจอแรกต้องตอบคำถาม “วันนี้มีอะไรสำคัญ” ได้เร็ว
- ข้อมูลมาจากไฟล์ที่โรงเรียนจัดส่งได้จริง เช่น ตารางเรียนรายวัน เมนูอาหารรายเดือน ปฏิทินรายปี
- ตัด AI ทุกส่วนใน MVP เพื่อคุมงบและลดความเสี่ยงด้านข้อมูล
- ให้ cadet สร้างกิจกรรมได้แบบ Meetup แต่มีระบบ moderation เพื่อความเรียบร้อย
- ใช้ LINE Rich Menu และ Bottom Navigation ให้ตรงกัน เพื่อไม่ให้ผู้ใช้หลงทาง

---

## 2. Feature Set ใหม่

### 2.1 Bottom Navigation หลัก

ควรมี 5 แท็บหลักตามภาพตัวอย่าง:

| Tab | Route | หน้าที่ |
| --- | --- | --- |
| หน้าหลัก Home | `/` | ภาพรวมประจำวัน, featured cards, quick services, news |
| ตารางเรียน Class | `/class` | ตารางเรียนรายวัน จันทร์-ศุกร์ แบบ fixed |
| งาน Todo | `/todo` | งานทั้งหมด, deadline, หมวดหมู่, สถานะ |
| กิจกรรม Activity | `/activity` | ระบบกิจกรรมแบบ Meetup, สร้าง event, RSVP |
| บริการ Service | `/service` | ค้นหาบริการทั้งหมดและเมนูลัด |

### 2.2 Quick Services บนหน้า Home

Quick Services ที่แนะนำ:

| เดิม | ใหม่ | เหตุผล |
| --- | --- | --- |
| Grades | ผลการเรียน Grades | คงไว้ เป็น feature ที่มีประโยชน์สูง |
| Meals | อาหาร Meals | คงไว้ เพราะมี data รายเดือน วันละ 3 มื้อ |
| Health AI | Lost & Found | แนะนำให้แทน Health AI เพราะทำได้จริง งบต่ำ และเหมาะกับชีวิตในโรงเรียนประจำ |
| Reports | รายงาน / แจ้งซ่อม Reports | คงไว้ และเพิ่ม Pin on Map |

### 2.3 ฟีเจอร์ที่ตัดออก

ตัดทั้งหมดใน MVP:

- Health AI
- AI Coach
- AI Q&A
- AI Insight
- AI recommendation
- การซื้อโมเดล AI หรือเรียก API AI เชิงพาณิชย์

หมายเหตุ: หากอนาคตมีงบ สามารถเพิ่ม AI เป็น phase แยกได้ แต่ไม่ควรปะปนกับ MVP

---

## 3. Feature แทน Health AI

### Recommendation: Lost & Found / ของหาย-ของพบ

แนะนำให้ใช้ “Lost & Found / ของหาย-ของพบ” แทน Health AI เพราะเหมาะกับบริบทโรงเรียนมากกว่า Leave Pass ในตอนนี้ ระบบขอลาของ รร.จปร. ยังเป็นกระดาษและมีแนวโน้มไม่เปลี่ยนเร็ว ดังนั้นไม่ควรฝืนเอา workflow ที่องค์กรยังไม่พร้อมเข้าระบบดิจิทัล

เหตุผล:

- ไม่ต้องซื้อ AI
- เป็นปัญหาที่เกิดได้จริงในโรงเรียนประจำ เช่น บัตร, กระเป๋า, เอกสาร, อุปกรณ์กีฬา, หนังสือ, เครื่องแต่งกาย
- ทำ MVP ได้เร็ว: แจ้งของหาย → แจ้งพบของ → ตรวจสอบ → เจ้าของ claim → ปิดรายการ
- ใช้รูปภาพและสถานที่ช่วยให้ค้นหาได้ง่าย
- ต่อกับ LINE notification ได้ เช่น มีคนพบของที่คล้ายรายการที่แจ้งหาย
- ไม่กระทบ workflow กระดาษของโรงเรียน

หน้าที่ควรมี:

- แจ้งของหาย
- แจ้งพบของ
- แนบรูปของ
- ระบุหมวดหมู่ เช่น เอกสาร, บัตร, หนังสือ, เครื่องแบบ, อุปกรณ์กีฬา, อุปกรณ์อิเล็กทรอนิกส์, อื่น ๆ
- ระบุสถานที่หายหรือสถานที่พบ
- เพิ่ม Pin on Map แบบต้นทุนต่ำได้ หากต้องการเจาะตำแหน่งใน campus
- ดูสถานะ: Open, Matched, Claimed, Returned, Closed
- เจ้าของส่งคำขอ claim พร้อมรายละเอียดพิสูจน์ความเป็นเจ้าของ
- ผู้ดูแลตรวจสอบและปิดรายการ
- แจ้งเตือนผ่าน LINE เมื่อมีรายการ match หรือสถานะเปลี่ยน

ข้อมูลหลัก:

- `lost_found_item`
- `lost_found_claim`
- `lost_found_attachment`
- `lost_found_status_event`
- `lost_found_category`

ทางเลือกอื่นที่เป็นไปได้:

| ตัวเลือก | ข้อดี | ข้อควรระวัง |
| --- | --- | --- |
| Lost & Found | งบต่ำ ทำได้เร็ว มีประโยชน์ในชีวิตประจำวัน | ต้องมี moderation และระวังข้อมูลส่วนบุคคลในรูปภาพ |
| Clinic & Welfare | ใช้แทน Health ได้แบบไม่ใช้ AI | เกี่ยวข้องกับข้อมูลสุขภาพ ต้องระวัง PDPA |
| Campus Map & Wayfinding | ง่าย งบน้อย ใช้คู่กับ report map ได้ | อาจเป็น utility มากกว่า feature หลักบน Home |

---

## 4. รายละเอียดแต่ละหน้า

## 4.1 Home

วัตถุประสงค์: เป็นหน้าสรุปประจำวัน

องค์ประกอบ:

- Header: avatar, Smart Academy, notification bell
- Profile summary card: ชื่อ, ชั้น/กองพัน, สถานะกำลังเรียน
- Featured carousel: ข่าวสำคัญหรือประกาศ
- Quick Services: Grades, Meals, Lost & Found, Reports
- My Day: สรุปประจำวัน
- News: ข่าวสารล่าสุด

My Day ที่ควรแสดง:

- Next Class: วิชาถัดไปและเวลา
- Meal: มื้อถัดไปหรือมื้อกลางวัน
- Pending Todo: จำนวนงานค้าง
- Upcoming Activity หรือ Academic Event

ข้อมูลที่ต้องเตรียม:

- featured announcement
- daily schedule
- meal menu
- todo count
- latest news
- notification count

---

## 4.2 Profile & Grade Report

วัตถุประสงค์: ดูข้อมูลประจำตัวและผลการเรียน

องค์ประกอบ:

- Profile header
- Cadet info: รหัส, ชั้นปี, กองพัน, กองร้อย
- GPA / GPAX cards
- Term selector
- Subject list
- Transcript summary

ตัดออก:

- AI Insight
- AI recommendation

แทนที่ด้วย:

- Academic Notice: ข้อความประกาศจากฝ่ายวิชาการ
- Advisor Note: หมายเหตุจากอาจารย์ที่ปรึกษา
- Grade status: Published / Pending / Locked

ข้อมูลที่ต้องเตรียม:

- cadet profile
- term list
- grade records
- course credit
- grade publish status

---

## 4.3 Class - ตารางเรียนรายวัน

Requirement ใหม่:

- เปลี่ยนจากตารางแบบ calendar/week view เป็น “รายวัน จันทร์ถึงศุกร์”
- โรงเรียนจะให้ไฟล์มาเป็นรายวัน
- แต่ละวันมีวิชา fixed อยู่แล้ว ไม่เปลี่ยนบ่อย

รูปแบบหน้า:

- Day tabs: จันทร์, อังคาร, พุธ, พฤหัสบดี, ศุกร์
- Today highlight
- List รายคาบ:
  - เวลาเริ่ม
  - เวลาจบ
  - ชื่อวิชา
  - รหัสวิชา
  - ห้องเรียน
  - อาจารย์
  - หมวด Academic / Military / PE / Activity

การ import ข้อมูล:

รูปแบบไฟล์ที่แนะนำ:

| cohort | day | period | start | end | subject_code | subject_name_th | subject_name_en | room | instructor | type |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| M6/1 | Monday | 1 | 08:30 | 09:30 | MA201 | คณิตศาสตร์ | Mathematics | Room 302 | Capt. A | academic |

ข้อดีของแบบรายวัน:

- ทำง่ายกว่า dynamic timetable
- นำเข้าไฟล์ง่าย
- เหมาะกับตารางเรียน fixed
- ลดความผิดพลาดจากการคำนวณซับซ้อน

---

## 4.4 Meals - มื้ออาหาร

Requirement ใหม่:

- มีข้อมูลเป็นรายเดือน
- วันละ 3 มื้อ
- ไม่มี AI calorie หรือ recommendation

รูปแบบหน้า:

- Month selector
- Today meal summary
- Date selector หรือ calendar strip
- Breakfast / Lunch / Dinner cards
- รายละเอียดเมนู
- รูปอาหาร ถ้ามี
- หมายเหตุ เช่น ฮาลาล, มังสวิรัติ, แพ้อาหาร ถ้าโรงเรียนมีข้อมูล

รูปแบบไฟล์ที่แนะนำ:

| date | meal_type | menu_th | menu_en | note | image_url |
| --- | --- | --- | --- | --- | --- |
| 2026-06-01 | breakfast | ข้าวต้มหมู | Pork rice soup | - | - |
| 2026-06-01 | lunch | ไก่ผัดกะเพรา | Basil chicken | - | - |
| 2026-06-01 | dinner | แกงจืดเต้าหู้ | Tofu soup | - | - |

---

## 4.5 Academic Calendar

Requirement:

- มีข้อมูลทั้งปี
- ใช้แบบรายปี ไม่ต้องเปลี่ยน

รูปแบบหน้า:

- Year selector
- Month grid
- Event dots
- Agenda list ของวันที่เลือก
- Filter ประเภท event:
  - Academic
  - Exam
  - Military
  - Activity
  - Holiday
  - Deadline

รูปแบบไฟล์ที่แนะนำ:

| academic_year | date | title_th | title_en | category | start_time | end_time | location | note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026 | 2026-06-10 | สอบกลางภาค | Midterm Exam | exam | 09:00 | 12:00 | Hall A | - |

---

## 4.6 To-do-list

Requirement ใหม่:

- ตัด Top 3 Tasks for Today ออก

รูปแบบหน้า:

- Summary cards:
  - Open
  - Due Today
  - Done
- Filter chips:
  - All
  - Academic
  - Military
  - Personal
  - Activity
- Task list:
  - Checkbox
  - Title
  - Category
  - Deadline
  - Priority
  - Assigned by

สิ่งที่ไม่ต้องมี:

- Top 3 Tasks for Today
- AI task suggestion

ข้อมูลหลัก:

- `task`
- `task_assignment`
- `task_completion`
- `task_comment`

---

## 4.7 Activity - Meetup-style Events

Requirement:

- ใช้แบบ Platform “Meetup”
- มีภาพ event
- นักเรียนนายร้อยสร้าง events ได้อย่างอิสระ

รูปแบบหน้า:

- Featured events carousel
- Category filter:
  - Sport
  - Academic
  - Volunteer
  - Social
  - Club
  - Training
- Event card:
  - Cover image
  - Title
  - Date/time
  - Location
  - Host
  - Attendee count
  - Capacity
  - RSVP button
- Event detail:
  - Cover image
  - Host profile
  - Date/time
  - Location + map preview
  - Description
  - Attendees
  - Comment / update
  - Attend / Cancel attendance

ระบบสร้าง event:

- Cadet สร้าง event ได้
- ต้องมี moderation mode:
  - Draft
  - Pending Review
  - Published
  - Rejected
  - Cancelled
- Admin หรือ activity moderator ตรวจเฉพาะ event ที่เสี่ยง เช่น คำหยาบ รูปไม่เหมาะสม สถานที่ต้องขออนุญาต

ข้อมูลหลัก:

- `activity_event`
- `activity_category`
- `activity_attendee`
- `activity_comment`
- `activity_image`
- `activity_moderation_log`

---

## 4.8 Report - แจ้งซ่อม / แจ้งเหตุ

Requirement:

- ระบบนี้ดีแล้ว ให้คงไว้
- เพิ่มระบบ Pin on Map

รูปแบบหน้า:

- เลือกประเภท:
  - แจ้งซ่อมอาคาร
  - ไฟฟ้า
  - น้ำประปา
  - Internet
  - ความสะอาด
  - ความปลอดภัย
  - เหตุเร่งด่วน
- เลือกระดับความเร่งด่วน:
  - Low
  - Normal
  - High
  - Emergency
- กรอกรายละเอียด
- แนบรูป
- เลือกตำแหน่งด้วย Pin on Map
- Submit แล้วได้ ticket number
- ติดตามสถานะ

แนวทาง Pin on Map ที่คุมงบ:

MVP แนะนำใช้ “Campus Map Image + Pin Overlay”

- โรงเรียนส่งภาพแผนที่ campus หรือ floor plan
- ผู้ใช้แตะตำแหน่งบนภาพ
- ระบบบันทึกค่า `pin_x`, `pin_y` เป็นเปอร์เซ็นต์ของภาพ
- ไม่ต้องเสียค่า Google Maps
- เหมาะกับพื้นที่โรงเรียนที่เป็น campus ปิด

ถ้าต้องใช้พิกัดจริง:

- ใช้ Leaflet + OpenStreetMap เป็นตัวเลือกต้นทุนต่ำ
- บันทึก `latitude`, `longitude`
- ใช้เฉพาะกรณีจำเป็น เช่น เหตุนอกอาคารหรือพื้นที่กว้าง

ข้อมูลหลัก:

- `report_ticket`
- `report_category`
- `report_attachment`
- `report_status_event`
- `report_location`
- `maintenance_team`

---

## 4.9 Service Page

Requirement:

- คงไว้แบบเดิม เพราะสวยและดูง่าย
- ตัด AI Coach ออก

โครง Service Page:

- Search services
- Recent Services
- Service Hub cards
- All Services grouped by category

เมนูที่แนะนำ:

Academic:

- Grades & Transcripts
- Daily Class Schedule
- Academic Calendar
- Course Registration
- E-Book Library

Campus Life:

- Canteen Menu
- Activity Hub
- Lost & Found
- Bus Schedule
- Laundry Status
- Campus Map

Support:

- Report / Fix
- Contact Office
- Campus Map
- Documents Request
- FAQ

ตัดออก:

- AI Coach
- AI Q&A

---

## 4.10 Lost & Found - ของหาย / ของพบ

Requirement:

- ใช้แทน Health AI ใน Quick Services
- ไม่เกี่ยวกับระบบขอลาหรือเอกสารราชการที่โรงเรียนยังใช้กระดาษ
- ให้ cadet ช่วยกันแจ้งของหายและของพบได้
- มีระบบ claim และ moderation เพื่อกันรายการปลอม รูปไม่เหมาะสม หรือข้อมูลส่วนบุคคลรั่ว

รูปแบบหน้า:

- Tabs:
  - ของหาย
  - ของพบ
  - รายการของฉัน
- Search และ filter:
  - หมวดหมู่
  - สถานที่
  - วันที่
  - สถานะ
- Item card:
  - รูปของ
  - ชื่อสิ่งของ
  - หมวดหมู่
  - สถานที่หาย/พบ
  - วันที่แจ้ง
  - สถานะ
- Detail page:
  - รูปหลายใบ
  - รายละเอียด
  - สถานที่
  - ผู้แจ้ง
  - ปุ่ม Claim / ติดต่อผู้ดูแล
  - Status timeline

Workflow:

1. Cadet แจ้งของหายหรือของพบ
2. ระบบแสดงรายการเป็น Open
3. ผู้ใช้อื่นค้นหาและส่ง claim ได้
4. ผู้ดูแลตรวจสอบ claim
5. นัดรับคืนหรือส่งต่อจุดรับของกลาง
6. ปิดรายการเป็น Returned / Closed

ข้อมูลหลัก:

- `lost_found_item`
- `lost_found_category`
- `lost_found_attachment`
- `lost_found_claim`
- `lost_found_status_event`

ข้อควรระวัง:

- รูปอาจติดใบหน้า บัตรประจำตัว หรือข้อมูลส่วนบุคคล ต้องมี moderation
- รายการสำคัญ เช่น บัตรประชาชน บัตรนักเรียน เอกสารราชการ ควรซ่อนรายละเอียดบางส่วน
- ควรมีจุดรับของกลาง เช่น กองร้อย, ห้องกิจการนักเรียน, หรือสำนักงานที่โรงเรียนกำหนด

---

## 5. โครงสร้าง Project ที่แนะนำ

ใช้ Next.js App Router + TypeScript + Tailwind + Prisma + PostgreSQL + LINE LIFF SDK

```txt
crma-smart-academy-liff/
  docs/
    PROJECT-STRUCTURE.md
    FEATURE-SPEC.md
    DATA-IMPORT-SPEC.md
    LIFF-SETUP.md
    PDPA-CHECKLIST.md

  web/
    package.json
    next.config.ts
    tsconfig.json
    .env.example

    public/
      images/
        placeholders/
        event-covers/
        service-icons/
      maps/
        campus-map.png

    prisma/
      schema.prisma
      migrations/
      seed.ts

    scripts/
      import-class-schedule.ts
      import-meals.ts
      import-academic-calendar.ts
      import-cadets.ts

    src/
      app/
        layout.tsx
        page.tsx

        class/
          page.tsx

        meals/
          page.tsx

        calendar/
          page.tsx

        todo/
          page.tsx

        activity/
          page.tsx
          new/page.tsx
          [eventId]/page.tsx

        service/
          page.tsx

        report/
          page.tsx
          [ticketId]/page.tsx

        lost-found/
          page.tsx
          new/page.tsx
          [itemId]/page.tsx

        profile/
          page.tsx

        api/
          me/route.ts
          home/route.ts
          class/route.ts
          meals/route.ts
          calendar/route.ts
          todo/route.ts
          activity/route.ts
          report/route.ts
          lost-found/route.ts
          line/webhook/route.ts

      components/
        shell/
          AppShell.tsx
          TopBar.tsx
          BottomNav.tsx
          PageHeader.tsx
          NotificationBell.tsx

        ui/
          Button.tsx
          Card.tsx
          Chip.tsx
          MetricCard.tsx
          EmptyState.tsx
          ImageFallback.tsx
          SearchInput.tsx

        home/
          ProfileHero.tsx
          FeaturedCarousel.tsx
          QuickServices.tsx
          MyDaySummary.tsx
          NewsList.tsx

        class/
          DayTabs.tsx
          ClassPeriodCard.tsx
          DailyClassList.tsx

        meals/
          MonthSelector.tsx
          MealCard.tsx
          DailyMealView.tsx

        calendar/
          YearCalendar.tsx
          MonthGrid.tsx
          CalendarAgenda.tsx

        todo/
          TodoSummary.tsx
          TodoFilters.tsx
          TodoRow.tsx

        activity/
          EventCard.tsx
          EventDetail.tsx
          EventForm.tsx
          AttendeeList.tsx

        report/
          ReportForm.tsx
          CampusMapPinPicker.tsx
          ReportStatusTimeline.tsx

        service/
          ServiceSearch.tsx
          ServiceHub.tsx
          ServiceGroup.tsx

        lost-found/
          LostFoundItemCard.tsx
          LostFoundForm.tsx
          LostFoundClaimCard.tsx

      lib/
        liff.ts
        db.ts
        auth.ts
        rbac.ts
        i18n.ts
        routes.ts
        constants.ts
        validators/
          report.ts
          activity.ts
          lost-found.ts
        imports/
          class-schedule.ts
          meals.ts
          academic-calendar.ts

      styles/
        tokens.css
        globals.css
```

---

## 6. Data Model ระดับ MVP

ตารางหลักที่ควรมี:

| กลุ่ม | ตาราง |
| --- | --- |
| Identity | `user`, `cadet_profile`, `line_account`, `role_assignment` |
| Content | `announcement`, `news_item`, `file_asset` |
| Class | `class_schedule_day`, `class_period` |
| Meals | `meal_month`, `meal_day`, `meal_item` |
| Calendar | `academic_calendar_event` |
| Todo | `task`, `task_assignment`, `task_completion` |
| Activity | `activity_event`, `activity_attendee`, `activity_comment`, `activity_moderation_log` |
| Report | `report_ticket`, `report_location`, `report_attachment`, `report_status_event` |
| Lost & Found | `lost_found_item`, `lost_found_claim`, `lost_found_attachment`, `lost_found_status_event` |
| Service | `service_item`, `service_category` |
| System | `notification`, `notification_delivery`, `audit_log` |

---

## 7. API Routes ที่แนะนำ

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/me` | GET | ข้อมูลผู้ใช้ปัจจุบันจาก LINE/session |
| `/api/home` | GET | ข้อมูลหน้า Home |
| `/api/class?day=Monday` | GET | ตารางเรียนรายวัน |
| `/api/meals?month=2026-06` | GET | เมนูอาหารรายเดือน |
| `/api/calendar?year=2026` | GET | Academic calendar รายปี |
| `/api/todo` | GET/POST | ดูและสร้าง task |
| `/api/todo/{id}/complete` | POST | ทำเครื่องหมายว่างานเสร็จ |
| `/api/activity` | GET/POST | ดูและสร้าง event |
| `/api/activity/{id}/rsvp` | POST | เข้าร่วมกิจกรรม |
| `/api/report` | GET/POST | สร้างและดู report ticket |
| `/api/lost-found` | GET/POST | ดูและสร้างรายการของหาย/ของพบ |
| `/api/lost-found/{id}/claim` | POST | ส่งคำขอ claim สิ่งของ |
| `/api/line/webhook` | POST | รับ webhook จาก LINE |

---

## 8. Data Import Strategy

เพราะโรงเรียนจะส่งข้อมูลเป็นไฟล์ ควรออกแบบ import pipeline ตั้งแต่แรก

### 8.0 Source files ที่ ingest แล้ว

ไฟล์ Academic Calendar และ Class Schedule ปีการศึกษา 2569 ถูกคัดลอกเข้า workspace แล้ว:

| ประเภท | Source PDF | Ingest artifact |
| --- | --- | --- |
| Class Schedule | `docs/sources/class-schedule-2569.pdf` | `docs/ingested/class-schedule-2569.raw.txt` |
| Academic Calendar | `docs/sources/academic-calendar-2569.pdf` | `docs/ingested/previews/academic-calendar-2569-page-*.png` |

รายงาน ingest:

- `docs/ingested/INGEST-REPORT-2569.md`
- `docs/ingested/pdf-ingest-metadata.json`
- `docs/ingested/class-schedule-import-template.csv`
- `docs/ingested/academic-calendar-import-template.csv`

สถานะสำคัญ:

- Class Schedule มี text layer และ extract ได้ประมาณ 42,641 ตัวอักษร แต่ยังต้อง normalize เป็นตาราง
- Academic Calendar เป็น scan/image ไม่มี text layer ต้อง OCR หรือทำ manual import sheet ก่อนใช้งานจริง

### 8.1 ไฟล์ตารางเรียนรายวัน

- รับเป็น CSV หรือ Excel
- แยกตาม cohort/class
- Validate วัน เวลา ห้องเรียน และรหัสวิชา
- Preview ก่อน import
- Import แล้วเก็บ version เพื่อ rollback ได้

### 8.2 ไฟล์มื้ออาหารรายเดือน

- รับเป็น CSV หรือ Excel
- 1 เดือนมี 3 มื้อต่อวัน
- ตรวจว่าทุกวันมี breakfast/lunch/dinner
- ถ้าวันไหนไม่มีข้อมูล ให้แสดง empty state ว่า “ยังไม่มีข้อมูลมื้ออาหาร”

### 8.3 ไฟล์ Academic Calendar รายปี

- รับเป็น CSV หรือ Excel
- Import ทั้งปี
- แยก category เพื่อใช้สีใน calendar
- รองรับ event ที่มีทั้งวันและมีเวลาเฉพาะ

---

## 9. UX Style Guide

แนวภาพตามตัวอย่างใหม่:

- พื้นหลัง: very light blue / off-white
- Brand color: teal
- Accent: soft blue, red for urgent, green for success
- Card: white, shadow เบา, border-radius 16-24px
- Bottom nav: fixed, icon + bilingual label
- Header: avatar + Smart Academy + bell
- Quick Services: circular icon buttons
- Featured card: large image/card carousel
- Activity: ใช้ image-heavy card แบบ Meetup

สีที่แนะนำ:

```css
:root {
  --bg: #f5f7ff;
  --surface: #ffffff;
  --brand: #006b67;
  --brand-dark: #004f4b;
  --soft-blue: #dbeafe;
  --ink: #0f172a;
  --muted: #64748b;
  --line: #e2e8f0;
  --danger: #c81e2c;
  --success: #15946b;
  --warning: #d18b00;
}
```

---

## 10. Development Phases

### Phase 0: Project Setup

- Create Next.js project
- Install LINE LIFF SDK
- Setup Tailwind, Prisma, PostgreSQL
- Create app shell and routing
- Create design tokens
- Create `.env.example`

### Phase 1: MVP UI + Mock Data

- Home
- Class daily schedule
- Meals monthly menu
- Academic Calendar yearly
- To-do-list without Top 3
- Service Page without AI Coach
- Profile & Grades without AI Insight

### Phase 2: Workflow Features

- Report/Fix with Pin on Map
- Lost & Found
- Activity Meetup-style
- RSVP
- Event creation
- Report ticket status

### Phase 3: Backend + Import

- Prisma schema
- CSV/Excel import scripts
- Admin import preview
- Database queries replacing mock data
- Audit log

### Phase 4: LINE Integration

- LIFF login
- LINE user binding
- LINE Rich Menu
- Push notification for:
  - report status
  - lost-found match / claim status
  - upcoming activity
  - important announcement

### Phase 5: Pilot

- Test with small group
- Collect feedback
- Fix UI friction
- Verify data accuracy
- Prepare rollout guide

---

## 11. Environment Variables

```txt
DATABASE_URL=
NEXT_PUBLIC_LIFF_ID=
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
APP_BASE_URL=
```

สำคัญ:

- `NEXT_PUBLIC_LIFF_ID` เป็น public ได้
- `LINE_CHANNEL_SECRET` และ `LINE_CHANNEL_ACCESS_TOKEN` ต้องอยู่ฝั่ง server เท่านั้น
- ห้ามใส่ secret ใน client component หรือไฟล์ที่ browser เห็นได้

---

## 12. Claude Code Prompt แนะนำ

### Prompt 1: สร้างโปรเจ็กต์ใหม่

```txt
Create a new Next.js App Router project for a LINE LIFF app named CRMA Smart Academy.
Use TypeScript, Tailwind CSS, Prisma, PostgreSQL, and @line/liff.
Do not add any AI feature.
Build the initial app shell with mobile-first layout, top bar, bottom navigation,
and routes: Home, Class, Todo, Activity, Service, Profile, Meals, Calendar, Report, LostFound.
Use Thai-first bilingual labels.
```

### Prompt 2: ทำหน้า Home

```txt
Build the Home page using mock data.
Match this Smart Academy style: teal brand, light blue background, white rounded cards,
avatar header, featured carousel, quick services, My Day summary, and News list.
Quick services must be Grades, Meals, Lost & Found, Reports.
No Health AI and no AI features.
```

### Prompt 3: ทำตารางเรียนรายวัน

```txt
Build the Class page as a fixed daily schedule.
Use Monday-Friday tabs, not a weekly calendar grid.
Data should come from mock records shaped like an imported school file:
cohort, day, period, start, end, subject code, subject Thai/English, room, instructor, type.
```

### Prompt 4: ทำ Meals

```txt
Build the Meals page with monthly menu data.
Each day has breakfast, lunch, and dinner.
No calorie AI, no nutrition recommendation, no AI.
Add month selector, day selector, and meal cards.
```

### Prompt 5: ทำ Activity แบบ Meetup

```txt
Build the Activity page as a Meetup-style event platform.
Cadets can create events with cover image, title, description, date/time, location,
capacity, category, and RSVP.
Add event detail page, attendee list, and moderation statuses:
Draft, Pending Review, Published, Rejected, Cancelled.
```

### Prompt 6: ทำ Report พร้อม Pin on Map

```txt
Build the Report page with category, urgency, description, photo upload placeholder,
and Pin on Map.
For MVP, use a campus map image with a draggable/clickable pin overlay,
store pin_x and pin_y as percentages.
Do not use paid map APIs.
```

---

## 13. Reference Notes

ข้อมูลจาก LINE Developers ที่ควรยึด:

- LIFF app ต้องมี Endpoint URL เป็น HTTPS
- เมื่อเพิ่ม LIFF app จะได้ LIFF ID และ LIFF URL เช่น `https://liff.line.me/{liffId}`
- ต้องเรียก `liff.init({ liffId })` ก่อนใช้ LIFF SDK methods
- Rich Menu ใช้เป็นเมนูลัดใน LINE Official Account ได้ และตั้ง tappable areas ให้เปิด LIFF routes ได้
- URL และ token ที่เกี่ยวข้องกับ LIFF อาจมีข้อมูลละเอียดอ่อน ต้องระวังการรั่วไหล

ลิงก์:

- https://developers.line.biz/en/docs/liff/registering-liff-apps/
- https://developers.line.biz/en/docs/liff/developing-liff-apps/
- https://developers.line.biz/en/docs/liff/development-guidelines/
- https://developers.line.biz/en/docs/messaging-api/rich-menus-overview/

---

## 14. Checklist ก่อนเริ่ม Build

- [ ] ยืนยันชื่อแอปและ brand color
- [ ] ยืนยัน bottom nav 5 แท็บ
- [ ] ยืนยันว่า MVP ไม่มี AI ทุกชนิด
- [ ] เลือก feature แทน Health AI: Lost & Found
- [ ] เตรียมไฟล์ตารางเรียนรายวัน
- [ ] เตรียมไฟล์อาหารรายเดือน
- [ ] เตรียมไฟล์ academic calendar รายปี
- [ ] เตรียมรูปแผนที่ campus สำหรับ Pin on Map
- [ ] เตรียม LINE Official Account และ LINE Developers channel
- [ ] เตรียม database
- [ ] เขียน privacy notice และแนวทาง PDPA
- [ ] กำหนดผู้ดูแล event moderation
- [ ] กำหนดผู้ดูแล report ticket
