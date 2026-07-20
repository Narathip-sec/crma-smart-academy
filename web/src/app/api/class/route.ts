// GET /api/class?date=YYYY-MM-DD  → periods for that date
// GET /api/class?dayTh=จันทร์     → periods where dayTh matches (any date in DB)

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date");
  const dayThParam = searchParams.get("dayTh");

  if (!dateParam && !dayThParam) {
    return Response.json(
      { error: "provide ?date=YYYY-MM-DD or ?dayTh=จันทร์" },
      { status: 400 }
    );
  }

  const where = dateParam
    ? { date: new Date(dateParam) }
    : { dayTh: dayThParam! };

  const periods = await prisma.classPeriod.findMany({
    where,
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return Response.json(periods);
}
