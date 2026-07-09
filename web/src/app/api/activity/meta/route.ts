// GET /api/activity/meta → categories for activity form

import { prisma } from "@/lib/db";

export async function GET() {
  const categories = await prisma.activityCategory.findMany({
    select: { id: true, nameTh: true, nameEn: true },
    orderBy: { nameTh: "asc" },
  });
  return Response.json({ categories });
}
