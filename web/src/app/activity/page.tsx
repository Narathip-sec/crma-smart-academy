"use client";

import { useState } from "react";
import Link from "next/link";
import { useTx } from "@/components/shell/bilingual-label";
import { ACTIVITIES, ACTIVITY_CATEGORIES, type Activity, type ActivityCategory } from "@/lib/data/activity";

type FilterKey = ActivityCategory | "ทั้งหมด";

function FeaturedCard({ item }: { item: Activity }) {
  const t = useTx();
  return (
    <Link
      href={`/activity/${item.id}`}
      className="flex flex-col justify-between rounded-2xl p-4 shrink-0"
      style={{
        background: item.accentColor,
        width: "58%",
        minHeight: 130,
        textDecoration: "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute", right: -12, bottom: -12,
          width: 70, height: 70, borderRadius: "50%",
          background: "rgba(255,255,255,.12)",
        }}
      />
      <span
        style={{
          display: "inline-block", padding: "2px 8px", borderRadius: 999,
          background: "rgba(255,255,255,.25)", color: "#fff",
          font: "600 10px var(--font-sans)",
        }}
      >
        ● {item.category}
      </span>
      <div>
        <div style={{ font: "700 14px var(--font-sans)", color: "#fff", lineHeight: 1.3, marginBottom: 4 }}>
          {t({ th: item.titleTh, en: item.titleEn })}
        </div>
        <div style={{ font: "500 10px var(--font-sans)", color: "rgba(255,255,255,.75)" }}>
          📅 {item.dateTh} · {item.time}
        </div>
        <div style={{ font: "600 10px var(--font-sans)", color: "rgba(255,255,255,.85)", marginTop: 3 }}>
          👥 {item.enrolled}/{item.capacity}
        </div>
      </div>
    </Link>
  );
}

function ActivityRow({ item }: { item: Activity }) {
  const t = useTx();
  return (
    <Link
      href={`/activity/${item.id}`}
      className="flex items-start gap-3 rounded-2xl p-3.5"
      style={{ background: "var(--surface)", border: "1px solid var(--line)", textDecoration: "none" }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ background: item.accentColor }}
      >
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,.9)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1">
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "1px 8px", borderRadius: 999,
              background: item.accentColor + "18", color: item.accentColor,
              font: "600 9px var(--font-sans)",
            }}
          >
            ● {item.category}
          </span>
        </div>
        <div style={{ font: "600 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.3 }}>
          {t({ th: item.titleTh, en: item.titleEn })}
        </div>
        <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 3 }}>
          📅 {item.dateTh} · {item.time}
        </div>
        <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 1 }}>
          📍 {t({ th: item.locationTh, en: item.locationEn })}
        </div>
      </div>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
        stroke="var(--line)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}

export default function ActivityPage() {
  const t = useTx();
  const [filter, setFilter] = useState<FilterKey>("ทั้งหมด");

  const featured = ACTIVITIES.filter((a) => a.featured);
  const visible = filter === "ทั้งหมด"
    ? ACTIVITIES
    : ACTIVITIES.filter((a) => a.category === filter);

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex h-14 items-center justify-between px-4"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--line)" }}
      >
        <div>
          <div style={{ font: "700 16px var(--font-sans)", color: "var(--ink)" }}>
            {t({ th: "กิจกรรม", en: "Activities" })}
          </div>
          <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)" }}>Activities</div>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          aria-label="Search"
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
            stroke="var(--muted)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Featured */}
        <div className="pt-4">
          <div className="mb-2 px-3" style={{ font: "700 14px var(--font-sans)", color: "var(--ink)" }}>
            {t({ th: "กิจกรรมแนะนำ", en: "Featured" })}
            <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginLeft: 6 }}>Featured</span>
          </div>
          <div
            className="flex gap-2.5 overflow-x-auto px-3 pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {featured.map((item) => <FeaturedCard key={item.id} item={item} />)}
            <div style={{ flexShrink: 0, width: 4 }} />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto px-3 pb-1 pt-4" style={{ scrollbarWidth: "none" }}>
          {ACTIVITY_CATEGORIES.map((cat) => {
            const active = filter === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setFilter(cat.key as FilterKey)}
                className="shrink-0 rounded-full px-4 py-2"
                style={{
                  background: active ? "var(--brand)" : "var(--surface)",
                  color: active ? "#fff" : "var(--muted)",
                  border: active ? "none" : "1px solid var(--line)",
                  font: "600 12px var(--font-sans)",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* All activities */}
        <div className="px-3 pt-3">
          <div style={{ font: "700 14px var(--font-sans)", color: "var(--ink)", marginBottom: 10 }}>
            {t({ th: "กิจกรรมทั้งหมด", en: "All Activities" })}
            <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginLeft: 6 }}>
              {visible.length} {t({ th: "กิจกรรม", en: "events" })}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {visible.map((item) => <ActivityRow key={item.id} item={item} />)}
          </div>
        </div>
      </div>

      {/* FAB */}
      <Link
        href="/activity/new"
        className="fixed bottom-20 right-5 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{ background: "var(--brand)", color: "#fff", zIndex: 50 }}
        aria-label="Create activity"
      >
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
    </div>
  );
}
