import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const event = await prisma.activityEvent.findUnique({
    where: { id },
    include: {
      category: true,
      images: { select: { url: true } },
      attendees: { select: { id: true, userId: true, attended: true } },
      _count: { select: { attendees: true } },
    },
  });
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ...event, imageUrl: event.images[0]?.url ?? null });
}
