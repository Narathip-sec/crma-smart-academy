"use client";

import { useState, useEffect } from "react";
import { AppBar } from "@/components/shell/app-bar";
import { LoadingState, ErrorState } from "@/components/ui";

type MealRow = {
  id: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner";
  menuTh: string;
  menuEn: string | null;
  note: string | null;
};

const MEAL_LABEL = {
  breakfast: { th: "เช้า",    en: "Breakfast", color: "var(--warning)" },
  lunch:     { th: "กลางวัน", en: "Lunch",     color: "var(--brand)" },
  dinner:    { th: "เย็น",    en: "Dinner",    color: "var(--cat-notice)" },
};

const DAY_SHORT  = ["อา","จ","อ","พ","พฤ","ศ","ส"];
const DAY_FULL   = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"];
const MONTH_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

function getMondayOf(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d);
  m.setDate(d.getDate() + diff);
  m.setHours(0, 0, 0, 0);
  return m;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function MealsPage() {
  const today = new Date();
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOf(today));
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const dow = today.getDay();
    return dow === 0 || dow === 6 ? 0 : dow - 1; // Mon=0..Fri=4
  });
  // Keyed by week range so switching weeks shows the loading state
  // without a synchronous setState reset inside the effect.
  const [fetched, setFetched] = useState<{ key: string; rows: MealRow[]; error?: boolean } | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  const from = toIso(weekStart);
  const to   = toIso(addDays(weekStart, 7));
  const rangeKey = `${from}:${to}`;

  useEffect(() => {
    let cancelled = false;
    const key = `${from}:${to}`;
    fetch(`/api/meals?from=${from}&to=${to}`)
      .then(r => r.json())
      .then((data: MealRow[]) => {
        if (!cancelled) setFetched({ key, rows: Array.isArray(data) ? data : [] });
      })
      .catch(() => {
        if (!cancelled) setFetched({ key, rows: [], error: true });
      });
    return () => { cancelled = true; };
  }, [from, to, retryTick]);

  const meals = fetched?.key === rangeKey ? fetched.rows : null;
  const mealsError = fetched?.key === rangeKey ? !!fetched.error : false;

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const selectedDate = weekDays[selectedDay];
  const selectedIso  = toIso(selectedDate);

  const dayMeals = (meals ?? []).filter(m => m.date.slice(0, 10) === selectedIso);
  const mealMap  = Object.fromEntries(dayMeals.map(m => [m.mealType, m])) as Partial<Record<string, MealRow>>;

  const currentWeekStart = toIso(getMondayOf(today));
  const isCurrentWeek    = currentWeekStart === from;
  const isTodaySelected  = toIso(today) === selectedIso;

  const weekLabel = `${MONTH_SHORT[weekStart.getMonth()]} ${weekStart.getFullYear() + 543}`;

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <AppBar th="เมนูอาหาร" en="Meals" back />

      {/* Week navigation */}
      <div className="flex items-center justify-between px-4 py-2"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
        <button type="button"
          onClick={() => { setWeekStart(w => addDays(w, -7)); setSelectedDay(0); }}
          className="flex h-8 w-8 items-center justify-center rounded-full active:opacity-70"
          style={{ background: "var(--bg)" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="text-center">
          <div style={{ font: "700 13px var(--font-sans)", color: "var(--ink)" }}>{weekLabel}</div>
          {isCurrentWeek && (
            <div style={{ font: "600 11px var(--font-sans)", color: "var(--brand)", marginTop: 1 }}>สัปดาห์นี้</div>
          )}
        </div>

        <button type="button"
          onClick={() => { setWeekStart(w => addDays(w, 7)); setSelectedDay(0); }}
          className="flex h-8 w-8 items-center justify-center rounded-full active:opacity-70"
          style={{ background: "var(--bg)" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Day tabs: Mon–Fri */}
      <div className="grid grid-cols-5 gap-1.5 px-3 pt-3">
        {weekDays.map((d, i) => {
          const iso    = toIso(d);
          const isToday  = toIso(today) === iso;
          const active = selectedDay === i;
          return (
            <button key={i} type="button" onClick={() => setSelectedDay(i)}
              className="flex flex-col items-center rounded-xl py-2.5 active:opacity-70"
              style={{
                background: active ? "var(--brand)" : isToday ? "var(--tint)" : "var(--surface)",
                border: `1.5px solid ${active ? "var(--brand)" : isToday ? "var(--brand)" : "var(--line)"}`,
              }}>
              <span style={{ font: "600 11px var(--font-sans)", color: active ? "rgba(255,255,255,.8)" : "var(--muted)" }}>
                {DAY_SHORT[d.getDay()]}
              </span>
              <span style={{ font: "700 15px var(--font-sans)", color: active ? "#fff" : isToday ? "var(--brand)" : "var(--ink)", marginTop: 2 }}>
                {d.getDate()}
              </span>
              <span style={{ font: "500 11px var(--font-sans)", color: active ? "rgba(255,255,255,.65)" : "var(--muted)", marginTop: 1 }}>
                {MONTH_SHORT[d.getMonth()]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Meals panel */}
      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3">
        {mealsError ? (
          <ErrorState onRetry={() => setRetryTick(n => n + 1)} />
        ) : meals === null ? (
          <LoadingState label="กำลังโหลด…" />
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>

            {/* Day header */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ background: "var(--tint)", borderBottom: "1px solid var(--line)" }}>
              <span style={{ font: "700 13px var(--font-sans)", color: "var(--brand-dark)" }}>
                วัน{DAY_FULL[selectedDate.getDay()]} {selectedDate.getDate()} {MONTH_SHORT[selectedDate.getMonth()]} {selectedDate.getFullYear() + 543}
              </span>
              {isTodaySelected && (
                <span style={{ font: "700 11px var(--font-sans)", color: "var(--brand)", background: "color-mix(in srgb, var(--brand) 10%, transparent)", padding: "2px 8px", borderRadius: 999 }}>
                  วันนี้
                </span>
              )}
            </div>

            {/* Meal rows */}
            <div className="divide-y" style={{ borderColor: "var(--line)" }}>
              {(["breakfast", "lunch", "dinner"] as const).map(type => {
                const meal = mealMap[type];
                const lbl  = MEAL_LABEL[type];
                return (
                  <div key={type} className="flex items-start gap-3 px-4 py-4">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                      style={{ background: `color-mix(in srgb, ${lbl.color} 10%, transparent)` }}>
                      <span style={{ font: "700 11px var(--font-sans)", color: lbl.color }}>{lbl.th}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      {meal ? (
                        <>
                          <div style={{ font: "500 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.4 }}>
                            {meal.menuTh}
                          </div>
                          {meal.menuEn && (
                            <div style={{ font: "400 11px var(--font-sans)", color: "var(--muted)", marginTop: 1 }}>
                              {meal.menuEn}
                            </div>
                          )}
                          {meal.note && (
                            <div style={{ font: "500 11px var(--font-sans)", color: lbl.color, marginTop: 2 }}>
                              {meal.note}
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ font: "400 13px var(--font-sans)", color: "var(--muted)" }}>—</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
