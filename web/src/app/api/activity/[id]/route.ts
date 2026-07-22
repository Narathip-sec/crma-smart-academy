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
  const event = await prisma.activityEvent.findUnique({
    where: { id },
    include: {
      category: true,
      images: { select: { url: true } },
      attendees: { where: { userId: user.id }, select: { id: true } },
      creator: { select: { displayName: true, cadetProfile: { select: { thaiName: true } } } },
      _count: { select: { attendees: true } },
    },
  });
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  const isOwner = event.creatorId === user.id;

  let attendeeList: { name: string; registeredAt: Date }[] | undefined;
  if (isOwner) {
    const rows = await prisma.activityAttendee.findMany({
      where: { activityId: id },
      orderBy: { registeredAt: "asc" },
      select: {
        registeredAt: true,
        user: { select: { displayName: true, cadetProfile: { select: { thaiName: true } } } },
      },
    });
    attendeeList = rows.map(r => ({
      name: r.user.cadetProfile?.thaiName ?? r.user.displayName,
      registeredAt: r.registeredAt,
    }));
  }

  const { attendees, images, _count, creator, ...rest } = event;
  return NextResponse.json({
    ...rest,
    imageUrl: images[0]?.url ?? null,
    attendeeCount: _count.attendees,
    myRsvp: attendees.length > 0,
    creatorName: creator.cadetProfile?.thaiName ?? creator.displayName,
    isOwner,
    attendeeList,
  });
}
