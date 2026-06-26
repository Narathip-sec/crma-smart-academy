// GET  /api/todo           → tasks assigned to current user
// POST /api/todo           → create task (instructor/command only — P3-6 RBAC tightens this)

import { prisma } from "@/lib/db";
import type { NextRequest } from "next/server";

const DEV_EMAIL = process.env.DEV_USER_EMAIL ?? "dev.cadet@crma.ac.th";

async function resolveUser() {
  return prisma.user.findUnique({ where: { email: DEV_EMAIL } });
}

export async function GET() {
  const user = await resolveUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const assignments = await prisma.taskAssignment.findMany({
    where: { userId: user.id },
    include: {
      task: {
        include: {
          completions: { where: { userId: user.id } },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  type AssignRow = (typeof assignments)[number];
  const tasks = assignments.map(({ task }: AssignRow) => ({
    id: task.id,
    titleTh: task.titleTh,
    titleEn: task.titleEn,
    descriptionTh: task.descriptionTh,
    dueAt: task.dueAt,
    done: task.completions.length > 0,
  }));

  return Response.json(tasks);
}

export async function POST(req: NextRequest) {
  const user = await resolveUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await req.json()) as {
    titleTh: string;
    titleEn?: string;
    descriptionTh?: string;
    dueAt?: string;
    assigneeIds?: string[];
  };

  if (!body.titleTh) {
    return Response.json({ error: "titleTh required" }, { status: 400 });
  }

  const assigneeIds = body.assigneeIds ?? [user.id];

  const task = await prisma.task.create({
    data: {
      titleTh: body.titleTh,
      titleEn: body.titleEn,
      descriptionTh: body.descriptionTh,
      dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
      assignments: {
        create: assigneeIds.map((uid) => ({ userId: uid })),
      },
    },
  });

  return Response.json(task, { status: 201 });
}
