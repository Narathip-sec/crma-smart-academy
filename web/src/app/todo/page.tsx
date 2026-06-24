"use client";

import { useState } from "react";
import { useTx } from "@/components/shell/bilingual-label";
import { TODOS, TODO_CATEGORIES, CATEGORY_COLOR, type TodoItem, type TodoCategory } from "@/lib/data/todo";

function StatBox({ value, labelTh, labelEn, color }: { value: number; labelTh: string; labelEn: string; color: string }) {
  const t = useTx();
  return (
    <div className="flex flex-1 flex-col items-center rounded-2xl py-3" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div style={{ font: "700 22px var(--font-sans)", color }}>{value}</div>
      <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", textAlign: "center", marginTop: 2 }}>
        {t({ th: labelTh, en: labelEn })}
      </div>
    </div>
  );
}

function TaskRow({ item, onToggle }: { item: TodoItem; onToggle: (id: number) => void }) {
  const t = useTx();
  const catColor = CATEGORY_COLOR[item.category as TodoCategory] ?? "var(--muted)";
  return (
    <div
      className="flex items-start gap-3 rounded-2xl p-3.5"
      style={{ background: "var(--surface)", border: "1px solid var(--line)", opacity: item.done ? 0.55 : 1 }}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{
          border: item.done ? "none" : "2px solid var(--line)",
          background: item.done ? "var(--brand)" : "transparent",
          color: "#fff",
        }}
        aria-label={item.done ? "Mark undone" : "Mark done"}
      >
        {item.done && (
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div style={{
          font: "600 13px var(--font-sans)", color: "var(--ink)", lineHeight: 1.3,
          textDecoration: item.done ? "line-through" : "none",
        }}>
          {t({ th: item.titleTh, en: item.titleEn })}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "1px 8px", borderRadius: 999,
              background: catColor + "18", color: catColor,
              font: "600 9px var(--font-sans)",
            }}
          >
            ● {item.category}
          </span>
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "1px 8px", borderRadius: 999,
              background: item.dueUrgent ? "#fdeaec" : "var(--stage)",
              color: item.dueUrgent ? "var(--danger)" : "var(--muted)",
              font: "600 9px var(--font-sans)",
            }}
          >
            ⏱ {t(item.dueLabel)}
          </span>
        </div>
      </div>
    </div>
  );
}

type FilterKey = TodoCategory | "ทั้งหมด";

export default function TodoPage() {
  const t = useTx();
  const [filter, setFilter] = useState<FilterKey>("ทั้งหมด");
  const [items, setItems] = useState<TodoItem[]>(TODOS);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCat, setNewCat] = useState<TodoCategory>("วิชาการ");

  const pending = items.filter((i) => !i.done);
  const dueToday = items.filter((i) => !i.done && i.dueUrgent);
  const done = items.filter((i) => i.done);

  const visible = filter === "ทั้งหมด"
    ? items
    : items.filter((i) => i.category === filter);

  function toggle(id: number) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, done: !i.done } : i));
  }

  function createTask() {
    if (!newTitle.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(), titleTh: newTitle, titleEn: newTitle,
        category: newCat, dueLabel: { th: "ไม่ระบุ", en: "No due" },
        dueUrgent: false, done: false,
      },
    ]);
    setNewTitle("");
    setShowCreate(false);
  }

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      {/* AppBar */}
      <header
        className="sticky top-0 z-30 flex h-14 items-center justify-between px-4"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--line)" }}
      >
        <div>
          <div style={{ font: "700 16px var(--font-sans)", color: "var(--ink)" }}>
            {t({ th: "งานของฉัน", en: "My Tasks" })}
          </div>
          <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)" }}>
            Todo &amp; Tasks
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--brand)", color: "#fff" }}
          aria-label="New task"
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3">
        {/* Stats */}
        <div className="mb-3 flex gap-2">
          <StatBox value={pending.length} labelTh="ค้างอยู่" labelEn="Pending" color="var(--ink)" />
          <StatBox value={dueToday.length} labelTh="ครบกำหนดวันนี้" labelEn="Due today" color="var(--danger)" />
          <StatBox value={done.length} labelTh="เสร็จแล้ว" labelEn="Done" color="var(--success)" />
        </div>

        {/* Filter chips */}
        <div
          className="mb-3 flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {TODO_CATEGORIES.map((cat) => {
            const active = filter === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setFilter(cat.key as FilterKey)}
                className="shrink-0 rounded-full px-4 py-2"
                style={{
                  background: active ? "var(--brand)" : "var(--surface)",
                  color: active ? "#fff" : "var(--muted)",
                  border: active ? "none" : "1px solid var(--line)",
                  font: "600 12px var(--font-sans)",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Task list */}
        <div className="flex flex-col gap-2">
          {visible.map((item) => (
            <TaskRow key={item.id} item={item} onToggle={toggle} />
          ))}
          {visible.length === 0 && (
            <div className="py-12 text-center" style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>
              {t({ th: "ไม่มีงานในหมวดนี้", en: "No tasks in this category" })}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        type="button"
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-5 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{ background: "var(--brand)", color: "#fff", zIndex: 50 }}
        aria-label="New task"
      >
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* Create sheet */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: "rgba(15,23,42,.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
        >
          <div
            className="w-full rounded-t-3xl px-5 pb-8 pt-5"
            style={{ background: "var(--surface)", maxWidth: 420, margin: "0 auto" }}
          >
            <div className="mb-1 flex items-center justify-between">
              <div style={{ font: "700 16px var(--font-sans)", color: "var(--ink)" }}>
                {t({ th: "สร้างงานใหม่", en: "Create task" })}
              </div>
              <button type="button" onClick={() => setShowCreate(false)}
                style={{ font: "500 22px var(--font-sans)", color: "var(--muted)", lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginBottom: 16 }}>Create task</div>

            {/* Task name */}
            <div style={{ font: "600 12px var(--font-sans)", color: "var(--ink)", marginBottom: 6 }}>
              {t({ th: "ชื่องาน", en: "Task name" })} <span style={{ color: "var(--danger)" }}>*</span>
            </div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t({ th: "เช่น อ่านบทที่ 5 เตรียมสอบ...", en: "e.g. Read chapter 5 for exam..." })}
              className="mb-4 w-full rounded-xl px-4 py-3"
              style={{
                border: "1px solid var(--line)", background: "var(--bg)",
                font: "500 13px var(--font-sans)", color: "var(--ink)", outline: "none",
              }}
            />

            {/* Category */}
            <div style={{ font: "600 12px var(--font-sans)", color: "var(--ink)", marginBottom: 8 }}>
              {t({ th: "หมวดหมู่", en: "Category" })}
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              {(["วิชาการ", "ทหาร", "ส่วนตัว", "กิจกรรม"] as TodoCategory[]).map((c) => {
                const active = newCat === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCat(c)}
                    className="rounded-full px-4 py-2"
                    style={{
                      background: active ? "var(--brand)" : "var(--stage)",
                      color: active ? "#fff" : "var(--muted)",
                      font: "600 12px var(--font-sans)",
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 rounded-2xl py-3.5"
                style={{ background: "var(--stage)", font: "600 14px var(--font-sans)", color: "var(--muted)" }}
              >
                {t({ th: "ยกเลิก", en: "Cancel" })}
              </button>
              <button
                type="button"
                onClick={createTask}
                className="flex-1 rounded-2xl py-3.5"
                style={{ background: "var(--brand)", font: "600 14px var(--font-sans)", color: "#fff" }}
              >
                + {t({ th: "สร้างงาน", en: "Create" })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
