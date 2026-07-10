import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await prisma.activityEvent
    .findUnique({
      where: { id },
      select: { titleTh: true, titleEn: true, descriptionTh: true, location: true },
    })
    .catch(() => null);

  if (!event) {
    return { title: "กิจกรรม · Activity" };
  }

  const title = event.titleTh;
  const description =
    event.descriptionTh?.slice(0, 160) ??
    (event.location ? `สถานที่: ${event.location}` : undefined);

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default function ActivityDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
