// GET  /api/activity           → approved activity events (open/closed)
// POST /api/activity           → create event (pending moderation; audit-logged)

import { prisma } from "@/lib/db";
import { writeAuditLog, ipFrom } from "@/lib/audit";
import { requireCadet } from "@/lib/rbac";
import { ActivityStatus, ModerationStatus } from "@prisma/client";
import type { NextRequest } from "next/server";

const DEV_EMAIL = process.env.DEV_USER_EMAIL ?? "dev.cadet@crma.ac.th";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const categoryId = searchParams.get("categoryId");
  const status = (searchParams.get("status") as ActivityStatus) ?? undefined;

  const events = await prisma.activityEvent.findMany({
    where: {
      modStatus: ModerationStatus.approved,
      ...(categoryId ? { categoryId } : {}),
      ...(status ? { status } : { status: { in: [ActivityStatus.open, ActivityStatus.closed] } }),
    },
    include: {
      category: true,
      _count: { select: { attendees: true } },
    },
    orderBy: { startAt: "asc" },
  });

  type EventRow = (typeof events)[number];
  return Response.json(
    events.map((e: EventRow) => ({
      id: e.id,
      titleTh: e.titleTh,
      titleEn: e.titleEn,
      descriptionTh: e.descriptionTh,
      location: e.location,
      startAt: e.startAt,
      endAt: e.endAt,
      maxAttendees: e.maxAttendees,
      attendeeCount: e._count.attendees,
      status: e.status,
      category: e.category ? { id: e.category.id, nameTh: e.category.nameTh, nameEn: e.category.nameEn } : null,
    }))
  );
}

export async function POST(req: NextRequest) {
  const user = await prisma.user.findUnique({ where: { email: DEV_EMAIL } });
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const denied = requireCadet(user.role);
  if (denied) return denied;

  const body = (await req.json()) as {
    titleTh: string;
    titleEn?: string;
    descriptionTh?: string;
    location?: string;
    startAt: string;
    endAt?: string;
    maxAttendees?: number;
    categoryId?: string;
  };

  if (!body.titleTh || !body.startAt) {
    return Response.json({ error: "titleTh and startAt required" }, { status: 400 });
  }

  const event = await prisma.activityEvent.create({
    data: {
      creatorId: user.id,
      titleTh: body.titleTh,
      titleEn: body.titleEn,
      descriptionTh: body.descriptionTh,
      location: body.location,
      startAt: new Date(body.startAt),
      endAt: body.endAt ? new Date(body.endAt) : undefined,
      maxAttendees: body.maxAttendees,
      categoryId: body.categoryId,
      status: ActivityStatus.draft,
      modStatus: ModerationStatus.pending,
    },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "activity.create",
    entityType: "ActivityEvent",
    entityId: event.id,
    meta: { titleTh: event.titleTh },
    ip: ipFrom(req),
  });

  return Response.json(event, { status: 201 });
}
