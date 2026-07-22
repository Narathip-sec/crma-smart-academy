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
      reporter: { select: { displayName: true, cadetProfile: { select: { thaiName: true } } } },
      claims: { where: { claimantId: user.id }, select: { id: true } },
      attachments: { select: { id: true, asset: { select: { url: true } } } },
      _count: { select: { claims: true } },
    },
  });
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });

  const isOwner = item.reporterId === user.id;

  let claimantList: { name: string; claimedAt: Date }[] | undefined;
  if (isOwner) {
    const rows = await prisma.lostFoundClaim.findMany({
      where: { itemId: id },
      orderBy: { claimedAt: "asc" },
      select: {
        claimedAt: true,
        claimant: { select: { displayName: true, cadetProfile: { select: { thaiName: true } } } },
      },
    });
    claimantList = rows.map(r => ({
      name: r.claimant.cadetProfile?.thaiName ?? r.claimant.displayName,
      claimedAt: r.claimedAt,
    }));
  }

  const { claims, _count, reporter, ...rest } = item;
  return NextResponse.json({
    ...rest,
    claimCount: _count.claims,
    myClaim: claims.length > 0,
    reporterName: reporter.cadetProfile?.thaiName ?? reporter.displayName,
    isOwner,
    claimantList,
  });
}
