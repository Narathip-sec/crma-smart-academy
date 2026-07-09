// POST /api/lost-found/:id/claim — file a claim on a lost/found item.
// Any cadet+ can claim; action is audit-logged.

import { prisma } from "@/lib/db";
import { writeAuditLog, ipFrom } from "@/lib/audit";
import { requireCadet } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/auth";
import { LostFoundStatus } from "@prisma/client";
import type { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const denied = requireCadet(user.role);
  if (denied) return denied;

  const item = await prisma.lostFoundItem.findUnique({ where: { id } });
  if (!item) return Response.json({ error: "not found" }, { status: 404 });
  if (item.status === LostFoundStatus.claimed || item.status === LostFoundStatus.closed) {
    return Response.json({ error: "item already claimed or closed" }, { status: 409 });
  }

  const body = (await req.json()) as { note?: string };

  const [claim] = await prisma.$transaction([
    prisma.lostFoundClaim.create({
      data: { itemId: id, claimantId: user.id, note: body.note },
    }),
    prisma.lostFoundItem.update({
      where: { id },
      data: { status: LostFoundStatus.matched },
    }),
    prisma.lostFoundStatusEvent.create({
      data: {
        itemId: id,
        actorId: user.id,
        fromStatus: item.status,
        toStatus: LostFoundStatus.matched,
        note: "claim filed",
      },
    }),
  ]);

  await writeAuditLog({
    actorId: user.id,
    action: "lost_found.claim",
    entityType: "LostFoundItem",
    entityId: id,
    meta: { claimId: claim.id, note: body.note },
    ip: ipFrom(req),
  });

  return Response.json(claim, { status: 201 });
}
