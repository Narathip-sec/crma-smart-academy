"use client";

import type { ReactNode } from "react";

type ToastTone = "default" | "success" | "danger";

const TONES: Record<ToastTone, string> = {
  default: "var(--ink)",
  success: "var(--success)",
  danger: "var(--danger)",
};

// Transient toast. Caller controls mount/unmount (e.g. via timeout).
export function Toast({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: ToastTone;
}) {
  return (
    <div
      className="fixed left-1/2 z-50 -translate-x-1/2"
      style={{ bottom: 84 }}
    >
      <div
        style={{
          background: TONES[tone],
          color: "#fff",
          padding: "10px 16px",
          borderRadius: 999,
          font: "600 12px var(--font-sans)",
          boxShadow: "0 6px 20px rgba(15,23,42,.25)",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </div>
  );
}
