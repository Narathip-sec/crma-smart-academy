import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const SEMESTERS = [
  { label: "1/2568", order: 1, isCurrent: false },
  { label: "2/2568", order: 2, isCurrent: false },
  { label: "1/2569", order: 3, isCurrent: true },
];

const GRADES_BY_SEMESTER: Record<string, { code: string; th: string; en: string; credits: number; grade: string | null }[]> = {
  "1/2568": [
    { code: "MA 101", th: "คณิตศาสตร์วิศวกรรม 1",   en: "Engineering Mathematics 1", credits: 3, grade: "A-" },
    { code: "GE 101", th: "การปรับตัว",              en: "Orientation",               credits: 1, grade: "A" },
    { code: "EN 101", th: "ภาษาอังกฤษ 1",            en: "English 1",                 credits: 2, grade: "A" },
  ],
  "2/2568": [
    { code: "MA 102", th: "คณิตศาสตร์วิศวกรรม 2",   en: "Engineering Mathematics 2", credits: 3, grade: "B+" },
    { code: "CH 101", th: "เคมี 1",                  en: "Chemistry 1",               credits: 3, grade: "A-" },
    { code: "EN 102", th: "ภาษาอังกฤษ 2",            en: "English 2",                 credits: 2, grade: "A" },
    { code: "MS 102", th: "วิชาทหาร 2",              en: "Military Science 2",        credits: 3, grade: "B+" },
  ],
  "1/2569": [
    { code: "PH 1001", th: "ฟิสิกส์ทั่วไป 1",          en: "General Physics 1",             credits: 4, grade: null },
    { code: "PH 1002", th: "ปฏิบัติการฟิสิกส์ 1",      en: "Physics Laboratory 1",          credits: 1, grade: null },
    { code: "MS 1001", th: "วิชาทหาร 1",               en: "Military Science 1",            credits: 3, grade: null },
    { code: "LG 1001", th: "ภาษาไทย 1",                en: "Thai 1",                        credits: 2, grade: null },
    { code: "LG 1101", th: "ภาษาอังกฤษ 1",             en: "English 1",                     credits: 2, grade: null },
    { code: "SS 1201", th: "หลักรัฐศาสตร์",            en: "Principles of Political Science", credits: 3, grade: null },
    { code: "IE 1701", th: "แนวคิดและทฤษฎีอาวุธ",      en: "Concept and Principle of Weapon", credits: 2, grade: null },
    { code: "PC 1101", th: "จิตวิทยาเบื้องต้น",        en: "Introduction to Psychology",     credits: 3, grade: null },
    { code: "HI 1001", th: "ประวัติศาสตร์ไทย",         en: "Thai History",                  credits: 2, grade: null },
    { code: "PE 1001", th: "พลศึกษา 1",                en: "Physical Education 1",          credits: 1, grade: null },
  ],
};

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

