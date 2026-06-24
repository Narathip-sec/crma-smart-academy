"use client";

import type { CSSProperties, ReactNode } from "react";

// Pill chip — used for filters/categories. Teal when active.
export function Chip({
  children,
  active,
  color = "var(--brand)",
  onClick,
  style,
}: {
  children: ReactNode;
  active?: boolean;
  color?: string;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 12px",
        borderRadius: 999,
        border: `1px solid ${active ? color : "var(--line)"}`,
        background: active ? color : "var(--surface)",
        color: active ? "#fff" : "var(--muted)",
        font: "600 11px var(--font-sans)",
        whiteSpace: "nowrap",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// Horizontal scrollable chip row.
export function ChipRow({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex gap-2 overflow-x-auto"
      style={{ scrollbarWidth: "none", paddingBottom: 2 }}
    >
      {children}
    </div>
  );
}
