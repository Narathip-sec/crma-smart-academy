"use client";

import type { CSSProperties, ReactNode } from "react";

// White rounded card — soft shadow, radius 16–24px (mock UX style guide).
export function Card({
  children,
  pad = 16,
  radius = 20,
  className,
  style,
  onClick,
}: {
  children: ReactNode;
  pad?: number;
  radius?: number;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: radius,
        padding: pad,
        boxShadow: "0 1px 3px rgba(15,23,42,.06)",
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
