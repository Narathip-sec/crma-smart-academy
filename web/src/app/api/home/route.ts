// GET /api/home — aggregate for the home screen My Day widget.
// Returns: today's first class, today's lunch, pending task count, next activity.

import { prisma } from "@/lib/db";
import { ActivityStatus, ModerationStatus, MealType } from "@prisma/client";

const DEV_EMAIL = process.env.DEV_USER_EMAIL ?? "dev.cadet@crma.ac.th";

export async function GET() {
  const user = await prisma.user.findUnique({ where: { email: DEV_EMAIL } });
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [nextClass, todayLunch, pendingTasks, nextActivity] = await Promise.all([
    prisma.classPeriod.findFirst({
      where: { date: todayStart },
      orderBy: { startTime: "asc" },
    }),

    prisma.mealItem.findFirst({
      where: { date: todayStart, mealType: MealType.lunch },
    }),

    prisma.taskAssignment.count({
      where: {
        userId: user.id,
        task: { completions: { none: { userId: user.id } } },
      },
    }),

    prisma.activityEvent.findFirst({
      where: {
        modStatus: ModerationStatus.approved,
        status: ActivityStatus.open,
        startAt: { gte: now },
      },
      include: { category: true },
      orderBy: { startAt: "asc" },
    }),
  ]);

  return Response.json({
    nextClass: nextClass
      ? {
          courseName: nextClass.courseName,
          startTime: nextClass.startTime,
          room: nextClass.room,
          category: nextClass.category,
        }
      : null,
    todayLunch: todayLunch
      ? { menuTh: todayLunch.menuTh, menuEn: todayLunch.menuEn, note: todayLunch.note }
      : null,
    pendingTasks,
    nextActivity: nextActivity
      ? {
          id: nextActivity.id,
          titleTh: nextActivity.titleTh,
          startAt: nextActivity.startAt,
          location: nextActivity.location,
          categoryTh: nextActivity.category?.nameTh ?? null,
        }
      : null,
  });
}