// Migrated from the old src/lib/data/announcements.ts mock — same copy,
// publishAt now relative to seed run time so "x ชม./วัน ที่แล้ว" always
// reads correctly regardless of when this script actually runs.
const FEATURED_SEED = [
  {
    titleTh: "ประกาศตารางสอบกลางภาค ภาคต้น",
    titleEn: "Midterm Exam Schedule — Semester 1",
    tag: "สอบ",
    pinned: true,
    publishAt: hoursAgo(24),
    bodyTh: "กองการศึกษาขอแจ้งตารางสอบกลางภาค ประจำภาคต้น ปีการศึกษา 2569 ดังนี้\n\n• วิชาคณิตศาสตร์ประยุกต์: 15 มิ.ย. 2569 เวลา 08:00–11:00 น. ณ อาคารเรียนรวม ชั้น 2\n• วิชาฟิสิกส์การทหาร: 16 มิ.ย. 2569 เวลา 13:00–16:00 น. ณ ห้อง 301–305\n• วิชาพฤติกรรมมนุษย์และจิตวิทยา: 17 มิ.ย. 2569 เวลา 08:00–11:00 น. ณ อาคารสถาบัน\n• วิชาการทหาร: 18 มิ.ย. 2569 เวลา 13:00–16:00 น. ณ หอประชุม\n\nขอให้นักเรียนนายร้อยทุกนายตรวจสอบตารางสอบอีกครั้ง นำบัตรประจำตัวและอุปกรณ์เครื่องเขียนมาให้พร้อม ห้ามนำโทรศัพท์มือถือเข้าห้องสอบโดยเด็ดขาด หากมีข้อสงสัยติดต่อกองการศึกษาได้ในเวลาราชการ",
    bodyEn: "The Academic Affairs Department announces the Semester 1 midterm exam schedule for Academic Year 2569. Please bring your student ID and writing materials. Mobile phones are strictly prohibited in exam rooms. Contact Academic Affairs during office hours for any questions.",
  },
  {
    titleTh: "ปฏิทินการศึกษา ภาคการศึกษา 1/2569",
    titleEn: "Academic Calendar 1/2569",
    tag: "วิชาการ",
    pinned: true,
    publishAt: hoursAgo(48),
    bodyTh: "กองการศึกษาโรงเรียนนายร้อยพระจุลจอมเกล้าขอแจ้งปฏิทินการศึกษา ภาคการศึกษา 1/2569 เพื่อให้นักเรียนนายร้อยได้วางแผนการเรียนและกิจกรรมล่วงหน้า\n\n📅 กิจกรรมสำคัญ:\n• เปิดภาคการศึกษา: 1 มิ.ย. 2569\n• สอบกลางภาค: 15–22 มิ.ย. 2569\n• วันหยุดพิเศษ (วันเฉลิมพระชนมพรรษา): 28 ก.ค. 2569\n• สอบปลายภาค: 25 ส.ค.–5 ก.ย. 2569\n• ปิดภาคการศึกษา: 10 ก.ย. 2569\n\nสามารถดาวน์โหลดปฏิทินฉบับเต็มได้ที่เว็บไซต์กองการศึกษา หรือติดต่อสอบถามที่ฝ่ายทะเบียนและวัดผล",
    bodyEn: "The CRMA Academic Department announces the Academic Calendar for Semester 1/2569. Key dates include semester opening June 1, midterms June 15–22, royal holiday July 28, final exams August 25 – September 5, and semester end September 10.",
  },
];

