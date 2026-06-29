"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/shell/app-bar";
import { useTx } from "@/components/shell/bilingual-label";

type Category = { id: string; nameTh: string; nameEn: string | null };
type Team = { id: string; nameTh: string };
type MetaResponse = { categories?: Category[]; teams?: Team[] };

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

export default function ReportPage() {
  const t = useTx();
  const router = useRouter();

  const [cats, setCats] = useState<Category[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [titleTh, setTitleTh] = useState("");
  const [descriptionTh, setDescriptionTh] = useState("");
  const [locationDetail, setLocationDetail] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/report/meta").then(r => r.json()).then((d: MetaResponse) => {
      if (d.categories) setCats(d.categories);
      if (d.teams) setTeams(d.teams);
    }).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleTh.trim()) return;
    setSubmitting(true); setError("");
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleTh,
        descriptionTh: descriptionTh || undefined,
        locationDetail: locationDetail || undefined,
        categoryId: categoryId || undefined,
        teamId: teamId || undefined,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      router.push("/report/tickets");
    } else {
      const body = await res.json().catch(() => ({}));
      setError((body as { error?: string }).error ?? "แจ้งซ่อมไม่สำเร็จ");
    }
  }

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <AppBar th="แจ้งซ่อม / เหตุ" en="Report / Fix" />
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ font: "500 12px var(--font-sans)", color: "var(--muted)" }}>
          {t({ th: "แจ้งปัญหาซ่อมแซมหรือเหตุการณ์ผิดปกติ", en: "Report maintenance or incidents" })}
        </div>
        <Link href="/report/tickets"
          style={{ font: "600 12px var(--font-sans)", color: "var(--brand)", textDecoration: "none", whiteSpace: "nowrap", marginLeft: 8 }}>
          {t({ th: "รายการของฉัน →", en: "My tickets →" })}
        </Link>
      </div>
      <form onSubmit={submit} className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <div className="flex flex-col gap-4">
          <Field label={t({ th: "หัวข้อ", en: "Title" })} required>
            <input type="text" value={titleTh} onChange={e => setTitleTh(e.target.value)}
              placeholder={t({ th: "เช่น ไฟฟ้าดับห้อง 301…", en: "e.g. Power outage room 301…" })}
              style={inputStyle} required />
          </Field>
          <Field label={t({ th: "รายละเอียด", en: "Details" })}>
            <textarea value={descriptionTh} onChange={e => setDescriptionTh(e.target.value)}
              rows={3} placeholder={t({ th: "อธิบายปัญหาเพิ่มเติม…", en: "Describe the issue…" })}
              style={{ ...inputStyle, resize: "none" }} />
          </Field>
          <Field label={t({ th: "สถานที่", en: "Location" })}>
            <input type="text" value={locationDetail} onChange={e => setLocationDetail(e.target.value)}
              placeholder={t({ th: "เช่น อาคาร 3 ชั้น 2 ห้อง 201", en: "e.g. Bldg 3, Floor 2, Rm 201" })}
              style={inputStyle} />
          </Field>
          {cats.length > 0 && (
            <Field label={t({ th: "ประเภทปัญหา", en: "Category" })}>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
                <option value="">{t({ th: "— เลือกประเภท —", en: "— Select category —" })}</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.nameTh}</option>)}
              </select>
            </Field>
          )}
          {teams.length > 0 && (
            <Field label={t({ th: "ส่งให้ทีม", en: "Assign to team" })}>
              <select value={teamId} onChange={e => setTeamId(e.target.value)} style={inputStyle}>
                <option value="">{t({ th: "— เลือกทีม (ไม่บังคับ) —", en: "— Assign team (optional) —" })}</option>
                {teams.map(tm => <option key={tm.id} value={tm.id}>{tm.nameTh}</option>)}
              </select>
            </Field>
          )}
          {error && <div style={{ font: "500 12px var(--font-sans)", color: "var(--danger)" }}>{error}</div>}
          <button type="submit" disabled={submitting}
            className="w-full rounded-2xl py-4"
            style={{ background: "var(--brand)", font: "600 14px var(--font-sans)", color: "#fff", opacity: submitting ? 0.6 : 1 }}>
            {submitting ? t({ th: "กำลังส่ง…", en: "Submitting…" }) : t({ th: "แจ้งซ่อม / เหตุ", en: "Submit Report" })}
          </button>
        </div>
      </form>
    </div>
  );
}
