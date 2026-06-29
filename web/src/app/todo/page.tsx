"use client";

import { useState, useEffect, useCallback } from "react";
import { useTx } from "@/components/shell/bilingual-label";

const THAI_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

type DbTask = { id: string; titleTh: string; titleEn: string | null; dueAt: string | null; done: boolean };
type Filter = "ทั้งหมด" | "ค้างอยู่" | "เสร็จแล้ว";

function formatDue(dueAt: string | null): { th: string; en: string } {
  if (!dueAt) return { th: "ไม่ระบุ", en: "No due" };
  const d = new Date(dueAt);
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today.getTime() + 86400000);
  const dDay = new Date(d); dDay.setHours(0,0,0,0);
  if (dDay.getTime() === today.getTime()) {
    const hm = d.toTimeString().slice(0,5);
    return { th: `วันนี้ ${hm}`, en: `Today ${hm}` };
  }
  if (dDay.getTime() === tomorrow.getTime()) return { th: "พรุ่งนี้", en: "Tomorrow" };
  return { th: `${d.getDate()} ${THAI_MONTHS[d.getMonth()]}`, en: `${d.getDate()} ${THAI_MONTHS[d.getMonth()]}` };
}

function isUrgent(dueAt: string | null): boolean {
  if (!dueAt) return false;
  return new Date(dueAt).getTime() < Date.now() + 86400000;
}

function StatBox({ value, labelTh, labelEn, color }: { value: number; labelTh: string; labelEn: string; color: string }) {
  const t = useTx();
  return (
    <div className="flex flex-1 flex-col items-center rounded-2xl py-3"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div style={{ font: "700 22px var(--font-sans)", color }}>{value}</div>
      <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", textAlign: "center", marginTop: 2 }}>
        {t({ th: labelTh, en: labelEn })}
      </div>
    </div>
  );
}

export default function TodoPage() {
  const t = useTx();
  const [items, setItems] = useState<DbTask[]>([]);
  const [filter, setFilter] = useState<Filter>("ทั้งหมด");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    fetch("/api/todo").then(r => r.json()).then((data: DbTask[]) => {
      if (Array.isArray(data)) setItems(data);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggle(task: DbTask) {
    if (task.done) return; // no un-complete in P3
    setItems(prev => prev.map(i => i.id === task.id ? { ...i, done: true } : i));
    await fetch(`/api/todo/${task.id}/complete`, { method: "POST" });
    load();
  }

  async function createTask() {
    if (!newTitle.trim()) return;
    setSubmitting(true);
    await fetch("/api/todo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titleTh: newTitle }),
    });
    setNewTitle(""); setShowCreate(false); setSubmitting(false);
    load();
  }

  const pending = items.filter(i => !i.done);
  const dueToday = items.filter(i => !i.done && isUrgent(i.dueAt));
  const done = items.filter(i => i.done);
  const visible = filter === "ค้างอยู่" ? pending : filter === "เสร็จแล้ว" ? done : items;

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
        <div>
          <div style={{ font: "700 16px var(--font-sans)", color: "var(--ink)" }}>{t({ th: "งานของฉัน", en: "My Tasks" })}</div>
          <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)" }}>Todo &amp; Tasks</div>
        </div>
        <button type="button" onClick={() => setShowCreate(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--brand)", color: "#fff" }} aria-label="New task">
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3">
        <div className="mb-3 flex gap-2">
          <StatBox value={pending.length} labelTh="ค้างอยู่" labelEn="Pending" color="var(--ink)" />
          <StatBox value={dueToday.length} labelTh="ครบกำหนดวันนี้" labelEn="Due today" color="var(--danger)" />
          <StatBox value={done.length} labelTh="เสร็จแล้ว" labelEn="Done" color="var(--success)" />
        </div>

        {/* Filter */}
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {(["ทั้งหมด","ค้างอยู่","เสร็จแล้ว"] as Filter[]).map(f => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className="shrink-0 rounded-full px-4 py-2"
              style={{
                background: filter === f ? "var(--brand)" : "var(--surface)",
                color: filter === f ? "#fff" : "var(--muted)",
                border: filter === f ? "none" : "1px solid var(--line)",
                font: "600 12px var(--font-sans)",
              }}>
              {f}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {visible.map(item => {
            const due = formatDue(item.dueAt);
            const urgent = isUrgent(item.dueAt) && !item.done;
            return (
              <div key={item.id}
                className="flex items-start gap-3 rounded-2xl p-3.5"
                style={{ background: "var(--surface)", border: "1px solid var(--line)", opacity: item.done ? 0.55 : 1 }}>
                <button type="button" onClick={() => toggle(item)}
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{
                    border: item.done ? "none" : "2px solid var(--line)",
                    background: item.done ? "var(--brand)" : "transparent",
                  }}
                  aria-label={item.done ? "Done" : "Mark done"}>
                  {item.done && (
                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div style={{ font: "600 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.3, textDecoration: item.done ? "line-through" : "none" }}>
                    {t({ th: item.titleTh, en: item.titleEn ?? item.titleTh })}
                  </div>
                  {item.dueAt && (
                    <div className="mt-1.5">
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 3,
                        padding: "1px 8px", borderRadius: 999,
                        background: urgent ? "#fdeaec" : "var(--stage)",
                        color: urgent ? "var(--danger)" : "var(--muted)",
                        font: "600 9px var(--font-sans)",
                      }}>
                        ⏱ {t(due)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {visible.length === 0 && (
            <div className="py-12 text-center" style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>
              {t({ th: "ไม่มีงาน", en: "No tasks" })}
            </div>
          )}
        </div>
      </div>

      <button type="button" onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-5 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{ background: "var(--brand)", color: "#fff", zIndex: 50 }} aria-label="New task">
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end"
          style={{ background: "rgba(15,23,42,.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="w-full rounded-t-3xl px-5 pb-8 pt-5"
            style={{ background: "var(--surface)", maxWidth: 420, margin: "0 auto" }}>
            <div className="mb-4 flex items-center justify-between">
              <div style={{ font: "700 16px var(--font-sans)", color: "var(--ink)" }}>{t({ th: "สร้างงานใหม่", en: "Create task" })}</div>
              <button type="button" onClick={() => setShowCreate(false)}
                style={{ font: "500 22px var(--font-sans)", color: "var(--muted)", lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ font: "600 12px var(--font-sans)", color: "var(--ink)", marginBottom: 6 }}>
              {t({ th: "ชื่องาน", en: "Task name" })} <span style={{ color: "var(--danger)" }}>*</span>
            </div>
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t({ th: "เช่น อ่านบทที่ 5 เตรียมสอบ…", en: "e.g. Read chapter 5 for exam…" })}
              className="mb-5 w-full rounded-xl px-4 py-3"
              style={{ border: "1px solid var(--line)", background: "var(--bg)", font: "500 13px var(--font-sans)", color: "var(--ink)", outline: "none" }}
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowCreate(false)}
                className="flex-1 rounded-2xl py-3.5"
                style={{ background: "var(--stage)", font: "600 14px var(--font-sans)", color: "var(--muted)" }}>
                {t({ th: "ยกเลิก", en: "Cancel" })}
              </button>
              <button type="button" onClick={createTask} disabled={submitting}
                className="flex-1 rounded-2xl py-3.5"
                style={{ background: "var(--brand)", font: "600 14px var(--font-sans)", color: "#fff", opacity: submitting ? 0.6 : 1 }}>
                + {t({ th: "สร้างงาน", en: "Create" })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
