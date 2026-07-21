"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppBar } from "@/components/shell/app-bar";
import { useTx } from "@/components/shell/bilingual-label";
import { Chip, ChipRow, ListItem, LoadingState, EmptyState, ErrorState } from "@/components/ui";

const THAI_MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`;
}

type LFType = "lost" | "found";

type LFItem = {
  id: string; type: LFType; titleTh: string;
  foundLocation: string | null; status: string;
  foundAt: string | null; createdAt: string;
  category: { nameTh: string } | null;
  attachments: { asset: { url: string } | null }[];
};

const STATUS_CONFIG: Record<string, { th: string; color: string }> = {
  reported: { th: "รับเรื่อง",  color: "var(--brand)" },
  matched:  { th: "จับคู่แล้ว", color: "var(--cat-notice)" },
  claimed:  { th: "รับคืนแล้ว", color: "var(--success)" },
  closed:   { th: "ปิด",        color: "var(--muted)" },
};

const TYPE_COLOR: Record<LFType, string> = { lost: "var(--danger)", found: "var(--brand)" };
const TYPE_LABEL: Record<LFType, { th: string; en: string }> = {
  lost:  { th: "หาย", en: "Lost" },
  found: { th: "พบ",  en: "Found" },
};

type Filter = "all" | LFType;

export default function LostFoundPage() {
  const t = useTx();
  const [items, setItems] = useState<LFItem[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    fetch("/api/lost-found")
      .then(r => r.json())
      .then((data: LFItem[]) => {
        if (!Array.isArray(data)) throw new Error("bad response");
        setItems(data);
        setError(false);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = items === null ? [] : filter === "all" ? items : items.filter(i => i.type === filter);

  const filters: { key: Filter; labelTh: string; labelEn: string }[] = [
    { key: "all",   labelTh: "ทั้งหมด", labelEn: "All" },
    { key: "lost",  labelTh: "ของหาย",  labelEn: "Lost" },
    { key: "found", labelTh: "ของพบ",   labelEn: "Found" },
  ];

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <AppBar th="ของหาย-ของพบ" en="Lost & Found" back />
      <div className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
        <ChipRow>
          {filters.map(f => (
            <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
              {t({ th: f.labelTh, en: f.labelEn })}
            </Chip>
          ))}
        </ChipRow>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3">
        {error ? (
          <ErrorState onRetry={load} />
        ) : items === null ? (
          <LoadingState label={t({ th: "กำลังโหลด…", en: "Loading…" })} />
        ) : visible.length === 0 ? (
          <EmptyState title={t({ th: "ยังไม่มีรายการ", en: "Nothing here yet" })} />
        ) : (
        <div className="flex flex-col gap-2">
          {visible.map(item => {
            const statusCfg = STATUS_CONFIG[item.status] ?? { th: item.status, color: "var(--muted)" };
            const typeColor = TYPE_COLOR[item.type];
            const typeLbl = TYPE_LABEL[item.type];
            const photoUrl = item.attachments[0]?.asset?.url;
            return (
              <ListItem
                key={item.id}
                href={`/lost-found/${item.id}`}
                chevron
                style={{ background: "var(--surface)", border: "1px solid var(--line)", borderLeft: `3px solid ${typeColor}`, borderRadius: "var(--radius-card)", padding: "14px 16px" }}
                icon={photoUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={photoUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />
                  : <span style={{ fontSize: 18 }}>📦</span>}
                iconBg={`color-mix(in srgb, ${typeColor} 10%, transparent)`}
                title={
                  <>
                    <div className="mb-1 flex items-center gap-1.5">
                      <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 999, background: `color-mix(in srgb, ${typeColor} 10%, transparent)`, color: typeColor, font: "600 11px var(--font-sans)" }}>
                        {t(typeLbl)}
                      </span>
                      <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 999, background: `color-mix(in srgb, ${statusCfg.color} 10%, transparent)`, color: statusCfg.color, font: "600 11px var(--font-sans)" }}>
                        {statusCfg.th}
                      </span>
                    </div>
                    <div>{item.titleTh}</div>
                  </>
                }
                subtitle={
                  <div className="flex flex-col gap-0.5">
                    {item.category && <span>{item.category.nameTh}</span>}
                    <span>{item.foundLocation && `📍 ${item.foundLocation} · `}{fmtDate(item.createdAt)}</span>
                  </div>
                }
              />
            );
          })}
        </div>
        )}
      </div>

      <Link href="/lost-found/new"
        className="fixed bottom-20 right-5 flex h-14 w-14 items-center justify-center rounded-full shadow-lg active:opacity-70"
        style={{ background: "var(--brand)", color: "#fff", zIndex: 50 }} aria-label="Report lost/found">
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
    </div>
  );
}
