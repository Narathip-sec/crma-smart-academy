"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, { bg: string; color: string; border: string }> = {
  primary:   { bg: "var(--brand)",   color: "#fff",          border: "var(--brand)" },
  secondary: { bg: "var(--tint)",    color: "var(--brand-dark)", border: "var(--tint)" },
  ghost:     { bg: "transparent",    color: "var(--ink)",    border: "var(--line)" },
  danger:    { bg: "var(--danger)",  color: "#fff",          border: "var(--danger)" },
};

const SIZES: Record<Size, { padding: string; font: string }> = {
  sm: { padding: "6px 12px",  font: "600 11px var(--font-sans)" },
  md: { padding: "10px 16px", font: "600 13px var(--font-sans)" },
  lg: { padding: "14px 16px", font: "600 15px var(--font-sans)" },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  full,
  disabled,
  style,
  className,
  ...rest
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  full?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  return (
    <button
      type="button"
      disabled={disabled}
      className={`active:opacity-70 ${className ?? ""}`.trim()}
      {...rest}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        width: full ? "100%" : undefined,
        padding: s.padding,
        borderRadius: "var(--radius-control)",
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        font: s.font,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
