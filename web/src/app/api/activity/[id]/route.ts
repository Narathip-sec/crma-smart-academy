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
      _count: { select: { attendees: true } },
    },
  });
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { attendees, images, _count, ...rest } = event;
  return NextResponse.json({
    ...rest,
    imageUrl: images[0]?.url ?? null,
    attendeeCount: _count.attendees,
    myRsvp: attendees.length > 0,
  });
}
