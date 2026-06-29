// Class schedule data — CRMA AY 2569, Semester 1, Year Level 1
// 9 academic branches (สาขาวิชา), generated mock schedules
// Real schedules to be imported from official timetable when available.

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

export const COHORTS = ["วก.", "วฟ.", "ซบ.", "วท.EP", "วย.", "วผ.", "วอ.", "วท.", "สศ."] as const;
export type Cohort = (typeof COHORTS)[number];

export const COHORT_NAMES: Record<Cohort, { th: string; en: string }> = {
  "วก.":   { th: "วิศวกรรมเครื่องกล",                         en: "Mechanical Engineering" },
  "วฟ.":   { th: "วิศวกรรมไฟฟ้าสื่อสาร",                     en: "Electrical Communication Eng." },
  "ซบ.":   { th: "ความมั่นคงปลอดภัยทางไซเบอร์",               en: "Cybersecurity" },
  "วท.EP": { th: "วิทยาศาสตร์และเทคโนโลยี (English Program)",  en: "Science & Technology (EP)" },
  "วย.":   { th: "วิศวกรรมโยธา",                              en: "Civil Engineering" },
  "วผ.":   { th: "วิศวกรรมแผนที่",                            en: "Mapping Engineering" },
  "วอ.":   { th: "วิศวกรรมอุตสาหการ",                         en: "Industrial Engineering" },
  "วท.":   { th: "วิทยาศาสตร์และเทคโนโลยี",                   en: "Science & Technology" },
  "สศ.":   { th: "สังคมศาสตร์เพื่อการพัฒนา",                  en: "Social Sciences for Development" },
};

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
  academic: { th: "วิชาการ",    en: "Academic" },
  military: { th: "ทหาร",      en: "Military" },
  advisory: { th: "ที่ปรึกษา", en: "Advisory" },
  pe:       { th: "พลศึกษา",   en: "PE" },
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

