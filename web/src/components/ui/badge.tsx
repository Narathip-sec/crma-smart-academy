"use client";

import type { ReactNode } from "react";

type Tone = "brand" | "neutral" | "danger" | "success" | "warning";

const TONES: Record<Tone, { bg: string; color: string }> = {
  brand:   { bg: "var(--tint)",   color: "var(--brand-dark)" },
  neutral: { bg: "var(--stage)",  color: "var(--muted)" },
  danger:  { bg: "color-mix(in srgb, var(--danger) 10%, transparent)",  color: "var(--danger)" },
  success: { bg: "color-mix(in srgb, var(--success) 10%, transparent)", color: "var(--success)" },
  warning: { bg: "color-mix(in srgb, var(--warning) 12%, transparent)", color: "var(--warning)" },
};

// Small status/label badge.
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 999,
        background: t.bg,
        color: t.color,
        font: "600 11px var(--font-sans)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

// Category tag with a colored dot (class category, calendar category, etc.).
export function CatTag({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        font: "600 11px var(--font-sans)",
        color: "var(--muted)",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />
      {label}
    </span>
  );
}
