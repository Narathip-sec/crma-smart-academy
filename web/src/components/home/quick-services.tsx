"use client";

import Link from "next/link";
import { useTx } from "@/components/shell/bilingual-label";

type Service = { href: string; th: string; en: string; icon: React.ReactNode; iconBg: string };

function GradesIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="var(--brand)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
    </svg>
  );
}
function MealsIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="var(--warning)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}
function LostFoundIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="var(--brand)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 21l-6-6" /><circle cx="11" cy="11" r="8" />
      <path d="M11 8v3l2 2" />
    </svg>
  );
}
function ReportIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="var(--danger)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

// Per spec §4.1: Grades · Meals · Lost & Found · Reports.
const SERVICES: Service[] = [
  { href: "/profile",    th: "ผลการเรียน",   en: "Grades",       icon: <GradesIcon />,    iconBg: "var(--tint)" },
  { href: "/meals",      th: "เมนูอาหาร",    en: "Meals",        icon: <MealsIcon />,     iconBg: "color-mix(in srgb, var(--warning) 12%, transparent)" },
  { href: "/lost-found", th: "ของหาย",       en: "Lost",        icon: <LostFoundIcon />, iconBg: "var(--tint)" },
  { href: "/report",     th: "แจ้งซ่อม",     en: "Reports",      icon: <ReportIcon />,    iconBg: "color-mix(in srgb, var(--danger) 10%, transparent)" },
];

export function QuickServices() {
  const t = useTx();
  return (
    <section className="px-3 pt-4">
      <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)", marginBottom: 10 }}>
        {t({ th: "บริการด่วน", en: "Quick Services" })}
        <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginLeft: 6 }}>Quick services</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {SERVICES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex flex-col items-center gap-2 rounded-2xl py-3"
            style={{ textDecoration: "none", background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: s.iconBg }}
            >
              {s.icon}
            </div>
            <div style={{ font: "600 11px var(--font-sans)", color: "var(--ink)", textAlign: "center", lineHeight: 1.3 }}>
              {t({ th: s.th, en: s.en })}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
