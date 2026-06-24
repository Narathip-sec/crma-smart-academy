// Mock announcement data — used for Featured carousel and News feed.
// Replace with API/DB calls when backend is wired.

export type Priority = "important" | "new" | "normal";
export type NewsTag = "สอบ" | "วิชาการ" | "ทหาร" | "กิจกรรม" | "ประกาศ";

export interface Announcement {
  id: number;
  priority: Priority;
  tag: NewsTag;
  titleTh: string;
  titleEn: string;
  dateTh: string;       // "9 มิ.ย. 2569"
  accentColor: string;  // card bg color
}

export interface NewsItem {
  id: number;
  priority: Priority;
  tags: NewsTag[];
  titleTh: string;
  titleEn: string;
  timeAgo: { th: string; en: string };
  accentColor: string;
}

export const FEATURED: Announcement[] = [
  {
    id: 1,
    priority: "important",
    tag: "สอบ",
    titleTh: "ประกาศตารางสอบกลางภาค ภาคต้น",
    titleEn: "Midterm Exam Schedule — Semester 1",
    dateTh: "9 มิ.ย. 2569",
    accentColor: "#c62828",
  },
  {
    id: 2,
    priority: "new",
    tag: "วิชาการ",
    titleTh: "ปฏิทินการศึกษา ภาคการศึกษา 1/2569",
    titleEn: "Academic Calendar 1/2569",
    dateTh: "7 มิ.ย. 2569",
    accentColor: "#1565c0",
  },
];

export const NEWS: NewsItem[] = [
  {
    id: 1,
    priority: "important",
    tags: ["สอบ"],
    titleTh: "แจ้งเปลี่ยนแปลงห้องสอบกลางภาควิชาคณิตศาสตร์",
    titleEn: "Math Midterm Room Change Notice",
    timeAgo: { th: "2 ชม. ที่แล้ว", en: "2h ago" },
    accentColor: "#c62828",
  },
  {
    id: 2,
    priority: "new",
    tags: ["กิจกรรม"],
    titleTh: "เปิดรับสมัครแข่งขันกีฬาภายใน ประจำปี 2569",
    titleEn: "Intramural Sports Registration Open 2569",
    timeAgo: { th: "5 ชม. ที่แล้ว", en: "5h ago" },
    accentColor: "#2e7d32",
  },
  {
    id: 3,
    priority: "normal",
    tags: ["ทหาร"],
    titleTh: "กำหนดการฝึกภาคสนาม ชั้นปี 3 ณ เขาชนไก่",
    titleEn: "Year 3 Field Training Schedule — Khao Chon Kai",
    timeAgo: { th: "เมื่อวาน", en: "Yesterday" },
    accentColor: "#37474f",
  },
  {
    id: 4,
    priority: "normal",
    tags: ["วิชาการ"],
    titleTh: "ขยายเวลาเปิดห้องสมุดช่วงสอบถึง 22:00 น.",
    titleEn: "Library Extended Hours During Exam Period to 22:00",
    timeAgo: { th: "2 วันที่แล้ว", en: "2d ago" },
    accentColor: "#1565c0",
  },
];

export const TAG_COLOR: Record<NewsTag, string> = {
  "สอบ":     "#c62828",
  "วิชาการ": "#1565c0",
  "ทหาร":    "#37474f",
  "กิจกรรม": "#2e7d32",
  "ประกาศ":  "#6a1a9a",
};
