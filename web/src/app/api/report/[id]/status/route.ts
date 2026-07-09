// POST /api/report/:id/status — update report ticket status.
// Requires: moderator or command role.

import { prisma } from "@/lib/db";
import { writeAuditLog, ipFrom } from "@/lib/audit";
import { requireModerator } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/auth";
import { ReportStatus } from "@prisma/client";
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

  const ticket = await prisma.reportTicket.findUnique({ where: { id } });
  if (!ticket) return Response.json({ error: "not found" }, { status: 404 });

  const body = (await req.json()) as { status: ReportStatus; note?: string };
  if (!body.status || !Object.values(ReportStatus).includes(body.status)) {
    return Response.json({ error: "valid status required" }, { status: 400 });
  }

  const [updated] = await prisma.$transaction([
    prisma.reportTicket.update({
      where: { id },
      data: { status: body.status },
    }),
    prisma.reportStatusEvent.create({
      data: {
        ticketId: id,
        actorId: user.id,
        fromStatus: ticket.status,
        toStatus: body.status,
        note: body.note,
      },
    }),
  ]);

  await writeAuditLog({
    actorId: user.id,
    action: "report.status_change",
    entityType: "ReportTicket",
    entityId: id,
    meta: { from: ticket.status, to: body.status, note: body.note },
    ip: ipFrom(req),
  });

  return Response.json(updated);
}
