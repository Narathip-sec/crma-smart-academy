"use client";

import { useState, useEffect, useCallback } from "react";
import { AppBar } from "@/components/shell/app-bar";
import { useTx } from "@/components/shell/bilingual-label";
import { LoadingState, ErrorState } from "@/components/ui";

type DayOfWeek = "จันทร์" | "อังคาร" | "พุธ" | "พฤหัสบดี" | "ศุกร์";
type Category = "academic" | "military" | "pe" | "advisory" | "self_study";

type ClassPeriod = {
  id: string;
  periodLabel: string;
  startTime: string;
  endTime: string;
  courseCode: string | null;
  courseName: string;
  instructor: string | null;
  room: string | null;
  category: Category;
};

const DAYS: DayOfWeek[] = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];

const DAY_LABELS: Record<DayOfWeek, { en: string; short: string }> = {
  "จันทร์":   { en: "Monday",    short: "จ" },
  "อังคาร":   { en: "Tuesday",   short: "อ" },
  "พุธ":      { en: "Wednesday", short: "พ" },
  "พฤหัสบดี": { en: "Thursday",  short: "พฤ" },
  "ศุกร์":    { en: "Friday",    short: "ศ" },
};

const CATEGORY_COLOR: Record<Category, string> = {
  academic:   "var(--cat-academic)",
  military:   "var(--cat-military)",
  pe:         "var(--success)",
  advisory:   "var(--warning)",
  self_study: "var(--muted)",
};

const CATEGORY_LABEL: Record<Category, { th: string; en: string }> = {
  academic:   { th: "วิชาการ",           en: "Academic" },
  military:   { th: "ทหาร",              en: "Military" },
  pe:         { th: "พลศึกษา",           en: "PE" },
  advisory:   { th: "ที่ปรึกษา",         en: "Advisory" },
  self_study: { th: "ศึกษาด้วยตนเอง",   en: "Self-study" },
};

const JS_DAY_MAP: Record<number, DayOfWeek | null> = {
  1: "จันทร์", 2: "อังคาร", 3: "พุธ", 4: "พฤหัสบดี", 5: "ศุกร์",
  0: null, 6: null,
};

function todayDay(): DayOfWeek | null {
  return JS_DAY_MAP[new Date().getDay()];
}

function nowStr(): string {
  return new Date().toTimeString().slice(0, 5);
}

export default function ClassPage() {
  const t = useTx();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDay() ?? "จันทร์");
  const [periods, setPeriods] = useState<ClassPeriod[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/class?dayTh=${encodeURIComponent(selectedDay)}`)
      .then(r => r.json())
      .then((data: ClassPeriod[]) => {
        if (!Array.isArray(data)) throw new Error("bad response");
        setPeriods(data);
        setError(false);
      })
      .catch(() => setError(true));
  }, [selectedDay]);

  useEffect(() => { load(); }, [load]);

  const now = nowStr();
  const isToday = selectedDay === todayDay();

  function isActive(start: string, end: string) { return now >= start && now < end; }
  function isPast(end: string) { return now >= end; }

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <AppBar th="ตารางเรียน" en="Class Schedule" />

      {/* Day tabs */}
      <div className="flex gap-1.5 px-3 py-2"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
        {DAYS.map((day) => {
          const active = day === selectedDay;
          const lbl = DAY_LABELS[day];
          return (
            <button key={day} type="button" onClick={() => setSelectedDay(day)}
              className="flex flex-1 flex-col items-center rounded-xl py-1.5 active:opacity-70"
              style={{ background: active ? "var(--brand)" : "transparent", color: active ? "#fff" : "var(--muted)" }}>
              <span style={{ font: "700 13px var(--font-sans)" }}>{lbl.short}</span>
              <span style={{ font: "500 11px var(--font-sans)", marginTop: 1, opacity: .75 }}>{lbl.en.slice(0, 3)}</span>
            </button>
          );
        })}
      </div>

      {/* Day header */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div>
          <span style={{ font: "700 15px var(--font-sans)", color: "var(--ink)" }}>
            {t({ th: `วัน${selectedDay}`, en: DAY_LABELS[selectedDay].en })}
          </span>
          <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginLeft: 8 }}>
            {t({ th: `${periods?.length ?? 0} คาบ · ภาค 1/2569`, en: `${periods?.length ?? 0} periods · Sem 1/2569` })}
          </span>
        </div>
        {isToday && (
          <span className="flex items-center gap-1 rounded-full px-2.5 py-1"
            style={{ background: "var(--tint)", font: "600 11px var(--font-sans)", color: "var(--brand-dark)" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--brand)", display: "inline-block" }} />
            {t({ th: "วันนี้", en: "Today" })}
          </span>
        )}
      </div>

      {/* Period list */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {error ? (
          <ErrorState onRetry={load} />
        ) : periods === null ? (
          <LoadingState label={t({ th: "กำลังโหลด…", en: "Loading…" })} />
        ) : periods.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12" style={{ color: "var(--muted)" }}>
            <div style={{ font: "600 15px var(--font-sans)" }}>
              {t({ th: "ไม่มีคาบเรียน", en: "No classes" })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {periods.map((period) => {
              const catColor = CATEGORY_COLOR[period.category] ?? "var(--muted)";
              const catLabel = CATEGORY_LABEL[period.category] ?? { th: period.category, en: period.category };
              const active = isActive(period.startTime, period.endTime);
              const past = isPast(period.endTime);
              return (
                <div key={period.id} className="flex gap-3">
                  <div className="w-14 shrink-0 pt-1 text-right">
                    <div style={{ font: "700 13px var(--font-sans)", color: active ? "var(--brand)" : "var(--ink)" }}>
                      {period.startTime}
                    </div>
                    <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>
                      {period.endTime}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div style={{
                      width: 10, height: 10, borderRadius: 999, marginTop: 5,
                      background: active ? "var(--brand)" : past ? "var(--muted)" : "var(--line)",
                      border: active ? "2px solid var(--surface)" : "none",
                      boxShadow: active ? "0 0 0 2px var(--brand)" : "none",
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, width: 2, background: "var(--line)", marginTop: 2 }} />
                  </div>
                  <div className="mb-2 flex-1 rounded-2xl p-3.5"
                    style={{
                      background: "var(--surface)",
                      border: active ? "2px solid var(--brand)" : "1px solid var(--line)",
                      opacity: past ? 0.55 : 1,
                    }}>
                    <div className="mb-1.5 flex items-center gap-2">
                      <span style={{ font: "600 11px var(--font-sans)", color: "var(--muted)" }}>
                        {t({ th: `คาบ ${period.periodLabel}`, en: `P${period.periodLabel}` })}
                      </span>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 3,
                        padding: "1px 8px", borderRadius: 999,
                        background: `color-mix(in srgb, ${catColor} 10%, transparent)`, color: catColor,
                        font: "600 11px var(--font-sans)",
                      }}>
                        ● {t(catLabel)}
                      </span>
                      {active && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 3,
                          padding: "1px 8px", borderRadius: 999,
                          border: "1px solid var(--brand)", color: "var(--brand)",
                          font: "600 11px var(--font-sans)",
                        }}>
                          {t({ th: "เรียนอยู่", en: "In session" })}
                        </span>
                      )}
                    </div>
                    <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)", lineHeight: 1.25 }}>
                      {period.courseName}
                    </div>
                    {(period.courseCode || period.room || period.instructor) && (
                      <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginTop: 4 }}>
                        {[period.courseCode, period.room, period.instructor].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
