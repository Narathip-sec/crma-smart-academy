"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/shell/top-bar";
import { ProfileBanner } from "@/components/home/profile-banner";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { QuickServices } from "@/components/home/quick-services";
import { MyDay } from "@/components/home/my-day";
import { NewsFeed } from "@/components/home/news-feed";

type MeResponse = {
  displayName?: string;
  avatarUrl?: string | null;
  cadetProfile?: { thaiName?: string } | null;
  unreadCount?: number;
};

export default function HomePage() {
  const [name, setName] = useState("นนร.");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/me")
      .then(r => r.ok ? r.json() : null)
      .then((d: MeResponse | null) => {
        if (!d) return;
        const n = d.cadetProfile?.thaiName
          ? `นนร.${d.cadetProfile.thaiName}`
          : d.displayName ?? "นนร.";
        setName(n);
        setAvatarUrl(d.avatarUrl ?? undefined);
        setUnread(d.unreadCount ?? 0);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <TopBar name={name} pictureUrl={avatarUrl} unread={unread} />
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
