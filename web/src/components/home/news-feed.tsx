"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTx } from "@/components/shell/bilingual-label";
import { ListItem } from "@/components/ui";
import { tagColor, isRecent, timeAgo } from "@/lib/announcement-ui";

type NewsItem = {
  id: string;
  titleTh: string;
  titleEn: string | null;
  tag: string | null;
  publishAt: string;
};

function NewNewsBadge() {
  return (
    <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 4, background: "var(--brand)", color: "#fff", font: "700 11px var(--font-sans)", letterSpacing: ".06em" }}>
      NEW
    </span>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const t = useTx();
  const color = tagColor(item.tag);
  return (
    <ListItem
      href={`/announcements/${item.id}`}
      style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-card)", padding: "14px 16px" }}
      icon={
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,.9)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        </svg>
      }
      iconBg={color}
      title={
        <>
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            {isRecent(item.publishAt) && <NewNewsBadge />}
            {item.tag && (
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 3,
                  padding: "1px 7px", borderRadius: 999,
                  background: `color-mix(in srgb, ${color} 13%, transparent)`,
                  color,
                  font: "600 11px var(--font-sans)",
                }}
              >
                ● {item.tag}
              </span>
            )}
          </div>
          <div style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
            {t({ th: item.titleTh, en: item.titleEn ?? item.titleTh })}
          </div>
        </>
      }
      subtitle={`⏱ ${t(timeAgo(item.publishAt))}`}
    />
  );
}

export function NewsFeed() {
  const t = useTx();
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch("/api/announcements")
      .then(r => r.json())
      .then((data: { news?: NewsItem[] }) => setNews(data.news ?? []))
      .catch(() => {});
  }, []);

  return (
    <section className="px-3 pb-4 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)" }}>
          {t({ th: "ข่าวสารและประกาศ", en: "News & Announcements" })}
          <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginLeft: 6 }}>News</span>
        </div>
        <Link href="/announcements" style={{ font: "600 11px var(--font-sans)", color: "var(--brand)" }}>
          {t({ th: "ดูทั้งหมด", en: "See all" })}
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {news.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
