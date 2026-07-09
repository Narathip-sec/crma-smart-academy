"use client";

import Link from "next/link";
import { useState } from "react";
import { useTx } from "@/components/shell/bilingual-label";
import { FEATURED, type Announcement } from "@/lib/data/announcements";

function AnnouncementCard({ item }: { item: Announcement }) {
  const t = useTx();
  return (
    <Link
      href={`/announcements`}
      className="flex flex-col justify-between rounded-2xl p-3.5 active:scale-[0.98]"
      style={{
        background: item.accentColor,
        minHeight: 120,
        flex: "0 0 64%",
        textDecoration: "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* bg icon */}
      <div
        style={{
          position: "absolute", right: -10, bottom: -10,
          width: 80, height: 80,
          background: "rgba(255,255,255,.1)",
          borderRadius: "50%",
        }}
      />
      {/* Priority + tag badges */}
      <div className="flex items-center gap-1.5">
        {item.priority === "important" && (
          <span
            className="rounded px-1.5 py-0.5"
            style={{ background: "#fff", color: item.accentColor, font: "700 11px var(--font-sans)", letterSpacing: ".06em" }}
          >
            IMPORTANT
          </span>
        )}
        {item.priority === "new" && (
          <span
            className="rounded px-1.5 py-0.5"
            style={{ background: "#fff", color: item.accentColor, font: "700 11px var(--font-sans)", letterSpacing: ".06em" }}
          >
            NEW
          </span>
        )}
        <span
          className="rounded-full px-2 py-0.5"
          style={{ background: "rgba(255,255,255,.2)", font: "600 11px var(--font-sans)", color: "#fff" }}
        >
          ● {item.tag}
        </span>
      </div>
      {/* Title + date */}
      <div>
        <div
          style={{
            font: "700 13px var(--font-sans)", color: "#fff", lineHeight: 1.3,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
          }}
        >
          {t({ th: item.titleTh, en: item.titleEn })}
        </div>
        <div style={{ font: "500 11px var(--font-sans)", color: "rgba(255,255,255,.7)", marginTop: 4 }}>
          📅 {item.dateTh}
        </div>
      </div>
    </Link>
  );
}

export function HeroCarousel() {
  const t = useTx();
  const [active, setActive] = useState(0);

  return (
    <section className="pt-3">
      <div className="mb-2 flex items-center justify-between px-3">
        <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)" }}>
          {t({ th: "ประกาศสำคัญ", en: "Announcements" })}
          <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginLeft: 6 }}>Featured</span>
        </div>
        <Link href="/announcements" style={{ font: "600 11px var(--font-sans)", color: "var(--brand)" }}>
          {t({ th: "ทั้งหมด", en: "See all" })}
        </Link>
      </div>

      {/* Cards row */}
      <div
        className="flex gap-2 overflow-x-auto px-3"
        style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}
        onScroll={(e) => {
          const el = e.currentTarget;
          const idx = Math.round(el.scrollLeft / (el.offsetWidth * 0.66));
          setActive(Math.min(idx, FEATURED.length - 1));
        }}
      >
        {FEATURED.map((item) => (
          <div key={item.id} style={{ scrollSnapAlign: "start", flexShrink: 0, width: "64%" }}>
            <AnnouncementCard item={item} />
          </div>
        ))}
        {/* Peek of next */}
        <div style={{ flexShrink: 0, width: 12 }} />
      </div>

      {/* Dot indicator */}
      <div className="mt-2 flex justify-center gap-1">
        {FEATURED.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === active ? 16 : 5,
              height: 5,
              borderRadius: 999,
              background: i === active ? "var(--brand)" : "var(--line)",
              transition: "width .2s",
            }}
          />
        ))}
      </div>
    </section>
  );
}
