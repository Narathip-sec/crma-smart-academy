// GET /api/me — current user identity.
// P4: replace dev lookup with real LIFF profile binding.
// Until then: DEV_USER_EMAIL env var selects the user; defaults to seeded dev cadet.

import { prisma } from "@/lib/db";

const DEV_EMAIL = process.env.DEV_USER_EMAIL ?? "dev.cadet@crma.ac.th";

export async function GET() {
  const user = await prisma.user.findUnique({
    where: { email: DEV_EMAIL },
    include: {
      cadetProfile: { include: { company: true } },
      lineAccount: true,
    },
  });

  if (!user) {
    return Response.json({ error: "user not found" }, { status: 404 });
  }

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
  });
}
