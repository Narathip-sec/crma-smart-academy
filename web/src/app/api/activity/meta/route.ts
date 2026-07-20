// GET /api/activity/meta → categories for activity form

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const categories = await prisma.activityCategory.findMany({
    select: { id: true, nameTh: true, nameEn: true },
    orderBy: { nameTh: "asc" },
  });
  return Response.json({ categories });
}
