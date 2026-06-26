// GET  /api/lost-found  → items (cadet: own; moderator: all)
// POST /api/lost-found  → report a lost/found item

import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import type { NextRequest } from "next/server";

const DEV_EMAIL = process.env.DEV_USER_EMAIL ?? "dev.cadet@crma.ac.th";

export async function GET(req: NextRequest) {
  const user = await prisma.user.findUnique({ where: { email: DEV_EMAIL } });
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const statusFilter = searchParams.get("status");
  const isMod = user.role === Role.moderator || user.role === Role.command;

  const items = await prisma.lostFoundItem.findMany({
    where: {
      ...(isMod ? {} : { reporterId: user.id }),
      ...(statusFilter ? { status: statusFilter as never } : {}),
    },
    include: {
      category: true,
      _count: { select: { claims: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(items);
}

export async function POST(req: NextRequest) {
  const user = await prisma.user.findUnique({ where: { email: DEV_EMAIL } });
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await req.json()) as {
    titleTh: string;
    descriptionTh: string;
    categoryId?: string;
    foundAt?: string;
    foundLocation?: string;
  };

  if (!body.titleTh || !body.descriptionTh) {
    return Response.json({ error: "titleTh and descriptionTh required" }, { status: 400 });
  }

  const item = await prisma.lostFoundItem.create({
    data: {
      reporterId: user.id,
      categoryId: body.categoryId,
      titleTh: body.titleTh,
      descriptionTh: body.descriptionTh,
      foundAt: body.foundAt ? new Date(body.foundAt) : undefined,
      foundLocation: body.foundLocation,
      statusEvents: {
        create: { actorId: user.id, toStatus: "reported" },
      },
    },
    include: { category: true },
  });

  return Response.json(item, { status: 201 });
}
