// GET  /api/lost-found  → items (cadet: own; moderator: all)
// POST /api/lost-found  → report a lost/found item

import { prisma } from "@/lib/db";
import { writeAuditLog, ipFrom } from "@/lib/audit";
import { requireCadet, hasRole } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/auth";
import { Role, LostFoundType } from "@prisma/client";
import { boundedString, boundedStringOptional, validDate, isAllowedBlobUrl } from "@/lib/validate";
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
    type?: string;
    titleTh: string;
    descriptionTh: string;
    categoryId?: string;
    foundAt?: string;
    foundLocation?: string;
    photoUrl?: string;
  };

  if (!boundedString(body.titleTh, 200) || !boundedString(body.descriptionTh, 2000)) {
    return Response.json({ error: "titleTh (≤200) and descriptionTh (≤2000) required" }, { status: 400 });
  }
  if (body.type !== undefined && body.type !== LostFoundType.lost && body.type !== LostFoundType.found) {
    return Response.json({ error: "type must be lost or found" }, { status: 400 });
  }
  if (!boundedStringOptional(body.foundLocation, 200)) {
    return Response.json({ error: "foundLocation too long" }, { status: 400 });
  }
  if (body.foundAt !== undefined && !validDate(body.foundAt)) {
    return Response.json({ error: "foundAt must be a valid date" }, { status: 400 });
  }
  if (body.photoUrl !== undefined && !isAllowedBlobUrl(body.photoUrl)) {
    return Response.json({ error: "photoUrl must be an uploaded blob URL" }, { status: 400 });
  }

  const item = await prisma.lostFoundItem.create({
    data: {
      reporterId: user.id,
      categoryId: body.categoryId,
      type: (body.type as LostFoundType) ?? LostFoundType.found,
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
