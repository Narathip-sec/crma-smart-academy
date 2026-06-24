"use client";

import { useState, type CSSProperties } from "react";

// Image with graceful fallback to a tinted box (for event covers, food photos, etc.).
export function Img({
  src,
  alt,
  radius = 12,
  ratio = "16 / 9",
  style,
}: {
  src?: string;
  alt?: string;
  radius?: number;
  ratio?: string;
  style?: CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  const show = src && !failed;

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: ratio,
        borderRadius: radius,
        overflow: "hidden",
        background: "var(--tint)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--brand-dark)",
        font: "600 11px var(--font-sans)",
        ...style,
      }}
    >
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ""}
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span style={{ opacity: 0.7 }}>{alt ?? "ไม่มีรูป · No image"}</span>
      )}
    </div>
  );
}
