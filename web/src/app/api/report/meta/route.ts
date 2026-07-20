import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const [categories, teams] = await Promise.all([
    prisma.reportCategory.findMany({ orderBy: { nameTh: "asc" } }),
    prisma.maintenanceTeam.findMany({ orderBy: { nameTh: "asc" } }),
  ]);
  return NextResponse.json({ categories, teams });
}
