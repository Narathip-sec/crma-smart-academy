import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const item = await prisma.lostFoundItem.findUnique({
    where: { id },
    include: {
      category: true,
      reporter: { select: { displayName: true } },
      claims: { select: { id: true, claimantId: true, note: true, claimedAt: true } },
      attachments: { select: { id: true, assetId: true } },
    },
  });
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(item);
}