const NEWS_SEED = [
  {
    titleTh: "แจ้งเปลี่ยนแปลงห้องสอบกลางภาควิชาคณิตศาสตร์",
    titleEn: "Math Midterm Room Change Notice",
    tag: "สอบ",
    publishAt: hoursAgo(2),
    bodyTh: "กองการศึกษาขอแจ้งเปลี่ยนแปลงห้องสอบวิชาคณิตศาสตร์ประยุกต์ ประจำภาคต้น 2569\n\nเดิม: ห้อง 201–205 อาคารเรียนรวม ชั้น 2\nใหม่: หอประชุมกองพัน ชั้น 1 (รองรับนักเรียนนายร้อยทุกนายในคราวเดียว)\n\nวันและเวลาสอบยังคงเดิม: 15 มิ.ย. 2569 เวลา 08:00–11:00 น.\n\nเหตุผล: เนื่องจากระบบปรับอากาศในห้องเรียน 201–205 ขัดข้อง ทางฝ่ายช่างกำลังดำเนินการซ่อมแซม\n\nขอให้นักเรียนนายร้อยทุกนายเข้าสู่สถานที่สอบใหม่ให้ทันเวลา และตรวจสอบที่นั่งสอบจากรายชื่อที่ประกาศหน้าหอประชุม",
    bodyEn: "The math midterm exam room has changed from Building 201–205 to the Battalion Assembly Hall due to AC system failure. Date and time remain the same: June 15 at 08:00–11:00. Check seat assignments posted at the hall entrance.",
  },
  {
    titleTh: "เปิดรับสมัครแข่งขันกีฬาภายใน ประจำปี 2569",
    titleEn: "Intramural Sports Registration Open 2569",
    tag: "กิจกรรม",
    publishAt: hoursAgo(5),
    bodyTh: "ฝ่ายกีฬาและนันทนาการขอเชิญนักเรียนนายร้อยทุกนายสมัครเข้าร่วมการแข่งขันกีฬาภายใน ประจำปีการศึกษา 2569\n\n🏆 ประเภทกีฬาที่แข่งขัน:\n• ฟุตบอล (ทีม 11 คน)\n• บาสเกตบอล (ทีม 5 คน)\n• วอลเลย์บอล\n• ว่ายน้ำ (บุคคล)\n• วิ่งระยะทาง 5 กม. และ 10 กม.\n• มวยไทย (จับคู่น้ำหนัก)\n\n📋 รับสมัครถึง: 20 มิ.ย. 2569\n🏅 วันแข่งขัน: 25–30 มิ.ย. 2569\n\nสมัครได้ที่ฝ่ายกีฬาและนันทนาการ อาคารพลศึกษา ชั้น 1 หรือผ่านระบบออนไลน์",
    bodyEn: "The Sports & Recreation Department invites all cadets to register for the Annual Intramural Sports Competition 2569. Sports include football, basketball, volleyball, swimming, running (5km & 10km), and Muay Thai. Registration closes June 20. Competition dates: June 25–30.",
  },
  {
    titleTh: "กำหนดการฝึกภาคสนาม ชั้นปี 3 ณ เขาชนไก่",
    titleEn: "Year 3 Field Training Schedule — Khao Chon Kai",
    tag: "ทหาร",
    publishAt: hoursAgo(24),
    bodyTh: "กองพันทหารราบขอแจ้งกำหนดการฝึกภาคสนาม สำหรับนักเรียนนายร้อยชั้นปีที่ 3 ณ พื้นที่ฝึกเขาชนไก่ จ.กาญจนบุรี\n\n📅 วันที่: 1–14 ก.ค. 2569 (14 วัน)\n📍 สถานที่: ค่ายฝึกเขาชนไก่ อ.ไทรโยค จ.กาญจนบุรี\n\n🎒 สิ่งที่ต้องเตรียม:\n• ชุดลายพราง พร้อมสนามจำนวน 3 ชุด\n• รองเท้าป่า สำรอง 1 คู่\n• ถุงนอน และเป้หนัก\n• ยาประจำตัวและยาพื้นฐาน\n• น้ำดื่ม 3 ลิตร/วัน (จัดเตรียมโดยหน่วย)\n\nห้ามนำโทรศัพท์มือถือและอุปกรณ์ไฟฟ้าส่วนตัวเข้าพื้นที่ฝึก กำหนดการอาจมีการเปลี่ยนแปลงตามสภาพอากาศ",
    bodyEn: "Year 3 field training at Khao Chon Kai, Kanchanaburi from July 1–14. Pack 3 sets of combat fatigues, jungle boots, sleeping bag, and personal medications. No personal electronics allowed in the training area. Schedule subject to weather conditions.",
  },
  {
    titleTh: "ขยายเวลาเปิดห้องสมุดช่วงสอบถึง 22:00 น.",
    titleEn: "Library Extended Hours During Exam Period to 22:00",
    tag: "วิชาการ",
    publishAt: hoursAgo(48),
    bodyTh: "ห้องสมุดโรงเรียนนายร้อยพระจุลจอมเกล้าขอแจ้งขยายเวลาเปิดให้บริการในช่วงสอบกลางภาค เพื่ออำนวยความสะดวกแก่นักเรียนนายร้อยในการค้นคว้าและทบทวนบทเรียน\n\n⏰ เวลาเปิดพิเศษ (15–22 มิ.ย. 2569):\nวันจันทร์–ศุกร์: 06:30–22:00 น.\nวันเสาร์–อาทิตย์: 08:00–20:00 น.\n\n📚 บริการพิเศษช่วงสอบ:\n• ห้องศึกษาเดี่ยว (จองล่วงหน้าที่เคาน์เตอร์)\n• ห้องกลุ่ม ขนาด 4–8 คน (ฟรี)\n• บริการพิมพ์เอกสาร A4 ฟรี 20 แผ่น/คน/วัน\n• Wifi ความเร็วสูงตลอด 24 ชม.\n\nขอให้นักเรียนนายร้อยรักษาความสะอาดและความเป็นระเบียบเรียบร้อยของห้องสมุดด้วย",
    bodyEn: "The CRMA Library extends hours during the midterm exam period (June 15–22). Weekdays: 06:30–22:00, Weekends: 08:00–20:00. Special services include private study rooms, group rooms (4–8 persons), free printing (20 sheets/day), and high-speed WiFi.",
  },
];

