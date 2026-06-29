import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [categories, teams] = await Promise.all([
    prisma.reportCategory.findMany({ orderBy: { nameTh: "asc" } }),
    prisma.maintenanceTeam.findMany({ orderBy: { nameTh: "asc" } }),
  ]);
  return NextResponse.json({ categories, teams });
}
