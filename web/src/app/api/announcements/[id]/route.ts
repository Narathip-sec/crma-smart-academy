// GET /api/announcements/:id → single Announcement or NewsItem.
// id is prefixed "a_<cuid>" (Announcement) or "n_<cuid>" (NewsItem) — the same
// prefix format returned by GET /api/announcements list.

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const { id } = await params;
  const [prefix, rawId] = [id.slice(0, 2), id.slice(2)];

  if (prefix === "a_") {
    const item = await prisma.announcement.findUnique({ where: { id: rawId } });
    if (!item) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json({ ...item, id: `a_${item.id}`, kind: "announcement" });
  }

  if (prefix === "n_") {
    const item = await prisma.newsItem.findUnique({ where: { id: rawId } });
    if (!item) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json({ ...item, id: `n_${item.id}`, kind: "news" });
  }

  return Response.json({ error: "not found" }, { status: 404 });
}
