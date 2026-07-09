"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTx } from "@/components/shell/bilingual-label";
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
    <Link href={`/announcements/f${item.id}`} style={{ textDecoration: "none" }}>
      <div className="flex items-start gap-3 rounded-2xl p-3.5"
        style={{ background: "var(--surface)", border: "1px solid var(--line)", borderLeft: `3px solid ${item.accentColor}` }}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `color-mix(in srgb, ${item.accentColor} 10%, transparent)` }}>
          <span style={{ font: "700 16px var(--font-sans)", color: item.accentColor }}>📢</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 999, background: p.bg, color: p.color, font: "600 9px var(--font-sans)" }}>
              {p.th}
            </span>
            <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 999, background: `color-mix(in srgb, ${item.accentColor} 10%, transparent)`, color: item.accentColor, font: "600 9px var(--font-sans)" }}>
              {item.tag}
            </span>
          </div>
          <div style={{ font: "600 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.3 }}>
            {t({ th: item.titleTh, en: item.titleEn })}
          </div>
          <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 3 }}>📅 {item.dateTh}</div>
        </div>
      </div>
    </Link>
  );
}

function NewsRow({ item }: { item: NewsItem }) {
  const t = useTx();
  return (
    <Link href={`/announcements/n${item.id}`} style={{ textDecoration: "none" }}>
      <div className="flex items-start gap-3 rounded-2xl p-3.5"
        style={{ background: "var(--surface)", border: "1px solid var(--line)", borderLeft: `3px solid ${item.accentColor}` }}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `color-mix(in srgb, ${item.accentColor} 10%, transparent)` }}>
          <span style={{ font: "700 16px var(--font-sans)", color: item.accentColor }}>📋</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1">
            {item.tags.map(tag => (
              <span key={tag} style={{ display: "inline-block", padding: "1px 8px", borderRadius: 999, background: `color-mix(in srgb, ${TAG_COLOR[tag] ?? "var(--muted)"} 10%, transparent)`, color: TAG_COLOR[tag] ?? "var(--muted)", font: "600 9px var(--font-sans)" }}>
                {tag}
              </span>
            ))}
          </div>
          <div style={{ font: "600 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.3 }}>
            {t({ th: item.titleTh, en: item.titleEn })}
          </div>
          <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 3 }}>
            {t(item.timeAgo)}
          </div>
        </div>
      </div>
    </Link>
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
        <div style={{ font: "700 12px var(--font-sans)", color: "var(--muted)", marginBottom: 8, letterSpacing: ".04em" }}>
          {t({ th: "ประกาศสำคัญ", en: "FEATURED" })}
        </div>
        <div className="mb-4 flex flex-col gap-2">
          {FEATURED.map(item => <FeaturedRow key={item.id} item={item} />)}
        </div>

        {/* All news */}
        <div style={{ font: "700 12px var(--font-sans)", color: "var(--muted)", marginBottom: 8, letterSpacing: ".04em" }}>
          {t({ th: "ข่าวสาร", en: "NEWS" })}
        </div>
        <div className="flex flex-col gap-2">
          {NEWS.map(item => <NewsRow key={item.id} item={item} />)}
        </div>
      </div>
    </div>
  );
}
