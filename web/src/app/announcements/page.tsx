"use client";

import { useRouter } from "next/navigation";
import { useTx } from "@/components/shell/bilingual-label";
import { ListItem } from "@/components/ui";
import { FEATURED, NEWS, TAG_COLOR, type Announcement, type NewsItem } from "@/lib/data/announcements";

const PRIORITY_LABEL: Record<string, { th: string; bg: string; color: string }> = {
  important: { th: "สำคัญ",  bg: "color-mix(in srgb, var(--danger) 10%, transparent)", color: "var(--danger)" },
  new:       { th: "ใหม่",   bg: "color-mix(in srgb, var(--cat-academic) 10%, transparent)", color: "var(--cat-academic)" },
  normal:    { th: "ทั่วไป", bg: "var(--tint)", color: "var(--brand)" },
};

function FeaturedRow({ item }: { item: Announcement }) {
  const t = useTx();
  const p = PRIORITY_LABEL[item.priority];
  return (
    <ListItem
      href={`/announcements/f${item.id}`}
      style={{ background: "var(--surface)", border: "1px solid var(--line)", borderLeft: `3px solid ${item.accentColor}`, borderRadius: "var(--radius-card)", padding: "14px 16px" }}
      icon={<span style={{ fontSize: 16, color: item.accentColor }}>📢</span>}
      iconBg={`color-mix(in srgb, ${item.accentColor} 10%, transparent)`}
      title={
        <>
          <div className="mb-1 flex items-center gap-1.5">
            <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 999, background: p.bg, color: p.color, font: "600 11px var(--font-sans)" }}>
              {p.th}
            </span>
            <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 999, background: `color-mix(in srgb, ${item.accentColor} 10%, transparent)`, color: item.accentColor, font: "600 11px var(--font-sans)" }}>
              {item.tag}
            </span>
          </div>
          <div>{t({ th: item.titleTh, en: item.titleEn })}</div>
        </>
      }
      subtitle={`📅 ${item.dateTh}`}
    />
  );
}

function NewsRow({ item }: { item: NewsItem }) {
  const t = useTx();
  return (
    <ListItem
      href={`/announcements/n${item.id}`}
      style={{ background: "var(--surface)", border: "1px solid var(--line)", borderLeft: `3px solid ${item.accentColor}`, borderRadius: "var(--radius-card)", padding: "14px 16px" }}
      icon={<span style={{ fontSize: 16, color: item.accentColor }}>📋</span>}
      iconBg={`color-mix(in srgb, ${item.accentColor} 10%, transparent)`}
      title={
        <>
          <div className="mb-1 flex flex-wrap items-center gap-1">
            {item.tags.map(tag => (
              <span key={tag} style={{ display: "inline-block", padding: "1px 8px", borderRadius: 999, background: `color-mix(in srgb, ${TAG_COLOR[tag] ?? "var(--muted)"} 10%, transparent)`, color: TAG_COLOR[tag] ?? "var(--muted)", font: "600 11px var(--font-sans)" }}>
                {tag}
              </span>
            ))}
          </div>
          <div>{t({ th: item.titleTh, en: item.titleEn })}</div>
        </>
      }
      subtitle={t(item.timeAgo)}
    />
  );
}

export default function AnnouncementsPage() {
  const t = useTx();
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 px-4"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
        <button type="button" onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full"
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
        {/* Featured */}
        <div style={{ font: "700 13px var(--font-sans)", color: "var(--muted)", marginBottom: 8, letterSpacing: ".04em" }}>
          {t({ th: "ประกาศสำคัญ", en: "FEATURED" })}
        </div>
        <div className="mb-4 flex flex-col gap-2">
          {FEATURED.map(item => <FeaturedRow key={item.id} item={item} />)}
        </div>

        {/* All news */}
        <div style={{ font: "700 13px var(--font-sans)", color: "var(--muted)", marginBottom: 8, letterSpacing: ".04em" }}>
          {t({ th: "ข่าวสาร", en: "NEWS" })}
        </div>
        <div className="flex flex-col gap-2">
          {NEWS.map(item => <NewsRow key={item.id} item={item} />)}
        </div>
      </div>
    </div>
  );
}
