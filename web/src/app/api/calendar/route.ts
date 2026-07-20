// GET /api/calendar?year=2026             → all events for that Gregorian year
// GET /api/calendar?academicYear=2569     → events by Thai academic year (พ.ศ.)
// GET /api/calendar?category=holiday      → filter by CalendarCategory

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CalendarCategory, Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const yearParam = searchParams.get("year");
  const academicYearParam = searchParams.get("academicYear");
  const categoryParam = searchParams.get("category") as CalendarCategory | null;

  const where: Prisma.AcademicCalendarEventWhereInput = {};

  if (academicYearParam) {
    where.academicYear = Number(academicYearParam);
  } else if (yearParam) {
    const y = Number(yearParam);
    where.date = { gte: new Date(`${y}-01-01`), lt: new Date(`${y + 1}-01-01`) };
  }

  if (categoryParam && Object.values(CalendarCategory).includes(categoryParam)) {
    where.category = categoryParam;
  }

  const events = await prisma.academicCalendarEvent.findMany({
    where,
    orderBy: { date: "asc" },
  });

  return Response.json(events);
}
