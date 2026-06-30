// GET /api/meals?month=YYYY-MM         → all MealItem rows for that month
// GET /api/meals?date=YYYY-MM-DD       → rows for that day (breakfast/lunch/dinner)
// GET /api/meals?from=YYYY-MM-DD&to=YYYY-MM-DD → rows in date range [from, to)

import { prisma } from "@/lib/db";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const monthParam = searchParams.get("month"); // "2026-05"
  const dateParam  = searchParams.get("date");   // "2026-05-01"
  const fromParam  = searchParams.get("from");   // "2026-06-30"
  const toParam    = searchParams.get("to");     // "2026-07-07"

  if (!monthParam && !dateParam && !(fromParam && toParam)) {
    return Response.json(
      { error: "provide ?month=YYYY-MM, ?date=YYYY-MM-DD, or ?from=&to=" },
      { status: 400 }
    );
  }

  if (fromParam && toParam) {
    const items = await prisma.mealItem.findMany({
      where: { date: { gte: new Date(fromParam), lt: new Date(toParam) } },
      orderBy: [{ date: "asc" }, { mealType: "asc" }],
    });
    return Response.json(items);
  }

  if (dateParam) {
    const items = await prisma.mealItem.findMany({
      where: { date: new Date(dateParam) },
      orderBy: { mealType: "asc" },
    });
    return Response.json(items);
  }

  const [year, month] = monthParam!.split("-").map(Number);
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 1);

  const items = await prisma.mealItem.findMany({
    where: { date: { gte: from, lt: to } },
    orderBy: [{ date: "asc" }, { mealType: "asc" }],
  });

  return Response.json(items);
}
