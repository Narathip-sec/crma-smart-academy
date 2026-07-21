"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTx } from "@/components/shell/bilingual-label";
import { ListItem, LoadingState, ErrorState, EmptyState } from "@/components/ui";
import { tagColor, isRecent, timeAgo, formatDateTh } from "@/lib/announcement-ui";

type Announcement = {
  id: string;
  titleTh: string;
  titleEn: string | null;
  tag: string | null;
  pinned: boolean;
  publishAt: string;
};

type NewsItem = {
  id: string;
  titleTh: string;
  titleEn: string | null;
  tag: string | null;
  publishAt: string;
};

const PRIORITY_LABEL = {
  important: { th: "สำคัญ",  bg: "color-mix(in srgb, var(--danger) 10%, transparent)", color: "var(--danger)" },
  new:       { th: "ใหม่",   bg: "color-mix(in srgb, var(--cat-academic) 10%, transparent)", color: "var(--cat-academic)" },
};

function FeaturedRow({ item }: { item: Announcement }) {
  const t = useTx();
  const color = tagColor(item.tag);
  const p = item.pinned ? PRIORITY_LABEL.important : isRecent(item.publishAt) ? PRIORITY_LABEL.new : null;
  return (
    <ListItem
      href={`/announcements/${item.id}`}
      style={{ background: "var(--surface)", border: "1px solid var(--line)", borderLeft: `3px solid ${color}`, borderRadius: "var(--radius-card)", padding: "14px 16px" }}
      icon={<span style={{ fontSize: 16, color }}>📢</span>}
      iconBg={`color-mix(in srgb, ${color} 10%, transparent)`}
      title={
        <>
          <div className="mb-1 flex items-center gap-1.5">
            {p && (
              <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 999, background: p.bg, color: p.color, font: "600 11px var(--font-sans)" }}>
                {p.th}
              </span>
            )}
            {item.tag && (
              <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 999, background: `color-mix(in srgb, ${color} 10%, transparent)`, color, font: "600 11px var(--font-sans)" }}>
                {item.tag}
              </span>
            )}
          </div>
          <div>{t({ th: item.titleTh, en: item.titleEn ?? item.titleTh })}</div>
        </>
      }
      subtitle={`📅 ${formatDateTh(item.publishAt)}`}
    />
  );
}

function NewsRow({ item }: { item: NewsItem }) {
  const t = useTx();
  const color = tagColor(item.tag);
  return (
    <ListItem
      href={`/announcements/${item.id}`}
      style={{ background: "var(--surface)", border: "1px solid var(--line)", borderLeft: `3px solid ${color}`, borderRadius: "var(--radius-card)", padding: "14px 16px" }}
      icon={<span style={{ fontSize: 16, color }}>📋</span>}
      iconBg={`color-mix(in srgb, ${color} 10%, transparent)`}
      title={
        <>
          {item.tag && (
            <div className="mb-1 flex flex-wrap items-center gap-1">
              <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 999, background: `color-mix(in srgb, ${color} 10%, transparent)`, color, font: "600 11px var(--font-sans)" }}>
                {item.tag}
              </span>
            </div>
          )}
          <div>{t({ th: item.titleTh, en: item.titleEn ?? item.titleTh })}</div>
        </>
      }
      subtitle={t(timeAgo(item.publishAt))}
    />
  );
}

export default function AnnouncementsPage() {
  const t = useTx();
  const router = useRouter();
  const [featured, setFeatured] = useState<Announcement[] | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    fetch("/api/announcements")
      .then(r => r.json())
      .then((data: { featured?: Announcement[]; news?: NewsItem[] }) => {
        setFeatured(data.featured ?? []);
        setNews(data.news ?? []);
        setError(false);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 px-4"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
        <button type="button" onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full active:opacity-70"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }} aria-label="Back">
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div>
          <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)" }}>
            {t({ th: "ประกาศทั้งหมด", en: "All Announcements" })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3">
        {error ? (
          <ErrorState onRetry={load} />
        ) : featured === null ? (
          <LoadingState label={t({ th: "กำลังโหลด…", en: "Loading…" })} />
        ) : featured.length === 0 && news.length === 0 ? (
          <EmptyState title={t({ th: "ยังไม่มีประกาศ", en: "No announcements yet" })} />
        ) : (
          <>
            {featured.length > 0 && (
              <>
                <div style={{ font: "700 13px var(--font-sans)", color: "var(--muted)", marginBottom: 8, letterSpacing: ".04em" }}>
                  {t({ th: "ประกาศสำคัญ", en: "FEATURED" })}
                </div>
                <div className="mb-4 flex flex-col gap-2">
                  {featured.map(item => <FeaturedRow key={item.id} item={item} />)}
                </div>
              </>
            )}

            {news.length > 0 && (
              <>
                <div style={{ font: "700 13px var(--font-sans)", color: "var(--muted)", marginBottom: 8, letterSpacing: ".04em" }}>
                  {t({ th: "ข่าวสาร", en: "NEWS" })}
                </div>
                <div className="flex flex-col gap-2">
                  {news.map(item => <NewsRow key={item.id} item={item} />)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