async function main() {
  // Companies (กองร้อย)
  const companies = await Promise.all(
    ["Co-A", "Co-B", "Co-C", "Co-D", "Co-E"].map((name) =>
      prisma.company.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );
  console.log(`✔ companies: ${companies.length}`);

  // Activity categories
  const activityCats = [
    { nameTh: "กีฬา", nameEn: "Sports", iconKey: "trophy" },
    { nameTh: "วิชาการ", nameEn: "Academic", iconKey: "book" },
    { nameTh: "บำเพ็ญประโยชน์", nameEn: "Volunteer", iconKey: "heart" },
    { nameTh: "ทหาร", nameEn: "Military", iconKey: "shield" },
    { nameTh: "ทั่วไป", nameEn: "General", iconKey: "star" },
  ];
  const actCatResults = await Promise.all(
    activityCats.map((c) =>
      prisma.activityCategory.upsert({
        where: { nameTh: c.nameTh },
        update: {},
        create: c,
      })
    )
  );
  console.log(`✔ activity categories: ${actCatResults.length}`);

  // Report categories
  const reportCats = [
    { nameTh: "ซ่อมแซมสิ่งอำนวยความสะดวก", nameEn: "Facility Repair", iconKey: "wrench" },
    { nameTh: "ความปลอดภัย", nameEn: "Safety", iconKey: "alert-triangle" },
    { nameTh: "ความสะอาด", nameEn: "Cleanliness", iconKey: "trash" },
    { nameTh: "อุปกรณ์ไฟฟ้า", nameEn: "Electrical", iconKey: "zap" },
    { nameTh: "อื่น ๆ", nameEn: "Other", iconKey: "more-horizontal" },
  ];
  const repCatResults = await Promise.all(
    reportCats.map((c) =>
      prisma.reportCategory.upsert({
        where: { nameTh: c.nameTh },
        update: {},
        create: c,
      })
    )
  );
  console.log(`✔ report categories: ${repCatResults.length}`);

  // Maintenance teams
  const teams = [
    { nameTh: "ช่างไฟฟ้า", nameEn: "Electrical" },
    { nameTh: "ช่างประปา", nameEn: "Plumbing" },
    { nameTh: "ช่างทั่วไป", nameEn: "General Maintenance" },
    { nameTh: "ความปลอดภัย", nameEn: "Security" },
  ];
  const teamResults = await Promise.all(
    teams.map((t) =>
      prisma.maintenanceTeam.upsert({
        where: { nameTh: t.nameTh },
        update: {},
        create: t,
      })
    )
  );
  console.log(`✔ maintenance teams: ${teamResults.length}`);

  // Lost & Found categories
  const lfCats = [
    { nameTh: "เครื่องแต่งกาย", nameEn: "Uniform / Clothing", iconKey: "shirt" },
    { nameTh: "อุปกรณ์การเรียน", nameEn: "Study Equipment", iconKey: "book-open" },
    { nameTh: "อุปกรณ์กีฬา", nameEn: "Sports Equipment", iconKey: "activity" },
    { nameTh: "อิเล็กทรอนิกส์", nameEn: "Electronics", iconKey: "smartphone" },
    { nameTh: "เอกสาร", nameEn: "Documents", iconKey: "file-text" },
    { nameTh: "อื่น ๆ", nameEn: "Other", iconKey: "package" },
  ];
  const lfCatResults = await Promise.all(
    lfCats.map((c) =>
      prisma.lostFoundCategory.upsert({
        where: { nameTh: c.nameTh },
        update: {},
        create: c,
      })
    )
  );
  console.log(`✔ lost & found categories: ${lfCatResults.length}`);

  // Service categories + items
  const serviceData = [
    {
      category: { nameTh: "สวัสดิการ", nameEn: "Welfare", iconKey: "heart", sortOrder: 1 },
      items: [
        { nameTh: "ร้านค้าสวัสดิการ", nameEn: "Welfare Store", url: null, iconKey: "shopping-bag", sortOrder: 1 },
        { nameTh: "ห้องพยาบาล", nameEn: "Medical Room", url: null, iconKey: "plus-circle", sortOrder: 2 },
      ],
    },
    {
      category: { nameTh: "ข้อมูลการศึกษา", nameEn: "Academic Info", iconKey: "graduation-cap", sortOrder: 2 },
      items: [
        { nameTh: "ระบบตารางสอน", nameEn: "Class Schedule", url: "/class", iconKey: "calendar", sortOrder: 1 },
        { nameTh: "ปฏิทินการศึกษา", nameEn: "Academic Calendar", url: "/calendar", iconKey: "calendar-days", sortOrder: 2 },
      ],
    },
    {
      category: { nameTh: "ช่องทางติดต่อ", nameEn: "Contact", iconKey: "phone", sortOrder: 3 },
      items: [
        { nameTh: "สายด่วน", nameEn: "Hotline", url: "tel:+66XXXXXXXXX", iconKey: "phone", sortOrder: 1 },
        { nameTh: "เว็บไซต์โรงเรียน", nameEn: "School Website", url: "https://www.crma.ac.th", iconKey: "globe", sortOrder: 2 },
      ],
    },
  ];

  for (const { category, items } of serviceData) {
    const cat = await prisma.serviceCategory.upsert({
      where: { nameTh: category.nameTh },
      update: {},
      create: category,
    });
    for (const item of items) {
      await prisma.serviceItem.upsert({
        where: {
          // no unique on name alone — use compound check via findFirst + create
          // Prisma requires a unique field; use a synthetic approach
          // We'll skip upsert and use createOrUpdate pattern
          id: `svc-${cat.id}-${item.sortOrder}`,
        },
        update: {},
        create: { ...item, categoryId: cat.id, id: `svc-${cat.id}-${item.sortOrder}` },
      });
    }
  }
  console.log(`✔ service categories + items`);

  // Synthetic cadet (for local dev/testing)
  const devUser = await prisma.user.upsert({
    where: { email: "dev.cadet@crma.ac.th" },
    update: {},
    create: {
      email: "dev.cadet@crma.ac.th",
      displayName: "นนร. ทดสอบ ระบบ",
      role: Role.cadet,
      cadetProfile: {
        create: {
          studentCode: "67-0000",
          thaiName: "ทดสอบ ระบบ",
          englishName: "Test Cadet",
          rank: "2LT",
          yearLevel: 1,
          companyId: companies[0].id,
          battalion: "BN-1",
        },
      },
    },
  });
  console.log(`✔ dev cadet: ${devUser.email}`);

  // Semesters + grades (generated — pilot cadet has no real transcript yet)
  const semesterRows = await Promise.all(
    SEMESTERS.map((s) =>
      prisma.semester.upsert({
        where: { label: s.label },
        update: { order: s.order, isCurrent: s.isCurrent },
        create: s,
      })
    )
  );
  const semesterByLabel = new Map(semesterRows.map((s) => [s.label, s]));

  const cadetProfile = await prisma.cadetProfile.findUnique({ where: { userId: devUser.id } });
  if (cadetProfile) {
    let gradeCount = 0;
    for (const [label, rows] of Object.entries(GRADES_BY_SEMESTER)) {
      const semester = semesterByLabel.get(label)!;
      for (const row of rows) {
        await prisma.grade.upsert({
          where: { cadetProfileId_semesterId_courseCode: { cadetProfileId: cadetProfile.id, semesterId: semester.id, courseCode: row.code } },
          update: { courseNameTh: row.th, courseNameEn: row.en, credits: row.credits, grade: row.grade },
          create: {
            cadetProfileId: cadetProfile.id,
            semesterId: semester.id,
            courseCode: row.code,
            courseNameTh: row.th,
            courseNameEn: row.en,
            credits: row.credits,
            grade: row.grade,
          },
        });
        gradeCount++;
      }
    }
    console.log(`✔ semesters: ${semesterRows.length}, grades: ${gradeCount}`);

    await prisma.cadetProfile.update({
      where: { id: cadetProfile.id },
      data: { yearRank: 12, yearRankTotal: 118 },
    });
    console.log(`✔ cadet year rank set`);
  }

  // Announcements + news (migrated from the old client-side mock)
  let announcementCount = 0;
  for (const a of FEATURED_SEED) {
    const existing = await prisma.announcement.findFirst({ where: { titleTh: a.titleTh } });
    if (existing) {
      await prisma.announcement.update({ where: { id: existing.id }, data: a });
    } else {
      await prisma.announcement.create({ data: a });
    }
    announcementCount++;
  }
  console.log(`✔ announcements: ${announcementCount}`);

  let newsCount = 0;
  for (const n of NEWS_SEED) {
    const existing = await prisma.newsItem.findFirst({ where: { titleTh: n.titleTh } });
    if (existing) {
      await prisma.newsItem.update({ where: { id: existing.id }, data: n });
    } else {
      await prisma.newsItem.create({ data: n });
    }
    newsCount++;
  }
  console.log(`✔ news items: ${newsCount}`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
