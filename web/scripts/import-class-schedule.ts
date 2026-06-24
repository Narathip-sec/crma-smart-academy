// Import class schedule CSV (schedule.csv) -> ClassPeriod (idempotent upsert).
//   npx tsx scripts/import-class-schedule.ts --dry
//   npx tsx scripts/import-class-schedule.ts [--file other.csv]

import {
  type ClassCategory,
  type ClassPeriodRecord,
  type RawClassRow,
} from "../src/lib/data/csv-schema";
import {
  readCsv,
  reqStr,
  nullStr,
  toDate,
  getPrisma,
  hasFlag,
  argValue,
  countBy,
} from "./lib";

const FILE = argValue("file") ?? "schedule.csv";
const DRY = hasFlag("dry");

/** No category column in the file — infer from the course code prefix. */
function inferCategory(courseCode: string | null): ClassCategory {
  const code = (courseCode ?? "").toUpperCase();
  if (code.startsWith("MIL")) return "military";
  if (code.startsWith("PE")) return "pe";
  if (code === "") return "self_study";
  return "academic";
}

function toRecord(r: RawClassRow): ClassPeriodRecord {
  const courseCode = nullStr(r.Course_Code);
  return {
    date: reqStr(r.Date, "Date"),
    dayTh: reqStr(r.Day, "Day"),
    periodLabel: reqStr(r.Period, "Period"),
    startTime: reqStr(r.Start_Time, "Start_Time"),
    endTime: reqStr(r.End_Time, "End_Time"),
    courseCode,
    courseName: reqStr(r.Course_Name, "Course_Name"),
    section: nullStr(r["Section (ตอน)"]),
    instructor: nullStr(r.Instructor),
    room: nullStr(r.Room),
    remarks: nullStr(r.Remarks),
    category: inferCategory(courseCode),
  };
}

async function main() {
  const rows = readCsv<RawClassRow>(FILE);
  const records = rows.map(toRecord);

  console.log(`class: parsed ${records.length} rows from ${FILE}`);
  console.log("  by day:", countBy(records, (r) => r.dayTh));
  console.log("  by category:", countBy(records, (r) => r.category));

  if (DRY) {
    console.log("dry run — no DB writes");
    return;
  }

  const prisma = getPrisma();
  let n = 0;
  for (const rec of records) {
    const data = { ...rec, date: toDate(rec.date) };
    await prisma.classPeriod.upsert({
      where: {
        date_periodLabel_courseName: {
          date: toDate(rec.date),
          periodLabel: rec.periodLabel,
          courseName: rec.courseName,
        },
      },
      create: data,
      update: data,
    });
    n++;
  }
  await prisma.$disconnect();
  console.log(`class: upserted ${n} ClassPeriod rows`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
