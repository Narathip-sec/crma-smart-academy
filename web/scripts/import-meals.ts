// Import meals -> MealItem (idempotent upsert).
// Default: parse the real WIDE file (1 row/day, 3 columns, multi-dish multiline
// cells, Thai-numeral dates) and transform wide -> long (3 rows/day).
//   npx tsx scripts/import-meals.ts --dry
//   npx tsx scripts/import-meals.ts [--file other.csv]
//   npx tsx scripts/import-meals.ts --mock --month 2026-07   # generate a month

import { MEAL_TYPES, type MealItemRecord } from "../src/lib/data/csv-schema";
import {
  readCsv,
  toDate,
  getPrisma,
  hasFlag,
  argValue,
  countBy,
} from "./lib";

const FILE = argValue("file") ?? "ตารางรายการอาหาร_พฤษภาคม_2569_Cleaned.csv";
const MONTH = argValue("month") ?? "2026-06";
const MOCK = hasFlag("mock");
const DRY = hasFlag("dry");

// Wide-file column names (literal headers).
const COL_DATE = "วันที่ (Date)";
const WIDE_COLS: { header: string; meal: (typeof MEAL_TYPES)[number] }[] = [
  { header: "มื้อเช้า (Breakfast)", meal: "breakfast" },
  { header: "มื้อกลางวัน (Lunch)", meal: "lunch" },
  { header: "มื้อเย็น (Dinner)", meal: "dinner" },
];

const THAI_DIGITS = "๐๑๒๓๔๕๖๗๘๙";
const THAI_MONTHS: Record<string, number> = {
  "ม.ค.": 1, "ก.พ.": 2, "มี.ค.": 3, "เม.ย.": 4, "พ.ค.": 5, "มิ.ย.": 6,
  "ก.ค.": 7, "ส.ค.": 8, "ก.ย.": 9, "ต.ค.": 10, "พ.ย.": 11, "ธ.ค.": 12,
};

function thaiToArabic(s: string): string {
  return s.replace(/[๐-๙]/g, (d) => String(THAI_DIGITS.indexOf(d)));
}

/** "๑ พ.ค.๖๙ ศุกร์" -> "2026-05-01" (or null if unparseable). */
function parseThaiDate(raw: string): string | null {
  const s = raw.trim();
  const m = s.match(/^([๐-๙]+)\s+(.+?)([๐-๙]{2})(?:\s|$)/);
  if (!m) return null;
  const day = Number(thaiToArabic(m[1]));
  const month = THAI_MONTHS[m[2].trim()];
  const be = 2500 + Number(thaiToArabic(m[3]));
  const ce = be - 543;
  if (!day || !month || !ce) return null;
  return `${ce}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Multiline dish cell -> "dish; dish; dish" (strips leading ๑. / 1. markers). */
function cleanDishes(cell: string | undefined): string {
  return (cell ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[๐-๙\d]+[.)]\s*/, ""))
    .join("; ");
}

function fromWideFile(): MealItemRecord[] {
  const rows = readCsv<Record<string, string>>(FILE);
  const out: MealItemRecord[] = [];
  for (const r of rows) {
    const iso = parseThaiDate(r[COL_DATE] ?? "");
    if (!iso) {
      console.warn(`  ⚠ skip unparseable date: ${JSON.stringify(r[COL_DATE])}`);
      continue;
    }
    for (const col of WIDE_COLS) {
      const menuTh = cleanDishes(r[col.header]);
      if (!menuTh) continue;
      out.push({ date: iso, mealType: col.meal, menuTh, menuEn: null, note: null, imageUrl: null });
    }
  }
  return out;
}

// ── mock generator (fallback for months with no source file) ─────────────────

const MOCK_MENUS: Record<(typeof MEAL_TYPES)[number], string[]> = {
  breakfast: ["ข้าวต้มหมู; นมสด", "ไข่เจียว; ข้าวสวย", "โจ๊กไก่; ปาท่องโก๋"],
  lunch: ["ข้าวผัดกะเพราไก่", "ข้าวมันไก่", "ก๋วยเตี๋ยวหมู"],
  dinner: ["แกงจืดเต้าหู้; ผัดผัก", "ต้มยำกุ้ง; ข้าวสวย", "ไก่ผัดเม็ดมะม่วง"],
};

function daysInMonth(year: number, month1to12: number): number {
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
}

function generateMonth(month: string): MealItemRecord[] {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) throw new Error(`bad --month: ${month} (want yyyy-mm)`);
  const out: MealItemRecord[] = [];
  for (let d = 1; d <= daysInMonth(y, m); d++) {
    const date = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    for (const meal of MEAL_TYPES) {
      out.push({
        date,
        mealType: meal,
        menuTh: MOCK_MENUS[meal][(d - 1) % MOCK_MENUS[meal].length],
        menuEn: null,
        note: null,
        imageUrl: null,
      });
    }
  }
  return out;
}

async function main() {
  const records = MOCK ? generateMonth(MONTH) : fromWideFile();
  const src = MOCK ? `generated mock ${MONTH}` : FILE;

  console.log(`meals: prepared ${records.length} rows (${src})`);
  console.log("  by mealType:", countBy(records, (r) => r.mealType));

  if (DRY) {
    console.log("dry run — no DB writes");
    return;
  }

  const prisma = getPrisma();
  let n = 0;
  for (const rec of records) {
    const data = { ...rec, date: toDate(rec.date) };
    await prisma.mealItem.upsert({
      where: { date_mealType: { date: toDate(rec.date), mealType: rec.mealType } },
      create: data,
      update: data,
    });
    n++;
  }
  await prisma.$disconnect();
  console.log(`meals: upserted ${n} MealItem rows`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
