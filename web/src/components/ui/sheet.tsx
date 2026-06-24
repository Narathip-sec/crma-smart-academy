"use client";

import type { ReactNode } from "react";

// Bottom sheet / modal. Renders nothing when closed.
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 mx-auto flex flex-col justify-end"
      style={{ maxWidth: 420, background: "rgba(15,23,42,.35)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 16,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div
          className="mx-auto mb-3"
          style={{ width: 40, height: 4, borderRadius: 999, background: "var(--line)" }}
        />
        {title ? (
          <div style={{ font: "700 15px var(--font-sans)", color: "var(--ink)", marginBottom: 10 }}>
            {title}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
