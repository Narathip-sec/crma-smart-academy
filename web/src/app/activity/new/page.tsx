"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTx } from "@/components/shell/bilingual-label";
import { AppBar } from "@/components/shell/app-bar";

type Category = { id: string; nameTh: string };
type ActivityItem = { category: Category | null };

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px", borderRadius: 12,
  border: "1px solid var(--line)", background: "var(--surface)",
  font: "500 13px var(--font-sans)", color: "var(--ink)", outline: "none",
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ font: "600 12px var(--font-sans)", color: "var(--ink)", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "var(--danger)" }}>*</span>}
      </div>
      {children}
    </div>
  );
}

export default function CreateActivityPage() {
  const t = useTx();
  const router = useRouter();

  const [cats, setCats] = useState<Category[]>([]);
  const [titleTh, setTitleTh] = useState("");
  const [descriptionTh, setDescriptionTh] = useState("");
  const [location, setLocation] = useState("");
  const [startAt, setStartAt] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [categoryId, setCategoryId] = useState("");
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
        setCats(result);
      });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleTh.trim() || !startAt) return;
    setSubmitting(true); setError("");
    const res = await fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleTh,
        descriptionTh: descriptionTh || undefined,
        location: location || undefined,
        startAt: new Date(startAt).toISOString(),
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
      <AppBar th="สร้างกิจกรรม" en="Create Activity" />
      <form onSubmit={submit} className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <div className="flex flex-col gap-4">
          <Field label={t({ th: "ชื่อกิจกรรม", en: "Title" })} required>
            <input type="text" value={titleTh} onChange={e => setTitleTh(e.target.value)}
              placeholder={t({ th: "เช่น ค่ายผู้นำนักเรียนทหาร…", en: "e.g. Leadership camp…" })}
              style={inputStyle} required />
          </Field>
          <Field label={t({ th: "รายละเอียด", en: "Description" })}>
            <textarea value={descriptionTh} onChange={e => setDescriptionTh(e.target.value)}
              rows={3} placeholder={t({ th: "บอกรายละเอียดกิจกรรม…", en: "Describe the activity…" })}
              style={{ ...inputStyle, resize: "none" }} />
          </Field>
          <Field label={t({ th: "สถานที่", en: "Location" })}>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              placeholder={t({ th: "เช่น ห้องประชุมใหญ่", en: "e.g. Main Hall" })}
              style={inputStyle} />
          </Field>
          <Field label={t({ th: "วันและเวลาเริ่ม", en: "Start date & time" })} required>
            <input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)}
              style={inputStyle} required />
          </Field>
          <Field label={t({ th: "จำนวนที่นั่งสูงสุด", en: "Max attendees" })}>
            <input type="number" value={maxAttendees} onChange={e => setMaxAttendees(e.target.value)}
              min={1} placeholder={t({ th: "เว้นว่าง = ไม่จำกัด", en: "Leave blank = unlimited" })}
              style={inputStyle} />
          </Field>
          {cats.length > 0 && (
            <Field label={t({ th: "หมวดหมู่", en: "Category" })}>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
                <option value="">{t({ th: "— เลือกหมวดหมู่ —", en: "— Select category —" })}</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.nameTh}</option>)}
              </select>
            </Field>
          )}
          {error && <div style={{ font: "500 12px var(--font-sans)", color: "var(--danger)" }}>{error}</div>}
          <div className="rounded-2xl p-3" style={{ background: "var(--tint)", font: "500 11px var(--font-sans)", color: "var(--brand-dark)" }}>
            ℹ️ {t({ th: "กิจกรรมจะรอผู้ดูแลอนุมัติก่อนเผยแพร่", en: "Activity will be reviewed before publishing" })}
          </div>
          <button type="submit" disabled={submitting}
            className="w-full rounded-2xl py-4"
            style={{ background: "var(--brand)", font: "600 14px var(--font-sans)", color: "#fff", opacity: submitting ? 0.6 : 1 }}>
            {submitting ? t({ th: "กำลังส่ง…", en: "Submitting…" }) : t({ th: "ส่งเพื่อขออนุมัติ", en: "Submit for Review" })}
          </button>
        </div>
      </form>
    </div>
  );
}
