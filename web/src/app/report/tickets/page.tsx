"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppBar } from "@/components/shell/app-bar";
import { useTx } from "@/components/shell/bilingual-label";

const THAI_MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${String(d.getFullYear() + 543).slice(-2)}`;
}

type StatusEvent = { status: string; createdAt: string; note: string | null };
type Ticket = {
  id: string; ticketNumber: string; titleTh: string;
  status: string; createdAt: string;
  category: { nameTh: string } | null;
  statusEvents: StatusEvent[];
};

const STATUS_CONFIG: Record<string, { th: string; color: string }> = {
  open:        { th: "รับเรื่อง",      color: "var(--brand)" },
  in_progress: { th: "กำลังดำเนินการ", color: "var(--warning)" },
  resolved:    { th: "แก้ไขแล้ว",     color: "var(--success)" },
  closed:      { th: "ปิด",            color: "var(--muted)" },
  rejected:    { th: "ปฏิเสธ",        color: "var(--danger)" },
};

export default function MyTicketsPage() {
  const t = useTx();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/report")
      .then(r => r.json())
      .then((data: Ticket[]) => { if (Array.isArray(data)) setTickets(data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <AppBar th="รายการแจ้งซ่อมของฉัน" en="My Tickets" back />
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
        <span style={{ font: "500 12px var(--font-sans)", color: "var(--muted)" }}>
          {tickets.length} {t({ th: "รายการ", en: "tickets" })}
        </span>
        <Link href="/report"
          style={{ font: "600 12px var(--font-sans)", color: "var(--brand)", textDecoration: "none" }}>
          + {t({ th: "แจ้งใหม่", en: "New report" })}
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3">
        {loading && (
          <div className="py-12 text-center" style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>
            {t({ th: "กำลังโหลด…", en: "Loading…" })}
          </div>
        )}
        {!loading && tickets.length === 0 && (
          <div className="py-12 text-center" style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>
            {t({ th: "ยังไม่มีรายการแจ้งซ่อม", en: "No tickets yet" })}
          </div>
        )}
        <div className="flex flex-col gap-2">
          {tickets.map(tk => {
            const cfg = STATUS_CONFIG[tk.status] ?? { th: tk.status, color: "var(--muted)" };
            const open = expanded === tk.id;
            return (
              <div key={tk.id} className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
                <button type="button" className="flex w-full items-start gap-3 p-3.5 text-left"
                  onClick={() => setExpanded(open ? null : tk.id)}>
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: cfg.color, marginTop: 4, flexShrink: 0 }} />
                  <div className="min-w-0 flex-1">
                    <div style={{ font: "600 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.3 }}>{tk.titleTh}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span style={{ font: "500 10px var(--font-sans)", color: "var(--muted)" }}>#{tk.ticketNumber}</span>
                      <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 999, background: `color-mix(in srgb, ${cfg.color} 10%, transparent)`, color: cfg.color, font: "600 9px var(--font-sans)" }}>
                        {cfg.th}
                      </span>
                      <span style={{ font: "500 10px var(--font-sans)", color: "var(--muted)" }}>{fmtDate(tk.createdAt)}</span>
                    </div>
                  </div>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--line)" strokeWidth={2} strokeLinecap="round"
                    style={{ transform: open ? "rotate(90deg)" : "none", flexShrink: 0 }}>
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
                {open && tk.statusEvents.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--line)", padding: "12px 16px" }}>
                    <div style={{ font: "700 11px var(--font-sans)", color: "var(--muted)", marginBottom: 8 }}>
                      {t({ th: "ประวัติสถานะ", en: "Status history" })}
                    </div>
                    <div className="flex flex-col gap-2">
                      {tk.statusEvents.map((ev, i) => {
                        const eCfg = STATUS_CONFIG[ev.status] ?? { th: ev.status, color: "var(--muted)" };
                        return (
                          <div key={i} className="flex items-start gap-2.5">
                            <div style={{ width: 6, height: 6, borderRadius: 999, background: eCfg.color, marginTop: 5, flexShrink: 0 }} />
                            <div>
                              <span style={{ font: "600 11px var(--font-sans)", color: eCfg.color }}>{eCfg.th}</span>
                              <span style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginLeft: 6 }}>{fmtDate(ev.createdAt)}</span>
                              {ev.note && <div style={{ font: "400 11px var(--font-sans)", color: "var(--muted)", marginTop: 2 }}>{ev.note}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
