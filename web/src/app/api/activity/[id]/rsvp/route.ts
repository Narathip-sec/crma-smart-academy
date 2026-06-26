// POST /api/activity/:id/rsvp — register or cancel attendance.
// Body: { action: "register" | "cancel" }

import { prisma } from "@/lib/db";
import { ActivityStatus, ModerationStatus } from "@prisma/client";
import type { NextRequest } from "next/server";

const DEV_EMAIL = process.env.DEV_USER_EMAIL ?? "dev.cadet@crma.ac.th";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { email: DEV_EMAIL } });
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const event = await prisma.activityEvent.findUnique({ where: { id } });
  if (!event) return Response.json({ error: "not found" }, { status: 404 });
  if (event.modStatus !== ModerationStatus.approved) {
    return Response.json({ error: "event not available" }, { status: 409 });
  }
  if (event.status !== ActivityStatus.open) {
    return Response.json({ error: "registration closed" }, { status: 409 });
  }

  const body = (await req.json()) as { action?: "register" | "cancel" };
  const action = body.action ?? "register";

  if (action === "cancel") {
    await prisma.activityAttendee.deleteMany({
      where: { activityId: id, userId: user.id },
    });
    return Response.json({ registered: false });
  }

  if (event.maxAttendees) {
    const count = await prisma.activityAttendee.count({ where: { activityId: id } });
    if (count >= event.maxAttendees) {
      return Response.json({ error: "event full" }, { status: 409 });
    }
  }

  const attendee = await prisma.activityAttendee.upsert({
    where: { activityId_userId: { activityId: id, userId: user.id } },
    update: {},
    create: { activityId: id, userId: user.id },
  });

  return Response.json({ registered: true, attendee });
}
