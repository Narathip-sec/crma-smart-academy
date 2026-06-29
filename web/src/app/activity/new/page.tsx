"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTx } from "@/components/shell/bilingual-label";

type Category = { id: string; nameTh: string };
type ActivityItem = { category: Category | null };

const FALLBACK_CATS = [
  { id: "กีฬา", nameTh: "กีฬา" },
  { id: "วิชาการ", nameTh: "วิชาการ" },
  { id: "สังคม", nameTh: "สังคม" },
  { id: "กิจกรรม", nameTh: "กิจกรรม" },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px", borderRadius: 12,
  border: "1px solid var(--line)", background: "var(--surface)",
  font: "500 13px var(--font-sans)", color: "var(--ink)", outline: "none",
};

export default function CreateActivityPage() {
  const t = useTx();
  const router = useRouter();

  const [cats, setCats] = useState<Category[]>(FALLBACK_CATS);
  const [titleTh, setTitleTh] = useState("");
  const [descriptionTh, setDescriptionTh] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [categoryId, setCategoryId] = useState("กีฬา");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/activity")
      .then(r => r.json())
      .then((data: ActivityItem[]) => {
        const seen = new Set<string>();
        const result: Category[] = [];
        for (const ev of data) {
          if (ev.category && !seen.has(ev.category.id)) {
            seen.add(ev.category.id); result.push(ev.category);
          }
        }
        if (result.length > 0) { setCats(result); setCategoryId(result[0].id); }
      }).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleTh.trim() || !startDate) return;
    setSubmitting(true); setError("");

    const startAt = startDate && startTime
      ? new Date(`${startDate}T${startTime}`).toISOString()
      : new Date(`${startDate}T08:00`).toISOString();

    const res = await fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleTh,
        descriptionTh: descriptionTh || undefined,
        location: location || undefined,
        startAt,
        maxAttendees: maxAttendees ? Number(maxAttendees) : undefined,
        categoryId: categoryId || undefined,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      router.push("/activity");
    } else {
      const body = await res.json().catch(() => ({}));
      setError((body as { error?: string }).error ?? "สร้างกิจกรรมไม่สำเร็จ");
    }
  }

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 px-4"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
        <button type="button" onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)" }}>
          {t({ th: "สร้างกิจกรรม", en: "Create Activity" })}
        </div>
      </div>

      <form onSubmit={submit} className="flex-1 overflow-y-auto pb-8">

        {/* Cover image placeholder */}
        <div className="flex flex-col items-center justify-center gap-2 mx-4 mt-4 rounded-2xl"
          style={{ background: "var(--tint)", border: "1.5px dashed var(--brand)", minHeight: 140 }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: "var(--brand)18" }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <div style={{ font: "600 13px var(--font-sans)", color: "var(--brand)" }}>
            {t({ th: "เพิ่มภาพปก", en: "Add cover image" })}
          </div>
          <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)" }}>
            {t({ th: "แตะเพื่ออัปโหลด · JPG, PNG สูงสุด 5MB", en: "Tap to upload · JPG, PNG max 5MB" })}
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 pt-4">

          {/* Title */}
          <div>
            <div style={{ font: "600 12px var(--font-sans)", color: "var(--ink)", marginBottom: 6 }}>
              {t({ th: "ชื่อกิจกรรม", en: "Activity name" })} <span style={{ color: "var(--danger)" }}>*</span>
            </div>
            <input type="text" value={titleTh} onChange={e => setTitleTh(e.target.value)}
              placeholder={t({ th: "เช่น วิ่งเข้าเขาชนไก่…", en: "e.g. Mountain run…" })}
              style={inputStyle} />
          </div>

          {/* Category chips */}
          <div>
            <div style={{ font: "600 12px var(--font-sans)", color: "var(--ink)", marginBottom: 8 }}>
              {t({ th: "หมวดหมู่", en: "Category" })} <span style={{ color: "var(--danger)" }}>*</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {cats.map(c => (
                <button key={c.id} type="button" onClick={() => setCategoryId(c.id)}
                  className="rounded-full px-4 py-2"
                  style={{
                    background: categoryId === c.id ? "var(--brand)" : "var(--surface)",
                    color: categoryId === c.id ? "#fff" : "var(--muted)",
                    border: categoryId === c.id ? "none" : "1px solid var(--line)",
                    font: "600 13px var(--font-sans)",
                  }}>{c.nameTh}</button>
              ))}
            </div>
          </div>

          {/* Date + Time row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <div style={{ font: "600 12px var(--font-sans)", color: "var(--ink)", marginBottom: 6 }}>
                {t({ th: "วันที่", en: "Date" })} <span style={{ color: "var(--danger)" }}>*</span>
              </div>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                style={inputStyle} />
            </div>
            <div className="flex-1">
              <div style={{ font: "600 12px var(--font-sans)", color: "var(--ink)", marginBottom: 6 }}>
                {t({ th: "เวลา", en: "Time" })}
              </div>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                style={inputStyle} />
            </div>
          </div>

          {/* Location */}
          <div>
            <div style={{ font: "600 12px var(--font-sans)", color: "var(--ink)", marginBottom: 6 }}>
              {t({ th: "สถานที่", en: "Location" })} <span style={{ color: "var(--danger)" }}>*</span>
            </div>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              placeholder={t({ th: "เลือกหรือพิมพ์สถานที่ในค่าย…", en: "Location in camp…" })}
              style={{ ...inputStyle, paddingLeft: 40, backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "12px center" }} />
          </div>

          {/* Capacity */}
          <div>
            <div style={{ font: "600 12px var(--font-sans)", color: "var(--ink)", marginBottom: 6 }}>
              {t({ th: "จำนวนที่รับ · Capacity", en: "Capacity" })}
            </div>
            <input type="number" value={maxAttendees} onChange={e => setMaxAttendees(e.target.value)}
              min={1} placeholder={t({ th: "เช่น 40 (เว้นว่าง = ไม่จำกัด)", en: "e.g. 40 (blank = unlimited)" })}
              style={inputStyle} />
          </div>

          {/* Description */}
          <div>
            <div style={{ font: "600 12px var(--font-sans)", color: "var(--ink)", marginBottom: 6 }}>
              {t({ th: "รายละเอียด", en: "Description" })}
            </div>
            <textarea value={descriptionTh} onChange={e => setDescriptionTh(e.target.value)}
              rows={3} placeholder={t({ th: "บอกรายละเอียดกิจกรรม…", en: "Describe the activity…" })}
              style={{ ...inputStyle, resize: "none" }} />
          </div>

          {error && <div style={{ font: "500 12px var(--font-sans)", color: "var(--danger)" }}>{error}</div>}

          <button type="submit" disabled={submitting || !titleTh.trim() || !startDate}
            className="w-full rounded-2xl py-4"
            style={{
              background: "var(--brand)", font: "600 14px var(--font-sans)", color: "#fff",
              opacity: (submitting || !titleTh.trim() || !startDate) ? 0.5 : 1,
            }}>
            {submitting ? t({ th: "กำลังส่ง…", en: "Submitting…" }) : `✓ ${t({ th: "สร้างกิจกรรม", en: "Create Activity" })}`}
          </button>
        </div>
      </form>
    </div>
  );
}
