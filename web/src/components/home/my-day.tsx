"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTx } from "@/components/shell/bilingual-label";
import { MY_DAY } from "@/lib/mock-data";

type ActivityItem = {
  id: string;
  titleTh: string;
  titleEn: string | null;
  startAt: string;
  endAt: string | null;
  maxAttendees: number | null;
  attendeeCount: number;
  status: string;
  category: { nameTh: string } | null;
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

function scoreActivity(a: ActivityItem, now: Date): number {
  let score = 0;
  const start = new Date(a.startAt);
  const end   = a.endAt ? new Date(a.endAt) : null;

  // Ongoing right now — highest priority
  if (start <= now && (!end || end >= now)) {
    score += 100;
  // Starts today
  } else if (start.toDateString() === now.toDateString()) {
    score += 80;
  }

  // Urgency: <30% seats left → boost
  if (a.maxAttendees && a.maxAttendees > 0) {
    const remaining = a.maxAttendees - a.attendeeCount;
    if (remaining / a.maxAttendees < 0.3) score += 20;
    else if (remaining / a.maxAttendees < 0.5) score += 10;
  }

  return score;
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
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl p-2.5"
      style={{ background: "var(--surface)", border: "1px solid var(--line)", textDecoration: "none" }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginBottom: 1 }}>
          {t({ th: labelTh, en: labelEn })}
        </div>
        <div style={{ font: "700 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.2 }}>
          {t({ th: titleTh, en: titleEn })}
        </div>
        <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 1 }}>
          {t({ th: subTh, en: subEn })}
        </div>
      </div>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
        stroke="var(--line)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
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
  const d = MY_DAY;
  const [featured, setFeatured] = useState<ActivityItem | null>(null);

  useEffect(() => {
    const now = new Date();
    fetch("/api/activity?status=open")
      .then(r => r.json())
      .then((data: ActivityItem[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        // Score each, keep only today/ongoing (score > 0), else top by earliest startAt
        const scored = data.map(a => ({ a, s: scoreActivity(a, now) }));
        scored.sort((x, y) => y.s - x.s || new Date(x.a.startAt).getTime() - new Date(y.a.startAt).getTime());
        setFeatured(scored[0].a);
      })
      .catch(() => {});
  }, []);

  const activityHref  = featured ? `/activity/${featured.id}` : "/activity";
  const activityTitle = featured ? featured.titleTh : d.nextActivity.titleTh;
  const activityTitleEn = featured ? (featured.titleEn ?? featured.titleTh) : d.nextActivity.titleEn;
  const activitySub   = featured
    ? `${fmtDateTh(featured.startAt)} · ${fmtTime(featured.startAt)}${featured.category ? ` · ${featured.category.nameTh}` : ""}`
    : `${d.nextActivity.dateTh} · ${d.nextActivity.time}`;

  return (
    <section className="px-3 pt-4">
      <div style={{ font: "700 14px var(--font-sans)", color: "var(--ink)", marginBottom: 10 }}>
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
          titleTh={d.nextClass.subjectTh}
          titleEn={d.nextClass.subjectEn}
          subTh={`${d.nextClass.time} · ${d.nextClass.room}`}
          subEn={`${d.nextClass.time} · ${d.nextClass.room}`}
        />

        {/* Today's lunch */}
        <DayRow
          href="/meals"
          iconBg="color-mix(in srgb, var(--warning) 12%, transparent)"
          icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>}
          labelTh="มื้อกลางวันนี้ · Today's lunch"
          labelEn="Today's lunch · มื้อกลางวันนี้"
          titleTh={d.lunch.menuTh}
          titleEn={d.lunch.menuEn}
          subTh={`${d.lunch.time} · ${d.lunch.locationTh}`}
          subEn={`${d.lunch.time} · ${d.lunch.locationEn}`}
        />

        {/* Pending tasks */}
        <DayRow
          href="/todo"
          iconBg="color-mix(in srgb, var(--danger) 10%, transparent)"
          icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3 7-7" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>}
          labelTh="งานค้าง · Pending tasks"
          labelEn="Pending tasks · งานค้าง"
          titleTh={`${d.pendingTasks.count} งานที่ต้องทำ`}
          titleEn={`${d.pendingTasks.count} tasks to do`}
          subTh={`${d.pendingTasks.dueToday} งานครบกำหนดวันนี้`}
          subEn={`${d.pendingTasks.dueToday} due today`}
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
