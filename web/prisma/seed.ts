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

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
