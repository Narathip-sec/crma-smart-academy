// Class schedule data — typed from class-schedule-2569.pilot.csv
// AY 2569, Sem 1, Year Level 1, 5 cohorts (ก.1 / ก / ข / ค / ง), 75 rows.

export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
export type Category = "academic" | "advisory" | "military" | "pe";

export interface ClassPeriod {
  periodOrder: number;
  startTime: string;
  endTime: string;
  subjectCode: string;
  subjectNameTh: string;
  subjectNameEn: string;
  category: Category;
}

export const COHORTS = ["ก.1", "ก", "ข", "ค", "ง"] as const;
export type Cohort = (typeof COHORTS)[number];

export const DAYS: DayOfWeek[] = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
];

export const DAY_LABELS: Record<DayOfWeek, { th: string; en: string; short: string }> = {
  Monday:    { th: "จันทร์",    en: "Monday",    short: "จ" },
  Tuesday:   { th: "อังคาร",   en: "Tuesday",   short: "อ" },
  Wednesday: { th: "พุธ",      en: "Wednesday", short: "พ" },
  Thursday:  { th: "พฤหัสบดี", en: "Thursday",  short: "พฤ" },
  Friday:    { th: "ศุกร์",    en: "Friday",    short: "ศ" },
};

export const CATEGORY_COLOR: Record<Category, string> = {
  academic: "var(--brand)",
  military: "#1565c0",
  advisory: "var(--warning)",
  pe:       "var(--success)",
};

export const CATEGORY_LABEL: Record<Category, { th: string; en: string }> = {
  academic: { th: "วิชาการ",     en: "Academic" },
  military: { th: "ทหาร",       en: "Military" },
  advisory: { th: "ที่ปรึกษา",  en: "Advisory" },
  pe:       { th: "พลศึกษา",    en: "PE" },
};

type RawRow = {
  cohort: Cohort;
  day: DayOfWeek;
  periodOrder: number;
  startTime: string;
  endTime: string;
  subjectCode: string;
  subjectNameTh: string;
  subjectNameEn: string;
  category: Category;
};

