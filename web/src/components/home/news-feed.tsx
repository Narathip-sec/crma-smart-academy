"use client";

import Link from "next/link";
import { useTx } from "@/components/shell/bilingual-label";
import { ListItem } from "@/components/ui";
import { NEWS, TAG_COLOR, type NewsItem } from "@/lib/data/announcements";

function PriorityBadge({ priority }: { priority: NewsItem["priority"] }) {
  if (priority === "important") return (
    <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 4, background: "var(--danger)", color: "#fff", font: "700 11px var(--font-sans)", letterSpacing: ".06em" }}>
      IMPORTANT
    </span>
  );
  if (priority === "new") return (
    <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 4, background: "var(--brand)", color: "#fff", font: "700 11px var(--font-sans)", letterSpacing: ".06em" }}>
      NEW
    </span>
  );
  return null;
}

function NewsCard({ item }: { item: NewsItem }) {
  const t = useTx();
  return (
    <ListItem
      href={`/announcements/n${item.id}`}
      style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-card)", padding: "14px 16px" }}
      icon={
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,.9)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        </svg>
      }
      iconBg={item.accentColor}
      title={
        <>
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <PriorityBadge priority={item.priority} />
            {item.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 3,
                  padding: "1px 7px", borderRadius: 999,
                  background: `color-mix(in srgb, ${TAG_COLOR[tag]} 13%, transparent)`,
                  color: TAG_COLOR[tag],
                  font: "600 11px var(--font-sans)",
                }}
              >
                ● {tag}
              </span>
            ))}
          </div>
          <div style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
            {t({ th: item.titleTh, en: item.titleEn })}
          </div>
        </>
      }
      subtitle={`⏱ ${t({ th: item.timeAgo.th, en: item.timeAgo.en })}`}
    />
  );
}

export function NewsFeed() {
  const t = useTx();
  return (
    <section className="px-3 pb-4 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)" }}>
          {t({ th: "ข่าวสารและประกาศ", en: "News & Announcements" })}
          <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginLeft: 6 }}>News</span>
        </div>
        <Link href="/notifications" style={{ font: "600 11px var(--font-sans)", color: "var(--brand)" }}>
          {t({ th: "ดูทั้งหมด", en: "See all" })}
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {NEWS.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
