// Mock activity data — used for Activity screen and My Day widget.

export type ActivityCategory = "กีฬา" | "วิชาการ" | "สังคม" | "กิจกรรม";

export interface Activity {
  id: number;
  category: ActivityCategory;
  titleTh: string;
  titleEn: string;
  dateTh: string;
  time: string;
  locationTh: string;
  locationEn: string;
  capacity: number;
  enrolled: number;
  accentColor: string;
  featured: boolean;
}

export const ACTIVITIES: Activity[] = [
  {
    id: 1,
    category: "กีฬา",
    titleTh: "วิ่งเข้ารอบเขาชนไก่",
    titleEn: "Khao Chon Kai Mountain Run",
    dateTh: "อา 15 มิ.ย.",
    time: "05:30",
    locationTh: "สนามกองพัน",
    locationEn: "Battalion Field",
    capacity: 40,
    enrolled: 24,
    accentColor: "#0BA8A0",
    featured: true,
  },
  {
    id: 2,
    category: "วิชาการ",
    titleTh: "ติวเข้มคณิตศาสตร์ก่อนสอบ",
    titleEn: "Intensive Math Tutoring",
    dateTh: "พฤ 19 มิ.ย.",
    time: "19:00",
    locationTh: "ห้องสมุด ชั้น 2",
    locationEn: "Library 2nd Floor",
    capacity: 30,
    enrolled: 18,
    accentColor: "#1565c0",
    featured: true,
  },
  {
    id: 3,
    category: "กีฬา",
    titleTh: "แข่งฟุตบอลกระชับมิตร กองร้อย 4 vs 5",
    titleEn: "Friendly Football Match Co. 4 vs Co. 5",
    dateTh: "ส 21 มิ.ย.",
    time: "14:00",
    locationTh: "สนามกีฬากลาง",
    locationEn: "Central Sports Field",
    capacity: 22,
    enrolled: 20,
    accentColor: "#0BA8A0",
    featured: false,
  },
  {
    id: 4,
    category: "สังคม",
    titleTh: "กิจกรรมบำเพ็ญประโยชน์ชุมชน",
    titleEn: "Community Service Activity",
    dateTh: "อา 22 มิ.ย.",
    time: "07:00",
    locationTh: "ชุมชนรอบค่าย",
    locationEn: "Communities Around Campus",
    capacity: 50,
    enrolled: 32,
    accentColor: "#ad1457",
    featured: false,
  },
  {
    id: 5,
    category: "วิชาการ",
    titleTh: "บรรยายพิเศษ: ความมั่นคงทางไซเบอร์",
    titleEn: "Special Lecture: Cyber Security",
    dateTh: "จ 23 มิ.ย.",
    time: "10:00",
    locationTh: "ห้องประชุมใหญ่",
    locationEn: "Main Conference Room",
    capacity: 100,
    enrolled: 67,
    accentColor: "#1565c0",
    featured: false,
  },
];

export const ACTIVITY_CATEGORIES: { key: ActivityCategory | "ทั้งหมด"; label: string }[] = [
  { key: "ทั้งหมด", label: "ทั้งหมด" },
  { key: "กีฬา",    label: "กีฬา" },
  { key: "วิชาการ", label: "วิชาการ" },
  { key: "สังคม",   label: "สังคม" },
  { key: "กิจกรรม", label: "กิจกรรม" },
];
