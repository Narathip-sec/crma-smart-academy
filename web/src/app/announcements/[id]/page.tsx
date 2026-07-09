"use client";

import { useParams, useRouter } from "next/navigation";
import { useTx } from "@/components/shell/bilingual-label";
import { FEATURED, NEWS, TAG_COLOR } from "@/lib/data/announcements";

const TAG_ICON: Record<string, string> = {
  "สอบ":     "📋",
  "วิชาการ": "📚",
  "ทหาร":    "🎖️",
  "กิจกรรม": "🏆",
  "ประกาศ":  "📢",
};

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTx();
  const id = params.id as string;

  const isFeatured = id.startsWith("f");
  const numId = Number(id.slice(1));

  const item = isFeatured
    ? FEATURED.find(x => x.id === numId)
    : NEWS.find(x => x.id === numId);

  if (!item) {
    return (
      <div className="flex flex-1 items-center justify-center" style={{ background: "var(--bg)" }}>
        <div style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>ไม่พบประกาศ</div>
      </div>
    );
  }

  const tag = isFeatured
    ? (item as typeof FEATURED[0]).tag
    : (item as typeof NEWS[0]).tags[0];
  const icon = TAG_ICON[tag] ?? "📢";
  const accentColor = item.accentColor;

  const bodyTh = item.bodyTh;
  const bodyEn = item.bodyEn;
  const dateLine = isFeatured
    ? `📅 ${(item as typeof FEATURED[0]).dateTh}`
    : `⏱ ${t((item as typeof NEWS[0]).timeAgo)}`;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto" style={{ background: "var(--bg)" }}>

      {/* Hero header */}
      <div style={{
        background: `linear-gradient(145deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 75%, transparent) 100%)`,
        padding: "16px 16px 36px",
        position: "relative",
        overflow: "hidden",
        minHeight: 210,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,.06)", pointerEvents: "none" }} />

        {/* Back */}
        <button type="button" onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full active:opacity-70"
          style={{ background: "rgba(255,255,255,.2)", alignSelf: "flex-start" }}
          aria-label="Back">
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Icon */}
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 52, lineHeight: 1 }}>{icon}</div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 px-4 pb-10 pt-5">

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {isFeatured ? (
            <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: `color-mix(in srgb, ${accentColor} 10%, transparent)`, color: accentColor, font: "600 11px var(--font-sans)" }}>
              {(item as typeof FEATURED[0]).tag}
            </span>
          ) : (
            (item as typeof NEWS[0]).tags.map(tg => (
              <span key={tg} style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: `color-mix(in srgb, ${TAG_COLOR[tg] ?? accentColor} 10%, transparent)`, color: TAG_COLOR[tg] ?? accentColor, font: "600 11px var(--font-sans)" }}>
                {tg}
              </span>
            ))
          )}
        </div>

        {/* Title */}
        <div style={{ font: "700 20px var(--font-sans)", color: "var(--ink)", lineHeight: 1.3 }}>
          {t({ th: item.titleTh, en: item.titleEn })}
        </div>

        {/* Date */}
        <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>{dateLine}</div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--line)" }} />

        {/* Body */}
        <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div style={{ font: "400 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.75, whiteSpace: "pre-line" }}>
            {t({ th: bodyTh, en: bodyEn })}
          </div>
        </div>

        {/* Source badge */}
        <div className="flex items-center gap-2 px-1">
          <div style={{ width: 8, height: 8, borderRadius: 999, background: accentColor, flexShrink: 0 }} />
          <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>
            กองการศึกษา โรงเรียนนายร้อยพระจุลจอมเกล้า
          </span>
        </div>
      </div>
    </div>
  );
}