const RAW: RawRow[] = [
  // ── วก. วิศวกรรมเครื่องกล ─────────────────────────────────────────────────
  { cohort:"วก.", day:"Monday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                   subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"วก.", day:"Monday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1 (ภาคปฏิบัติ)",       subjectNameEn:"Military Science 1 (Lab)",        category:"military" },
  { cohort:"วก.", day:"Monday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"MA 1101", subjectNameTh:"แคลคูลัส 1",                   subjectNameEn:"Calculus 1",                      category:"academic" },
  { cohort:"วก.", day:"Tuesday",   periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PH 1001", subjectNameTh:"ฟิสิกส์ทั่วไป 1",              subjectNameEn:"General Physics 1",               category:"academic" },
  { cohort:"วก.", day:"Tuesday",   periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"ME 1001", subjectNameTh:"การเขียนแบบวิศวกรรม",          subjectNameEn:"Engineering Drawing",             category:"academic" },
  { cohort:"วก.", day:"Tuesday",   periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา",   subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"วก.", day:"Wednesday", periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"LG 1001", subjectNameTh:"ภาษาไทย 1",                    subjectNameEn:"Thai Language 1",                 category:"academic" },
  { cohort:"วก.", day:"Wednesday", periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"ME 1002", subjectNameTh:"กลศาสตร์วิศวกรรม 1",           subjectNameEn:"Engineering Mechanics 1",         category:"academic" },
  { cohort:"วก.", day:"Wednesday", periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"PE 1001", subjectNameTh:"พลศึกษา 1",                    subjectNameEn:"Physical Education 1",            category:"pe"       },
  { cohort:"วก.", day:"Thursday",  periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"HI 1001", subjectNameTh:"ประวัติศาสตร์ไทย",             subjectNameEn:"Thai History",                    category:"academic" },
  { cohort:"วก.", day:"Thursday",  periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"PH 1002", subjectNameTh:"ปฏิบัติการฟิสิกส์ 1",          subjectNameEn:"Physics Laboratory 1",            category:"academic" },
  { cohort:"วก.", day:"Thursday",  periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"MA 1101", subjectNameTh:"แคลคูลัส 1 (แบบฝึกหัด)",       subjectNameEn:"Calculus 1 (Tutorial)",           category:"academic" },
  { cohort:"วก.", day:"Friday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PC 1101", subjectNameTh:"จิตวิทยาเบื้องต้น",            subjectNameEn:"Intro to Psychology",             category:"academic" },
  { cohort:"วก.", day:"Friday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"ME 1001", subjectNameTh:"การเขียนแบบวิศวกรรม (ปฏิบัติ)", subjectNameEn:"Engineering Drawing (Lab)",       category:"academic" },
  { cohort:"วก.", day:"Friday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา",   subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },

  // ── วฟ. วิศวกรรมไฟฟ้าสื่อสาร ──────────────────────────────────────────────
  { cohort:"วฟ.", day:"Monday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                   subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"วฟ.", day:"Monday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1 (ภาคปฏิบัติ)",       subjectNameEn:"Military Science 1 (Lab)",        category:"military" },
  { cohort:"วฟ.", day:"Monday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"MA 1101", subjectNameTh:"แคลคูลัส 1",                   subjectNameEn:"Calculus 1",                      category:"academic" },
  { cohort:"วฟ.", day:"Tuesday",   periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PH 1001", subjectNameTh:"ฟิสิกส์ทั่วไป 1",              subjectNameEn:"General Physics 1",               category:"academic" },
  { cohort:"วฟ.", day:"Tuesday",   periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"EE 1001", subjectNameTh:"วงจรไฟฟ้า 1",                  subjectNameEn:"Electric Circuits 1",             category:"academic" },
  { cohort:"วฟ.", day:"Tuesday",   periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา",   subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"วฟ.", day:"Wednesday", periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"LG 1001", subjectNameTh:"ภาษาไทย 1",                    subjectNameEn:"Thai Language 1",                 category:"academic" },
  { cohort:"วฟ.", day:"Wednesday", periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"EE 1002", subjectNameTh:"การเขียนแบบวิศวกรรมไฟฟ้า",    subjectNameEn:"Electrical Engineering Drawing",  category:"academic" },
  { cohort:"วฟ.", day:"Wednesday", periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"PE 1001", subjectNameTh:"พลศึกษา 1",                    subjectNameEn:"Physical Education 1",            category:"pe"       },
  { cohort:"วฟ.", day:"Thursday",  periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"HI 1001", subjectNameTh:"ประวัติศาสตร์ไทย",             subjectNameEn:"Thai History",                    category:"academic" },
  { cohort:"วฟ.", day:"Thursday",  periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"PH 1002", subjectNameTh:"ปฏิบัติการฟิสิกส์ 1",          subjectNameEn:"Physics Laboratory 1",            category:"academic" },
  { cohort:"วฟ.", day:"Thursday",  periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"EE 1001", subjectNameTh:"วงจรไฟฟ้า 1 (แบบฝึกหัด)",      subjectNameEn:"Electric Circuits 1 (Tutorial)",  category:"academic" },
  { cohort:"วฟ.", day:"Friday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PC 1101", subjectNameTh:"จิตวิทยาเบื้องต้น",            subjectNameEn:"Intro to Psychology",             category:"academic" },
  { cohort:"วฟ.", day:"Friday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MA 1101", subjectNameTh:"แคลคูลัส 1 (แบบฝึกหัด)",       subjectNameEn:"Calculus 1 (Tutorial)",           category:"academic" },
  { cohort:"วฟ.", day:"Friday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา",   subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },

  // ── ซบ. ความมั่นคงปลอดภัยทางไซเบอร์ ──────────────────────────────────────
  { cohort:"ซบ.", day:"Monday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                   subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"ซบ.", day:"Monday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1 (ภาคปฏิบัติ)",       subjectNameEn:"Military Science 1 (Lab)",        category:"military" },
  { cohort:"ซบ.", day:"Monday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"CS 1001", subjectNameTh:"พื้นฐานวิทยาการคอมพิวเตอร์",   subjectNameEn:"Fundamentals of Computer Science", category:"academic" },
  { cohort:"ซบ.", day:"Tuesday",   periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"MA 1101", subjectNameTh:"แคลคูลัส 1",                   subjectNameEn:"Calculus 1",                      category:"academic" },
  { cohort:"ซบ.", day:"Tuesday",   periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"CS 1002", subjectNameTh:"การเขียนโปรแกรม 1",            subjectNameEn:"Programming 1",                   category:"academic" },
  { cohort:"ซบ.", day:"Tuesday",   periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา",   subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"ซบ.", day:"Wednesday", periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"LG 1001", subjectNameTh:"ภาษาไทย 1",                    subjectNameEn:"Thai Language 1",                 category:"academic" },
  { cohort:"ซบ.", day:"Wednesday", periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"PH 1001", subjectNameTh:"ฟิสิกส์ทั่วไป 1",              subjectNameEn:"General Physics 1",               category:"academic" },
  { cohort:"ซบ.", day:"Wednesday", periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"PE 1001", subjectNameTh:"พลศึกษา 1",                    subjectNameEn:"Physical Education 1",            category:"pe"       },
  { cohort:"ซบ.", day:"Thursday",  periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"HI 1001", subjectNameTh:"ประวัติศาสตร์ไทย",             subjectNameEn:"Thai History",                    category:"academic" },
  { cohort:"ซบ.", day:"Thursday",  periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"CS 1002", subjectNameTh:"การเขียนโปรแกรม 1 (ปฏิบัติ)",  subjectNameEn:"Programming 1 (Lab)",             category:"academic" },
  { cohort:"ซบ.", day:"Thursday",  periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"CS 1003", subjectNameTh:"ระบบคอมพิวเตอร์และเครือข่าย",  subjectNameEn:"Computer Systems & Networks",     category:"academic" },
  { cohort:"ซบ.", day:"Friday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PC 1101", subjectNameTh:"จิตวิทยาเบื้องต้น",            subjectNameEn:"Intro to Psychology",             category:"academic" },
  { cohort:"ซบ.", day:"Friday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MA 1101", subjectNameTh:"แคลคูลัส 1 (แบบฝึกหัด)",       subjectNameEn:"Calculus 1 (Tutorial)",           category:"academic" },
  { cohort:"ซบ.", day:"Friday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา",   subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },

  // ── วท.EP วิทยาศาสตร์และเทคโนโลยี (English Program) ────────────────────────
  { cohort:"วท.EP", day:"Monday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                 subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"วท.EP", day:"Monday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1 (ภาคปฏิบัติ)",     subjectNameEn:"Military Science 1 (Lab)",        category:"military" },
  { cohort:"วท.EP", day:"Monday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"MA 1101", subjectNameTh:"แคลคูลัส 1",                 subjectNameEn:"Calculus 1",                      category:"academic" },
  { cohort:"วท.EP", day:"Tuesday",   periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PH 1001", subjectNameTh:"ฟิสิกส์ทั่วไป 1",            subjectNameEn:"General Physics 1",               category:"academic" },
  { cohort:"วท.EP", day:"Tuesday",   periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"EN 1001", subjectNameTh:"ภาษาอังกฤษวิชาการ 1",         subjectNameEn:"Academic English 1",              category:"academic" },
  { cohort:"วท.EP", day:"Tuesday",   periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"วท.EP", day:"Wednesday", periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"CH 1001", subjectNameTh:"เคมีทั่วไป 1",               subjectNameEn:"General Chemistry 1",             category:"academic" },
  { cohort:"วท.EP", day:"Wednesday", periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"EN 1002", subjectNameTh:"การฟัง-พูดภาษาอังกฤษ",       subjectNameEn:"English Listening & Speaking",    category:"academic" },
  { cohort:"วท.EP", day:"Wednesday", periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"PE 1001", subjectNameTh:"พลศึกษา 1",                  subjectNameEn:"Physical Education 1",            category:"pe"       },
  { cohort:"วท.EP", day:"Thursday",  periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"HI 1001", subjectNameTh:"ประวัติศาสตร์ไทย",           subjectNameEn:"Thai History",                    category:"academic" },
  { cohort:"วท.EP", day:"Thursday",  periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"PH 1002", subjectNameTh:"ปฏิบัติการฟิสิกส์ 1",        subjectNameEn:"Physics Laboratory 1",            category:"academic" },
  { cohort:"วท.EP", day:"Thursday",  periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"CH 1002", subjectNameTh:"ปฏิบัติการเคมี 1",           subjectNameEn:"Chemistry Laboratory 1",          category:"academic" },
  { cohort:"วท.EP", day:"Friday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PC 1101", subjectNameTh:"จิตวิทยาเบื้องต้น",          subjectNameEn:"Intro to Psychology",             category:"academic" },
  { cohort:"วท.EP", day:"Friday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"EN 1001", subjectNameTh:"ภาษาอังกฤษวิชาการ 1 (ปฏิบัติ)", subjectNameEn:"Academic English 1 (Practice)", category:"academic" },
  { cohort:"วท.EP", day:"Friday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา", subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },

  // ── วย. วิศวกรรมโยธา ──────────────────────────────────────────────────────
  { cohort:"วย.", day:"Monday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                   subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"วย.", day:"Monday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1 (ภาคปฏิบัติ)",       subjectNameEn:"Military Science 1 (Lab)",        category:"military" },
  { cohort:"วย.", day:"Monday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"MA 1101", subjectNameTh:"แคลคูลัส 1",                   subjectNameEn:"Calculus 1",                      category:"academic" },
  { cohort:"วย.", day:"Tuesday",   periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PH 1001", subjectNameTh:"ฟิสิกส์ทั่วไป 1",              subjectNameEn:"General Physics 1",               category:"academic" },
  { cohort:"วย.", day:"Tuesday",   periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"CE 1001", subjectNameTh:"การเขียนแบบวิศวกรรมโยธา",      subjectNameEn:"Civil Engineering Drawing",       category:"academic" },
  { cohort:"วย.", day:"Tuesday",   periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา",   subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"วย.", day:"Wednesday", periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"LG 1001", subjectNameTh:"ภาษาไทย 1",                    subjectNameEn:"Thai Language 1",                 category:"academic" },
  { cohort:"วย.", day:"Wednesday", periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"CE 1002", subjectNameTh:"กลศาสตร์โครงสร้าง 1",          subjectNameEn:"Structural Mechanics 1",          category:"academic" },
  { cohort:"วย.", day:"Wednesday", periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"PE 1001", subjectNameTh:"พลศึกษา 1",                    subjectNameEn:"Physical Education 1",            category:"pe"       },
  { cohort:"วย.", day:"Thursday",  periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"HI 1001", subjectNameTh:"ประวัติศาสตร์ไทย",             subjectNameEn:"Thai History",                    category:"academic" },
  { cohort:"วย.", day:"Thursday",  periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"PH 1002", subjectNameTh:"ปฏิบัติการฟิสิกส์ 1",          subjectNameEn:"Physics Laboratory 1",            category:"academic" },
  { cohort:"วย.", day:"Thursday",  periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"CE 1003", subjectNameTh:"การสำรวจเบื้องต้น",            subjectNameEn:"Introduction to Surveying",       category:"academic" },
  { cohort:"วย.", day:"Friday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PC 1101", subjectNameTh:"จิตวิทยาเบื้องต้น",            subjectNameEn:"Intro to Psychology",             category:"academic" },
  { cohort:"วย.", day:"Friday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MA 1101", subjectNameTh:"แคลคูลัส 1 (แบบฝึกหัด)",       subjectNameEn:"Calculus 1 (Tutorial)",           category:"academic" },
  { cohort:"วย.", day:"Friday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา",   subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },

  // ── วผ. วิศวกรรมแผนที่ ────────────────────────────────────────────────────
  { cohort:"วผ.", day:"Monday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                   subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"วผ.", day:"Monday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1 (ภาคปฏิบัติ)",       subjectNameEn:"Military Science 1 (Lab)",        category:"military" },
  { cohort:"วผ.", day:"Monday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"MA 1101", subjectNameTh:"แคลคูลัส 1",                   subjectNameEn:"Calculus 1",                      category:"academic" },
  { cohort:"วผ.", day:"Tuesday",   periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PH 1001", subjectNameTh:"ฟิสิกส์ทั่วไป 1",              subjectNameEn:"General Physics 1",               category:"academic" },
  { cohort:"วผ.", day:"Tuesday",   periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"GE 1001", subjectNameTh:"แผนที่และการสำรวจ 1",           subjectNameEn:"Cartography & Surveying 1",       category:"academic" },
  { cohort:"วผ.", day:"Tuesday",   periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา",   subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"วผ.", day:"Wednesday", periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"LG 1001", subjectNameTh:"ภาษาไทย 1",                    subjectNameEn:"Thai Language 1",                 category:"academic" },
  { cohort:"วผ.", day:"Wednesday", periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"GE 1002", subjectNameTh:"ระบบสารสนเทศภูมิศาสตร์เบื้องต้น", subjectNameEn:"Introduction to GIS",          category:"academic" },
  { cohort:"วผ.", day:"Wednesday", periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"PE 1001", subjectNameTh:"พลศึกษา 1",                    subjectNameEn:"Physical Education 1",            category:"pe"       },
  { cohort:"วผ.", day:"Thursday",  periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"HI 1001", subjectNameTh:"ประวัติศาสตร์ไทย",             subjectNameEn:"Thai History",                    category:"academic" },
  { cohort:"วผ.", day:"Thursday",  periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"GE 1001", subjectNameTh:"แผนที่และการสำรวจ 1 (ปฏิบัติ)", subjectNameEn:"Cartography & Surveying 1 (Lab)", category:"academic" },
  { cohort:"วผ.", day:"Thursday",  periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"MA 1101", subjectNameTh:"แคลคูลัส 1 (แบบฝึกหัด)",       subjectNameEn:"Calculus 1 (Tutorial)",           category:"academic" },
  { cohort:"วผ.", day:"Friday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PC 1101", subjectNameTh:"จิตวิทยาเบื้องต้น",            subjectNameEn:"Intro to Psychology",             category:"academic" },
  { cohort:"วผ.", day:"Friday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"GE 1002", subjectNameTh:"ระบบสารสนเทศภูมิศาสตร์เบื้องต้น (ปฏิบัติ)", subjectNameEn:"Intro to GIS (Lab)", category:"academic" },
  { cohort:"วผ.", day:"Friday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา",   subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },

  // ── วอ. วิศวกรรมอุตสาหการ ─────────────────────────────────────────────────
  { cohort:"วอ.", day:"Monday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                   subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"วอ.", day:"Monday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1 (ภาคปฏิบัติ)",       subjectNameEn:"Military Science 1 (Lab)",        category:"military" },
  { cohort:"วอ.", day:"Monday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"MA 1101", subjectNameTh:"แคลคูลัส 1",                   subjectNameEn:"Calculus 1",                      category:"academic" },
  { cohort:"วอ.", day:"Tuesday",   periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PH 1001", subjectNameTh:"ฟิสิกส์ทั่วไป 1",              subjectNameEn:"General Physics 1",               category:"academic" },
  { cohort:"วอ.", day:"Tuesday",   periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"IE 1001", subjectNameTh:"วิศวกรรมอุตสาหการเบื้องต้น",   subjectNameEn:"Intro to Industrial Engineering", category:"academic" },
  { cohort:"วอ.", day:"Tuesday",   periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา",   subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"วอ.", day:"Wednesday", periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"LG 1001", subjectNameTh:"ภาษาไทย 1",                    subjectNameEn:"Thai Language 1",                 category:"academic" },
  { cohort:"วอ.", day:"Wednesday", periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"IE 1002", subjectNameTh:"สถิติเพื่องานวิศวกรรม",         subjectNameEn:"Statistics for Engineering",      category:"academic" },
  { cohort:"วอ.", day:"Wednesday", periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"PE 1001", subjectNameTh:"พลศึกษา 1",                    subjectNameEn:"Physical Education 1",            category:"pe"       },
  { cohort:"วอ.", day:"Thursday",  periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"HI 1001", subjectNameTh:"ประวัติศาสตร์ไทย",             subjectNameEn:"Thai History",                    category:"academic" },
  { cohort:"วอ.", day:"Thursday",  periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"IE 1001", subjectNameTh:"วิศวกรรมอุตสาหการเบื้องต้น (ปฏิบัติ)", subjectNameEn:"Intro to Industrial Eng. (Lab)", category:"academic" },
  { cohort:"วอ.", day:"Thursday",  periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"MA 1101", subjectNameTh:"แคลคูลัส 1 (แบบฝึกหัด)",       subjectNameEn:"Calculus 1 (Tutorial)",           category:"academic" },
  { cohort:"วอ.", day:"Friday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PC 1101", subjectNameTh:"จิตวิทยาเบื้องต้น",            subjectNameEn:"Intro to Psychology",             category:"academic" },
  { cohort:"วอ.", day:"Friday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"IE 1002", subjectNameTh:"สถิติเพื่องานวิศวกรรม (ปฏิบัติ)", subjectNameEn:"Statistics for Eng. (Lab)",     category:"academic" },
  { cohort:"วอ.", day:"Friday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา",   subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },

  // ── วท. วิทยาศาสตร์และเทคโนโลยี ──────────────────────────────────────────
  { cohort:"วท.", day:"Monday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                   subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"วท.", day:"Monday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1 (ภาคปฏิบัติ)",       subjectNameEn:"Military Science 1 (Lab)",        category:"military" },
  { cohort:"วท.", day:"Monday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"MA 1101", subjectNameTh:"แคลคูลัส 1",                   subjectNameEn:"Calculus 1",                      category:"academic" },
  { cohort:"วท.", day:"Tuesday",   periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PH 1001", subjectNameTh:"ฟิสิกส์ทั่วไป 1",              subjectNameEn:"General Physics 1",               category:"academic" },
  { cohort:"วท.", day:"Tuesday",   periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"CH 1001", subjectNameTh:"เคมีทั่วไป 1",                 subjectNameEn:"General Chemistry 1",             category:"academic" },
  { cohort:"วท.", day:"Tuesday",   periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา",   subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"วท.", day:"Wednesday", periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"LG 1001", subjectNameTh:"ภาษาไทย 1",                    subjectNameEn:"Thai Language 1",                 category:"academic" },
  { cohort:"วท.", day:"Wednesday", periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"BI 1001", subjectNameTh:"ชีววิทยาทั่วไป 1",             subjectNameEn:"General Biology 1",               category:"academic" },
  { cohort:"วท.", day:"Wednesday", periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"PE 1001", subjectNameTh:"พลศึกษา 1",                    subjectNameEn:"Physical Education 1",            category:"pe"       },
  { cohort:"วท.", day:"Thursday",  periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"HI 1001", subjectNameTh:"ประวัติศาสตร์ไทย",             subjectNameEn:"Thai History",                    category:"academic" },
  { cohort:"วท.", day:"Thursday",  periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"PH 1002", subjectNameTh:"ปฏิบัติการฟิสิกส์ 1",          subjectNameEn:"Physics Laboratory 1",            category:"academic" },
  { cohort:"วท.", day:"Thursday",  periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"CH 1002", subjectNameTh:"ปฏิบัติการเคมี 1",             subjectNameEn:"Chemistry Laboratory 1",          category:"academic" },
  { cohort:"วท.", day:"Friday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PC 1101", subjectNameTh:"จิตวิทยาเบื้องต้น",            subjectNameEn:"Intro to Psychology",             category:"academic" },
  { cohort:"วท.", day:"Friday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MA 1101", subjectNameTh:"แคลคูลัส 1 (แบบฝึกหัด)",       subjectNameEn:"Calculus 1 (Tutorial)",           category:"academic" },
  { cohort:"วท.", day:"Friday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา",   subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },

  // ── สศ. สังคมศาสตร์เพื่อการพัฒนา ─────────────────────────────────────────
  { cohort:"สศ.", day:"Monday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1",                   subjectNameEn:"Military Science 1",              category:"military" },
  { cohort:"สศ.", day:"Monday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"MS 1001", subjectNameTh:"วิชาทหาร 1 (ภาคปฏิบัติ)",       subjectNameEn:"Military Science 1 (Lab)",        category:"military" },
  { cohort:"สศ.", day:"Monday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"SS 1001", subjectNameTh:"หลักรัฐศาสตร์",                subjectNameEn:"Principles of Political Science", category:"academic" },
  { cohort:"สศ.", day:"Tuesday",   periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"SS 1002", subjectNameTh:"เศรษฐศาสตร์เบื้องต้น",         subjectNameEn:"Introduction to Economics",       category:"academic" },
  { cohort:"สศ.", day:"Tuesday",   periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"SS 1003", subjectNameTh:"สังคมวิทยาและมานุษยวิทยา",      subjectNameEn:"Sociology & Anthropology",        category:"academic" },
  { cohort:"สศ.", day:"Tuesday",   periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา",   subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
  { cohort:"สศ.", day:"Wednesday", periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"LG 1001", subjectNameTh:"ภาษาไทย 1",                    subjectNameEn:"Thai Language 1",                 category:"academic" },
  { cohort:"สศ.", day:"Wednesday", periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"SS 1004", subjectNameTh:"ระเบียบวิธีวิจัยทางสังคมศาสตร์", subjectNameEn:"Social Science Research Methods", category:"academic" },
  { cohort:"สศ.", day:"Wednesday", periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"PE 1001", subjectNameTh:"พลศึกษา 1",                    subjectNameEn:"Physical Education 1",            category:"pe"       },
  { cohort:"สศ.", day:"Thursday",  periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"HI 1001", subjectNameTh:"ประวัติศาสตร์ไทย",             subjectNameEn:"Thai History",                    category:"academic" },
  { cohort:"สศ.", day:"Thursday",  periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"SS 1001", subjectNameTh:"หลักรัฐศาสตร์ (สัมมนา)",        subjectNameEn:"Political Science (Seminar)",     category:"academic" },
  { cohort:"สศ.", day:"Thursday",  periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"SS 1002", subjectNameTh:"เศรษฐศาสตร์เบื้องต้น (แบบฝึกหัด)", subjectNameEn:"Introduction to Economics (Tutorial)", category:"academic" },
  { cohort:"สศ.", day:"Friday",    periodOrder:1, startTime:"08:00", endTime:"09:30", subjectCode:"PC 1101", subjectNameTh:"จิตวิทยาเบื้องต้น",            subjectNameEn:"Intro to Psychology",             category:"academic" },
  { cohort:"สศ.", day:"Friday",    periodOrder:2, startTime:"10:00", endTime:"12:00", subjectCode:"SS 1003", subjectNameTh:"สังคมวิทยาและมานุษยวิทยา (สัมมนา)", subjectNameEn:"Sociology & Anthropology (Seminar)", category:"academic" },
  { cohort:"สศ.", day:"Friday",    periodOrder:3, startTime:"13:00", endTime:"14:30", subjectCode:"",        subjectNameTh:"ค้นคว้า/พบอาจารย์ที่ปรึกษา",   subjectNameEn:"Research / Advisor Meeting",      category:"advisory" },
];

export function getSchedule(cohort: Cohort, day: DayOfWeek): ClassPeriod[] {
  return RAW
    .filter((r) => r.cohort === cohort && r.day === day)
    .sort((a, b) => a.periodOrder - b.periodOrder)
    .map(({ periodOrder, startTime, endTime, subjectCode, subjectNameTh, subjectNameEn, category }) => ({
      periodOrder, startTime, endTime, subjectCode, subjectNameTh, subjectNameEn, category,
    }));
}

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
