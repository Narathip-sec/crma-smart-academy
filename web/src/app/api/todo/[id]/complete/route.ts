// POST /api/todo/:id/complete — mark a task done for current user.

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return Response.json({ error: "not found" }, { status: 404 });

  const completion = await prisma.taskCompletion.upsert({
    where: { taskId_userId: { taskId: id, userId: user.id } },
    update: { completedAt: new Date() },
    create: { taskId: id, userId: user.id },
  });

  return Response.json(completion);
}
