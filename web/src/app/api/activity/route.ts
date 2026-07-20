// GET  /api/activity           → approved activity events (open/closed)
// POST /api/activity           → create event (auto-approved, no moderator UI exists
//                                 to unblock a pending queue; audit-logged)

import { prisma } from "@/lib/db";
import { writeAuditLog, ipFrom } from "@/lib/audit";
import { requireCadet } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/auth";
import { ActivityStatus, ModerationStatus } from "@prisma/client";
import { boundedString, boundedStringOptional, validDate, intInRange, isAllowedBlobUrl } from "@/lib/validate";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

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
      images: { select: { url: true } },
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
      imageUrl: e.images[0]?.url ?? null,
      category: e.category ? { id: e.category.id, nameTh: e.category.nameTh, nameEn: e.category.nameEn } : null,
    }))
  );
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
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
    coverImageUrl?: string;
  };

  if (!boundedString(body.titleTh, 200) || !validDate(body.startAt)) {
    return Response.json({ error: "titleTh (≤200) and a valid startAt required" }, { status: 400 });
  }
  if (!boundedStringOptional(body.descriptionTh, 2000) || !boundedStringOptional(body.location, 200)) {
    return Response.json({ error: "descriptionTh/location too long" }, { status: 400 });
  }
  if (body.endAt !== undefined && !validDate(body.endAt)) {
    return Response.json({ error: "endAt must be a valid date" }, { status: 400 });
  }
  if (body.maxAttendees !== undefined && !intInRange(body.maxAttendees, 1, 10000)) {
    return Response.json({ error: "maxAttendees must be an integer between 1 and 10000" }, { status: 400 });
  }
  if (body.coverImageUrl !== undefined && !isAllowedBlobUrl(body.coverImageUrl)) {
    return Response.json({ error: "coverImageUrl must be an uploaded blob URL" }, { status: 400 });
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
      status: ActivityStatus.open,
      modStatus: ModerationStatus.approved,
    },
  });

  if (body.coverImageUrl) {
    const mimeType = body.coverImageUrl.match(/\.png(\?|$)/i) ? "image/png"
      : body.coverImageUrl.match(/\.webp(\?|$)/i) ? "image/webp"
      : "image/jpeg";
    await prisma.fileAsset.create({
      data: { url: body.coverImageUrl, mimeType, activityEventId: event.id },
    });
  }

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
