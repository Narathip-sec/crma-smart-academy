"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppBar } from "@/components/shell/app-bar";
import { useTx } from "@/components/shell/bilingual-label";

const THAI_MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`;
}

type LFItem = {
  id: string; type: "lost" | "found"; titleTh: string;
  locationFound: string | null; status: string;
  lostDate: string | null; createdAt: string;
  category: { nameTh: string } | null;
};

const TYPE_COLOR = { lost: "var(--danger)", found: "var(--brand)" };
const TYPE_LABEL = { lost: { th: "หาย", en: "Lost" }, found: { th: "พบ", en: "Found" } };
const STATUS_CONFIG: Record<string, { th: string; color: string }> = {
  open:    { th: "รับเรื่อง",  color: "var(--brand)" },
  matched: { th: "จับคู่แล้ว", color: "#7c3aed" },
  closed:  { th: "ปิด",        color: "var(--muted)" },
};

type Filter = "all" | "lost" | "found";

export default function LostFoundPage() {
  const t = useTx();
  const [items, setItems] = useState<LFItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/lost-found")
      .then(r => r.json())
      .then((data: LFItem[]) => { if (Array.isArray(data)) setItems(data); })
      .finally(() => setLoading(false));
  }, []);

  const visible = filter === "all" ? items : items.filter(i => i.type === filter);

  const filters: { key: Filter; labelTh: string; labelEn: string }[] = [
    { key: "all",   labelTh: "ทั้งหมด", labelEn: "All" },
    { key: "lost",  labelTh: "ของหาย",  labelEn: "Lost" },
    { key: "found", labelTh: "ของพบ",   labelEn: "Found" },
  ];

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <AppBar th="ของหาย-ของพบ" en="Lost & Found" />
      <div className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
        <div className="flex flex-1 gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {filters.map(f => (
            <button key={f.key} type="button" onClick={() => setFilter(f.key)}
              className="shrink-0 rounded-full px-3 py-1.5"
              style={{
                background: filter === f.key ? "var(--brand)" : "transparent",
                color: filter === f.key ? "#fff" : "var(--muted)",
                border: filter === f.key ? "none" : "1px solid var(--line)",
                font: "600 11px var(--font-sans)",
              }}>
              {t({ th: f.labelTh, en: f.labelEn })}
            </button>
          ))}
        </div>
        <Link href="/lost-found/new"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--brand)" }} aria-label="Report lost/found">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3">
        {loading && (
          <div className="py-12 text-center" style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>
            {t({ th: "กำลังโหลด…", en: "Loading…" })}
          </div>
        )}
        {!loading && visible.length === 0 && (
          <div className="py-12 text-center" style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>
            {t({ th: "ยังไม่มีรายการ", en: "Nothing here yet" })}
          </div>
        )}
        <div className="flex flex-col gap-2">
          {visible.map(item => {
            const typeColor = TYPE_COLOR[item.type];
            const typeLbl = TYPE_LABEL[item.type];
            const statusCfg = STATUS_CONFIG[item.status] ?? { th: item.status, color: "var(--muted)" };
            return (
              <Link key={item.id} href={`/lost-found/${item.id}`}
                className="flex items-start gap-3 rounded-2xl p-3.5"
                style={{ background: "var(--surface)", border: "1px solid var(--line)", borderLeft: `3px solid ${typeColor}`, textDecoration: "none" }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: typeColor + "18" }}>
                  <span style={{ font: "700 18px var(--font-sans)", color: typeColor }}>{item.type === "lost" ? "?" : "✓"}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-1.5">
                    <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 999, background: typeColor + "18", color: typeColor, font: "700 9px var(--font-sans)" }}>
                      {t(typeLbl)}
                    </span>
                    <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 999, background: statusCfg.color + "18", color: statusCfg.color, font: "600 9px var(--font-sans)" }}>
                      {statusCfg.th}
                    </span>
                  </div>
                  <div style={{ font: "600 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.3 }}>{item.titleTh}</div>
                  {item.category && (
                    <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 1 }}>{item.category.nameTh}</div>
                  )}
                  <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 1 }}>
                    {item.locationFound && `📍 ${item.locationFound} · `}{fmtDate(item.createdAt)}
                  </div>
                </div>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--line)" strokeWidth={2} strokeLinecap="round" style={{ flexShrink: 0 }}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
