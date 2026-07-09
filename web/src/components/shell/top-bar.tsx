"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";

// Home-style top bar: avatar · "Smart Academy" · notification bell.
// Push/detail screens use <AppBar> (with back) instead.
export function TopBar({
  name,
  pictureUrl,
  unread = 0,
}: {
  name?: string;
  pictureUrl?: string;
  unread?: number;
}) {
  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center gap-3 px-4"
      style={{ background: "var(--bg)" }}
    >
      <Link href="/profile" aria-label="Profile" className="active:opacity-70">
        <Avatar name={name} src={pictureUrl} size={36} />
      </Link>
      <div className="flex-1 leading-tight">
        <div style={{ font: "700 15px var(--font-sans)", color: "var(--brand)" }}>
          Smart Academy
        </div>
        <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)" }}>
          โรงเรียนนายร้อยพระจุลจอมเกล้า
        </div>
      </div>
      <Link
        href="/notifications"
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full active:opacity-70"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
          stroke="var(--ink)" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 01-3.4 0" />
        </svg>
        {unread > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1"
            style={{ background: "var(--danger)", color: "#fff", font: "700 11px var(--font-sans)" }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>
    </header>
  );
}
