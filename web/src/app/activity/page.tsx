"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTx } from "@/components/shell/bilingual-label";
import { Chip, ChipRow, Img, LoadingState, EmptyState, ErrorState } from "@/components/ui";

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
  imageUrl: string | null;
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

function ActivityCard({ item }: { item: DbActivity }) {
  const t = useTx();
  return (
    <Link
      href={`/activity/${item.id}`}
      className="flex flex-col overflow-hidden active:opacity-90"
      style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-card)", textDecoration: "none" }}
    >
      <div style={{ position: "relative" }}>
        <Img src={item.imageUrl ?? undefined} alt={item.titleTh} radius={0} ratio="16 / 9" />
        {item.category && (
          <span style={{
            position: "absolute", top: 10, left: 10,
            padding: "3px 10px", borderRadius: 999,
            background: "rgba(15,23,42,.55)", color: "#fff",
            font: "600 11px var(--font-sans)", backdropFilter: "blur(4px)",
          }}>
            ● {item.category.nameTh}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3.5">
        <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)", lineHeight: 1.3 }}>
          {t({ th: item.titleTh, en: item.titleEn ?? item.titleTh })}
        </div>
        <div className="flex flex-col gap-0.5" style={{ font: "500 12px var(--font-sans)", color: "var(--muted)" }}>
          <span>📅 {formatDate(item.startAt)} · {formatTime(item.startAt)}</span>
          {item.location && <span>📍 {item.location}</span>}
          {item.maxAttendees && <span>👥 {item.attendeeCount}/{item.maxAttendees}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function ActivityPage() {
  const t = useTx();
  const [activities, setActivities] = useState<DbActivity[] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("ทั้งหมด");
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    fetch("/api/activity")
      .then(r => r.json())
      .then((data: DbActivity[]) => {
        if (!Array.isArray(data)) throw new Error("bad response");
        setActivities(data);
        setError(false);
        const cats = [...new Set(data.map(a => a.category?.nameTh).filter(Boolean))] as string[];
        setCategories(cats);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = activities === null ? [] : filter === "ทั้งหมด"
    ? activities
    : activities.filter(a => a.category?.nameTh === filter);

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
        <div>
          <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)" }}>{t({ th: "กิจกรรม", en: "Activities" })}</div>
          <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>Activities</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Filter chips */}
        <div className="px-3 pb-1 pt-4">
          <ChipRow>
            {["ทั้งหมด", ...categories].map(cat => (
              <Chip key={cat} active={filter === cat} onClick={() => setFilter(cat)}>
                {cat}
              </Chip>
            ))}
          </ChipRow>
        </div>

        <div className="px-3 pt-3">
          <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)", marginBottom: 10 }}>
            {t({ th: "กิจกรรมทั้งหมด", en: "All Activities" })}
            <span style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginLeft: 6 }}>
              {visible.length} {t({ th: "กิจกรรม", en: "events" })}
            </span>
          </div>
          {error ? (
            <ErrorState onRetry={load} />
          ) : activities === null ? (
            <LoadingState label={t({ th: "กำลังโหลด…", en: "Loading…" })} />
          ) : visible.length === 0 ? (
            <EmptyState title={t({ th: "ยังไม่มีกิจกรรม", en: "No activities yet" })} />
          ) : (
            <div className="flex flex-col gap-3">
              {visible.map(item => <ActivityCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </div>

      <Link href="/activity/new"
        className="fixed bottom-20 right-5 flex h-14 w-14 items-center justify-center rounded-full shadow-lg active:opacity-70"
        style={{ background: "var(--brand)", color: "#fff", zIndex: 50 }} aria-label="Create activity">
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
    </div>
  );
}
