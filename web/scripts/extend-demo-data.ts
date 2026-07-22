// Idempotent demo-data extension: clones real June ClassPeriod + May MealItem
// data into August 2026 (presentation week), adds a handful of August
// AcademicCalendarEvent rows, and seeds 3 Notification rows per user.
// Run: npm run demo:extend

import { PrismaClient, CalendarCategory } from "@prisma/client";

const prisma = new PrismaClient();

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_PER_DAY);
}

async function cloneClassWeek(sourceMonday: Date, targetMonday: Date) {
  const sourceFriday = addDays(sourceMonday, 4);
  const rows = await prisma.classPeriod.findMany({
    where: { date: { gte: sourceMonday, lte: sourceFriday } },
  });
  const offsetDays = Math.round((targetMonday.getTime() - sourceMonday.getTime()) / MS_PER_DAY);

  let count = 0;
  for (const row of rows) {
    const newDate = addDays(row.date, offsetDays);
    await prisma.classPeriod.upsert({
      where: {
        date_periodLabel_courseName: {
          date: newDate,
          periodLabel: row.periodLabel,
          courseName: row.courseName,
        },
      },
      update: {
        dayTh: row.dayTh,
        startTime: row.startTime,
        endTime: row.endTime,
        courseCode: row.courseCode,
        section: row.section,
        instructor: row.instructor,
        room: row.room,
        remarks: row.remarks,
        category: row.category,
      },
      create: {
        date: newDate,
        dayTh: row.dayTh,
        periodLabel: row.periodLabel,
        startTime: row.startTime,
        endTime: row.endTime,
        courseCode: row.courseCode,
        courseName: row.courseName,
        section: row.section,
        instructor: row.instructor,
        room: row.room,
        remarks: row.remarks,
        category: row.category,
      },
    });
    count++;
  }
  return count;
}

async function cloneMealsMayTo(targetMonth: number) {
  // targetMonth: 0-indexed (6 = July, 7 = August) — source is May (31 days),
  // both target months also have 31 days so day-of-month maps 1:1.
  const rows = await prisma.mealItem.findMany({
    where: { date: { gte: new Date("2026-05-01"), lte: new Date("2026-05-31") } },
  });

  let count = 0;
  for (const row of rows) {
    const dayOfMonth = row.date.getUTCDate();
    const newDate = new Date(Date.UTC(2026, targetMonth, dayOfMonth));

    await prisma.mealItem.upsert({
      where: { date_mealType: { date: newDate, mealType: row.mealType } },
      update: {
        menuTh: row.menuTh,
        menuEn: row.menuEn,
        note: row.note,
        imageUrl: row.imageUrl,
      },
      create: {
        date: newDate,
        mealType: row.mealType,
        menuTh: row.menuTh,
        menuEn: row.menuEn,
        note: row.note,
        imageUrl: row.imageUrl,
      },
    });
    count++;
  }
  return count;
}

const AUGUST_EVENTS: {
  date: string; thaiDateLabel: string; dayOfWeekTh: string;
  titleTh: string; titleEn: string; category: CalendarCategory;
}[] = [
  { date: "2026-08-03", thaiDateLabel: "3 ส.ค. 69", dayOfWeekTh: "จันทร์", titleTh: "เปิดภาคเรียน / ชี้แจงระเบียบปฏิบัติประจำสัปดาห์", titleEn: "Semester Opening / Weekly Briefing", category: CalendarCategory.academic },
  { date: "2026-08-05", thaiDateLabel: "5 ส.ค. 69", dayOfWeekTh: "พุธ", titleTh: "สอบย่อยครั้งที่ 1 วิชาฟิสิกส์ทั่วไป", titleEn: "General Physics Quiz 1", category: CalendarCategory.exam },
  { date: "2026-08-06", thaiDateLabel: "6 ส.ค. 69", dayOfWeekTh: "พฤหัสบดี", titleTh: "ฝึกบุคคลท่ามือเปล่า / วิชาทหาร", titleEn: "Drill Training / Military Science", category: CalendarCategory.military },
  { date: "2026-08-08", thaiDateLabel: "8 ส.ค. 69", dayOfWeekTh: "เสาร์", titleTh: "กีฬาสีภายใน CRMA", titleEn: "CRMA Internal Sports Day", category: CalendarCategory.activity },
  { date: "2026-08-10", thaiDateLabel: "10 ส.ค. 69", dayOfWeekTh: "จันทร์", titleTh: "กำหนดส่งรายงานประจำสัปดาห์", titleEn: "Weekly Report Submission Deadline", category: CalendarCategory.deadline },
  { date: "2026-08-12", thaiDateLabel: "12 ส.ค. 69", dayOfWeekTh: "พุธ", titleTh: "วันเฉลิมพระชนมพรรษาสมเด็จพระบรมราชชนนีพันปีหลวง (วันแม่แห่งชาติ)", titleEn: "HM Queen Mother's Birthday (Mother's Day)", category: CalendarCategory.holiday },
  { date: "2026-08-13", thaiDateLabel: "13 ส.ค. 69", dayOfWeekTh: "พฤหัสบดี", titleTh: "อบรมความเป็นผู้นำ / เรียนตามตารางปกติ", titleEn: "Leadership Seminar / Regular Classes", category: CalendarCategory.academic },
  { date: "2026-08-14", thaiDateLabel: "14 ส.ค. 69", dayOfWeekTh: "ศุกร์", titleTh: "สอบย่อยครั้งที่ 1 วิชาวิชาทหาร", titleEn: "Military Science Quiz 1", category: CalendarCategory.exam },
];

