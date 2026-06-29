export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import { AppBar } from "@/components/shell/app-bar";
import { MealType } from "@prisma/client";

const THAI_MONTHS_FULL = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
];
const THAI_MONTHS_SHORT = [
  "ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.",
  "ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค.",
];

const MEAL_LABEL: Record<MealType, { th: string; en: string; color: string }> = {
  breakfast: { th: "เช้า",   en: "Breakfast", color: "#f59e0b" },
  lunch:     { th: "กลางวัน", en: "Lunch",     color: "var(--brand)" },
  dinner:    { th: "เย็น",   en: "Dinner",    color: "#7c3aed" },
};

function thaiDate(d: Date): string {
  const be = d.getFullYear() + 543;
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${String(be).slice(-2)}`;
}

function thaiMonthYear(d: Date): string {
  return `${THAI_MONTHS_FULL[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export default async function MealsPage() {
  // Find the most recent month with data.
  const latest = await prisma.mealItem.findFirst({ orderBy: { date: "desc" } });
  if (!latest) {
    return (
      <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
        <AppBar th="เมนูอาหาร" en="Meals" />
        <div className="flex flex-1 items-center justify-center" style={{ color: "var(--muted)", font: "500 13px var(--font-sans)" }}>
          ยังไม่มีข้อมูลเมนู
        </div>
      </div>
    );
  }

  const ref = new Date(latest.date);
  const from = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const to   = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);

  const items = await prisma.mealItem.findMany({
    where: { date: { gte: from, lt: to } },
    orderBy: [{ date: "asc" }, { mealType: "asc" }],
  });

  // Group by date string (ISO).
  const byDate = new Map<string, typeof items>();
  for (const item of items) {
    const key = new Date(item.date).toISOString().slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(item);
  }

  const days = [...byDate.entries()].map(([key, meals]) => ({
    key,
    date: new Date(key),
    meals,
  }));

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <AppBar th="เมนูอาหาร" en="Meals" />

      {/* Month header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}
      >
        <span style={{ font: "700 14px var(--font-sans)", color: "var(--ink)" }}>
          {thaiMonthYear(from)}
        </span>
        <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>
          {days.length} วัน
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3">
        <div className="flex flex-col gap-3">
          {days.map(({ key, date, meals }) => {
            const mealMap = Object.fromEntries(meals.map((m) => [m.mealType, m]));
            return (
              <div
                key={key}
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid var(--line)", background: "var(--surface)" }}
              >
                {/* Date header */}
                <div
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: "var(--tint)", borderBottom: "1px solid var(--line)" }}
                >
                  <span style={{ font: "700 13px var(--font-sans)", color: "var(--brand-dark)" }}>
                    {thaiDate(date)}
                  </span>
                  <span style={{ font: "500 10px var(--font-sans)", color: "var(--brand)" }}>
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                </div>

                {/* Meal rows */}
                <div className="divide-y" style={{ borderColor: "var(--line)" }}>
                  {([MealType.breakfast, MealType.lunch, MealType.dinner] as MealType[]).map((type) => {
                    const meal = mealMap[type];
                    const lbl = MEAL_LABEL[type];
                    return (
                      <div key={type} className="flex items-start gap-3 px-4 py-3">
                        <div
                          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                          style={{ background: lbl.color + "18" }}
                        >
                          <span style={{ font: "700 8px var(--font-sans)", color: lbl.color }}>
                            {lbl.th}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          {meal ? (
                            <>
                              <div style={{ font: "500 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.4 }}>
                                {meal.menuTh}
                              </div>
                              {meal.menuEn && (
                                <div style={{ font: "400 10px var(--font-sans)", color: "var(--muted)", marginTop: 1 }}>
                                  {meal.menuEn}
                                </div>
                              )}
                              {meal.note && (
                                <div style={{ font: "500 10px var(--font-sans)", color: lbl.color, marginTop: 2 }}>
                                  {meal.note}
                                </div>
                              )}
                            </>
                          ) : (
                            <div style={{ font: "400 12px var(--font-sans)", color: "var(--muted)" }}>—</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
