// POST /api/todo/:id/complete — mark a task done for current user.

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { writeAuditLog, ipFrom } from "@/lib/audit";
import type { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const assignment = await prisma.taskAssignment.findUnique({
    where: { taskId_userId: { taskId: id, userId: user.id } },
  });
  if (!assignment) return Response.json({ error: "not found" }, { status: 404 });

  const completion = await prisma.taskCompletion.upsert({
    where: { taskId_userId: { taskId: id, userId: user.id } },
    update: { completedAt: new Date() },
    create: { taskId: id, userId: user.id },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "todo.complete",
    entityType: "Task",
    entityId: id,
    ip: ipFrom(req),
  });

  return Response.json(completion);
}
