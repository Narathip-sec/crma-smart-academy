"use client";

import type { ReactNode } from "react";

function Frame({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center"
      style={{ minHeight: 240, color: "var(--muted)" }}
    >
      {children}
    </div>
  );
}

// Empty / "coming soon" placeholder.
export function EmptyState({
  title,
  hint,
  tag,
}: {
  title: ReactNode;
  hint?: ReactNode;
  tag?: string;
}) {
  return (
    <Frame>
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: "var(--tint)", color: "var(--brand-dark)", font: "700 20px var(--font-sans)" }}
      >
        ◌
      </div>
      <div style={{ font: "700 14px var(--font-sans)", color: "var(--ink)" }}>{title}</div>
      {hint ? <div style={{ font: "500 12px var(--font-sans)" }}>{hint}</div> : null}
      {tag ? (
        <div
          style={{
            marginTop: 4,
            font: "600 9px var(--font-mono)",
            letterSpacing: ".15em",
            color: "var(--muted)",
          }}
        >
          {tag.toUpperCase()}
        </div>
      ) : null}
    </Frame>
  );
}

// Loading spinner state.
export function LoadingState({ label }: { label?: ReactNode }) {
  return (
    <Frame>
      <div
        className="h-7 w-7 animate-spin rounded-full"
        style={{ border: "3px solid var(--tint)", borderTopColor: "var(--brand)" }}
      />
      {label ? <div style={{ font: "500 12px var(--font-sans)" }}>{label}</div> : null}
    </Frame>
  );
}

// Error state with optional retry.
export function ErrorState({
  message,
  onRetry,
}: {
  message?: ReactNode;
  onRetry?: () => void;
}) {
  return (
    <Frame>
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: "#fdeaec", color: "var(--danger)", font: "700 20px var(--font-sans)" }}
      >
        !
      </div>
      <div style={{ font: "600 13px var(--font-sans)", color: "var(--ink)" }}>
        {message ?? "เกิดข้อผิดพลาด · Something went wrong"}
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          style={{ font: "600 12px var(--font-sans)", color: "var(--brand)", cursor: "pointer" }}
        >
          ลองอีกครั้ง · Retry
        </button>
      ) : null}
    </Frame>
  );
}
