"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTx } from "@/components/shell/bilingual-label";
import { Chip, ChipRow, ListItem, LoadingState, EmptyState, ErrorState } from "@/components/ui";

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
    <ListItem
      href={`/activity/${item.id}`}
      chevron
      style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-card)", padding: "14px 16px" }}
      icon={
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,.9)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      }
      iconBg="var(--brand)"
      title={
        <>
          {item.category && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "1px 8px", borderRadius: 999, marginBottom: 3,
              background: "color-mix(in srgb, var(--brand) 10%, transparent)", color: "var(--brand)",
              font: "600 11px var(--font-sans)",
            }}>
              ● {item.category.nameTh}
            </span>
          )}
          <div>{t({ th: item.titleTh, en: item.titleEn ?? item.titleTh })}</div>
        </>
      }
      subtitle={
        <div className="flex flex-col gap-0.5">
          <span>📅 {formatDate(item.startAt)} · {formatTime(item.startAt)}</span>
          {item.location && <span>📍 {item.location}</span>}
          {item.maxAttendees && <span>👥 {item.attendeeCount}/{item.maxAttendees}</span>}
        </div>
      }
    />
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
            <div className="flex flex-col gap-2">
              {visible.map(item => <ActivityRow key={item.id} item={item} />)}
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
