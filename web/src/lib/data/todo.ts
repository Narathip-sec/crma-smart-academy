// Mock todo data — used for Todo screen and My Day "Pending tasks" widget.

export type TodoCategory = "วิชาการ" | "ทหาร" | "ส่วนตัว" | "กิจกรรม";
export type DueLabel = { th: string; en: string };

export interface TodoItem {
  id: number;
  titleTh: string;
  titleEn: string;
  category: TodoCategory;
  dueLabel: DueLabel;
  dueUrgent: boolean;
  done: boolean;
}

export const TODOS: TodoItem[] = [
  {
    id: 1,
    titleTh: "ส่งรายงานปฏิบัติการฟิสิกส์ บทที่ 4",
    titleEn: "Submit Physics Lab Report Ch. 4",
    category: "วิชาการ",
    dueLabel: { th: "วันนี้ 16:00", en: "Today 16:00" },
    dueUrgent: true,
    done: false,
  },
  {
    id: 2,
    titleTh: "เตรียมเครื่องแต่งกายตรวจพลสวนสนาม",
    titleEn: "Prepare Uniform for Parade Inspection",
    category: "ทหาร",
    dueLabel: { th: "วันนี้ 18:00", en: "Today 18:00" },
    dueUrgent: true,
    done: false,
  },
  {
    id: 3,
    titleTh: "อ่านบทที่ 5 เตรียมสอบคณิตศาสตร์",
    titleEn: "Read Chapter 5 for Math Exam",
    category: "วิชาการ",
    dueLabel: { th: "พรุ่งนี้", en: "Tomorrow" },
    dueUrgent: false,
    done: false,
  },
  {
    id: 4,
    titleTh: "ลงทะเบียนกิจกรรมแข่งขันกีฬาภายใน",
    titleEn: "Register for Intramural Sports",
    category: "กิจกรรม",
    dueLabel: { th: "12 มิ.ย.", en: "12 Jun" },
    dueUrgent: false,
    done: false,
  },
  {
    id: 5,
    titleTh: "ซื้อกระดาษเขียนแบบ A2",
    titleEn: "Buy A2 Drawing Paper",
    category: "ส่วนตัว",
    dueLabel: { th: "13 มิ.ย.", en: "13 Jun" },
    dueUrgent: false,
    done: false,
  },
  {
    id: 6,
    titleTh: "ส่งใบลาพักผ่อนสุดสัปดาห์",
    titleEn: "Submit Weekend Leave Form",
    category: "ทหาร",
    dueLabel: { th: "เสร็จแล้ว", en: "Done" },
    dueUrgent: false,
    done: true,
  },
];

export const TODO_CATEGORIES: { key: TodoCategory | "ทั้งหมด"; label: string }[] = [
  { key: "ทั้งหมด", label: "ทั้งหมด" },
  { key: "วิชาการ", label: "วิชาการ" },
  { key: "ทหาร",   label: "ทหาร" },
  { key: "ส่วนตัว", label: "ส่วนตัว" },
  { key: "กิจกรรม", label: "กิจกรรม" },
];

export const CATEGORY_COLOR: Record<TodoCategory, string> = {
  "วิชาการ": "var(--brand)",
  "ทหาร":    "var(--cat-military)",
  "ส่วนตัว": "var(--cat-notice)",
  "กิจกรรม": "var(--cat-activity)",
};
