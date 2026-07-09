"use client";

import { useState } from "react";
import { AppBar } from "@/components/shell/app-bar";
import { useTx } from "@/components/shell/bilingual-label";
import {
  DAYS, DAY_LABELS, CATEGORY_COLOR, CATEGORY_LABEL,
  COHORT_NAMES, getSchedule,
  type DayOfWeek, type Cohort,
} from "@/lib/data/class";

// Dev default — P4 will replace with LIFF profile company
const USER_COHORT: Cohort = "วก.";

const JS_DAY_MAP: Record<number, DayOfWeek | null> = {
  1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday",
  0: null, 6: null,
};

function todayDay(): DayOfWeek {
  return JS_DAY_MAP[new Date().getDay()] ?? "Monday";
}

function nowStr(): string {
  return new Date().toTimeString().slice(0, 5);
}

export default function ClassPage() {
  const t = useTx();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDay());
  const cohort = USER_COHORT;

  const periods = getSchedule(cohort, selectedDay);
  const now = nowStr();
  const dayLabel = DAY_LABELS[selectedDay];
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

      {/* Branch label */}
      <div className="px-4 pt-2.5 pb-0.5">
        <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>
          {t(COHORT_NAMES[cohort])}
        </span>
      </div>

      {/* Day header */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div>
          <span style={{ font: "700 15px var(--font-sans)", color: "var(--ink)" }}>
            {t({ th: `วัน${dayLabel.th}`, en: dayLabel.en })}
          </span>
          <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginLeft: 8 }}>
            {t({ th: `${periods.length} คาบ · ภาค 1/2569`, en: `${periods.length} periods · Sem 1/2569` })}
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
        {periods.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12" style={{ color: "var(--muted)" }}>
            <div style={{ font: "600 15px var(--font-sans)" }}>
              {t({ th: "ไม่มีคาบเรียน", en: "No classes" })}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2.5">
          {periods.map((period, idx) => {
            const catColor = CATEGORY_COLOR[period.category] ?? "var(--muted)";
            const catLabel = CATEGORY_LABEL[period.category] ?? { th: period.category, en: period.category };
            const active = isActive(period.startTime, period.endTime);
            const past = isPast(period.endTime);
            return (
              <div key={idx} className="flex gap-3">
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
                      {t({ th: `คาบ ${period.periodOrder}`, en: `P${period.periodOrder}` })}
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
                    {t({ th: period.subjectNameTh, en: period.subjectNameEn || period.subjectNameTh })}
                  </div>
                  {period.subjectCode && (
                    <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginTop: 4 }}>
                      {period.subjectCode}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
