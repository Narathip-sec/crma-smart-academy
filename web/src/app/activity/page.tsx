"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTx } from "@/components/shell/bilingual-label";

type DbActivity = {
  id: string;
  titleTh: string;
  titleEn: string | null;
  descriptionTh: string | null;
  location: string | null;
  startAt: string;
  endAt: string | null;
  maxAttendees: number | null;
  attendeeCount: number;
  status: string;
  category: { id: string; nameTh: string; nameEn: string | null } | null;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const THAI_DAYS = ["อา","จ","อ","พ","พฤ","ศ","ส"];
  const THAI_MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${THAI_DAYS[d.getDay()]} ${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toTimeString().slice(0, 5);
}

function ActivityRow({ item }: { item: DbActivity }) {
  const t = useTx();
  return (
    <Link href={`/activity/${item.id}`}
      className="flex items-start gap-3 rounded-2xl p-3.5"
      style={{ background: "var(--surface)", border: "1px solid var(--line)", textDecoration: "none" }}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ background: "var(--brand)" }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,.9)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        {item.category && (
          <div className="mb-1">
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "1px 8px", borderRadius: 999,
              background: "color-mix(in srgb, var(--brand) 10%, transparent)", color: "var(--brand)",
              font: "600 9px var(--font-sans)",
            }}>
              ● {item.category.nameTh}
            </span>
          </div>
        )}
        <div style={{ font: "600 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.3 }}>
          {t({ th: item.titleTh, en: item.titleEn ?? item.titleTh })}
        </div>
        <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 3 }}>
          📅 {formatDate(item.startAt)} · {formatTime(item.startAt)}
        </div>
        {item.location && (
          <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 1 }}>
            📍 {item.location}
          </div>
        )}
        {item.maxAttendees && (
          <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 1 }}>
            👥 {item.attendeeCount}/{item.maxAttendees}
          </div>
        )}
      </div>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
        stroke="var(--line)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}

export default function ActivityPage() {
  const t = useTx();
  const [activities, setActivities] = useState<DbActivity[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("ทั้งหมด");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity")
      .then(r => r.json())
      .then((data: DbActivity[]) => {
        if (!Array.isArray(data)) return;
        setActivities(data);
        const cats = [...new Set(data.map(a => a.category?.nameTh).filter(Boolean))] as string[];
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  const visible = filter === "ทั้งหมด"
    ? activities
    : activities.filter(a => a.category?.nameTh === filter);

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
        <div>
          <div style={{ font: "700 16px var(--font-sans)", color: "var(--ink)" }}>{t({ th: "กิจกรรม", en: "Activities" })}</div>
          <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)" }}>Activities</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto px-3 pb-1 pt-4" style={{ scrollbarWidth: "none" }}>
          {["ทั้งหมด", ...categories].map(cat => (
            <button key={cat} type="button" onClick={() => setFilter(cat)}
              className="shrink-0 rounded-full px-4 py-2"
              style={{
                background: filter === cat ? "var(--brand)" : "var(--surface)",
                color: filter === cat ? "#fff" : "var(--muted)",
                border: filter === cat ? "none" : "1px solid var(--line)",
                font: "600 12px var(--font-sans)",
              }}>
              {cat}
            </button>
          ))}
        </div>

        <div className="px-3 pt-3">
          <div style={{ font: "700 14px var(--font-sans)", color: "var(--ink)", marginBottom: 10 }}>
            {t({ th: "กิจกรรมทั้งหมด", en: "All Activities" })}
            <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginLeft: 6 }}>
              {visible.length} {t({ th: "กิจกรรม", en: "events" })}
            </span>
          </div>
          {loading && (
            <div className="py-12 text-center" style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>
              {t({ th: "กำลังโหลด…", en: "Loading…" })}
            </div>
          )}
          {!loading && visible.length === 0 && (
            <div className="py-12 text-center" style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>
              {t({ th: "ยังไม่มีกิจกรรม", en: "No activities yet" })}
            </div>
          )}
          <div className="flex flex-col gap-2">
            {visible.map(item => <ActivityRow key={item.id} item={item} />)}
          </div>
        </div>
      </div>

      <Link href="/activity/new"
        className="fixed bottom-20 right-5 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{ background: "var(--brand)", color: "#fff", zIndex: 50 }} aria-label="Create activity">
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
    </div>
  );
}
