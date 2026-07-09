"use client";

import type { ReactNode } from "react";

// Section header with optional trailing action (e.g. "ดูทั้งหมด / See all").
export function Sec({
  title,
  action,
}: {
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
      <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)" }}>
        {title}
      </div>
      {action ? (
        <div style={{ font: "600 11px var(--font-sans)", color: "var(--brand)" }}>
          {action}
        </div>
      ) : null}
    </div>
  );
}
