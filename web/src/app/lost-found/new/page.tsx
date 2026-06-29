"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTx } from "@/components/shell/bilingual-label";

type Category = { id: string; nameTh: string };

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

export default function LostFoundNewPage() {
  const t = useTx();
  const router = useRouter();

  const [cats, setCats] = useState<Category[]>([]);
  const [titleTh, setTitleTh] = useState("");
  const [descriptionTh, setDescriptionTh] = useState("");
  const [foundLocation, setFoundLocation] = useState("");
  const [foundAt, setFoundAt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/lost-found/meta").then(r => r.json()).then((d: { categories?: Category[] }) => {
      if (d.categories) setCats(d.categories);
    }).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleTh.trim() || !descriptionTh.trim()) return;
    setSubmitting(true); setError("");
    const res = await fetch("/api/lost-found", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleTh,
        descriptionTh,
        categoryId: categoryId || undefined,
        foundAt: foundAt || undefined,
        foundLocation: foundLocation || undefined,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      router.push("/lost-found");
    } else {
      const body = await res.json().catch(() => ({}));
      setError((body as { error?: string }).error ?? "บันทึกไม่สำเร็จ");
    }
  }

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 px-4"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
        <button type="button" onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }} aria-label="Back">
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div>
          <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)" }}>
            {t({ th: "แจ้งของพบ / ของหาย", en: "Report Lost or Found" })}
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <div className="flex flex-col gap-4">

          <Field label={t({ th: "ชื่อสิ่งของ", en: "Item name" })} required>
            <input
              type="text"
              value={titleTh}
              onChange={e => setTitleTh(e.target.value)}
              placeholder={t({ th: "เช่น กระเป๋าสีดำ, โทรศัพท์มือถือ…", en: "e.g. Black bag, mobile phone…" })}
              style={inputStyle}
            />
          </Field>

          <Field label={t({ th: "รายละเอียด", en: "Description" })} required>
            <textarea
              value={descriptionTh}
              onChange={e => setDescriptionTh(e.target.value)}
              rows={3}
              placeholder={t({ th: "ลักษณะ สี เครื่องหมาย หรือข้อมูลเพิ่มเติม…", en: "Appearance, color, markings…" })}
              style={{ ...inputStyle, resize: "none" }}
            />
          </Field>

          {cats.length > 0 && (
            <Field label={t({ th: "ประเภท", en: "Category" })}>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
                <option value="">{t({ th: "— เลือกประเภท —", en: "— Select category —" })}</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.nameTh}</option>)}
              </select>
            </Field>
          )}

          <Field label={t({ th: "สถานที่พบ / หาย", en: "Location found / lost" })}>
            <input
              type="text"
              value={foundLocation}
              onChange={e => setFoundLocation(e.target.value)}
              placeholder={t({ th: "เช่น อาคาร 1 ชั้น 2, โรงอาหาร…", en: "e.g. Building 1 floor 2, canteen…" })}
              style={inputStyle}
            />
          </Field>

          <Field label={t({ th: "วันที่พบ / หาย", en: "Date found / lost" })}>
            <input
              type="date"
              value={foundAt}
              onChange={e => setFoundAt(e.target.value)}
              style={inputStyle}
            />
          </Field>

          {error && (
            <div style={{ font: "500 12px var(--font-sans)", color: "var(--danger)" }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting || !titleTh.trim() || !descriptionTh.trim()}
            className="w-full rounded-2xl py-4"
            style={{
              background: "var(--brand)",
              font: "600 14px var(--font-sans)",
              color: "#fff",
              opacity: (submitting || !titleTh.trim() || !descriptionTh.trim()) ? 0.5 : 1,
              cursor: (submitting || !titleTh.trim() || !descriptionTh.trim()) ? "not-allowed" : "pointer",
            }}>
            {submitting
              ? t({ th: "กำลังบันทึก…", en: "Saving…" })
              : t({ th: "แจ้งของพบ / ของหาย", en: "Submit Report" })}
          </button>
        </div>
      </form>
    </div>
  );
}
