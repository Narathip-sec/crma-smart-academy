"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const THAI_MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 1) return "เพิ่งนี้";
  if (diff < 60) return `${diff} นาทีที่แล้ว`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`;
}

export function NotificationRow({
  notificationId, icon, titleTh, bodyTh, createdAt, deepLink, initialRead,
}: {
  notificationId: string; icon: string; titleTh: string; bodyTh: string | null;
  createdAt: string; deepLink: string | null; initialRead: boolean;
}) {
  const router = useRouter();
  const [read, setRead] = useState(initialRead);

  async function handleClick() {
    if (!read) {
      setRead(true);
      fetch(`/api/notifications/${notificationId}/read`, { method: "POST" }).catch(() => {});
    }
    if (deepLink) router.push(deepLink);
  }

  return (
    <button type="button" onClick={handleClick}
      className="flex w-full items-start gap-3 px-4 py-3.5 text-left active:opacity-70"
      style={{ borderBottom: "1px solid var(--line)", background: read ? "var(--bg)" : "var(--tint)" }}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: read ? "var(--stage)" : "var(--brand)", fontSize: 16 }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div style={{ font: `${read ? "500" : "700"} 13px var(--font-sans)`, color: "var(--ink)", lineHeight: 1.3 }}>
          {titleTh}
        </div>
        {bodyTh && (
          <div style={{ font: "400 11px var(--font-sans)", color: "var(--muted)", marginTop: 2, lineHeight: 1.4 }}>{bodyTh}</div>
        )}
        <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginTop: 4 }}>
          {fmtDate(createdAt)}
        </div>
      </div>
      {!read && (
        <div style={{ width: 8, height: 8, borderRadius: 999, background: "var(--brand)", flexShrink: 0, marginTop: 5 }} />
      )}
    </button>
  );
}
