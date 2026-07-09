"use client";

import Link from "next/link";
import { useTx } from "@/components/shell/bilingual-label";
import { CADET } from "@/lib/mock-data";

export function ProfileBanner() {
  const t = useTx();
  return (
    <Link
      href="/profile"
      className="mx-3 mt-2 flex items-center gap-3 rounded-2xl p-4 active:opacity-70"
      style={{
        background: "linear-gradient(135deg, var(--grad-from) 0%, var(--grad-to) 100%)",
        color: "#fff",
        textDecoration: "none",
      }}
    >
      {/* Avatar */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        style={{
          background: "rgba(255,255,255,.25)",
          font: "700 16px var(--font-sans)",
          color: "#fff",
          letterSpacing: ".02em",
        }}
      >
        {CADET.initials}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div style={{ font: "700 15px var(--font-sans)", color: "#fff", lineHeight: 1.2 }}>
          {CADET.thaiName}
        </div>
        <div
          className="mt-0.5"
          style={{ font: "500 11px var(--font-sans)", color: "rgba(255,255,255,.8)" }}
        >
          {t({ th: `ชั้นปีที่ ${CADET.yearLevel} · รุ่น ${CADET.classYear}`, en: `Year ${CADET.yearLevel} · Class ${CADET.classYear}` })}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{ background: "rgba(255,255,255,.2)", font: "600 11px var(--font-sans)", color: "#fff" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "#4cff91", display: "inline-block" }} />
            {t({ th: "อยู่ในคาบเรียน", en: "In class" })}
          </span>
          <span style={{ font: "500 11px var(--font-sans)", color: "rgba(255,255,255,.75)" }}>
            {CADET.platoon} {CADET.company}
          </span>
        </div>
      </div>

      {/* Chevron */}
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
        stroke="rgba(255,255,255,.6)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
