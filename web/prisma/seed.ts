import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

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

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
