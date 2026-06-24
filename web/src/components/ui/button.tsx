"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, { bg: string; color: string; border: string }> = {
  primary:   { bg: "var(--brand)",   color: "#fff",          border: "var(--brand)" },
  secondary: { bg: "var(--tint)",    color: "var(--brand-dark)", border: "var(--tint)" },
  ghost:     { bg: "transparent",    color: "var(--ink)",    border: "var(--line)" },
  danger:    { bg: "var(--danger)",  color: "#fff",          border: "var(--danger)" },
};

export function Button({
  children,
  variant = "primary",
  full,
  style,
  ...rest
}: {
  children: ReactNode;
  variant?: Variant;
  full?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const v = VARIANTS[variant];
  return (
    <button
      type="button"
      {...rest}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        width: full ? "100%" : undefined,
        padding: "10px 16px",
        borderRadius: 12,
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        font: "600 13px var(--font-sans)",
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
