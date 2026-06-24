"use client";

import { useState } from "react";
import { AppBar } from "@/components/shell/app-bar";
import { useTx } from "@/components/shell/bilingual-label";
import {
  COHORTS, DAYS, DAY_LABELS, CATEGORY_COLOR, CATEGORY_LABEL,
  getSchedule, currentPeriodOrder,
  type Cohort, type DayOfWeek,
} from "@/lib/data/class";
import { CADET } from "@/lib/mock-data";

const JS_DAY_MAP: Record<number, DayOfWeek | null> = {
  1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday",
  0: null, 6: null,
};

function todayDay(): DayOfWeek {
  const d = JS_DAY_MAP[new Date().getDay()];
  return d ?? "Monday";
}

export default function ClassPage() {
  const t = useTx();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDay());
  const [cohort, setCohort] = useState<Cohort>(CADET.cohort as Cohort);
  const [showCohortPicker, setShowCohortPicker] = useState(false);

  const periods = getSchedule(cohort, selectedDay);
  const nowStr = new Date().toTimeString().slice(0, 5);
  const activePeriod = currentPeriodOrder(selectedDay, nowStr, cohort);
  const dayLabel = DAY_LABELS[selectedDay];
  const isToday = selectedDay === todayDay();

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <AppBar
        th="ตารางเรียน"
        en="Class Schedule"
        right={
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCohortPicker((v) => !v)}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5"
              style={{ background: "var(--tint)", font: "600 11px var(--font-sans)", color: "var(--brand-dark)" }}
            >
              {t({ th: "กลุ่ม", en: "Group" })} {cohort}
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                stroke="var(--brand-dark)" strokeWidth={2.5} strokeLinecap="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {showCohortPicker && (
              <div
                className="absolute right-0 top-9 z-20 overflow-hidden rounded-xl"
                style={{ background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "0 4px 20px rgba(0,0,0,.12)", minWidth: 120 }}
              >
                {COHORTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setCohort(c); setShowCohortPicker(false); }}
                    className="block w-full text-left px-3 py-2.5"
                    style={{
                      font: "500 12px var(--font-sans)",
                      color: c === cohort ? "var(--brand)" : "var(--ink)",
                      background: c === cohort ? "var(--tint)" : "transparent",
                    }}
                  >
                    {t({ th: `กลุ่ม ${c}`, en: `Group ${c}` })}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />

      {/* Day tabs */}
      <div
        className="flex gap-1.5 px-3 py-2"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}
      >
        {DAYS.map((day) => {
          const active = day === selectedDay;
          const lbl = DAY_LABELS[day];
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className="flex flex-1 flex-col items-center rounded-xl py-1.5"
              style={{
                background: active ? "var(--brand)" : "transparent",
                color: active ? "#fff" : "var(--muted)",
              }}
            >
              <span style={{ font: "700 13px var(--font-sans)" }}>{lbl.short}</span>
              <span style={{ font: "500 9px var(--font-sans)", marginTop: 1, opacity: .75 }}>{lbl.en.slice(0, 3)}</span>
            </button>
          );
        })}
      </div>

      {/* Day header */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div>
          <span style={{ font: "700 15px var(--font-sans)", color: "var(--ink)" }}>
            {t({ th: `วัน${dayLabel.th}`, en: dayLabel.en })}
          </span>
          <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginLeft: 8 }}>
            {t({ th: `${periods.length} คาบเรียน · ภาคการศึกษา 1/2569`, en: `${periods.length} periods · Sem 1/2569` })}
          </span>
        </div>
        {isToday && (
          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-1"
            style={{ background: "var(--tint)", font: "600 10px var(--font-sans)", color: "var(--brand-dark)" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--brand)", display: "inline-block" }} />
            {t({ th: "วันนี้", en: "Today" })}
          </span>
        )}
      </div>

      {/* Period list */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {periods.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12" style={{ color: "var(--muted)" }}>
            <div style={{ font: "600 14px var(--font-sans)" }}>
              {t({ th: "ไม่มีคาบเรียน", en: "No classes" })}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2.5">
          {periods.map((period) => {
            const catColor = CATEGORY_COLOR[period.category];
            const catLabel = CATEGORY_LABEL[period.category];
            const isActive = activePeriod === period.periodOrder;
            const isPast = activePeriod !== null && period.periodOrder < activePeriod;

            return (
              <div key={period.periodOrder} className="flex gap-3">
                {/* Time column */}
                <div className="w-14 shrink-0 pt-1 text-right">
                  <div style={{ font: "700 12px var(--font-sans)", color: isActive ? "var(--brand)" : "var(--ink)" }}>
                    {period.startTime}
                  </div>
                  <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)" }}>
                    {period.endTime}
                  </div>
                </div>

                {/* Spine dot */}
                <div className="flex flex-col items-center">
                  <div
                    style={{
                      width: 10, height: 10, borderRadius: 999, marginTop: 5,
                      background: isActive ? "var(--brand)" : isPast ? "var(--muted)" : "var(--line)",
                      border: isActive ? "2px solid var(--surface)" : "none",
                      boxShadow: isActive ? "0 0 0 2px var(--brand)" : "none",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, width: 2, background: "var(--line)", marginTop: 2 }} />
                </div>

                {/* Card */}
                <div
                  className="mb-2 flex-1 rounded-2xl p-3.5"
                  style={{
                    background: "var(--surface)",
                    border: isActive ? `2px solid var(--brand)` : "1px solid var(--line)",
                    opacity: isPast ? 0.55 : 1,
                  }}
                >
                  {/* Period label + category + status */}
                  <div className="mb-1.5 flex items-center gap-2">
                    <span style={{ font: "600 11px var(--font-sans)", color: "var(--muted)" }}>
                      {t({ th: `คาบ ${period.periodOrder}`, en: `P${period.periodOrder}` })}
                    </span>
                    <span
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 3,
                        padding: "1px 8px", borderRadius: 999,
                        background: catColor + "18", color: catColor,
                        font: "600 9px var(--font-sans)",
                      }}
                    >
                      ● {t(catLabel)}
                    </span>
                    {isActive && (
                      <span
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 3,
                          padding: "1px 8px", borderRadius: 999,
                          border: "1px solid var(--brand)",
                          color: "var(--brand)",
                          font: "600 9px var(--font-sans)",
                        }}
                      >
                        {t({ th: "เรียนอยู่", en: "In session" })}
                      </span>
                    )}
                  </div>

                  {/* Subject name */}
                  <div style={{ font: "700 14px var(--font-sans)", color: "var(--ink)", lineHeight: 1.25 }}>
                    {period.subjectNameTh}
                  </div>
                  {period.subjectNameEn && (
                    <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginTop: 2 }}>
                      {period.subjectNameEn}
                    </div>
                  )}

                  {/* Code */}
                  {period.subjectCode && (
                    <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 4 }}>
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
