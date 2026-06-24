// Mock fixtures — each exported function will later wrap a Prisma query.
// Pilot cadet: นนร.นราธิป เชตุใจ, Year 1, Cohort ก.1, พัน.4 ร้อย.1

import type { Bilingual } from "./i18n";

export type CadetMock = {
  thaiName: string;
  englishName: string;
  initials: string;
  studentCode: string;
  platoon: string;   // พัน.4
  company: string;   // ร้อย.1
  yearLevel: number;
  cohort: string;    // ก.1
  classYear: number; // รุ่น 75
};

export type GradeRow = {
  code: string;
  course: Bilingual;
  credits: number;
  grade: string | null; // null = รอผล (pending)
};

export type SemesterKey = `${1 | 2}/${number}`;

export const CADET: CadetMock = {
  thaiName: "นนร.นราธิป เชตุใจ",
  englishName: "Cdt. Narathip Chetjai",
  initials: "นร",
  studentCode: "67-0421",
  platoon: "พัน.4",
  company: "ร้อย.1",
  yearLevel: 1,
  cohort: "ก.1",
  classYear: 75,
};

export const SEMESTERS: SemesterKey[] = ["1/2569", "2/2568", "1/2568"];

// Current semester is locked (grades not yet released).
export const CURRENT_SEMESTER: SemesterKey = "1/2569";

export const GRADES_BY_SEMESTER: Record<SemesterKey, GradeRow[]> = {
  "1/2569": [
    { code: "PH 1001", course: { th: "ฟิสิกส์ทั่วไป 1",        en: "General Physics 1" },             credits: 4, grade: null },
    { code: "PH 1002", course: { th: "ปฏิบัติการฟิสิกส์ 1",    en: "Physics Laboratory 1" },          credits: 1, grade: null },
    { code: "MS 1001", course: { th: "วิชาทหาร 1",             en: "Military Science 1" },             credits: 3, grade: null },
    { code: "LG 1001", course: { th: "ภาษาไทย 1",              en: "Thai 1" },                         credits: 2, grade: null },
    { code: "LG 1101", course: { th: "ภาษาอังกฤษ 1",           en: "English 1" },                     credits: 2, grade: null },
    { code: "SS 1201", course: { th: "หลักรัฐศาสตร์",          en: "Principles of Political Science" }, credits: 3, grade: null },
    { code: "IE 1701", course: { th: "แนวคิดและทฤษฎีอาวุธ",    en: "Concept and Principle of Weapon" }, credits: 2, grade: null },
    { code: "PC 1101", course: { th: "จิตวิทยาเบื้องต้น",      en: "Introduction to Psychology" },     credits: 3, grade: null },
    { code: "HI 1001", course: { th: "ประวัติศาสตร์ไทย",       en: "Thai History" },                   credits: 2, grade: null },
    { code: "PE 1001", course: { th: "พลศึกษา 1",              en: "Physical Education 1" },           credits: 1, grade: null },
  ],
  "2/2568": [
    { code: "MA 102",  course: { th: "คณิตศาสตร์วิศวกรรม 2",   en: "Engineering Mathematics 2" },     credits: 3, grade: "B+" },
    { code: "CH 101",  course: { th: "เคมี 1",                  en: "Chemistry 1" },                   credits: 3, grade: "A-" },
    { code: "EN 102",  course: { th: "ภาษาอังกฤษ 2",            en: "English 2" },                     credits: 2, grade: "A" },
    { code: "MS 102",  course: { th: "วิชาทหาร 2",             en: "Military Science 2" },             credits: 3, grade: "B+" },
  ],
  "1/2568": [
    { code: "MA 101",  course: { th: "คณิตศาสตร์วิศวกรรม 1",   en: "Engineering Mathematics 1" },     credits: 3, grade: "A-" },
    { code: "GE 101",  course: { th: "การปรับตัว",              en: "Orientation" },                   credits: 1, grade: "A" },
    { code: "EN 101",  course: { th: "ภาษาอังกฤษ 1",            en: "English 1" },                     credits: 2, grade: "A" },
  ],
};

const GRADE_POINTS: Record<string, number> = {
  "A": 4, "A-": 3.7, "B+": 3.3, "B": 3, "B-": 2.7,
  "C+": 2.3, "C": 2, "D+": 1.3, "D": 1, "F": 0,
};

export function gpaFor(semester: SemesterKey): { gpa: string; gpax: string; credits: number } {
  const rows = (GRADES_BY_SEMESTER[semester] ?? []).filter((r) => r.grade !== null);
  let credits = 0, weighted = 0;
  for (const r of rows) {
    credits += r.credits;
    weighted += (GRADE_POINTS[r.grade!] ?? 0) * r.credits;
  }
  const gpa = credits ? (weighted / credits).toFixed(2) : "—";

  // GPAX = running avg across all graded rows.
  let allCr = 0, allW = 0;
  for (const rs of Object.values(GRADES_BY_SEMESTER)) {
    for (const r of rs.filter((x) => x.grade !== null)) {
      allCr += r.credits;
      allW += (GRADE_POINTS[r.grade!] ?? 0) * r.credits;
    }
  }
  const gpax = allCr ? (allW / allCr).toFixed(2) : "—";
  return { gpa, gpax, credits };
}

// My Day widget data — shown on Home screen.
export const MY_DAY = {
  nextClass: {
    subjectTh: "ฟิสิกส์ทั่วไป",
    subjectEn: "General Physics",
    time: "10:00",
    room: "อาคาร 2 / Lab 1",
  },
  lunch: {
    menuTh: "แกงเขียวหวานไก่",
    menuEn: "Green Curry Chicken",
    time: "11:30–12:30",
    locationTh: "โรงอาหารกลาง",
    locationEn: "Central Mess Hall",
  },
  pendingTasks: { count: 5, dueToday: 2 },
  nextActivity: {
    titleTh: "วิ่งเข้ารอบเขาชนไก่",
    titleEn: "Khao Chon Kai Mountain Run",
    dateTh: "อา 15 มิ.ย.",
    time: "05:30",
  },
};

// Year rank (mock — from a 118-cadet cohort).
export const YEAR_RANK = { rank: 12, total: 118 };
