// POST /api/activity/:id/moderate — approve or reject an activity event.
// Requires: moderator or command role.

import { prisma } from "@/lib/db";
import { writeAuditLog, ipFrom } from "@/lib/audit";
import { requireModerator } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/auth";
import { ActivityStatus, ModerationStatus } from "@prisma/client";
import type { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const denied = requireModerator(user.role);
  if (denied) return denied;

  const event = await prisma.activityEvent.findUnique({ where: { id } });
  if (!event) return Response.json({ error: "not found" }, { status: 404 });

  const body = (await req.json()) as {
    action: "approve" | "reject";
    reason?: string;
  };

  if (!body.action || !["approve", "reject"].includes(body.action)) {
    return Response.json({ error: "action must be approve or reject" }, { status: 400 });
  }

  const newModStatus =
    body.action === "approve" ? ModerationStatus.approved : ModerationStatus.rejected;
  const newStatus =
    body.action === "approve" ? ActivityStatus.open : ActivityStatus.cancelled;

  const [updated] = await prisma.$transaction([
    prisma.activityEvent.update({
      where: { id },
      data: { modStatus: newModStatus, status: newStatus },
    }),
    prisma.activityModerationLog.create({
      data: {
        activityId: id,
        moderatorId: user.id,
        action: body.action,
        reason: body.reason,
      },
    }),
  ]);

  await writeAuditLog({
    actorId: user.id,
    action: `activity.${body.action}`,
    entityType: "ActivityEvent",
    entityId: id,
    meta: { reason: body.reason },
    ip: ipFrom(req),
  });

  return Response.json(updated);
}
