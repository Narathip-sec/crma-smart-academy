// GET /api/lost-found/meta → categories for lost-found form

import { prisma } from "@/lib/db";

export async function GET() {
  const categories = await prisma.lostFoundCategory.findMany({
    select: { id: true, nameTh: true, nameEn: true },
    orderBy: { nameTh: "asc" },
  });
  return Response.json({ categories });
}
