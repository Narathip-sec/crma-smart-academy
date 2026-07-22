"use client";

import { useState, useEffect } from "react";
import { useTx } from "@/components/shell/bilingual-label";
import { Chip, ListItem } from "@/components/ui";

type MeData = {
  displayName: string;
  avatarUrl: string | null;
  cadetProfile: {
    thaiName: string;
    englishName: string;
    rank: string;
    yearLevel: number;
    battalion: string;
    company: string;
    studentCode: string;
  } | null;
};

// "BN-1" → "1", "Co-A" → "1" (A=1..E=5) — matches the ป.4 ร้อย.1 shorthand
// used around camp, instead of the raw BN-/Co- codes.
const COMPANY_LETTER_TO_NUM: Record<string, string> = { A: "1", B: "2", C: "3", D: "4", E: "5" };

function formatUnit(battalion: string, company: string): string {
  const bn = battalion.match(/(\d+)/)?.[1] ?? battalion;
  const letter = company.match(/Co-([A-Za-z])/)?.[1]?.toUpperCase();
  const co = letter ? (COMPANY_LETTER_TO_NUM[letter] ?? letter) : company;
  return `พัน.${bn} ร้อย.${co}`;
}

type GradeRow = { code: string; courseTh: string; courseEn: string | null; credits: number; grade: string | null };
type GradesData = {
  semesters: { label: string; isCurrent: boolean }[];
  gradesBySemester: Record<string, GradeRow[]>;
  gpax: string;
  yearRank: number | null;
  yearRankTotal: number | null;
};

function BackButton() {
  return (
    <button type="button" onClick={() => window.history.back()}
      className="flex h-9 w-9 items-center justify-center rounded-full active:opacity-70"
      style={{ background: "rgba(255,255,255,.2)" }} aria-label="Back">
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

export default function ProfilePage() {
  const [sem, setSem] = useState<string | null>(null);
  const [me, setMe] = useState<MeData | null>(null);
  const [grades, setGrades] = useState<GradesData | null>(null);
  const t = useTx();

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then((data: MeData) => setMe(data)).catch(() => {});
    fetch("/api/grades").then(r => r.json()).then((data: GradesData) => {
      setGrades(data);
      const current = data.semesters?.find(s => s.isCurrent) ?? data.semesters?.[0];
      if (current) setSem(current.label);
    }).catch(() => {});
  }, []);

  const semesters = grades?.semesters ?? [];
  const rows = (sem ? grades?.gradesBySemester[sem] : undefined) ?? [];
  const gpax = grades?.gpax ?? "—";
  const isPending = !!semesters.find(s => s.label === sem)?.isCurrent;

  const profile = me?.cadetProfile;
  const thaiName = profile ? `นนร.${profile.thaiName}` : me?.displayName ?? "—";
  const englishName = profile?.englishName ?? "";
  const initials = profile ? profile.thaiName.slice(0, 2) : "นร";

  return (
    <div className="flex flex-1 flex-col overflow-y-auto" style={{ background: "var(--bg)" }}>
      <div style={{ background: "linear-gradient(135deg, var(--grad-from) 0%, var(--grad-to) 100%)", padding: "12px 16px 20px" }}>
        <div className="mb-4 flex items-center">
          <BackButton />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,.25)", font: "700 20px var(--font-sans)", color: "#fff" }}>
            {me?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.avatarUrl} alt={thaiName} width={64} height={64}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : initials}
          </div>
          <div>
            <div style={{ font: "700 20px var(--font-sans)", color: "#fff", lineHeight: 1.2 }}>{thaiName}</div>
            {englishName && (
              <div style={{ font: "500 13px var(--font-sans)", color: "rgba(255,255,255,.8)", marginTop: 3 }}>{englishName}</div>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2" style={{ borderTop: "1px solid rgba(255,255,255,.2)", paddingTop: 12 }}>
          {[
            { labelTh: "ชั้นปี", labelEn: "Year", value: profile ? String(profile.yearLevel) : "—" },
            { labelTh: "สังกัด", labelEn: "Affiliation", value: profile ? formatUnit(profile.battalion, profile.company) : "—" },
          ].map(s => (
            <div key={s.labelTh} className="text-center">
              <div style={{ font: "600 11px var(--font-sans)", color: "rgba(255,255,255,.65)" }}>{t({ th: s.labelTh, en: s.labelEn })}</div>
              <div style={{ font: "700 13px var(--font-sans)", color: "#fff", marginTop: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 py-4">
        <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>{t({ th: "GPAX สะสม", en: "Cumulative GPAX" })}</div>
          <div style={{ font: "700 28px var(--font-sans)", color: "var(--brand)", lineHeight: 1.1, marginTop: 4 }}>{gpax === "—" ? "—" : gpax}</div>
          <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginTop: 2 }}>{t({ th: "จาก 4.00", en: "out of 4.00" })}</div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>{t({ th: "อันดับในชั้นปี", en: "Year Rank" })}</div>
          <div style={{ font: "700 28px var(--font-sans)", color: "var(--ink)", lineHeight: 1.1, marginTop: 4 }}>{grades?.yearRank ?? "—"}</div>
          <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginTop: 2 }}>{t({ th: `จาก ${grades?.yearRankTotal ?? "—"} นาย`, en: `of ${grades?.yearRankTotal ?? "—"} cadets` })}</div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)", marginBottom: 12 }}>
          {t({ th: "ผลการเรียนรายภาค", en: "Grades by Term" })}
        </div>
        <div className="pb-3">
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {semesters.map(s => (
              <Chip key={s.label} active={s.label === sem} onClick={() => setSem(s.label)}>
                {t({ th: `ภาค ${s.label}`, en: `Sem ${s.label}` })}
              </Chip>
            ))}
          </div>
        </div>
        {isPending && (
          <div className="mb-3 flex items-center gap-3 rounded-2xl p-3.5" style={{ background: "color-mix(in srgb, var(--warning) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--warning) 35%, transparent)" }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--warning)", color: "#fff", font: "700 13px var(--font-sans)" }}>⏱</div>
            <div>
              <div style={{ font: "600 13px var(--font-sans)", color: "var(--ink)" }}>{t({ th: "ผลการเรียนยังไม่ประกาศ", en: "Grades Not Yet Released" })}</div>
              <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginTop: 2 }}>{t({ th: "ภาคเรียนกำลังดำเนินอยู่", en: "Semester in progress" })}</div>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {rows.map(row => (
            <ListItem
              key={row.code}
              title={t({ th: row.courseTh, en: row.courseEn ?? row.courseTh })}
              subtitle={`${row.code} · ${t({ th: `${row.credits} หน่วยกิต`, en: `${row.credits} cr` })}`}
              trailing={row.grade === null ? (
                <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: "var(--tint)", color: "var(--muted)", font: "600 11px var(--font-sans)" }}>
                  {t({ th: "รอผล", en: "Pending" })}
                </span>
              ) : (
                <span style={{ font: "700 20px var(--font-sans)", color: row.grade.startsWith("A") ? "var(--brand)" : "var(--ink)" }}>{row.grade}</span>
              )}
              style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-card)", padding: "14px 16px" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
