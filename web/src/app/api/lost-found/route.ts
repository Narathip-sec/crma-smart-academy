// GET  /api/lost-found  → items (cadet: own; moderator: all)
// POST /api/lost-found  → report a lost/found item

import { prisma } from "@/lib/db";
import { writeAuditLog, ipFrom } from "@/lib/audit";
import { requireCadet, hasRole } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/auth";
import { Role } from "@prisma/client";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const denied = requireCadet(user.role);
  if (denied) return denied;

  const { searchParams } = req.nextUrl;
  const statusFilter = searchParams.get("status");
  const isMod = hasRole(user.role, [Role.moderator, Role.command]);

  const items = await prisma.lostFoundItem.findMany({
    where: {
      ...(isMod ? {} : { reporterId: user.id }),
      ...(statusFilter ? { status: statusFilter as never } : {}),
    },
    include: {
      category: true,
      attachments: { select: { asset: { select: { url: true } } } },
      _count: { select: { claims: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(items);
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
    foundAt?: string;
    foundLocation?: string;
    photoUrl?: string;
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

  if (body.photoUrl) {
    const mimeType = body.photoUrl.match(/\.png(\?|$)/i) ? "image/png"
      : body.photoUrl.match(/\.webp(\?|$)/i) ? "image/webp"
      : "image/jpeg";
    const asset = await prisma.fileAsset.create({
      data: { url: body.photoUrl, mimeType },
    });
    await prisma.lostFoundAttachment.create({
      data: { itemId: item.id, assetId: asset.id },
    });
  }

  await writeAuditLog({
    actorId: user.id,
    action: "lost_found.report",
    entityType: "LostFoundItem",
    entityId: item.id,
    meta: { titleTh: item.titleTh },
    ip: ipFrom(req),
  });

  return Response.json(item, { status: 201 });
}
