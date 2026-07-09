"use client";

import { useState, useEffect, useCallback } from "react";
import { useTx } from "@/components/shell/bilingual-label";
import { Button, Chip, ChipRow, FormField, LoadingState, EmptyState, ErrorState } from "@/components/ui";

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
      <div style={{ font: "700 20px var(--font-sans)", color }}>{value}</div>
      <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", textAlign: "center", marginTop: 2 }}>
        {t({ th: labelTh, en: labelEn })}
      </div>
    </div>
  );
}

export default function TodoPage() {
  const t = useTx();
  const [items, setItems] = useState<DbTask[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<Filter>("ทั้งหมด");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("วิชาการ");
  const [newDue, setNewDue] = useState<"วันนี้"|"พรุ่งนี้"|"สัปดาห์นี้"|"ไม่ระบุ">("ไม่ระบุ");
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const CATEGORIES = ["วิชาการ","ทหาร","ส่วนตัว","กิจกรรม"] as const;
  const DUE_OPTS = ["วันนี้","พรุ่งนี้","สัปดาห์นี้","ไม่ระบุ"] as const;

  function resolveDueAt(): string | undefined {
    const now = new Date();
    if (newDue === "วันนี้") { now.setHours(23,59,0,0); return now.toISOString(); }
    if (newDue === "พรุ่งนี้") { now.setDate(now.getDate()+1); now.setHours(23,59,0,0); return now.toISOString(); }
    if (newDue === "สัปดาห์นี้") { now.setDate(now.getDate()+7); now.setHours(23,59,0,0); return now.toISOString(); }
    return undefined;
  }

  const load = useCallback(() => {
    fetch("/api/todo")
      .then(r => r.json())
      .then((data: DbTask[]) => {
        if (!Array.isArray(data)) throw new Error("bad response");
        setItems(data);
        setLoadError(false);
      })
      .catch(() => {
        // Only surface a blocking error if we've never loaded data —
        // a background refresh (e.g. after toggling a task) fails silently.
        setItems(prev => {
          if (prev === null) setLoadError(true);
          return prev;
        });
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggle(task: DbTask) {
    if (task.done) return; // no un-complete in P3
    setItems(prev => prev && prev.map(i => i.id === task.id ? { ...i, done: true } : i));
    await fetch(`/api/todo/${task.id}/complete`, { method: "POST" });
    load();
  }

  async function createTask() {
    if (!newTitle.trim()) return;
    setSubmitting(true);
    await fetch("/api/todo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleTh: newTitle,
        descriptionTh: newNote || undefined,
        dueAt: resolveDueAt(),
      }),
    });
    setNewTitle(""); setNewCategory("วิชาการ"); setNewDue("ไม่ระบุ"); setNewNote("");
    setShowCreate(false); setSubmitting(false);
    load();
  }

  const pending = (items ?? []).filter(i => !i.done);
  const dueToday = (items ?? []).filter(i => !i.done && isUrgent(i.dueAt));
  const done = (items ?? []).filter(i => i.done);
  const visible = filter === "ค้างอยู่" ? pending : filter === "เสร็จแล้ว" ? done : (items ?? []);

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
        <div>
          <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)" }}>{t({ th: "งานของฉัน", en: "My Tasks" })}</div>
          <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>Todo &amp; Tasks</div>
        </div>
        <button type="button" onClick={() => setShowCreate(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full active:opacity-70"
          style={{ background: "var(--brand)", color: "#fff" }} aria-label="New task">
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3">
        {loadError ? (
          <ErrorState onRetry={load} />
        ) : items === null ? (
          <LoadingState label={t({ th: "กำลังโหลด…", en: "Loading…" })} />
        ) : (
        <>
        <div className="mb-3 flex gap-2">
          <StatBox value={pending.length} labelTh="ค้างอยู่" labelEn="Pending" color="var(--ink)" />
          <StatBox value={dueToday.length} labelTh="ครบกำหนดวันนี้" labelEn="Due today" color="var(--danger)" />
          <StatBox value={done.length} labelTh="เสร็จแล้ว" labelEn="Done" color="var(--success)" />
        </div>

        {/* Filter */}
        <div className="mb-3">
          <ChipRow>
            {(["ทั้งหมด","ค้างอยู่","เสร็จแล้ว"] as Filter[]).map(f => (
              <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f}
              </Chip>
            ))}
          </ChipRow>
        </div>

        {visible.length === 0 ? (
          <EmptyState title={t({ th: "ไม่มีงาน", en: "No tasks" })} />
        ) : (
        <div className="flex flex-col gap-2">
          {visible.map(item => {
            const due = formatDue(item.dueAt);
            const urgent = isUrgent(item.dueAt) && !item.done;
            return (
              <div key={item.id}
                className="flex items-start gap-3 rounded-2xl p-3.5"
                style={{ background: "var(--surface)", border: "1px solid var(--line)", opacity: item.done ? 0.55 : 1 }}>
                <button type="button" onClick={() => toggle(item)}
                  className="-m-3 flex h-11 w-11 shrink-0 items-center justify-center active:opacity-70"
                  aria-label={item.done ? "Done" : "Mark done"}>
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full"
                    style={{
                      border: item.done ? "none" : "2px solid var(--line)",
                      background: item.done ? "var(--brand)" : "transparent",
                    }}
                  >
                    {item.done && (
                      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </span>
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
                        background: urgent ? "color-mix(in srgb, var(--danger) 10%, transparent)" : "var(--stage)",
                        color: urgent ? "var(--danger)" : "var(--muted)",
                        font: "600 11px var(--font-sans)",
                      }}>
                        ⏱ {t(due)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
        </>
        )}
      </div>

      <button type="button" onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-5 flex h-14 w-14 items-center justify-center rounded-full shadow-lg active:opacity-70"
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
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)" }}>
                {t({ th: "สร้างงานใหม่", en: "Create task" })}
              </div>
              <button type="button" onClick={() => setShowCreate(false)}
                className="-m-2.5 flex h-11 w-11 items-center justify-center active:opacity-70"
                style={{ font: "500 20px var(--font-sans)", color: "var(--muted)", lineHeight: 1 }}>✕</button>
            </div>

            <div className="flex flex-col gap-4">
              <FormField label={t({ th: "ชื่องาน", en: "Task name" })} required>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={t({ th: "เช่น อ่านบทที่ 5 เตรียมสอบ…", en: "e.g. Read chapter 5 for exam…" })}
                  className="w-full px-4 py-3"
                  style={{ borderRadius: "var(--radius-control)", border: "1px solid var(--line)", background: "var(--bg)", font: "500 13px var(--font-sans)", color: "var(--ink)", outline: "none" }}
                />
              </FormField>

              <FormField label={t({ th: "หมวดหมู่", en: "Category" })}>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map(c => (
                    <Chip key={c} active={newCategory === c} onClick={() => setNewCategory(c)}>
                      {c}
                    </Chip>
                  ))}
                </div>
              </FormField>

              <FormField label={t({ th: "กำหนดส่ง", en: "Due date" })}>
                <div className="flex gap-2 flex-wrap">
                  {DUE_OPTS.map(d => (
                    <Chip key={d} active={newDue === d} onClick={() => setNewDue(d as typeof newDue)}>
                      {t({ th: d, en: d })}
                    </Chip>
                  ))}
                </div>
              </FormField>

              <FormField label={t({ th: "โน้ต", en: "Note" })}>
                <textarea value={newNote} onChange={e => setNewNote(e.target.value)} rows={2}
                  placeholder={t({ th: "รายละเอียดเพิ่มเติม…", en: "Additional details…" })}
                  className="w-full px-4 py-3"
                  style={{ borderRadius: "var(--radius-control)", border: "1px solid var(--line)", background: "var(--bg)", font: "500 13px var(--font-sans)", color: "var(--ink)", outline: "none", resize: "none" }}
                />
              </FormField>

              {/* Actions */}
              <div className="mt-1 flex gap-3">
                <Button variant="ghost" size="lg" onClick={() => setShowCreate(false)} style={{ flex: 1 }}>
                  {t({ th: "ยกเลิก", en: "Cancel" })}
                </Button>
                <Button size="lg" onClick={createTask} disabled={submitting || !newTitle.trim()} style={{ flex: 1 }}>
                  + {t({ th: "สร้างงาน", en: "Create" })}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
