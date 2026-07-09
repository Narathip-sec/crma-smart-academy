// GET  /api/report  → tickets (cadet: own; moderator/command: all)
// POST /api/report  → file new report ticket (any cadet+)

import { prisma } from "@/lib/db";
import { writeAuditLog, ipFrom } from "@/lib/audit";
import { requireCadet, hasRole } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";
import type { NextRequest } from "next/server";

async function nextTicketNo(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.reportTicket.count();
  return `RPT-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const denied = requireCadet(user.role);
  if (denied) return denied;

  const isMod = hasRole(user.role, [Role.moderator, Role.command]);

  const tickets = await prisma.reportTicket.findMany({
    where: isMod ? {} : { reporterId: user.id },
    include: {
      category: true,
      team: true,
      statusEvents: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(tickets);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const denied = requireCadet(user.role);
  if (denied) return denied;

  const body = (await req.json()) as {
    titleTh: string;
    descriptionTh: string;
    categoryId?: string;
    teamId?: string;
    locationNameTh?: string;
    photoUrl?: string;
  };

  if (!body.titleTh || !body.descriptionTh) {
    return Response.json({ error: "titleTh and descriptionTh required" }, { status: 400 });
  }

  let locationId: string | undefined;
  if (body.locationNameTh) {
    const loc = await prisma.reportLocation.create({
      data: { nameTh: body.locationNameTh },
    });
    locationId = loc.id;
  }

  const ticketNo = await nextTicketNo();

  const ticket = await prisma.reportTicket.create({
    data: {
      ticketNo,
      reporterId: user.id,
      categoryId: body.categoryId,
      teamId: body.teamId,
      titleTh: body.titleTh,
      descriptionTh: body.descriptionTh,
      locationId,
      statusEvents: {
        create: { actorId: user.id, toStatus: "open" },
      },
    },
    include: { category: true, team: true, location: true },
  });

  if (body.photoUrl) {
    const mimeType = body.photoUrl.match(/\.png(\?|$)/i) ? "image/png"
      : body.photoUrl.match(/\.webp(\?|$)/i) ? "image/webp"
      : "image/jpeg";
    const asset = await prisma.fileAsset.create({
      data: { url: body.photoUrl, mimeType },
    });
    await prisma.reportAttachment.create({
      data: { ticketId: ticket.id, assetId: asset.id },
    });
  }

  await writeAuditLog({
    actorId: user.id,
    action: "report.create",
    entityType: "ReportTicket",
    entityId: ticket.id,
    meta: { ticketNo },
    ip: ipFrom(req),
  });

  return Response.json(ticket, { status: 201 });
}
