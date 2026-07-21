"use client";

import { useState, useEffect } from "react";
import { useTx } from "@/components/shell/bilingual-label";
import { ListItem } from "@/components/ui";

type HomeData = {
  nextClass: { courseName: string; startTime: string; room: string | null; category: string } | null;
  todayLunch: { menuTh: string; menuEn: string | null; note: string | null } | null;
  pendingTasks: number;
  nextActivity: { id: string; titleTh: string; startAt: string; location: string | null; categoryTh: string | null } | null;
};

const THAI_MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toTimeString().slice(0, 5) + " น.";
}

function fmtDateTh(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`;
}

type RowProps = {
  href: string;
  iconBg: string;
  icon: React.ReactNode;
  labelTh: string;
  labelEn: string;
  titleTh: string;
  titleEn: string;
  subTh: string;
  subEn: string;
};

function DayRow({ href, iconBg, icon, labelTh, labelEn, titleTh, titleEn, subTh, subEn }: RowProps) {
  const t = useTx();
  return (
    <ListItem
      href={href}
      icon={icon}
      iconBg={iconBg}
      chevron
      style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-card)", padding: "14px 16px" }}
      title={
        <>
          <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginBottom: 1 }}>
            {t({ th: labelTh, en: labelEn })}
          </div>
          <div>{t({ th: titleTh, en: titleEn })}</div>
        </>
      }
      subtitle={t({ th: subTh, en: subEn })}
    />
  );
}

const ACTIVITY_ICON = (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--brand)"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

export function MyDay() {
  const t = useTx();
  const [home, setHome] = useState<HomeData | null>(null);

  useEffect(() => {
    fetch("/api/home").then(r => r.json()).then((data: HomeData) => setHome(data)).catch(() => {});
  }, []);

  const featured = home?.nextActivity ?? null;
  const activityHref  = featured ? `/activity/${featured.id}` : "/activity";
  const activityTitle = featured ? featured.titleTh : "ยังไม่มีกิจกรรมเปิดรับ";
  const activityTitleEn = featured ? featured.titleTh : "No open activities";
  const activitySub   = featured
    ? `${fmtDateTh(featured.startAt)} · ${fmtTime(featured.startAt)}${featured.categoryTh ? ` · ${featured.categoryTh}` : ""}`
    : "";

  return (
    <section className="px-3 pt-4">
      <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)", marginBottom: 10 }}>
        {t({ th: "วันนี้ของฉัน", en: "My Day" })}
        <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginLeft: 6 }}>My Day</span>
      </div>
      <div className="flex flex-col gap-1.5">

        {/* Next class */}
        <DayRow
          href="/class"
          iconBg="var(--tint)"
          icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /></svg>}
          labelTh="คาบเรียนถัดไป · Next class"
          labelEn="Next class · คาบเรียนถัดไป"
          titleTh={home?.nextClass?.courseName ?? "ไม่มีคาบเรียนวันนี้"}
          titleEn={home?.nextClass?.courseName ?? "No class today"}
          subTh={home?.nextClass ? `${home.nextClass.startTime}${home.nextClass.room ? ` · ${home.nextClass.room}` : ""}` : ""}
          subEn={home?.nextClass ? `${home.nextClass.startTime}${home.nextClass.room ? ` · ${home.nextClass.room}` : ""}` : ""}
        />

        {/* Today's lunch */}
        <DayRow
          href="/meals"
          iconBg="color-mix(in srgb, var(--warning) 12%, transparent)"
          icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>}
          labelTh="มื้อกลางวันนี้ · Today's lunch"
          labelEn="Today's lunch · มื้อกลางวันนี้"
          titleTh={home?.todayLunch?.menuTh ?? "ยังไม่มีเมนู"}
          titleEn={home?.todayLunch?.menuEn ?? home?.todayLunch?.menuTh ?? "No menu yet"}
          subTh={home?.todayLunch?.note ?? (home?.todayLunch ? "โรงอาหารกลาง" : "")}
          subEn={home?.todayLunch?.note ?? (home?.todayLunch ? "Central Mess Hall" : "")}
        />

        {/* Pending tasks */}
        <DayRow
          href="/todo"
          iconBg="color-mix(in srgb, var(--danger) 10%, transparent)"
          icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3 7-7" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>}
          labelTh="งานค้าง · Pending tasks"
          labelEn="Pending tasks · งานค้าง"
          titleTh={`${home?.pendingTasks ?? 0} งานที่ต้องทำ`}
          titleEn={`${home?.pendingTasks ?? 0} tasks to do`}
          subTh="แตะเพื่อดูรายการ"
          subEn="Tap to view list"
        />

        {/* Featured activity */}
        <DayRow
          href={activityHref}
          iconBg="var(--tint)"
          icon={ACTIVITY_ICON}
          labelTh="กิจกรรมน่าสนใจ · Featured activity"
          labelEn="Featured activity · กิจกรรมน่าสนใจ"
          titleTh={activityTitle}
          titleEn={activityTitleEn}
          subTh={activitySub}
          subEn={activitySub}
        />
      </div>
    </section>
  );
}
