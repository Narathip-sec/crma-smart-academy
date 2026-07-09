"use client";

// Route-level error boundary — keeps a crash inside the LIFF shell
// instead of showing the raw Next.js error screen.
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-8 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: "color-mix(in srgb, var(--danger) 10%, transparent)",
          color: "var(--danger)",
          font: "700 20px var(--font-sans)",
        }}
      >
        !
      </div>
      <div style={{ font: "600 15px var(--font-sans)", color: "var(--ink)" }}>
        เกิดข้อผิดพลาดบางอย่าง
      </div>
      <div style={{ font: "500 12px var(--font-sans)", color: "var(--muted)" }}>
        Something went wrong. Please try again.
      </div>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex items-center justify-center rounded-xl px-5 py-2.5 active:opacity-70"
        style={{
          background: "var(--brand)",
          color: "#fff",
          font: "600 13px var(--font-sans)",
        }}
      >
        ลองอีกครั้ง · Retry
      </button>
    </div>
  );
}
