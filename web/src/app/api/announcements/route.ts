// GET /api/announcements → { featured, news } for the home carousel + announcements pages.

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const now = new Date();

  const [featured, news] = await Promise.all([
    prisma.announcement.findMany({
      where: {
        pinned: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { publishAt: "desc" },
    }),
    prisma.newsItem.findMany({
      orderBy: { publishAt: "desc" },
    }),
  ]);

  return Response.json({
    featured: featured.map((a) => ({ ...a, id: `a_${a.id}` })),
    news: news.map((n) => ({ ...n, id: `n_${n.id}` })),
  });
}
