"use client";

import type { CSSProperties, ReactNode } from "react";

type Props = {
  w: number | string;
  h: number | string;
  label?: string;
  children?: ReactNode;
  style?: CSSProperties;
};

// Hatch-pattern placeholder until real images are wired up.
export function ImgBox({ w, h, label, children, style }: Props) {
  return (
    <div
      style={{
        width: w,
        height: h,
        background:
          "repeating-linear-gradient(135deg, var(--shade2) 0 6px, var(--bone) 6px 12px)",
        border: "1px solid var(--rule)",
        borderRadius: 8,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-start",
        color: "var(--gray2)",
        font: '500 9px var(--font-sans)',
        letterSpacing: ".06em",
        textTransform: "uppercase",
        padding: 6,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        ...style,
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, opacity: .25, pointerEvents: "none" }}
      >
        <line x1="0"    y1="0"    x2="100%" y2="100%" stroke="var(--gray2)" strokeWidth="0.6" />
        <line x1="100%" y1="0"    x2="0"    y2="100%" stroke="var(--gray2)" strokeWidth="0.6" />
      </svg>
      <span
        style={{
          position: "relative",
          zIndex: 1,
          background: "rgba(251,250,246,.85)",
          padding: "1px 4px",
          borderRadius: 2,
        }}
      >
        {children ?? label}
      </span>
    </div>
  );
}
