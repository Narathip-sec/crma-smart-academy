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
  accentColor: string;
  bodyTh: string;
  bodyEn: string;
}

export interface NewsItem {
  id: number;
  priority: Priority;
  tags: NewsTag[];
  titleTh: string;
  titleEn: string;
  timeAgo: { th: string; en: string };
  accentColor: string;
  bodyTh: string;
  bodyEn: string;
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
    bodyTh: "กองการศึกษาขอแจ้งตารางสอบกลางภาค ประจำภาคต้น ปีการศึกษา 2569 ดังนี้\n\n• วิชาคณิตศาสตร์ประยุกต์: 15 มิ.ย. 2569 เวลา 08:00–11:00 น. ณ อาคารเรียนรวม ชั้น 2\n• วิชาฟิสิกส์การทหาร: 16 มิ.ย. 2569 เวลา 13:00–16:00 น. ณ ห้อง 301–305\n• วิชาพฤติกรรมมนุษย์และจิตวิทยา: 17 มิ.ย. 2569 เวลา 08:00–11:00 น. ณ อาคารสถาบัน\n• วิชาการทหาร: 18 มิ.ย. 2569 เวลา 13:00–16:00 น. ณ หอประชุม\n\nขอให้นักเรียนนายร้อยทุกนายตรวจสอบตารางสอบอีกครั้ง นำบัตรประจำตัวและอุปกรณ์เครื่องเขียนมาให้พร้อม ห้ามนำโทรศัพท์มือถือเข้าห้องสอบโดยเด็ดขาด หากมีข้อสงสัยติดต่อกองการศึกษาได้ในเวลาราชการ",
    bodyEn: "The Academic Affairs Department announces the Semester 1 midterm exam schedule for Academic Year 2569. Please bring your student ID and writing materials. Mobile phones are strictly prohibited in exam rooms. Contact Academic Affairs during office hours for any questions.",
  },
  {
    id: 2,
    priority: "new",
    tag: "วิชาการ",
    titleTh: "ปฏิทินการศึกษา ภาคการศึกษา 1/2569",
    titleEn: "Academic Calendar 1/2569",
    dateTh: "7 มิ.ย. 2569",
    accentColor: "#1565c0",
    bodyTh: "กองการศึกษาโรงเรียนนายร้อยพระจุลจอมเกล้าขอแจ้งปฏิทินการศึกษา ภาคการศึกษา 1/2569 เพื่อให้นักเรียนนายร้อยได้วางแผนการเรียนและกิจกรรมล่วงหน้า\n\n📅 กิจกรรมสำคัญ:\n• เปิดภาคการศึกษา: 1 มิ.ย. 2569\n• สอบกลางภาค: 15–22 มิ.ย. 2569\n• วันหยุดพิเศษ (วันเฉลิมพระชนมพรรษา): 28 ก.ค. 2569\n• สอบปลายภาค: 25 ส.ค.–5 ก.ย. 2569\n• ปิดภาคการศึกษา: 10 ก.ย. 2569\n\nสามารถดาวน์โหลดปฏิทินฉบับเต็มได้ที่เว็บไซต์กองการศึกษา หรือติดต่อสอบถามที่ฝ่ายทะเบียนและวัดผล",
    bodyEn: "The CRMA Academic Department announces the Academic Calendar for Semester 1/2569. Key dates include semester opening June 1, midterms June 15–22, royal holiday July 28, final exams August 25 – September 5, and semester end September 10.",
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
    bodyTh: "กองการศึกษาขอแจ้งเปลี่ยนแปลงห้องสอบวิชาคณิตศาสตร์ประยุกต์ ประจำภาคต้น 2569\n\nเดิม: ห้อง 201–205 อาคารเรียนรวม ชั้น 2\nใหม่: หอประชุมกองพัน ชั้น 1 (รองรับนักเรียนนายร้อยทุกนายในคราวเดียว)\n\nวันและเวลาสอบยังคงเดิม: 15 มิ.ย. 2569 เวลา 08:00–11:00 น.\n\nเหตุผล: เนื่องจากระบบปรับอากาศในห้องเรียน 201–205 ขัดข้อง ทางฝ่ายช่างกำลังดำเนินการซ่อมแซม\n\nขอให้นักเรียนนายร้อยทุกนายเข้าสู่สถานที่สอบใหม่ให้ทันเวลา และตรวจสอบที่นั่งสอบจากรายชื่อที่ประกาศหน้าหอประชุม",
    bodyEn: "The math midterm exam room has changed from Building 201–205 to the Battalion Assembly Hall due to AC system failure. Date and time remain the same: June 15 at 08:00–11:00. Check seat assignments posted at the hall entrance.",
  },
  {
    id: 2,
    priority: "new",
    tags: ["กิจกรรม"],
    titleTh: "เปิดรับสมัครแข่งขันกีฬาภายใน ประจำปี 2569",
    titleEn: "Intramural Sports Registration Open 2569",
    timeAgo: { th: "5 ชม. ที่แล้ว", en: "5h ago" },
    accentColor: "#2e7d32",
    bodyTh: "ฝ่ายกีฬาและนันทนาการขอเชิญนักเรียนนายร้อยทุกนายสมัครเข้าร่วมการแข่งขันกีฬาภายใน ประจำปีการศึกษา 2569\n\n🏆 ประเภทกีฬาที่แข่งขัน:\n• ฟุตบอล (ทีม 11 คน)\n• บาสเกตบอล (ทีม 5 คน)\n• วอลเลย์บอล\n• ว่ายน้ำ (บุคคล)\n• วิ่งระยะทาง 5 กม. และ 10 กม.\n• มวยไทย (จับคู่น้ำหนัก)\n\n📋 รับสมัครถึง: 20 มิ.ย. 2569\n🏅 วันแข่งขัน: 25–30 มิ.ย. 2569\n\nสมัครได้ที่ฝ่ายกีฬาและนันทนาการ อาคารพลศึกษา ชั้น 1 หรือผ่านระบบออนไลน์",
    bodyEn: "The Sports & Recreation Department invites all cadets to register for the Annual Intramural Sports Competition 2569. Sports include football, basketball, volleyball, swimming, running (5km & 10km), and Muay Thai. Registration closes June 20. Competition dates: June 25–30.",
  },
  {
    id: 3,
    priority: "normal",
    tags: ["ทหาร"],
    titleTh: "กำหนดการฝึกภาคสนาม ชั้นปี 3 ณ เขาชนไก่",
    titleEn: "Year 3 Field Training Schedule — Khao Chon Kai",
    timeAgo: { th: "เมื่อวาน", en: "Yesterday" },
    accentColor: "#37474f",
    bodyTh: "กองพันทหารราบขอแจ้งกำหนดการฝึกภาคสนาม สำหรับนักเรียนนายร้อยชั้นปีที่ 3 ณ พื้นที่ฝึกเขาชนไก่ จ.กาญจนบุรี\n\n📅 วันที่: 1–14 ก.ค. 2569 (14 วัน)\n📍 สถานที่: ค่ายฝึกเขาชนไก่ อ.ไทรโยค จ.กาญจนบุรี\n\n🎒 สิ่งที่ต้องเตรียม:\n• ชุดลายพราง พร้อมสนามจำนวน 3 ชุด\n• รองเท้าป่า สำรอง 1 คู่\n• ถุงนอน และเป้หนัก\n• ยาประจำตัวและยาพื้นฐาน\n• น้ำดื่ม 3 ลิตร/วัน (จัดเตรียมโดยหน่วย)\n\nห้ามนำโทรศัพท์มือถือและอุปกรณ์ไฟฟ้าส่วนตัวเข้าพื้นที่ฝึก กำหนดการอาจมีการเปลี่ยนแปลงตามสภาพอากาศ",
    bodyEn: "Year 3 field training at Khao Chon Kai, Kanchanaburi from July 1–14. Pack 3 sets of combat fatigues, jungle boots, sleeping bag, and personal medications. No personal electronics allowed in the training area. Schedule subject to weather conditions.",
  },
  {
    id: 4,
    priority: "normal",
    tags: ["วิชาการ"],
    titleTh: "ขยายเวลาเปิดห้องสมุดช่วงสอบถึง 22:00 น.",
    titleEn: "Library Extended Hours During Exam Period to 22:00",
    timeAgo: { th: "2 วันที่แล้ว", en: "2d ago" },
    accentColor: "#1565c0",
    bodyTh: "ห้องสมุดโรงเรียนนายร้อยพระจุลจอมเกล้าขอแจ้งขยายเวลาเปิดให้บริการในช่วงสอบกลางภาค เพื่ออำนวยความสะดวกแก่นักเรียนนายร้อยในการค้นคว้าและทบทวนบทเรียน\n\n⏰ เวลาเปิดพิเศษ (15–22 มิ.ย. 2569):\nวันจันทร์–ศุกร์: 06:30–22:00 น.\nวันเสาร์–อาทิตย์: 08:00–20:00 น.\n\n📚 บริการพิเศษช่วงสอบ:\n• ห้องศึกษาเดี่ยว (จองล่วงหน้าที่เคาน์เตอร์)\n• ห้องกลุ่ม ขนาด 4–8 คน (ฟรี)\n• บริการพิมพ์เอกสาร A4 ฟรี 20 แผ่น/คน/วัน\n• Wifi ความเร็วสูงตลอด 24 ชม.\n\nขอให้นักเรียนนายร้อยรักษาความสะอาดและความเป็นระเบียบเรียบร้อยของห้องสมุดด้วย",
    bodyEn: "The CRMA Library extends hours during the midterm exam period (June 15–22). Weekdays: 06:30–22:00, Weekends: 08:00–20:00. Special services include private study rooms, group rooms (4–8 persons), free printing (20 sheets/day), and high-speed WiFi.",
  },
];

export const TAG_COLOR: Record<NewsTag, string> = {
  "สอบ":     "#c62828",
  "วิชาการ": "#1565c0",
  "ทหาร":    "#37474f",
  "กิจกรรม": "#2e7d32",
  "ประกาศ":  "#6a1a9a",
};
