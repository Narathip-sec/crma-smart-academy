// TS types mirroring the import CSVs in docs/ingested/.
//   - *_CSV_HEADERS : exact column order of the CSV file.
//   - Raw*Row       : a parsed CSV row (every field a string, snake_case keys).
//   - *Record       : normalized/typed record (camelCase) — matches the Prisma
//                     models ClassPeriod / AcademicCalendarEvent / MealItem.
// Loaders turn Raw*Row -> *Record -> Prisma upsert.

// ── shared enums (canonical, from the import templates) ──────────────────────

export const CLASS_CATEGORIES = [
  "academic",
  "military",
  "pe",
  "advisory",
  "self_study",
] as const;
export type ClassCategory = (typeof CLASS_CATEGORIES)[number];

export const CALENDAR_CATEGORIES = [
  "academic",
  "exam",
  "military",
  "activity",
  "holiday",
  "deadline",
] as const;
export type CalendarCategory = (typeof CALENDAR_CATEGORIES)[number];

export const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

// ── 1. schedule.csv (class schedule, date-based) ─────────────────────────────
// Header note: "Section (ตอน)" is the literal CSV column name (access via bracket).

export const CLASS_CSV_HEADERS = [
  "Date",
  "Day",
  "Period",
  "Start_Time",
  "End_Time",
  "Course_Code",
  "Course_Name",
  "Section (ตอน)",
  "Instructor",
  "Room",
  "Remarks",
] as const;

export type RawClassRow = Record<(typeof CLASS_CSV_HEADERS)[number], string>;

export interface ClassPeriodRecord {
  date: string; // ISO yyyy-mm-dd
  dayTh: string; // "จันทร์"
  periodLabel: string; // "1-2"
  startTime: string;
  endTime: string;
  courseCode: string | null;
  courseName: string;
  section: string | null;
  instructor: string | null;
  room: string | null;
  remarks: string | null;
  category: ClassCategory;
}

// ── 2. academic-calendar-import-template.csv ─────────────────────────────────

export const CALENDAR_CSV_HEADERS = [
  "academic_year",
  "date",
  "thai_date_label",
  "day_of_week_th",
  "start_time",
  "end_time",
  "title_th",
  "title_en",
  "category",
  "note",
  "source_page",
  "source_row",
] as const;

export type RawCalendarRow = Record<(typeof CALENDAR_CSV_HEADERS)[number], string>;

export interface AcademicCalendarRecord {
  academicYear: number;
  date: string; // ISO yyyy-mm-dd
  thaiDateLabel: string | null;
  dayOfWeekTh: string | null;
  startTime: string | null; // null = all-day
  endTime: string | null;
  titleTh: string;
  titleEn: string | null;
  category: CalendarCategory;
  note: string | null;
  sourcePage: number | null;
  sourceRow: number | null;
}

// ── 3. meals (proposed; no source file yet) ──────────────────────────────────

export const MEAL_CSV_HEADERS = [
  "date",
  "meal_type",
  "menu_th",
  "menu_en",
  "note",
  "image_url",
] as const;

export type RawMealRow = Record<(typeof MEAL_CSV_HEADERS)[number], string>;

export interface MealItemRecord {
  date: string; // ISO yyyy-mm-dd
  mealType: MealType;
  menuTh: string;
  menuEn: string | null;
  note: string | null;
  imageUrl: string | null;
}
