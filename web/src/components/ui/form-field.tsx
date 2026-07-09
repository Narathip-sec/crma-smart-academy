"use client";

import type { ReactNode } from "react";

// Label + control + error wrapper for form screens
// (report, lost-found/new, activity/new).
export function FormField({
  labelTh,
  labelEn,
  required,
  error,
  children,
}: {
  labelTh: string;
  labelEn?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ font: "600 11px var(--font-sans)", color: "var(--muted)" }}>
        {labelTh}
        {labelEn ? ` · ${labelEn}` : ""}
        {required && <span style={{ color: "var(--danger)" }}> *</span>}
      </label>
      {children}
      {error && (
        <div style={{ font: "500 11px var(--font-sans)", color: "var(--danger)" }}>{error}</div>
      )}
    </div>
  );
}
