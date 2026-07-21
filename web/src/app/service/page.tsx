"use client";

import { useState } from "react";
import Link from "next/link";
import { useTx } from "@/components/shell/bilingual-label";
import { ListItem } from "@/components/ui";

type ServiceRow = { href: string; th: string; en: string; soon?: boolean };

const ACADEMIC: ServiceRow[] = [
  { href: "/profile",  th: "ผลการเรียน & ทรานสคริปต์", en: "Grades & Transcripts" },
  { href: "/class",    th: "ตารางเรียนประจำวัน",        en: "Daily Class Schedule" },
  { href: "/calendar", th: "ปฏิทินการศึกษา",            en: "Academic Calendar" },
  { href: "#",         th: "ห้องสมุด E-Book",           en: "E-Book Library", soon: true },
];

const OTHER: ServiceRow[] = [
  { href: "/meals",    th: "เมนูโรงอาหาร", en: "Mess Hall Menu" },
  { href: "/activity", th: "ศูนย์กิจกรรม", en: "Activity Hub" },
];

const SUPPORT: ServiceRow[] = [
  { href: "/lost-found", th: "ของหาย / ของพบ",        en: "Lost & Found" },
  { href: "/report",     th: "แจ้งซ่อม / แจ้งปัญหา", en: "Report / Fix" },
  { href: "#",           th: "ติดต่อกองบัญชาการ",     en: "Contact Office", soon: true },
  { href: "#",           th: "แผนที่ค่าย",             en: "Campus Map",     soon: true },
  { href: "#",           th: "คำถามที่พบบ่อย",         en: "FAQ",            soon: true },
];

const POPULAR = [
  { href: "/profile",  th: "ผลการเรียน", en: "Grades",      color: "var(--cat-academic)" },
  { href: "/meals",    th: "เมนูอาหาร",  en: "Meals",       color: "var(--warning)" },
  { href: "/activity", th: "ศูนย์กิจกรรม", en: "Activities", color: "var(--brand)" },
  { href: "/report",   th: "แจ้งซ่อม",   en: "Reports",     color: "var(--danger)" },
];

function ServiceListRow({ item }: { item: ServiceRow }) {
  const t = useTx();
  return (
    <ListItem
      href={item.href}
      title={t({ th: item.th, en: item.en })}
      subtitle={item.en}
      chevron={!item.soon}
      style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-card)", padding: "14px 16px" }}
      trailing={item.soon ? (
        <span
          style={{
            display: "inline-block", padding: "2px 8px", borderRadius: 999,
            background: "var(--tint)", color: "var(--brand)",
            font: "600 11px var(--font-sans)",
          }}
        >
          {t({ th: "เร็วๆ นี้", en: "Soon" })}
        </span>
      ) : undefined}
    />
  );
}

function SectionLabel({ th, en }: { th: string; en: string }) {
  const t = useTx();
  return (
    <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)", marginBottom: 8, marginTop: 20 }}>
      {t({ th, en })}
      <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginLeft: 6 }}>{en}</span>
    </div>
  );
}

const ALL_SERVICES: ServiceRow[] = [...ACADEMIC, ...OTHER, ...SUPPORT];

export default function ServicePage() {
  const t = useTx();
  const [query, setQuery] = useState("");

  const trimmed = query.trim().toLowerCase();
  const searchResults = trimmed
    ? ALL_SERVICES.filter(s =>
        s.th.toLowerCase().includes(trimmed) ||
        s.en.toLowerCase().includes(trimmed)
      )
    : null;

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 px-4 pb-3 pt-4"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--line)" }}
      >
        <div style={{ font: "700 20px var(--font-sans)", color: "var(--ink)", marginBottom: 8 }}>
          {t({ th: "บริการ", en: "Services" })}
          <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginLeft: 6 }}>All Services</span>
        </div>
        {/* Search bar */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: "var(--surface)", border: `1px solid ${trimmed ? "var(--brand)" : "var(--line)"}` }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke={trimmed ? "var(--brand)" : "var(--muted)"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t({ th: "ค้นหาบริการ...", en: "Search services..." })}
            style={{
              flex: 1, border: "none", background: "transparent", outline: "none",
              font: "500 13px var(--font-sans)", color: "var(--ink)",
            }}
          />
          {trimmed && (
            <button type="button" onClick={() => setQuery("")}
              className="active:opacity-70"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2.5} strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-3 pb-6">
        {/* Search results */}
        {searchResults !== null && (
          <div className="pt-3">
            {searchResults.length === 0 ? (
              <div className="py-12 text-center" style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>
                {t({ th: "ไม่พบบริการที่ค้นหา", en: "No services found" })}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {searchResults.map(item => <ServiceListRow key={item.th} item={item} />)}
              </div>
            )}
          </div>
        )}

        {/* Normal layout — hidden when searching */}
        {searchResults === null && <>

        {/* Popular 2×2 grid */}
        <div style={{ marginTop: 20, marginBottom: 4, font: "700 15px var(--font-sans)", color: "var(--ink)" }}>
          {t({ th: "บริการยอดนิยม", en: "Popular" })}
          <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginLeft: 6 }}>Popular</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {POPULAR.map((p) => (
            <Link
              key={p.href + p.th}
              href={p.href}
              className="flex flex-col justify-between rounded-2xl p-4 active:scale-[0.98]"
              style={{ background: p.color, minHeight: 90, textDecoration: "none", position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", right: -10, bottom: -10, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,.12)" }} />
              <div style={{ font: "700 13px var(--font-sans)", color: "#fff" }}>
                {t({ th: p.th, en: p.en })}
              </div>
            </Link>
          ))}
        </div>

        {/* Academic */}
        <SectionLabel th="วิชาการ" en="Academic" />
        <div className="flex flex-col gap-2">
          {ACADEMIC.map((item) => <ServiceListRow key={item.th} item={item} />)}
        </div>

        {/* Other */}
        <SectionLabel th="อื่นๆ" en="Other" />
        <div className="flex flex-col gap-2">
          {OTHER.map((item) => <ServiceListRow key={item.th} item={item} />)}
        </div>

        {/* Support */}
        <SectionLabel th="บริการ & ช่วยเหลือ" en="Support" />
        <div className="flex flex-col gap-2">
          {SUPPORT.map((item) => <ServiceListRow key={item.th} item={item} />)}
        </div>
        </>}
      </div>
    </div>
  );
}
