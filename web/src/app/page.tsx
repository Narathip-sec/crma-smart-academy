import { TopBar } from "@/components/shell/top-bar";
import { ProfileBanner } from "@/components/home/profile-banner";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { QuickServices } from "@/components/home/quick-services";
import { MyDay } from "@/components/home/my-day";
import { NewsFeed } from "@/components/home/news-feed";
import { CADET } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <>
      <TopBar name={CADET.thaiName} unread={3} />
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
