"use client";

import type { CSSProperties, ReactNode } from "react";

type ChipProps = {
  children: ReactNode;
  active?: boolean;
  color?: string;
  style?: CSSProperties;
};

export function Chip({ children, active, color = "var(--ink)", style }: ChipProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px",
        borderRadius: 999,
        border: `1px solid ${active ? color : "var(--rule)"}`,
        background: active ? color : "transparent",
        color: active ? "var(--paper)" : "var(--ink2)",
        font: '500 9px var(--font-sans)',
        letterSpacing: ".04em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
