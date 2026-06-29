"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTx } from "@/components/shell/bilingual-label";
import { GRADES_BY_SEMESTER, SEMESTERS, CURRENT_SEMESTER, YEAR_RANK, gpaFor, type SemesterKey } from "@/lib/mock-data";

type MeData = {
  displayName: string;
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

function BackButton() {
  return (
    <button type="button" onClick={() => window.history.back()}
      className="flex h-9 w-9 items-center justify-center rounded-full"
      style={{ background: "rgba(255,255,255,.2)" }} aria-label="Back">
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

export default function ProfilePage() {
  const [sem, setSem] = useState<SemesterKey>(CURRENT_SEMESTER);
  const [me, setMe] = useState<MeData | null>(null);
  const t = useTx();

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then((data: MeData) => setMe(data));
  }, []);

  const rows = GRADES_BY_SEMESTER[sem] ?? [];
  const { gpax } = gpaFor(sem);
  const isPending = sem === CURRENT_SEMESTER;

  const profile = me?.cadetProfile;
  const thaiName = profile ? `นนร.${profile.thaiName}` : me?.displayName ?? "—";
  const englishName = profile?.englishName ?? "";
  const initials = profile ? profile.thaiName.slice(0, 2) : "นร";

  return (
    <div className="flex flex-1 flex-col overflow-y-auto" style={{ background: "var(--bg)" }}>
      <div style={{ background: "linear-gradient(135deg, var(--grad-from) 0%, var(--grad-to) 100%)", padding: "12px 16px 20px" }}>
        <div className="mb-4 flex items-center justify-between">
          <BackButton />
          <Link href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,.2)" }} aria-label="Settings">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,.25)", font: "700 20px var(--font-sans)", color: "#fff" }}>
            {initials}
          </div>
          <div>
            <div style={{ font: "700 17px var(--font-sans)", color: "#fff", lineHeight: 1.2 }}>{thaiName}</div>
            {englishName && (
              <div style={{ font: "500 12px var(--font-sans)", color: "rgba(255,255,255,.8)", marginTop: 3 }}>{englishName}</div>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2" style={{ borderTop: "1px solid rgba(255,255,255,.2)", paddingTop: 12 }}>
          {[
            { labelTh: "ชั้นปี", labelEn: "Year", value: profile ? String(profile.yearLevel) : "—" },
            { labelTh: "รหัส", labelEn: "Code", value: profile?.studentCode ?? "—" },
            { labelTh: "หน่วย", labelEn: "Unit", value: profile ? `${profile.battalion} / ${profile.company}` : "—" },
          ].map(s => (
            <div key={s.labelTh} className="text-center">
              <div style={{ font: "600 10px var(--font-sans)", color: "rgba(255,255,255,.65)" }}>{t({ th: s.labelTh, en: s.labelEn })}</div>
              <div style={{ font: "700 14px var(--font-sans)", color: "#fff", marginTop: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 py-4">
        <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>{t({ th: "GPAX สะสม", en: "Cumulative GPAX" })}</div>
          <div style={{ font: "700 28px var(--font-sans)", color: "var(--brand)", lineHeight: 1.1, marginTop: 4 }}>{gpax === "—" ? "—" : gpax}</div>
          <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 2 }}>{t({ th: "จาก 4.00", en: "out of 4.00" })}</div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>{t({ th: "อันดับในชั้นปี", en: "Year Rank" })}</div>
          <div style={{ font: "700 28px var(--font-sans)", color: "var(--ink)", lineHeight: 1.1, marginTop: 4 }}>{YEAR_RANK.rank}</div>
          <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 2 }}>{t({ th: `จาก ${YEAR_RANK.total} นาย`, en: `of ${YEAR_RANK.total} cadets` })}</div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)", marginBottom: 12 }}>
          {t({ th: "ผลการเรียนรายภาค", en: "Grades by Term" })}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
          {SEMESTERS.map(s => (
            <button key={s} type="button" onClick={() => setSem(s)}
              className="shrink-0 rounded-full px-4 py-2"
              style={{
                background: s === sem ? "var(--brand)" : "var(--surface)",
                color: s === sem ? "#fff" : "var(--muted)",
                border: s === sem ? "none" : "1px solid var(--line)",
                font: "600 11px var(--font-sans)", whiteSpace: "nowrap",
              }}>
              {t({ th: `ภาค ${s}`, en: `Sem ${s}` })}
            </button>
          ))}
        </div>
        {isPending && (
          <div className="mb-3 flex items-center gap-3 rounded-2xl p-3.5" style={{ background: "#fbf1dc", border: "1px solid #f0d080" }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--warning)", color: "#fff", font: "700 14px var(--font-sans)" }}>⏱</div>
            <div>
              <div style={{ font: "600 12px var(--font-sans)", color: "var(--ink)" }}>{t({ th: "ผลการเรียนยังไม่ประกาศ", en: "Grades Not Yet Released" })}</div>
              <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 2 }}>{t({ th: "ภาคเรียนกำลังดำเนินอยู่", en: "Semester in progress" })}</div>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {rows.map(row => (
            <div key={row.code} className="flex items-center rounded-2xl px-4 py-3.5"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <div className="min-w-0 flex-1">
                <div style={{ font: "600 13px var(--font-sans)", color: "var(--ink)" }}>{t(row.course)}</div>
                <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 2 }}>
                  {row.code} · {t({ th: `${row.credits} หน่วยกิต`, en: `${row.credits} cr` })}
                </div>
              </div>
              {row.grade === null ? (
                <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: "var(--tint)", color: "var(--muted)", font: "600 10px var(--font-sans)" }}>
                  {t({ th: "รอผล", en: "Pending" })}
                </span>
              ) : (
                <span style={{ font: "700 18px var(--font-sans)", color: row.grade.startsWith("A") ? "var(--brand)" : "var(--ink)" }}>{row.grade}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
