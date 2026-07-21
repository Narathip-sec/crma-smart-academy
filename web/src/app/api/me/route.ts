// GET /api/me — current user identity.
// Real path: resolved via the session cookie set by POST /api/auth/line.
// Dev fallback (getCurrentUser): DEV_USER_EMAIL, only when LIFF is unconfigured.

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const identity = await getCurrentUser();
  if (!identity) {
    return Response.json({ error: "unauthenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: identity.id },
    include: {
      cadetProfile: { include: { company: true } },
      lineAccount: true,
    },
  });

  if (!user) {
    return Response.json({ error: "user not found" }, { status: 404 });
  }

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, readAt: null },
  });

  return Response.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    cadetProfile: user.cadetProfile
      ? {
          studentCode: user.cadetProfile.studentCode,
          thaiName: user.cadetProfile.thaiName,
          englishName: user.cadetProfile.englishName,
          rank: user.cadetProfile.rank,
          yearLevel: user.cadetProfile.yearLevel,
          battalion: user.cadetProfile.battalion,
          company: user.cadetProfile.company.name,
        }
      : null,
    lineLinked: !!user.lineAccount,
    unreadCount,
  });
}
