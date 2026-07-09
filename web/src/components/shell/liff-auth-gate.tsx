"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ensureSession } from "@/lib/liff";

// Blocks first paint until the LIFF session cookie is established.
// No-op (renders children immediately) when NEXT_PUBLIC_LIFF_ID is unset —
// that's the local-dev path, which uses the DEV_USER_EMAIL fallback instead.
export function LiffAuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!process.env.NEXT_PUBLIC_LIFF_ID);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_LIFF_ID) return;
    let cancelled = false;
    ensureSession().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <div
          className="h-7 w-7 animate-spin rounded-full"
          style={{ border: "3px solid var(--tint)", borderTopColor: "var(--brand)" }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
