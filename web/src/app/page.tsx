import { TopBar } from "@/components/shell/top-bar";
import { ProfileBanner } from "@/components/home/profile-banner";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { QuickServices } from "@/components/home/quick-services";
import { MyDay } from "@/components/home/my-day";
import { NewsFeed } from "@/components/home/news-feed";
import { prisma } from "@/lib/db";

const DEV_EMAIL = process.env.DEV_USER_EMAIL ?? "dev.cadet@crma.ac.th";

export default async function HomePage() {
  const user = await prisma.user.findUnique({
    where: { email: DEV_EMAIL },
    include: { cadetProfile: { select: { thaiName: true } } },
  });
  const name = user?.cadetProfile?.thaiName
    ? `นนร.${user.cadetProfile.thaiName}`
    : user?.displayName ?? "นนร.";

  return (
    <>
      <TopBar name={name} unread={3} />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <ProfileBanner />
        <HeroCarousel />
        <QuickServices />
        <MyDay />
        <NewsFeed />
      </div>
    </>
  );
}
