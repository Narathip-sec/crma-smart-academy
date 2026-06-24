// Import academic calendar CSV -> AcademicCalendarEvent (idempotent upsert).
//   npx tsx scripts/import-academic-calendar.ts --dry
//   npx tsx scripts/import-academic-calendar.ts [--file other.csv]

import {
  CALENDAR_CATEGORIES,
  type AcademicCalendarRecord,
  type RawCalendarRow,
} from "../src/lib/data/csv-schema";
import {
  readCsv,
  reqInt,
  reqStr,
  nullStr,
  toInt,
  oneOf,
  toDate,
  getPrisma,
  hasFlag,
  argValue,
  countBy,
} from "./lib";

// Despite the filename, crma_schedule_structured.csv holds calendar events
// (matches the academic-calendar column set exactly).
const FILE = argValue("file") ?? "crma_schedule_structured.csv";
const DRY = hasFlag("dry");

function toRecord(r: RawCalendarRow): AcademicCalendarRecord {
  return {
    academicYear: reqInt(r.academic_year, "academic_year"),
    date: reqStr(r.date, "date"),
    thaiDateLabel: nullStr(r.thai_date_label),
    dayOfWeekTh: nullStr(r.day_of_week_th),
    startTime: nullStr(r.start_time),
    endTime: nullStr(r.end_time),
    titleTh: reqStr(r.title_th, "title_th"),
    titleEn: nullStr(r.title_en),
    category: oneOf(
      nullStr(r.category) ?? "academic",
      CALENDAR_CATEGORIES,
      "academic",
      "category",
    ),
    note: nullStr(r.note),
    sourcePage: toInt(r.source_page),
    sourceRow: toInt(r.source_row),
  };
}

async function main() {
  const rows = readCsv<RawCalendarRow>(FILE);
  const records = rows.map(toRecord);

  console.log(`calendar: parsed ${records.length} rows from ${FILE}`);
  console.log("  by category:", countBy(records, (r) => r.category));
  const flagged = records.filter((r) => r.note).length;
  if (flagged) console.log(`  ⚠ ${flagged} rows carry a note/verify flag`);

  if (DRY) {
    console.log("dry run — no DB writes");
    return;
  }

  const prisma = getPrisma();
  let n = 0;
  for (const rec of records) {
    const data = { ...rec, date: toDate(rec.date) };
    await prisma.academicCalendarEvent.upsert({
      where: {
        academicYear_date_titleTh: {
          academicYear: rec.academicYear,
          date: toDate(rec.date),
          titleTh: rec.titleTh,
        },
      },
      create: data,
      update: data,
    });
    n++;
  }
  await prisma.$disconnect();
  console.log(`calendar: upserted ${n} AcademicCalendarEvent rows`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
