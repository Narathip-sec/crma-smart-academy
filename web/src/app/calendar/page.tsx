"use client";

import { useState, useEffect } from "react";
import { AppBar } from "@/components/shell/app-bar";

type CalendarCategory = "academic" | "exam" | "military" | "activity" | "holiday" | "deadline";

type CalEvent = {
  id: string;
  date: string;
  titleTh: string;
  titleEn?: string | null;
  category: CalendarCategory;
  startTime?: string | null;
  endTime?: string | null;
  academicYear: number;
};

const CAT_COLOR: Record<CalendarCategory, string> = {
  academic: "var(--brand)",
  exam:     "var(--cat-exam)",
  military: "var(--cat-military)",
  activity: "var(--cat-activity)",
  holiday:  "var(--warning)",
  deadline: "var(--cat-notice)",
};

const CAT_LABEL: Record<CalendarCategory, string> = {
  academic: "วิชาการ",
  exam:     "สอบ",
  military: "ทหาร",
  activity: "กิจกรรม",
  holiday:  "วันหยุด",
  deadline: "กำหนดส่ง",
};

const THAI_MONTHS = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
];
const EN_MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_HEADERS = ["อา","จ","อ","พ","พฤ","ศ","ส"];

export default function CalendarPage() {
  const today = new Date();
  const [viewYear, setViewYear]       = useState(today.getFullYear());
  const [viewMonth, setViewMonth]     = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [events, setEvents] = useState<CalEvent[] | null>(null);

  useEffect(() => {
    fetch(`/api/calendar?year=${viewYear}`)
      .then(r => r.json())
      .then((data: CalEvent[]) => setEvents(data))
      .catch(() => setEvents([]));
  }, [viewYear]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); setEvents(null); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); setEvents(null); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  }

  const loading = events === null;

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate();

  const monthEvents = (events ?? []).filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
  });

  const dayCategories = new Map<number, CalendarCategory[]>();
  for (const e of monthEvents) {
    const day = new Date(e.date).getDate();
    if (!dayCategories.has(day)) dayCategories.set(day, []);
    const cats = dayCategories.get(day)!;
    if (!cats.includes(e.category)) cats.push(e.category);
  }

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const selectedEvents = selectedDay
    ? monthEvents.filter(e => new Date(e.date).getDate() === selectedDay)
    : [];

  // Flat grid: leading nulls + day numbers + trailing nulls
  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const thaiYear = viewYear + 543;

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <AppBar th="ปฏิทินการศึกษา" en="Academic Calendar" />

      {/* Calendar card */}
      <div className="mx-3 mt-3 rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full active:opacity-70"
            style={{ background: "var(--bg)" }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="text-center">
            <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)" }}>
              {THAI_MONTHS[viewMonth]} {thaiYear}
            </div>
            <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>
              {EN_MONTHS[viewMonth]} {viewYear}
            </div>
          </div>

          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full active:opacity-70"
            style={{ background: "var(--bg)" }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_HEADERS.map((d, i) => (
            <div key={d} className="flex justify-center py-1">
              <span style={{ font: "600 11px var(--font-sans)", color: i === 0 ? "var(--danger)" : "var(--muted)" }}>
                {d}
              </span>
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} className="h-12" />;
            const cats = dayCategories.get(day) ?? [];
            const todayFlag = isToday(day);
            const selected  = selectedDay === day;
            const isSunday  = idx % 7 === 0;
            const active    = todayFlag || selected;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                className="flex flex-col items-center pb-1 pt-0.5 active:opacity-70"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: active ? "var(--brand)" : "transparent" }}
                >
                  <span style={{
                    font: `${active ? "700" : "500"} 13px var(--font-sans)`,
                    color: active ? "#fff" : isSunday ? "var(--danger)" : "var(--ink)",
                  }}>
                    {day}
                  </span>
                </div>
                {/* Event dots */}
                <div className="flex gap-0.5 mt-0.5" style={{ minHeight: 7, alignItems: "center" }}>
                  {cats.slice(0, 3).map(cat => (
                    <span
                      key={cat}
                      style={{
                        width: 5, height: 5, borderRadius: 999,
                        background: CAT_COLOR[cat],
                        display: "inline-block",
                      }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3 pt-3" style={{ borderTop: "1px solid var(--line)" }}>
          {(Object.keys(CAT_LABEL) as CalendarCategory[]).map(cat => (
            <div key={cat} className="flex items-center gap-1">
              <span style={{ width: 7, height: 7, borderRadius: 999, background: CAT_COLOR[cat], display: "inline-block", flexShrink: 0 }} />
              <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>{CAT_LABEL[cat]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected day events */}
      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3">
        {loading ? (
          <div className="flex h-20 items-center justify-center">
            <span style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>กำลังโหลด…</span>
          </div>
        ) : selectedDay !== null ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span style={{ font: "700 15px var(--font-sans)", color: "var(--ink)" }}>
                วันที่ {selectedDay} {THAI_MONTHS[viewMonth]}
              </span>
              <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>
                {selectedEvents.length} events
              </span>
            </div>

            {selectedEvents.length === 0 ? (
              <div className="flex h-16 items-center justify-center">
                <span style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>ไม่มีกิจกรรมในวันนี้</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedEvents.map(ev => {
                  const color = CAT_COLOR[ev.category];
                  return (
                    <div
                      key={ev.id}
                      className="flex items-start gap-3 rounded-2xl p-3.5"
                      style={{ background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "0 1px 3px rgba(15,23,42,.06)" }}
                    >
                      {/* Category icon badge */}
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `color-mix(in srgb, ${color} 10%, transparent)` }}
                      >
                        <span style={{ font: "700 13px var(--font-sans)", color }}>
                          {CAT_LABEL[ev.category][0]}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Category chip */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <span style={{ width: 7, height: 7, borderRadius: 999, background: color, display: "inline-block", flexShrink: 0 }} />
                          <span style={{ font: "600 11px var(--font-sans)", color: "var(--muted)" }}>
                            {CAT_LABEL[ev.category]}
                          </span>
                        </div>
                        <div style={{ font: "600 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.35 }}>
                          {ev.titleTh}
                        </div>
                        {ev.titleEn && (
                          <div style={{ font: "400 11px var(--font-sans)", color: "var(--muted)", marginTop: 1 }}>
                            {ev.titleEn}
                          </div>
                        )}
                        {ev.startTime && (
                          <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginTop: 3 }}>
                            🕐 {ev.startTime}{ev.endTime ? `–${ev.endTime}` : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-20 items-center justify-center">
            <span style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>
              เลือกวันเพื่อดูกิจกรรม
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
