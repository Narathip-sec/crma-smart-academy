// GET  /api/report  → tickets for current user (cadet sees own; moderator sees all)
// POST /api/report  → file new report ticket

import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

const DEV_EMAIL = process.env.DEV_USER_EMAIL ?? "dev.cadet@crma.ac.th";

async function nextTicketNo(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.reportTicket.count();
  return `RPT-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function GET() {
  const user = await prisma.user.findUnique({ where: { email: DEV_EMAIL } });
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const isMod = user.role === Role.moderator || user.role === Role.command;

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
  const user = await prisma.user.findUnique({ where: { email: DEV_EMAIL } });
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await req.json()) as {
    titleTh: string;
    descriptionTh: string;
    categoryId?: string;
    teamId?: string;
    locationNameTh?: string;
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
        create: {
          actorId: user.id,
          toStatus: "open",
        },
      },
    },
    include: { category: true, team: true, location: true },
  });

  return Response.json(ticket, { status: 201 });
}
