import { prisma } from "@/lib/db";
import { AppBar } from "@/components/shell/app-bar";
import { CalendarCategory } from "@prisma/client";

const THAI_MONTHS_FULL = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
];
const THAI_MONTHS_SHORT = [
  "ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.",
  "ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค.",
];

const CAT_COLOR: Record<CalendarCategory, string> = {
  academic: "var(--brand)",
  exam:     "#c62828",
  military: "#1565c0",
  activity: "#2e7d32",
  holiday:  "#e65100",
  deadline: "#ad1457",
};

const CAT_LABEL: Record<CalendarCategory, { th: string; en: string }> = {
  academic: { th: "วิชาการ",    en: "Academic" },
  exam:     { th: "สอบ",       en: "Exam" },
  military: { th: "ทหาร",      en: "Military" },
  activity: { th: "กิจกรรม",   en: "Activity" },
  holiday:  { th: "วันหยุด",   en: "Holiday" },
  deadline: { th: "กำหนดส่ง",  en: "Deadline" },
};

function thaiShortDate(d: Date): string {
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`;
}

export default async function CalendarPage() {
  const events = await prisma.academicCalendarEvent.findMany({
    orderBy: { date: "asc" },
  });

  if (events.length === 0) {
    return (
      <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
        <AppBar th="ปฏิทินวิชาการ" en="Calendar" />
        <div className="flex flex-1 items-center justify-center" style={{ color: "var(--muted)", font: "500 13px var(--font-sans)" }}>
          ยังไม่มีข้อมูลปฏิทิน
        </div>
      </div>
    );
  }

  // Group by month key "YYYY-MM".
  const byMonth = new Map<string, typeof events>();
  for (const ev of events) {
    const d = new Date(ev.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(ev);
  }

  const months = [...byMonth.entries()].map(([key, evs]) => {
    const [y, m] = key.split("-").map(Number);
    return { key, label: `${THAI_MONTHS_FULL[m - 1]} ${y + 543}`, events: evs };
  });

  const academicYear = events[0]?.academicYear ?? "";

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <AppBar th="ปฏิทินวิชาการ" en="Calendar" />

      {/* Academic year header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}
      >
        <span style={{ font: "700 14px var(--font-sans)", color: "var(--ink)" }}>
          ปีการศึกษา {academicYear}
        </span>
        <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>
          {events.length} รายการ
        </span>
      </div>

      {/* Category legend */}
      <div
        className="flex gap-3 overflow-x-auto px-4 py-2.5"
        style={{ scrollbarWidth: "none", borderBottom: "1px solid var(--line)" }}
      >
        {(Object.keys(CAT_LABEL) as CalendarCategory[]).map((cat) => (
          <div key={cat} className="flex shrink-0 items-center gap-1.5">
            <span
              style={{
                width: 8, height: 8, borderRadius: 999,
                background: CAT_COLOR[cat], display: "inline-block", flexShrink: 0,
              }}
            />
            <span style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", whiteSpace: "nowrap" }}>
              {CAT_LABEL[cat].th}
            </span>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3">
        <div className="flex flex-col gap-5">
          {months.map(({ key, label, events: evs }) => (
            <div key={key}>
              <div
                className="mb-2 px-1"
                style={{ font: "700 13px var(--font-sans)", color: "var(--brand-dark)" }}
              >
                {label}
              </div>
              <div className="flex flex-col gap-2">
                {evs.map((ev) => {
                  const d = new Date(ev.date);
                  const color = CAT_COLOR[ev.category] ?? "var(--muted)";
                  const catLbl = CAT_LABEL[ev.category];
                  const hasNote = !!ev.note?.includes("verify") || !!ev.note?.includes("label_verify");
                  return (
                    <div
                      key={ev.id}
                      className="flex items-start gap-3 rounded-2xl p-3.5"
                      style={{
                        background: "var(--surface)",
                        border: `1px solid var(--line)`,
                        borderLeft: `3px solid ${color}`,
                      }}
                    >
                      {/* Date badge */}
                      <div
                        className="flex w-11 shrink-0 flex-col items-center rounded-xl py-1.5"
                        style={{ background: color + "12" }}
                      >
                        <span style={{ font: "700 15px var(--font-sans)", color, lineHeight: 1 }}>
                          {d.getDate()}
                        </span>
                        <span style={{ font: "500 9px var(--font-sans)", color: color + "bb", marginTop: 1 }}>
                          {THAI_MONTHS_SHORT[d.getMonth()]}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-1.5">
                          <span
                            style={{
                              display: "inline-block", padding: "1px 7px", borderRadius: 999,
                              background: color + "18", color,
                              font: "600 9px var(--font-sans)",
                            }}
                          >
                            {catLbl.th}
                          </span>
                          {hasNote && (
                            <span
                              style={{
                                display: "inline-block", padding: "1px 7px", borderRadius: 999,
                                background: "#fbf1dc", color: "#b45309",
                                font: "600 9px var(--font-sans)",
                              }}
                            >
                              ⚠ รอยืนยัน
                            </span>
                          )}
                        </div>
                        <div style={{ font: "600 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.3 }}>
                          {ev.titleTh}
                        </div>
                        {ev.titleEn && (
                          <div style={{ font: "400 10px var(--font-sans)", color: "var(--muted)", marginTop: 1 }}>
                            {ev.titleEn}
                          </div>
                        )}
                        {ev.startTime && (
                          <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 2 }}>
                            🕐 {ev.startTime}{ev.endTime ? `–${ev.endTime}` : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