async function seedAugustCalendar() {
  let count = 0;
  for (const ev of AUGUST_EVENTS) {
    await prisma.academicCalendarEvent.upsert({
      where: {
        academicYear_date_titleTh: {
          academicYear: 2569,
          date: new Date(ev.date),
          titleTh: ev.titleTh,
        },
      },
      update: {
        thaiDateLabel: ev.thaiDateLabel,
        dayOfWeekTh: ev.dayOfWeekTh,
        titleEn: ev.titleEn,
        category: ev.category,
      },
      create: {
        academicYear: 2569,
        date: new Date(ev.date),
        thaiDateLabel: ev.thaiDateLabel,
        dayOfWeekTh: ev.dayOfWeekTh,
        titleTh: ev.titleTh,
        titleEn: ev.titleEn,
        category: ev.category,
        note: "demo_extend",
      },
    });
    count++;
  }
  return count;
}

const NOTIFICATION_TEMPLATES: { titleTh: string; bodyTh: string; deepLink: string }[] = [
  { titleTh: "ตารางเรียนสัปดาห์ ส.ค. พร้อมแล้ว", bodyTh: "ตรวจสอบตารางเรียนของคุณสำหรับสัปดาห์นี้", deepLink: "/class" },
  { titleTh: "มีกิจกรรมใหม่เปิดรับสมัคร", bodyTh: "กีฬาสีภายใน CRMA เปิดลงทะเบียนแล้ว", deepLink: "/activity" },
  { titleTh: "อัปเดตสถานะรายการแจ้งซ่อม", bodyTh: "รายการแจ้งซ่อมของคุณมีความคืบหน้าใหม่", deepLink: "/report" },
];

async function seedNotifications() {
  const users = await prisma.user.findMany({ select: { id: true } });
  let count = 0;
  for (const user of users) {
    for (const tpl of NOTIFICATION_TEMPLATES) {
      const existing = await prisma.notification.findFirst({
        where: { userId: user.id, titleTh: tpl.titleTh },
      });
      if (existing) continue;

      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          titleTh: tpl.titleTh,
          bodyTh: tpl.bodyTh,
          deepLink: tpl.deepLink,
        },
      });
      await prisma.notificationDelivery.create({
        data: {
          notificationId: notification.id,
          userId: user.id,
          channel: "in_app",
          deliveredAt: new Date(),
        },
      });
      count++;
    }
  }
  return count;
}

// Bridge weeks between the original seeded week and presentation day
// (2026-08-10) — keeps /class showing real data on whatever day someone
// actually tests on, not just the two original demo weeks.
const TARGET_CLASS_WEEKS = ["2026-07-20", "2026-07-27", "2026-08-03", "2026-08-10"];

async function main() {
  let classCounts = "";
  for (const monday of TARGET_CLASS_WEEKS) {
    const n = await cloneClassWeek(new Date("2026-06-22"), new Date(monday));
    classCounts += `${monday}: ${n}, `;
  }
  const mealCountJul = await cloneMealsMayTo(6);
  const mealCountAug = await cloneMealsMayTo(7);
  const calendarCount = await seedAugustCalendar();
  const notifCount = await seedNotifications();

  console.log(`ClassPeriod cloned → ${classCounts}`);
  console.log(`MealItem cloned May→Jul: ${mealCountJul}, May→Aug: ${mealCountAug}`);
  console.log(`AcademicCalendarEvent seeded: ${calendarCount}`);
  console.log(`Notification rows created (new only): ${notifCount}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