// Inline from CSV — 75 rows.
const RAW: RawRow[] = [
  // ── Cohort ก.1 ──────────────────────────────────────────────────────────
  { cohort:"ก.1", day:"Monday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PH 1001", subjectNameTh:"ฟิสิกส์ทั่วไป 1",            subjectNameEn:"General Physics 1",              category:"academic" },
  { cohort:"ก.1", day:"Monday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"ก.1", day:"Monday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"PC 1101", subjectNameTh:"จิตวิทยาเบื้องต้น",            subjectNameEn:"Introduction to Psychology",      category:"academic" },
  { cohort:"ก.1", day:"Tuesday",   periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                  subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"ก.1", day:"Tuesday",   periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                  subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"ก.1", day:"Tuesday",   periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                  subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"ก.1", day:"Wednesday", periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"SS 1201", subjectNameTh:"หลักรัฐศาสตร์",               subjectNameEn:"Principles of Political Science", category:"academic" },
  { cohort:"ก.1", day:"Wednesday", periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"LG 1001", subjectNameTh:"ภาษาไทย 1",                   subjectNameEn:"Thai 1",                          category:"academic" },
  { cohort:"ก.1", day:"Wednesday", periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"ก.1", day:"Thursday",  periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"IE 1701", subjectNameTh:"แนวคิดและทฤษฎีอาวุธ",         subjectNameEn:"Concept and Principle of Weapon", category:"academic" },
  { cohort:"ก.1", day:"Thursday",  periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"PH 1002", subjectNameTh:"ปฏิบัติการฟิสิกส์ทั่วไป 1",   subjectNameEn:"General Physics Laboratory 1",    category:"academic" },
  { cohort:"ก.1", day:"Thursday",  periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"ก.1", day:"Friday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"HI 1001", subjectNameTh:"ประวัติศาสตร์ไทย",             subjectNameEn:"Thai History",                    category:"academic" },
  { cohort:"ก.1", day:"Friday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"LG 1101", subjectNameTh:"ภาษาอังกฤษ 1",                subjectNameEn:"English 1",                       category:"academic" },
  { cohort:"ก.1", day:"Friday",    periodOrder:3, startTime:"13:00", endTime:"15:30", subjectCode:"PE 1001", subjectNameTh:"พลศึกษา 1",                   subjectNameEn:"Physical Education 1",            category:"pe" },
  // ── Cohort ก ────────────────────────────────────────────────────────────
  { cohort:"ก", day:"Monday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PH 1001", subjectNameTh:"ฟิสิกส์ทั่วไป 1",            subjectNameEn:"General Physics 1",              category:"academic" },
  { cohort:"ก", day:"Monday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"ก", day:"Monday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"PC 1101", subjectNameTh:"จิตวิทยาเบื้องต้น",            subjectNameEn:"Introduction to Psychology",      category:"academic" },
  { cohort:"ก", day:"Tuesday",   periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                  subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"ก", day:"Tuesday",   periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                  subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"ก", day:"Tuesday",   periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                  subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"ก", day:"Wednesday", periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"SS 1201", subjectNameTh:"หลักรัฐศาสตร์",               subjectNameEn:"Principles of Political Science", category:"academic" },
  { cohort:"ก", day:"Wednesday", periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"LG 1001", subjectNameTh:"ภาษาไทย 1",                   subjectNameEn:"Thai 1",                          category:"academic" },
  { cohort:"ก", day:"Wednesday", periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"ก", day:"Thursday",  periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"IE 1701", subjectNameTh:"แนวคิดและทฤษฎีอาวุธ",         subjectNameEn:"Concept and Principle of Weapon", category:"academic" },
  { cohort:"ก", day:"Thursday",  periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"PH 1002", subjectNameTh:"ปฏิบัติการฟิสิกส์ทั่วไป 1",   subjectNameEn:"General Physics Laboratory 1",    category:"academic" },
  { cohort:"ก", day:"Thursday",  periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"ก", day:"Friday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"HI 1001", subjectNameTh:"ประวัติศาสตร์ไทย",             subjectNameEn:"Thai History",                    category:"academic" },
  { cohort:"ก", day:"Friday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"LG 1101", subjectNameTh:"ภาษาอังกฤษ 1",                subjectNameEn:"English 1",                       category:"academic" },
  { cohort:"ก", day:"Friday",    periodOrder:3, startTime:"13:00", endTime:"15:30", subjectCode:"PE 1001", subjectNameTh:"พลศึกษา 1",                   subjectNameEn:"Physical Education 1",            category:"pe" },
  // ── Cohort ข ────────────────────────────────────────────────────────────
  { cohort:"ข", day:"Monday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PH 1001", subjectNameTh:"ฟิสิกส์ทั่วไป 1",            subjectNameEn:"General Physics 1",              category:"academic" },
  { cohort:"ข", day:"Monday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"ข", day:"Monday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"PC 1101", subjectNameTh:"จิตวิทยาเบื้องต้น",            subjectNameEn:"Introduction to Psychology",      category:"academic" },
  { cohort:"ข", day:"Tuesday",   periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                  subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"ข", day:"Tuesday",   periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                  subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"ข", day:"Tuesday",   periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                  subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"ข", day:"Wednesday", periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"SS 1201", subjectNameTh:"หลักรัฐศาสตร์",               subjectNameEn:"Principles of Political Science", category:"academic" },
  { cohort:"ข", day:"Wednesday", periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"LG 1001", subjectNameTh:"ภาษาไทย 1",                   subjectNameEn:"Thai 1",                          category:"academic" },
  { cohort:"ข", day:"Wednesday", periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"ข", day:"Thursday",  periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"IE 1701", subjectNameTh:"แนวคิดและทฤษฎีอาวุธ",         subjectNameEn:"Concept and Principle of Weapon", category:"academic" },
  { cohort:"ข", day:"Thursday",  periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"PH 1002", subjectNameTh:"ปฏิบัติการฟิสิกส์ทั่วไป 1",   subjectNameEn:"General Physics Laboratory 1",    category:"academic" },
  { cohort:"ข", day:"Thursday",  periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"ข", day:"Friday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"HI 1001", subjectNameTh:"ประวัติศาสตร์ไทย",             subjectNameEn:"Thai History",                    category:"academic" },
  { cohort:"ข", day:"Friday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"LG 1101", subjectNameTh:"ภาษาอังกฤษ 1",                subjectNameEn:"English 1",                       category:"academic" },
  { cohort:"ข", day:"Friday",    periodOrder:3, startTime:"13:00", endTime:"15:30", subjectCode:"PE 1001", subjectNameTh:"พลศึกษา 1",                   subjectNameEn:"Physical Education 1",            category:"pe" },
  // ── Cohort ค ────────────────────────────────────────────────────────────
  { cohort:"ค", day:"Monday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"ค", day:"Monday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"PH 1001", subjectNameTh:"ฟิสิกส์ทั่วไป 1",            subjectNameEn:"General Physics 1",              category:"academic" },
  { cohort:"ค", day:"Monday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"PC 1101", subjectNameTh:"จิตวิทยาเบื้องต้น",            subjectNameEn:"Introduction to Psychology",      category:"academic" },
  { cohort:"ค", day:"Tuesday",   periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                  subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"ค", day:"Tuesday",   periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                  subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"ค", day:"Tuesday",   periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                  subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"ค", day:"Wednesday", periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"LG 1001", subjectNameTh:"ภาษาไทย 1",                   subjectNameEn:"Thai 1",                          category:"academic" },
  { cohort:"ค", day:"Wednesday", periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"SS 1201", subjectNameTh:"หลักรัฐศาสตร์",               subjectNameEn:"Principles of Political Science", category:"academic" },
  { cohort:"ค", day:"Wednesday", periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"ค", day:"Thursday",  periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PH 1002", subjectNameTh:"ปฏิบัติการฟิสิกส์ทั่วไป 1",   subjectNameEn:"General Physics Laboratory 1",    category:"academic" },
  { cohort:"ค", day:"Thursday",  periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"IE 1701", subjectNameTh:"แนวคิดและทฤษฎีอาวุธ",         subjectNameEn:"Concept and Principle of Weapon", category:"academic" },
  { cohort:"ค", day:"Thursday",  periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"ค", day:"Friday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"LG 1101", subjectNameTh:"ภาษาอังกฤษ 1",                subjectNameEn:"English 1",                       category:"academic" },
  { cohort:"ค", day:"Friday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"HI 1001", subjectNameTh:"ประวัติศาสตร์ไทย",             subjectNameEn:"Thai History",                    category:"academic" },
  { cohort:"ค", day:"Friday",    periodOrder:3, startTime:"13:00", endTime:"15:30", subjectCode:"PE 1001", subjectNameTh:"พลศึกษา 1",                   subjectNameEn:"Physical Education 1",            category:"pe" },
  // ── Cohort ง ────────────────────────────────────────────────────────────
  { cohort:"ง", day:"Monday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"ง", day:"Monday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"PH 1001", subjectNameTh:"ฟิสิกส์ทั่วไป 1",            subjectNameEn:"General Physics 1",              category:"academic" },
  { cohort:"ง", day:"Monday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"PC 1101", subjectNameTh:"จิตวิทยาเบื้องต้น",            subjectNameEn:"Introduction to Psychology",      category:"academic" },
  { cohort:"ง", day:"Tuesday",   periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                  subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"ง", day:"Tuesday",   periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                  subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"ง", day:"Tuesday",   periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                  subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"ง", day:"Wednesday", periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"LG 1001", subjectNameTh:"ภาษาไทย 1",                   subjectNameEn:"Thai 1",                          category:"academic" },
  { cohort:"ง", day:"Wednesday", periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"SS 1201", subjectNameTh:"หลักรัฐศาสตร์",               subjectNameEn:"Principles of Political Science", category:"academic" },
  { cohort:"ง", day:"Wednesday", periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"ง", day:"Thursday",  periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PH 1002", subjectNameTh:"ปฏิบัติการฟิสิกส์ทั่วไป 1",   subjectNameEn:"General Physics Laboratory 1",    category:"academic" },
  { cohort:"ง", day:"Thursday",  periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"IE 1701", subjectNameTh:"แนวคิดและทฤษฎีอาวุธ",         subjectNameEn:"Concept and Principle of Weapon", category:"academic" },
  { cohort:"ง", day:"Thursday",  periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"ง", day:"Friday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"LG 1101", subjectNameTh:"ภาษาอังกฤษ 1",                subjectNameEn:"English 1",                       category:"academic" },
  { cohort:"ง", day:"Friday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"HI 1001", subjectNameTh:"ประวัติศาสตร์ไทย",             subjectNameEn:"Thai History",                    category:"academic" },
  { cohort:"ง", day:"Friday",    periodOrder:3, startTime:"13:00", endTime:"15:30", subjectCode:"PE 1001", subjectNameTh:"พลศึกษา 1",                   subjectNameEn:"Physical Education 1",            category:"pe" },
];

export function getSchedule(cohort: Cohort, day: DayOfWeek): ClassPeriod[] {
  return RAW
    .filter((r) => r.cohort === cohort && r.day === day)
    .sort((a, b) => a.periodOrder - b.periodOrder)
    .map(({ periodOrder, startTime, endTime, subjectCode, subjectNameTh, subjectNameEn, category }) => ({
      periodOrder, startTime, endTime, subjectCode, subjectNameTh, subjectNameEn, category,
    }));
}

// Determine current period index for a given time string "HH:MM".
export function currentPeriodOrder(day: DayOfWeek, now: string, cohort: Cohort): number | null {
  const periods = getSchedule(cohort, day);
  const [h, m] = now.split(":").map(Number);
  const nowMin = h * 60 + m;
  for (const p of periods) {
    const [sh, sm] = p.startTime.split(":").map(Number);
    const [eh, em] = p.endTime.split(":").map(Number);
    if (nowMin >= sh * 60 + sm && nowMin < eh * 60 + em) return p.periodOrder;
  }
  return null;
}
