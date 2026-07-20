import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { id } = await params;
  const item = await prisma.lostFoundItem.findUnique({
    where: { id },
    include: {
      category: true,
      reporter: { select: { displayName: true } },
      claims: { where: { claimantId: user.id }, select: { id: true } },
      attachments: { select: { id: true, asset: { select: { url: true } } } },
      _count: { select: { claims: true } },
    },
  });
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { claims, _count, ...rest } = item;
  return NextResponse.json({
    ...rest,
    claimCount: _count.claims,
    myClaim: claims.length > 0,
  });
}
